import { createClient } from 'npm:@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface EvolutionWebhookPayload {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    message: {
      conversation?: string
      audioMessage?: {
        url: string
        mimetype: string
      }
      imageMessage?: {
        url: string
        caption?: string
      }
    }
    messageTimestamp: number
    pushName: string
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

    const payload: EvolutionWebhookPayload = await req.json()

    // Only process incoming messages (not sent by us)
    if (payload.data.key.fromMe) {
      return new Response(
        JSON.stringify({ message: 'Ignoring outgoing message' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract message details
    const customerPhone = payload.data.key.remoteJid.replace('@s.whatsapp.net', '')
    const customerName = payload.data.pushName || 'Cliente'
    
    let messageType = 'text'
    let content = ''
    let mediaUrl = ''

    if (payload.data.message.conversation) {
      messageType = 'text'
      content = payload.data.message.conversation
    } else if (payload.data.message.audioMessage) {
      messageType = 'audio'
      content = 'Áudio recebido'
      mediaUrl = payload.data.message.audioMessage.url
    } else if (payload.data.message.imageMessage) {
      messageType = 'image'
      content = payload.data.message.imageMessage.caption || 'Imagem recebida'
      mediaUrl = payload.data.message.imageMessage.url
    }

    // Find restaurant by instance (you'll need to map instances to restaurants)
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1)
      .single()

    if (!restaurant) {
      console.error('No restaurant found for instance:', payload.instance)
      return new Response(
        JSON.stringify({ error: 'Restaurant not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Call AI agent
    const aiAgentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'whatsapp',
        messageType,
        content,
        mediaUrl,
        customerPhone,
        customerName,
        restaurantId: restaurant.id,
        conversationId: `whatsapp_${customerPhone}`
      })
    })

    const aiResult = await aiAgentResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        aiResponse: aiResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Evolution webhook error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})