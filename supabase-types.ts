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
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      leaderboard_entries: {
        Row: {
          created_at: string
          id: string
          rank: number
          score: number
          user_id: string
          username: string
          category: string
        }
        Insert: {
          created_at?: string
          id?: string
          rank: number
          score: number
          user_id: string
          username: string
          category: string
        }
        Update: {
          created_at?: string
          id?: string
          rank?: number
          score?: number
          user_id?: string
          username?: string
          category?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: string | null
          interval_count: number | null
          product_id: string | null
          trial_period_days: number | null
          type: string | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: string | null
          interval_count?: number | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: string | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: string | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string | null
        }
        Relationships: []
      }
      streak_entries: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          price_id: string | null
          quantity: number | null
          status: string | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          price_id?: string | null
          quantity?: number | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          price_id?: string | null
          quantity?: number | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          created_at: string
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          payment_method: Json | null
          streak_count: number | null
          streak_last_updated: string | null
          updated_at: string | null
          workouts_completed: number | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string
          display_name?: string | null
          email: string
          full_name?: string | null
          id: string
          payment_method?: Json | null
          streak_count?: number | null
          streak_last_updated?: string | null
          updated_at?: string | null
          workouts_completed?: number | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          payment_method?: Json | null
          streak_count?: number | null
          streak_last_updated?: string | null
          updated_at?: string | null
          workouts_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workout_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          liked_by: string[] | null
          user_id: string
          username: string
          workout_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          liked_by?: string[] | null
          user_id: string
          username: string
          workout_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          liked_by?: string[] | null
          user_id?: string
          username?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_comments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      workouts: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          id: string
          image_url: string | null
          name: string
          steps: Json[]
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: string
          id?: string
          image_url?: string | null
          name: string
          steps: Json[]
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          image_url?: string | null
          name?: string
          steps?: Json[]
          video_url?: string | null
        }
        Relationships: []
      }
      workouts_completed: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_completed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_completed_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}