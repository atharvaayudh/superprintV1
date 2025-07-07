export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          company: string
          address: string
          city: string
          state: string
          zip_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          company: string
          address: string
          city: string
          state: string
          zip_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      sales_coordinators: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      product_names: {
        Row: {
          id: string
          name: string
          category_id: string
          base_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          base_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          base_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      colors: {
        Row: {
          id: string
          name: string
          hex_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          hex_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          hex_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          order_date: string
          delivery_date: string
          customer_id: string
          order_type: 'new' | 'repeat' | 'sample' | 'rush'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          sales_coordinator_id: string
          product_category_id: string
          product_name_id: string
          color_id: string
          description: string
          size_breakdown: Json
          total_qty: number
          branding_type: 'embroidery' | 'screen-print' | 'heat-transfer' | 'sublimation' | 'vinyl' | 'dtf' | 'none'
          placement1: string | null
          placement1_size: string | null
          placement2: string | null
          placement2_size: string | null
          placement3: string | null
          placement3_size: string | null
          placement4: string | null
          placement4_size: string | null
          mockup_files: string[]
          attachments: string[]
          remarks: string | null
          cost_per_pc: number
          total_amount: number
          order_status: 'pending' | 'confirmed' | 'in-production' | 'quality-check' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
          edd: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          order_date: string
          delivery_date: string
          customer_id: string
          order_type: 'new' | 'repeat' | 'sample' | 'rush'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          sales_coordinator_id: string
          product_category_id: string
          product_name_id: string
          color_id: string
          description: string
          size_breakdown: Json
          total_qty: number
          branding_type: 'embroidery' | 'screen-print' | 'heat-transfer' | 'sublimation' | 'vinyl' | 'dtf' | 'none'
          placement1?: string | null
          placement1_size?: string | null
          placement2?: string | null
          placement2_size?: string | null
          placement3?: string | null
          placement3_size?: string | null
          placement4?: string | null
          placement4_size?: string | null
          mockup_files?: string[]
          attachments?: string[]
          remarks?: string | null
          cost_per_pc: number
          total_amount: number
          order_status?: 'pending' | 'confirmed' | 'in-production' | 'quality-check' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
          edd?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          order_date?: string
          delivery_date?: string
          customer_id?: string
          order_type?: 'new' | 'repeat' | 'sample' | 'rush'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          sales_coordinator_id?: string
          product_category_id?: string
          product_name_id?: string
          color_id?: string
          description?: string
          size_breakdown?: Json
          total_qty?: number
          branding_type?: 'embroidery' | 'screen-print' | 'heat-transfer' | 'sublimation' | 'vinyl' | 'dtf' | 'none'
          placement1?: string | null
          placement1_size?: string | null
          placement2?: string | null
          placement2_size?: string | null
          placement3?: string | null
          placement3_size?: string | null
          placement4?: string | null
          placement4_size?: string | null
          mockup_files?: string[]
          attachments?: string[]
          remarks?: string | null
          cost_per_pc?: number
          total_amount?: number
          order_status?: 'pending' | 'confirmed' | 'in-production' | 'quality-check' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
          edd?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}