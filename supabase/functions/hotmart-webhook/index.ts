import { createClient } from 'npm:@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Hotmart-Hottok',
}

interface HotmartWebhookPayload {
  id: string
  event: string
  version: string
  date_created: number
  data: {
    product: {
      id: number
      name: string
    }
    purchase: {
      transaction: string
      status: string
      approved_date?: number
      price: {
        value: number
        currency_value: string
      }
    }
    buyer: {
      email: string
      name: string
    }
    subscription?: {
      id: string
      status: string
      date_next_charge?: number
    }
  }
}

// Mapeamento de produtos Hotmart para planos
const PLAN_MAPPING: { [key: string]: any } = {
  'essencial-plan': {
    plan_type: 'essencial',
    monthly_ai_limit: 150,
    monthly_messages_limit: 100,
    monthly_images_limit: 15,
    features: {
      text_messages: true,
      audio_messages: false,
      image_messages: false,
      reactivation: false,
      analytics: 'basic'
    }
  },
  'profissional-plan': {
    plan_type: 'profissional',
    monthly_ai_limit: 400,
    monthly_messages_limit: 300,
    monthly_images_limit: 50,
    features: {
      text_messages: true,
      audio_messages: true,
      image_messages: true,
      reactivation: true,
      analytics: 'complete'
    }
  },
  'ilimitado-plan': {
    plan_type: 'ilimitado',
    monthly_ai_limit: -1,
    monthly_messages_limit: -1,
    monthly_images_limit: -1,
    features: {
      text_messages: true,
      audio_messages: true,
      image_messages: true,
      reactivation: true,
      analytics: 'complete',
      dedicated_support: true,
      priority_features: true
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify Hotmart webhook token
    const hottok = req.headers.get('X-Hotmart-Hottok')
    const expectedToken = Deno.env.get('HOTMART_WEBHOOK_TOKEN')
    
    if (!hottok || hottok !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const payload: HotmartWebhookPayload = await req.json()

    // Log webhook received
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: payload.event,
        hotmart_transaction_id: payload.data.purchase.transaction,
        payload: payload,
        processed: false,
      })

    // Handle different webhook events
    switch (payload.event) {
      case 'PURCHASE_APPROVED':
        await handlePurchaseApproved(supabase, payload)
        break
      case 'PURCHASE_CANCELED':
      case 'PURCHASE_REFUNDED':
        await handlePurchaseCanceled(supabase, payload)
        break
      case 'SUBSCRIPTION_CANCELLATION':
        await handleSubscriptionCancellation(supabase, payload)
        break
      case 'PURCHASE_DELAYED':
        await handlePurchaseDelayed(supabase, payload)
        break
      default:
        console.log(`Unhandled event type: ${payload.event}`)
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('hotmart_transaction_id', payload.data.purchase.transaction)
      .eq('event_type', payload.event)

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handlePurchaseApproved(supabase: any, payload: HotmartWebhookPayload) {
  const { data: { buyer, purchase, product } } = payload
  
  try {
    // Determine plan based on product name or ID
    const planConfig = determinePlan(product.name, product.id)
    
    // Generate secure password
    const { data: passwordData } = await supabase.rpc('generate_secure_password')
    const password = passwordData

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: buyer.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: buyer.name,
        source: 'hotmart',
        transaction_id: purchase.transaction,
        plan_type: planConfig.plan_type
      }
    })

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`)
    }

    // Create subscription record with plan details
    await supabase
      .from('subscriptions')
      .insert({
        user_id: authData.user.id,
        hotmart_transaction_id: purchase.transaction,
        status: 'active',
        plan_name: product.name,
        plan_type: planConfig.plan_type,
        amount: purchase.price.value,
        currency: purchase.price.currency_value,
        monthly_ai_limit: planConfig.monthly_ai_limit,
        monthly_messages_limit: planConfig.monthly_messages_limit,
        monthly_images_limit: planConfig.monthly_images_limit,
        features: planConfig.features,
        start_date: new Date(payload.data.purchase.approved_date! * 1000).toISOString(),
      })

    // Send welcome email with credentials
    await sendWelcomeEmail(buyer.email, buyer.name, password, planConfig.plan_type)

    console.log(`User created successfully for transaction: ${purchase.transaction}`)

  } catch (error) {
    console.error('Error handling purchase approved:', error)
    
    // Log error in webhook_logs
    await supabase
      .from('webhook_logs')
      .update({ 
        error_message: error.message,
        processed: true 
      })
      .eq('hotmart_transaction_id', purchase.transaction)
      .eq('event_type', payload.event)
    
    throw error
  }
}

async function handlePurchaseCanceled(supabase: any, payload: HotmartWebhookPayload) {
  const { purchase } = payload.data
  
  try {
    // Update subscription status
    await supabase.rpc('update_subscription_status', {
      p_transaction_id: purchase.transaction,
      p_new_status: payload.event === 'PURCHASE_REFUNDED' ? 'refunded' : 'cancelled'
    })

    // Get user email for notification
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select(`
        user_id,
        plan_type,
        users:auth.users(email, raw_user_meta_data)
      `)
      .eq('hotmart_transaction_id', purchase.transaction)
      .single()

    if (subscription?.users?.email) {
      await sendCancellationEmail(
        subscription.users.email,
        subscription.users.raw_user_meta_data?.name || 'Cliente',
        subscription.plan_type
      )
    }

    console.log(`Subscription cancelled for transaction: ${purchase.transaction}`)

  } catch (error) {
    console.error('Error handling purchase cancellation:', error)
    throw error
  }
}

async function handleSubscriptionCancellation(supabase: any, payload: HotmartWebhookPayload) {
  await handlePurchaseCanceled(supabase, payload)
}

async function handlePurchaseDelayed(supabase: any, payload: HotmartWebhookPayload) {
  const { purchase } = payload.data
  
  try {
    // Update subscription status to overdue
    await supabase.rpc('update_subscription_status', {
      p_transaction_id: purchase.transaction,
      p_new_status: 'overdue'
    })

    console.log(`Subscription marked as overdue for transaction: ${purchase.transaction}`)

  } catch (error) {
    console.error('Error handling purchase delayed:', error)
    throw error
  }
}

function determinePlan(productName: string, productId: number): any {
  // Try to match by product name first
  const lowerName = productName.toLowerCase()
  
  if (lowerName.includes('essencial')) {
    return PLAN_MAPPING['essencial-plan']
  } else if (lowerName.includes('ilimitado')) {
    return PLAN_MAPPING['ilimitado-plan']
  } else if (lowerName.includes('profissional')) {
    return PLAN_MAPPING['profissional-plan']
  }
  
  // Default to professional plan
  return PLAN_MAPPING['profissional-plan']
}

async function sendWelcomeEmail(email: string, name: string, password: string, planType: string) {
  const planNames = {
    'essencial': 'Essencial',
    'profissional': 'Profissional',
    'ilimitado': 'Ilimitado'
  }

  const emailContent = {
    to: email,
    subject: `Bem-vindo ao DeliveryFlow AI - Plano ${planNames[planType as keyof typeof planNames]}! 🚀`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Bem-vindo ao DeliveryFlow AI!</h1>
        <p>Olá ${name},</p>
        <p>Sua assinatura do <strong>Plano ${planNames[planType as keyof typeof planNames]}</strong> foi ativada com sucesso!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Seus dados de acesso:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Senha:</strong> ${password}</p>
          <p><strong>Plano:</strong> ${planNames[planType as keyof typeof planNames]}</p>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>O que você pode fazer agora:</h3>
          <ul>
            <li>✅ Configurar seu restaurante</li>
            <li>✅ Adicionar produtos ao cardápio</li>
            <li>✅ Configurar taxas de entrega</li>
            <li>✅ Conectar seu WhatsApp</li>
            <li>✅ Começar a vender com IA!</li>
          </ul>
        </div>
        
        <p>Acesse sua conta em: <a href="https://deliveryflow.ai/login" style="color: #10B981;">https://deliveryflow.ai/login</a></p>
        <p><strong>Importante:</strong> Recomendamos que você altere sua senha após o primeiro login.</p>
        <p>Se precisar de ajuda, entre em contato conosco pelo WhatsApp: (11) 99999-9999</p>
        <p>Atenciosamente,<br>Equipe DeliveryFlow AI</p>
      </div>
    `
  }
  
  console.log('Welcome email to send:', emailContent)
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
  // await resend.emails.send(emailContent)
}

async function sendCancellationEmail(email: string, name: string, planType: string) {
  const planNames = {
    'essencial': 'Essencial',
    'profissional': 'Profissional',
    'ilimitado': 'Ilimitado'
  }

  const emailContent = {
    to: email,
    subject: 'Cancelamento da assinatura - DeliveryFlow AI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Assinatura Cancelada</h1>
        <p>Olá ${name},</p>
        <p>Sua assinatura do <strong>Plano ${planNames[planType as keyof typeof planNames]}</strong> foi cancelada.</p>
        <p>Seu acesso ao sistema será desativado em breve.</p>
        <p>Se isso foi um erro ou se você gostaria de reativar sua assinatura, entre em contato conosco pelo WhatsApp: (11) 99999-9999</p>
        <p>Atenciosamente,<br>Equipe DeliveryFlow AI</p>
      </div>
    `
  }
  
  console.log('Cancellation email to send:', emailContent)
  
  // TODO: Implement actual email sending
}