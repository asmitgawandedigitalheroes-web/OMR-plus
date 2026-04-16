export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'client' | 'coach' | 'admin';
          avatar_url: string | null;
          phone: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'client' | 'coach' | 'admin';
          avatar_url?: string | null;
          phone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'client' | 'coach' | 'admin';
          avatar_url?: string | null;
          phone?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_name: string;
          status: 'active' | 'cancelled' | 'expired' | 'pending';
          price_sar: number;
          started_at: string;
          expires_at: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_name: string;
          status?: 'active' | 'cancelled' | 'expired' | 'pending';
          price_sar: number;
          started_at?: string;
          expires_at?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'active' | 'cancelled' | 'expired' | 'pending';
          expires_at?: string | null;
          stripe_subscription_id?: string | null;
        };
      };
      trainer_client_assignments: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id: string;
          assigned_at?: string;
        };
        Update: {
          trainer_id?: string;
          client_id?: string;
        };
      };
      onboarding_responses: {
        Row: {
          id: string;
          user_id: string;
          goal: string | null;
          current_weight: number | null;
          target_weight: number | null;
          height: number | null;
          age: number | null;
          gender: string | null;
          activity_level: string | null;
          dietary_restrictions: string | null;
          health_conditions: string | null;
          experience_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal?: string | null;
          current_weight?: number | null;
          target_weight?: number | null;
          height?: number | null;
          age?: number | null;
          gender?: string | null;
          activity_level?: string | null;
          dietary_restrictions?: string | null;
          health_conditions?: string | null;
          experience_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          goal?: string | null;
          current_weight?: number | null;
          target_weight?: number | null;
          height?: number | null;
          age?: number | null;
          gender?: string | null;
          activity_level?: string | null;
          dietary_restrictions?: string | null;
          health_conditions?: string | null;
          experience_level?: string | null;
          updated_at?: string;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          title: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          title: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      meal_plan_items: {
        Row: {
          id: string;
          meal_plan_id: string;
          meal_type: string;
          meal_timing: string | null;
          food_name: string;
          grams: number | null;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_plan_id: string;
          meal_type: string;
          meal_timing?: string | null;
          food_name: string;
          grams?: number | null;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          created_at?: string;
        };
        Update: {
          meal_type?: string;
          meal_timing?: string | null;
          food_name?: string;
          grams?: number | null;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
        };
      };
      workout_plans: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          title: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          title: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      workout_plan_days: {
        Row: {
          id: string;
          workout_plan_id: string;
          day_label: string;
          focus: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_plan_id: string;
          day_label: string;
          focus?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          day_label?: string;
          focus?: string | null;
          order_index?: number;
        };
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_plan_day_id: string;
          exercise_name: string;
          sets: number | null;
          reps: string | null;
          rest_time: string | null;
          notes: string | null;
          video_url: string | null;
          image_url: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_plan_day_id: string;
          exercise_name: string;
          sets?: number | null;
          reps?: string | null;
          rest_time?: string | null;
          notes?: string | null;
          video_url?: string | null;
          image_url?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          exercise_name?: string;
          sets?: number | null;
          reps?: string | null;
          rest_time?: string | null;
          notes?: string | null;
          video_url?: string | null;
          image_url?: string | null;
          order_index?: number;
        };
      };
      progress_logs: {
        Row: {
          id: string;
          user_id: string;
          weight: number | null;
          body_fat_pct: number | null;
          muscle_mass_kg: number | null;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight?: number | null;
          body_fat_pct?: number | null;
          muscle_mass_kg?: number | null;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          weight?: number | null;
          body_fat_pct?: number | null;
          muscle_mass_kg?: number | null;
          notes?: string | null;
        };
      };
      body_checks: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          file_type: string | null;
          notes: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          file_type?: string | null;
          notes?: string | null;
          uploaded_at?: string;
        };
        Update: {
          notes?: string | null;
        };
      };
      message_threads: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          price_sar: number;
          image_url: string | null;
          file_url: string | null;
          product_type: 'physical' | 'digital';
          is_active: boolean;
          stock_quantity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          price_sar: number;
          image_url?: string | null;
          file_url?: string | null;
          product_type?: 'physical' | 'digital';
          is_active?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: string | null;
          price_sar?: number;
          image_url?: string | null;
          file_url?: string | null;
          product_type?: 'physical' | 'digital';
          is_active?: boolean;
          stock_quantity?: number | null;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_sar: number;
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_sar: number;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_sar: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_sar: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price_sar?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'client' | 'coach' | 'admin';
      subscription_status: 'active' | 'cancelled' | 'expired' | 'pending';
      product_type: 'physical' | 'digital';
    };
  };
}
