import React, { useEffect } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../hooks/useAuth'

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { requestPermission, permission } = useNotifications()
  const { user } = useAuth()

  useEffect(() => {
    // Request notification permission when user logs in
    if (user && permission === 'default') {
      const timer = setTimeout(() => {
        requestPermission()
      }, 2000) // Wait 2 seconds after login

      return () => clearTimeout(timer)
    }
  }, [user, permission, requestPermission])

  return <>{children}</>
}