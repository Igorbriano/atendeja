import { createClient } from 'npm:@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface NotificationPayload {
  title: string
  body: string
  targetUserId?: string
  data?: any
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

    const payload: NotificationPayload = await req.json()
    const { title, body, targetUserId, data } = payload

    // Get FCM tokens for target users
    let query = supabase
      .from('user_fcm_tokens')
      .select('fcm_token, user_id')

    if (targetUserId) {
      query = query.eq('user_id', targetUserId)
    }

    const { data: tokens, error: tokensError } = await query

    if (tokensError) {
      throw new Error(`Failed to fetch FCM tokens: ${tokensError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No FCM tokens found for target users' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send notifications to Firebase Cloud Messaging
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
    if (!fcmServerKey) {
      throw new Error('FCM_SERVER_KEY not configured')
    }

    const notifications = tokens.map(async (tokenData) => {
      const fcmPayload = {
        to: tokenData.fcm_token,
        notification: {
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          click_action: '/'
        },
        data: data || {}
      }

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${fcmServerKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fcmPayload)
      })

      if (!response.ok) {
        console.error(`Failed to send notification to ${tokenData.fcm_token}:`, await response.text())
        return { success: false, userId: tokenData.user_id }
      }

      return { success: true, userId: tokenData.user_id }
    })

    const results = await Promise.all(notifications)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
        results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Notification sending error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})