import { useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabase'
import { useAuth } from './useAuth'

interface Subscription {
  id: string
  hotmart_transaction_id: string
  status: 'active' | 'cancelled' | 'overdue' | 'refunded'
  plan_name: string
  plan_type: 'essencial' | 'profissional' | 'ilimitado'
  amount: number
  currency: string
  monthly_ai_limit: number
  monthly_messages_limit: number
  monthly_images_limit: number
  features: any
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

interface UsageData {
  ai_interactions_used: number
  messages_sent: number
  images_uploaded: number
  current_month: string
}

export const useSubscription = () => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setUsage(null)
      setLoading(false)
      return
    }

    fetchSubscriptionData()
  }, [user])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subscriptionError) {
        throw subscriptionError
      }

      setSubscription(subscriptionData)

      // Fetch current month usage
      if (subscriptionData) {
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
        
        const { data: usageData, error: usageError } = await supabaseClient
          .from('subscription_usage')
          .select('*')
          .eq('user_id', user?.id)
          .eq('month_year', currentMonth)
          .maybeSingle()

        if (usageError && usageError.code !== 'PGRST116') {
          throw usageError
        }

        setUsage({
          ai_interactions_used: usageData?.ai_interactions_used || 0,
          messages_sent: usageData?.messages_sent || 0,
          images_uploaded: usageData?.images_uploaded || 0,
          current_month: currentMonth
        })
      }

    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkLimit = async (limitType: 'ai_interactions' | 'messages' | 'images', amount: number = 1) => {
    if (!user) return { can_use: false, reason: 'not_authenticated' }

    try {
      const { data, error } = await supabaseClient.rpc('check_user_limit', {
        p_user_id: user.id,
        p_limit_type: limitType,
        p_increment: amount
      })

      if (error) throw error
      return data
    } catch (err: any) {
      console.error('Error checking limit:', err)
      return { can_use: false, reason: 'error', error: err.message }
    }
  }

  const incrementUsage = async (limitType: 'ai_interactions' | 'messages' | 'images', amount: number = 1) => {
    if (!user) return false

    try {
      const { data, error } = await supabaseClient.rpc('increment_usage', {
        p_user_id: user.id,
        p_limit_type: limitType,
        p_amount: amount
      })

      if (error) throw error
      
      // Refresh usage data
      await fetchSubscriptionData()
      
      return data
    } catch (err: any) {
      console.error('Error incrementing usage:', err)
      return false
    }
  }

  const isSubscriptionActive = () => {
    return subscription?.status === 'active'
  }

  const isSubscriptionOverdue = () => {
    return subscription?.status === 'overdue'
  }

  const getSubscriptionStatusColor = () => {
    switch (subscription?.status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'overdue':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
      case 'refunded':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSubscriptionStatusText = () => {
    switch (subscription?.status) {
      case 'active':
        return 'Ativa'
      case 'overdue':
        return 'Em atraso'
      case 'cancelled':
        return 'Cancelada'
      case 'refunded':
        return 'Reembolsada'
      default:
        return 'Desconhecido'
    }
  }

  const getPlanDisplayName = () => {
    switch (subscription?.plan_type) {
      case 'essencial':
        return 'Essencial'
      case 'profissional':
        return 'Profissional'
      case 'ilimitado':
        return 'Ilimitado'
      default:
        return subscription?.plan_name || 'Desconhecido'
    }
  }

  const getUsagePercentage = (type: 'ai' | 'messages' | 'images') => {
    if (!subscription || !usage) return 0
    
    let used = 0
    let limit = 0
    
    switch (type) {
      case 'ai':
        used = usage.ai_interactions_used
        limit = subscription.monthly_ai_limit
        break
      case 'messages':
        used = usage.messages_sent
        limit = subscription.monthly_messages_limit
        break
      case 'images':
        used = usage.images_uploaded
        limit = subscription.monthly_images_limit
        break
    }
    
    if (limit === -1) return 0 // Unlimited
    return limit > 0 ? (used / limit) * 100 : 0
  }

  const isFeatureEnabled = (feature: string) => {
    if (!subscription) return false
    return subscription.features?.[feature] === true
  }

  return {
    subscription,
    usage,
    loading,
    error,
    isSubscriptionActive,
    isSubscriptionOverdue,
    getSubscriptionStatusColor,
    getSubscriptionStatusText,
    getPlanDisplayName,
    getUsagePercentage,
    isFeatureEnabled,
    checkLimit,
    incrementUsage,
    refetch: fetchSubscriptionData,
  }
}