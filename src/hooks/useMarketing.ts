import { useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabase'
import { useOnboarding } from './useOnboarding'
import { initializePixels, sendConversionEvent } from '../lib/marketing'

interface MarketingPixels {
  facebook_pixel_id?: string
  google_analytics_id?: string
  google_ads_conversion_id?: string
  google_ads_conversion_label?: string
  tiktok_pixel_id?: string
  taboola_pixel_id?: string
  custom_scripts?: string
}

export const useMarketing = () => {
  const { restaurant } = useOnboarding()
  const [pixels, setPixels] = useState<MarketingPixels>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (restaurant?.id) {
      fetchPixels()
    }
  }, [restaurant])

  const fetchPixels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('marketing_pixels')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPixels(data)
        // Initialize pixels on page load
        initializePixels(data)
      }
    } catch (err: any) {
      console.error('Error fetching pixels:', err)
    } finally {
      setLoading(false)
    }
  }

  const trackPurchase = async (orderValue: number, orderId?: string, customerPhone?: string) => {
    try {
      await sendConversionEvent('purchase', {
        value: orderValue,
        currency: 'BRL',
        orderId,
        customerPhone
      })

      // Log conversion event to database
      await supabaseClient
        .from('conversion_events')
        .insert({
          restaurant_id: restaurant!.id,
          event_type: 'purchase',
          pixel_type: 'manual',
          order_value: orderValue,
          customer_phone: customerPhone || 'unknown',
          order_id: orderId
        })

    } catch (error) {
      console.error('Error tracking purchase:', error)
    }
  }

  const trackEvent = async (eventType: string, value?: number) => {
    try {
      // Send to configured pixels
      if (window.fbq) {
        window.fbq('track', eventType, value ? { value, currency: 'BRL' } : {})
      }

      if (window.gtag) {
        window.gtag('event', eventType.toLowerCase(), value ? { value, currency: 'BRL' } : {})
      }

      if (window.ttq) {
        window.ttq.track(eventType, value ? { value, currency: 'BRL' } : {})
      }

    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  return {
    pixels,
    loading,
    trackPurchase,
    trackEvent,
    refetch: fetchPixels
  }
}