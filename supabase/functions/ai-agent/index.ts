import { createClient } from 'npm:@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface MessagePayload {
  platform: 'whatsapp' | 'instagram'
  messageType: 'text' | 'audio' | 'image'
  content: string
  mediaUrl?: string
  customerPhone: string
  customerName?: string
  restaurantId: string
  conversationId?: string
}

interface AIResponse {
  responseType: 'text' | 'audio' | 'image'
  content: string
  mediaUrl?: string
  shouldPrintOrder?: boolean
  orderData?: any
  nextAction?: 'collect_info' | 'suggest_upsell' | 'confirm_order' | 'complete'
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

    const payload: MessagePayload = await req.json()
    
    // Process incoming message based on type
    let processedContent = payload.content
    
    if (payload.messageType === 'audio') {
      processedContent = await processAudioMessage(payload.mediaUrl!)
    } else if (payload.messageType === 'image') {
      processedContent = await processImageMessage(payload.mediaUrl!)
    }

    // Get restaurant context
    const restaurantContext = await getRestaurantContext(supabase, payload.restaurantId)
    
    // Get conversation history
    const conversationHistory = await getConversationHistory(supabase, payload.conversationId)
    
    // Generate AI response using Groq
    const aiResponse = await generateAIResponse(
      processedContent,
      restaurantContext,
      conversationHistory,
      payload.platform
    )

    // Save conversation
    await saveConversation(supabase, {
      restaurantId: payload.restaurantId,
      customerPhone: payload.customerPhone,
      customerName: payload.customerName,
      platform: payload.platform,
      messageType: payload.messageType,
      customerMessage: processedContent,
      aiResponse: aiResponse.content,
      conversationId: payload.conversationId
    })

    // Send response via Evolution API
    await sendResponse(payload.platform, payload.customerPhone, aiResponse)

    // Handle order printing if needed
    if (aiResponse.shouldPrintOrder && aiResponse.orderData) {
      await printOrder(supabase, aiResponse.orderData)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        message: 'Message processed successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI Agent error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function processAudioMessage(audioUrl: string): Promise<string> {
  try {
    // Download audio file
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Convert to text using Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'multipart/form-data',
      },
      body: new FormData().append('file', new Blob([audioBuffer]), 'audio.ogg').append('model', 'whisper-1')
    })

    const transcription = await whisperResponse.json()
    return transcription.text || 'Não consegui entender o áudio'

  } catch (error) {
    console.error('Error processing audio:', error)
    return 'Desculpe, não consegui processar seu áudio. Pode repetir por texto?'
  }
}

async function processImageMessage(imageUrl: string): Promise<string> {
  try {
    // For now, return a standard response
    // In production, you could implement OCR or image recognition
    return 'Recebi sua imagem! Por favor, me diga o que gostaria de pedir do nosso cardápio.'

  } catch (error) {
    console.error('Error processing image:', error)
    return 'Recebi sua imagem, mas não consigo processá-la no momento. Pode me dizer o que precisa?'
  }
}

async function getRestaurantContext(supabase: any, restaurantId: string) {
  try {
    // Get restaurant info
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    // Get products
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true)

    // Get delivery zones
    const { data: deliveryZones } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true)

    // Get active promotions
    const { data: promotions } = await supabase
      .from('promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true)
      .gte('end_date', new Date().toISOString())

    return {
      restaurant,
      products: products || [],
      deliveryZones: deliveryZones || [],
      promotions: promotions || []
    }

  } catch (error) {
    console.error('Error getting restaurant context:', error)
    return null
  }
}

async function getConversationHistory(supabase: any, conversationId?: string) {
  if (!conversationId) return []

  try {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    return data || []
  } catch (error) {
    console.error('Error getting conversation history:', error)
    return []
  }
}

async function generateAIResponse(
  message: string,
  context: any,
  history: any[],
  platform: string
): Promise<AIResponse> {
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    
    const systemPrompt = buildSystemPrompt(context, platform)
    const conversationContext = buildConversationContext(history, message)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationContext }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    })

    const aiResult = await response.json()
    const aiMessage = aiResult.choices[0]?.message?.content || 'Desculpe, não entendi. Pode repetir?'

    // Analyze response to determine next actions
    const analysis = analyzeResponse(aiMessage, message, context)

    return {
      responseType: 'text',
      content: aiMessage,
      shouldPrintOrder: analysis.shouldPrintOrder,
      orderData: analysis.orderData,
      nextAction: analysis.nextAction
    }

  } catch (error) {
    console.error('Error generating AI response:', error)
    return {
      responseType: 'text',
      content: 'Desculpe, estou com dificuldades técnicas. Pode tentar novamente?'
    }
  }
}

function buildSystemPrompt(context: any, platform: string): string {
  const { restaurant, products, deliveryZones, promotions } = context

  return `Você é uma IA vendedora especializada em atendimento via ${platform} para o restaurante "${restaurant?.name}".

PERSONALIDADE E COMPORTAMENTO:
- Seja amigável, proativa e focada em vendas
- Sempre sugira upsells, combos e promoções
- Use emojis apropriados para ${platform}
- Seja persuasiva mas não insistente
- Mantenha conversas fluidas e naturais

CARDÁPIO DISPONÍVEL:
${products.map((p: any) => `- ${p.name}: R$ ${p.price} (${p.category})\n  ${p.description || ''}`).join('\n')}

PROMOÇÕES ATIVAS:
${promotions.map((p: any) => `- ${p.name}: ${p.discount_percentage}% OFF\n  ${p.description || ''}`).join('\n')}

ZONAS DE ENTREGA:
${deliveryZones.map((z: any) => `- ${z.neighborhood}: R$ ${z.delivery_fee} (${z.delivery_time_min}-${z.delivery_time_max}min)`).join('\n')}

PROCESSO DE VENDA:
1. Cumprimente e apresente promoções
2. Ajude a escolher produtos e sugira combos
3. Colete: nome, telefone, endereço completo
4. Confirme pedido e calcule total com taxa de entrega
5. Finalize com previsão de entrega

REGRAS IMPORTANTES:
- SEMPRE colete dados completos antes de finalizar
- SEMPRE sugira bebidas, sobremesas ou combos
- SEMPRE confirme endereço e calcule taxa de entrega
- NUNCA finalize pedido sem confirmação total
- Use linguagem adequada para ${platform}

Responda sempre como se fosse uma vendedora experiente e simpática.`
}

function buildConversationContext(history: any[], currentMessage: string): string {
  let context = 'HISTÓRICO DA CONVERSA:\n'
  
  history.forEach((msg: any) => {
    context += `Cliente: ${msg.customer_message}\n`
    context += `Você: ${msg.ai_response}\n\n`
  })
  
  context += `MENSAGEM ATUAL DO CLIENTE: ${currentMessage}\n\n`
  context += 'Responda de forma natural e focada em vendas:'
  
  return context
}

function analyzeResponse(aiMessage: string, customerMessage: string, context: any) {
  // Simple analysis - in production, use more sophisticated NLP
  const shouldPrintOrder = aiMessage.toLowerCase().includes('pedido confirmado') || 
                          aiMessage.toLowerCase().includes('vou enviar para')
  
  let orderData = null
  if (shouldPrintOrder) {
    // Extract order data from conversation
    orderData = {
      restaurantId: context.restaurant?.id,
      customerMessage: customerMessage,
      aiResponse: aiMessage,
      timestamp: new Date().toISOString()
    }
  }

  let nextAction = 'collect_info'
  if (aiMessage.toLowerCase().includes('gostaria de adicionar')) {
    nextAction = 'suggest_upsell'
  } else if (aiMessage.toLowerCase().includes('confirmar')) {
    nextAction = 'confirm_order'
  } else if (shouldPrintOrder) {
    nextAction = 'complete'
  }

  return { shouldPrintOrder, orderData, nextAction }
}

async function saveConversation(supabase: any, data: any) {
  try {
    await supabase
      .from('conversations')
      .insert({
        restaurant_id: data.restaurantId,
        customer_phone: data.customerPhone,
        customer_name: data.customerName,
        platform: data.platform,
        message_type: data.messageType,
        customer_message: data.customerMessage,
        ai_response: data.aiResponse,
        conversation_id: data.conversationId || `${data.platform}_${data.customerPhone}_${Date.now()}`,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error saving conversation:', error)
  }
}

async function sendResponse(platform: string, customerPhone: string, response: AIResponse) {
  try {
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')

    if (response.responseType === 'text') {
      await fetch(`${evolutionApiUrl}/message/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${evolutionApiKey}`
        },
        body: JSON.stringify({
          number: customerPhone,
          text: response.content
        })
      })
    } else if (response.responseType === 'audio') {
      // Generate audio using Google TTS
      const audioUrl = await generateAudio(response.content)
      
      await fetch(`${evolutionApiUrl}/message/sendAudio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${evolutionApiKey}`
        },
        body: JSON.stringify({
          number: customerPhone,
          audioUrl: audioUrl
        })
      })
    }

  } catch (error) {
    console.error('Error sending response:', error)
  }
}

async function generateAudio(text: string): Promise<string> {
  try {
    // Using Google Text-to-Speech
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GOOGLE_TTS_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Wavenet-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      })
    })

    const result = await response.json()
    
    // Save audio to temporary storage and return URL
    // In production, save to cloud storage
    return `data:audio/mp3;base64,${result.audioContent}`

  } catch (error) {
    console.error('Error generating audio:', error)
    return ''
  }
}

async function printOrder(supabase: any, orderData: any) {
  try {
    // Save order to database
    await supabase
      .from('orders')
      .insert({
        restaurant_id: orderData.restaurantId,
        customer_name: 'Cliente WhatsApp', // Extract from conversation
        customer_phone: 'Pendente',
        customer_address: 'Pendente',
        items: [{ name: 'Pedido via IA', quantity: 1, price: 0 }],
        total_amount: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    // In production, integrate with thermal printer
    console.log('Order sent to printer:', orderData)

  } catch (error) {
    console.error('Error printing order:', error)
  }
}