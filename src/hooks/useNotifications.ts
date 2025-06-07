import { useState, useEffect } from 'react'
import { requestNotificationPermission, onMessageListener } from '../lib/firebase'
import { supabaseClient } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { user } = useAuth()

  useEffect(() => {
    // Check current permission status
    setPermission(Notification.permission)

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        console.log('Received foreground message:', payload)
        
        // Show notification if app is in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png'
          })
        }
      })
      .catch((err) => console.log('Failed to receive message:', err))
  }, [])

  const requestPermission = async () => {
    try {
      const fcmToken = await requestNotificationPermission()
      if (fcmToken) {
        setToken(fcmToken)
        setPermission('granted')
        
        // Save token to database for the current user
        if (user) {
          await saveFCMToken(fcmToken)
        }
        
        return fcmToken
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
    return null
  }

  const saveFCMToken = async (fcmToken: string) => {
    try {
      const { error } = await supabaseClient
        .from('user_fcm_tokens')
        .upsert({
          user_id: user?.id,
          fcm_token: fcmToken,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving FCM token:', error)
      }
    } catch (error) {
      console.error('Error saving FCM token:', error)
    }
  }

  const sendNotification = async (title: string, body: string, targetUserId?: string) => {
    try {
      const { error } = await supabaseClient.functions.invoke('send-notification', {
        body: {
          title,
          body,
          targetUserId
        }
      })

      if (error) {
        console.error('Error sending notification:', error)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  return {
    token,
    permission,
    requestPermission,
    sendNotification
  }
}