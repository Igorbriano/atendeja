import { useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabase'
import { useAuth } from './useAuth'

interface OnboardingStatus {
  restaurant_completed: boolean
  products_completed: boolean
  delivery_zones_completed: boolean
  onboarding_completed: boolean
}

interface Restaurant {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip_code: string
  description?: string
  logo_url?: string
  external_menu_url?: string
}

export const useOnboarding = () => {
  const { user } = useAuth()
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setOnboardingStatus(null)
      setRestaurant(null)
      setLoading(false)
      return
    }

    fetchOnboardingData()
  }, [user])

  const fetchOnboardingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch onboarding status
      const { data: statusData, error: statusError } = await supabaseClient
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (statusError && statusError.code !== 'PGRST116') {
        throw statusError
      }

      // Fetch restaurant data
      const { data: restaurantData, error: restaurantError } = await supabaseClient
        .from('restaurants')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (restaurantError && restaurantError.code !== 'PGRST116') {
        throw restaurantError
      }

      setOnboardingStatus(statusData || {
        restaurant_completed: false,
        products_completed: false,
        delivery_zones_completed: false,
        onboarding_completed: false,
      })
      setRestaurant(restaurantData)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching onboarding data:', err)
    } finally {
      setLoading(false)
    }
  }

  const createRestaurant = async (restaurantData: Omit<Restaurant, 'id'>) => {
    try {
      setError(null)

      const { data, error } = await supabaseClient
        .from('restaurants')
        .insert({
          user_id: user?.id,
          ...restaurantData,
        })
        .select()
        .single()

      if (error) throw error

      setRestaurant(data)
      await fetchOnboardingData() // Refresh status
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateRestaurant = async (restaurantData: Partial<Restaurant>) => {
    try {
      setError(null)

      const { data, error } = await supabaseClient
        .from('restaurants')
        .update(restaurantData)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) throw error

      setRestaurant(data)
      await fetchOnboardingData() // Refresh status
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getCurrentStep = () => {
    if (!onboardingStatus) return 'restaurant'
    
    if (!onboardingStatus.restaurant_completed) return 'restaurant'
    if (!onboardingStatus.products_completed) return 'products'
    if (!onboardingStatus.delivery_zones_completed) return 'delivery-zones'
    
    return 'completed'
  }

  const getStepProgress = () => {
    if (!onboardingStatus) return 0
    
    let completed = 0
    if (onboardingStatus.restaurant_completed) completed++
    if (onboardingStatus.products_completed) completed++
    if (onboardingStatus.delivery_zones_completed) completed++
    
    return (completed / 3) * 100
  }

  return {
    onboardingStatus,
    restaurant,
    loading,
    error,
    createRestaurant,
    updateRestaurant,
    getCurrentStep,
    getStepProgress,
    refetch: fetchOnboardingData,
  }
}