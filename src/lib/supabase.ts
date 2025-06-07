import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabaseClient = createClient(supabaseUrl, supabaseKey)

// Helper function to upload image to Supabase Storage
export const uploadProductImage = async (file: File, productId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`

  const { data, error } = await supabaseClient.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return publicUrl
}

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip_code: string
          description?: string
          logo_url?: string
          external_menu_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip_code: string
          description?: string
          logo_url?: string
          external_menu_url?: string
        }
        Update: {
          name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          description?: string
          logo_url?: string
          external_menu_url?: string
        }
      }
      products: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string
          price: number
          image_url: string | null
          category: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description: string
          price: number
          image_url?: string | null
          category: string
          active?: boolean
        }
        Update: {
          name?: string
          description?: string
          price?: number
          image_url?: string | null
          category?: string
          active?: boolean
        }
      }
      delivery_zones: {
        Row: {
          id: string
          restaurant_id: string
          neighborhood: string
          delivery_fee: number
          delivery_time_min: number
          delivery_time_max: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          neighborhood: string
          delivery_fee?: number
          delivery_time_min?: number
          delivery_time_max?: number
          active?: boolean
        }
        Update: {
          neighborhood?: string
          delivery_fee?: number
          delivery_time_min?: number
          delivery_time_max?: number
          active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          items: any[]
          total_amount: number
          status: 'pending' | 'preparing' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          items: any[]
          total_amount: number
          status?: 'pending' | 'preparing' | 'delivered' | 'cancelled'
        }
        Update: {
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          items?: any[]
          total_amount?: number
          status?: 'pending' | 'preparing' | 'delivered' | 'cancelled'
        }
      }
      promotions: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string
          discount_percentage: number
          start_date: string
          end_date: string
          active: boolean
          category: 'reativacao_7_dias' | 'reativacao_15_dias' | 'reativacao_30_dias' | 'promocao_geral' | 'combo_especial' | 'desconto_categoria'
          target_days?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description: string
          discount_percentage: number
          start_date: string
          end_date: string
          active?: boolean
          category?: 'reativacao_7_dias' | 'reativacao_15_dias' | 'reativacao_30_dias' | 'promocao_geral' | 'combo_especial' | 'desconto_categoria'
          target_days?: number
        }
        Update: {
          name?: string
          description?: string
          discount_percentage?: number
          start_date?: string
          end_date?: string
          active?: boolean
          category?: 'reativacao_7_dias' | 'reativacao_15_dias' | 'reativacao_30_dias' | 'promocao_geral' | 'combo_especial' | 'desconto_categoria'
          target_days?: number
        }
      }
      conversations: {
        Row: {
          id: string
          restaurant_id: string
          customer_phone: string
          customer_name: string
          platform: 'whatsapp' | 'instagram'
          message_type: 'text' | 'audio' | 'image'
          customer_message: string
          ai_response: string
          conversation_id: string
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_phone: string
          customer_name: string
          platform: 'whatsapp' | 'instagram'
          message_type: 'text' | 'audio' | 'image'
          customer_message: string
          ai_response: string
          conversation_id: string
        }
        Update: {
          customer_name?: string
          customer_message?: string
          ai_response?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          hotmart_transaction_id: string
          status: 'active' | 'cancelled' | 'overdue' | 'refunded'
          plan_name: string
          amount: number
          currency: string
          start_date: string
          end_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hotmart_transaction_id: string
          status?: 'active' | 'cancelled' | 'overdue' | 'refunded'
          plan_name?: string
          amount?: number
          currency?: string
          start_date?: string
          end_date?: string
        }
        Update: {
          status?: 'active' | 'cancelled' | 'overdue' | 'refunded'
          plan_name?: string
          amount?: number
          currency?: string
          start_date?: string
          end_date?: string
        }
      }
      user_onboarding_status: {
        Row: {
          id: string
          user_id: string
          restaurant_completed: boolean
          products_completed: boolean
          delivery_zones_completed: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_completed?: boolean
          products_completed?: boolean
          delivery_zones_completed?: boolean
          onboarding_completed?: boolean
        }
        Update: {
          restaurant_completed?: boolean
          products_completed?: boolean
          delivery_zones_completed?: boolean
          onboarding_completed?: boolean
        }
      }
      user_fcm_tokens: {
        Row: {
          id: string
          user_id: string
          fcm_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fcm_token: string
        }
        Update: {
          fcm_token?: string
        }
      }
      webhook_logs: {
        Row: {
          id: string
          event_type: string
          hotmart_transaction_id?: string
          payload: any
          processed: boolean
          error_message?: string
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          hotmart_transaction_id?: string
          payload: any
          processed?: boolean
          error_message?: string
        }
        Update: {
          processed?: boolean
          error_message?: string
        }
      }
    }
  }
}