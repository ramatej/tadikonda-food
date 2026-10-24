export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          district: string
          door_no: string
          id: string
          is_default: boolean
          label: string
          landmark: string | null
          phone: string | null
          pincode: string
          state: string
          street: string
          updated_at: string
          user_id: string
          village_area: string
        }
        Insert: {
          city?: string
          created_at?: string
          district?: string
          door_no: string
          id?: string
          is_default?: boolean
          label?: string
          landmark?: string | null
          phone?: string | null
          pincode?: string
          state?: string
          street: string
          updated_at?: string
          user_id: string
          village_area?: string
        }
        Update: {
          city?: string
          created_at?: string
          district?: string
          door_no?: string
          id?: string
          is_default?: boolean
          label?: string
          landmark?: string | null
          phone?: string | null
          pincode?: string
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
          village_area?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partner_profiles: {
        Row: {
          approval_status: string
          availability_status: string
          created_at: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          approval_status?: string
          availability_status?: string
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          approval_status?: string
          availability_status?: string
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_available: boolean
          is_bestseller: boolean
          is_veg: boolean
          name: string
          original_price: number | null
          preparation_time_minutes: number
          price: number
          rating: number
          restaurant_id: string
          review_count: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_available?: boolean
          is_bestseller?: boolean
          is_veg?: boolean
          name: string
          original_price?: number | null
          preparation_time_minutes?: number
          price: number
          rating?: number
          restaurant_id: string
          review_count?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_available?: boolean
          is_bestseller?: boolean
          is_veg?: boolean
          name?: string
          original_price?: number | null
          preparation_time_minutes?: number
          price?: number
          rating?: number
          restaurant_id?: string
          review_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_veg: boolean
          menu_item_id: string | null
          name: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_veg?: boolean
          menu_item_id?: string | null
          name: string
          order_id: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_veg?: boolean
          menu_item_id?: string | null
          name?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          customer_notes: string | null
          delivery_address: Json
          delivery_fee: number
          delivery_partner_id: string | null
          discount: number
          id: string
          item_subtotal: number
          order_number: string
          payment_method: string
          payment_status: string
          restaurant_id: string
          status: string
          total: number
          updated_at: string
          voucher_code: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          delivery_address: Json
          delivery_fee?: number
          delivery_partner_id?: string | null
          discount?: number
          id?: string
          item_subtotal: number
          order_number: string
          payment_method?: string
          payment_status?: string
          restaurant_id: string
          status?: string
          total: number
          updated_at?: string
          voucher_code?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          delivery_address?: Json
          delivery_fee?: number
          delivery_partner_id?: string | null
          discount?: number
          id?: string
          item_subtotal?: number
          order_number?: string
          payment_method?: string
          payment_status?: string
          restaurant_id?: string
          status?: string
          total?: number
          updated_at?: string
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          announcement_banner: string | null
          delivery_fee: number
          free_delivery_threshold: number
          id: string
          platform_open: boolean
          service_tax_percentage: number
          updated_at: string
        }
        Insert: {
          announcement_banner?: string | null
          delivery_fee?: number
          free_delivery_threshold?: number
          id?: string
          platform_open?: boolean
          service_tax_percentage?: number
          updated_at?: string
        }
        Update: {
          announcement_banner?: string | null
          delivery_fee?: number
          free_delivery_threshold?: number
          id?: string
          platform_open?: boolean
          service_tax_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_profiles: {
        Row: {
          application_status: string
          created_at: string
          cuisine: string[] | null
          full_address: string | null
          id: string
          location_area: string | null
          owner_id: string
          phone: string | null
          restaurant_name: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          application_status?: string
          created_at?: string
          cuisine?: string[] | null
          full_address?: string | null
          id?: string
          location_area?: string | null
          owner_id: string
          phone?: string | null
          restaurant_name: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          application_status?: string
          created_at?: string
          cuisine?: string[] | null
          full_address?: string | null
          id?: string
          location_area?: string | null
          owner_id?: string
          phone?: string | null
          restaurant_name?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          cover_image_url: string | null
          created_at: string
          cuisine: string[]
          delivery_time_minutes: number
          featured: boolean
          full_address: string
          id: string
          image_url: string
          is_open: boolean
          location_area: string
          name: string
          owner_id: string | null
          phone: string
          price_for_two: number
          rating: number
          review_count: number
          status: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          cuisine?: string[]
          delivery_time_minutes?: number
          featured?: boolean
          full_address: string
          id?: string
          image_url: string
          is_open?: boolean
          location_area: string
          name: string
          owner_id?: string | null
          phone: string
          price_for_two?: number
          rating?: number
          review_count?: number
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          cuisine?: string[]
          delivery_time_minutes?: number
          featured?: boolean
          full_address?: string
          id?: string
          image_url?: string
          is_open?: boolean
          location_area?: string
          name?: string
          owner_id?: string | null
          phone?: string
          price_for_two?: number
          rating?: number
          review_count?: number
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          restaurant_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          restaurant_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      provision_admin: { Args: { target_email: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
