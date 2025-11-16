export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      benefits: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      card_templates: {
        Row: {
          created_at: string | null
          field_positions: Json
          id: string
          is_active: boolean | null
          template_url: string
        }
        Insert: {
          created_at?: string | null
          field_positions?: Json
          id?: string
          is_active?: boolean | null
          template_url: string
        }
        Update: {
          created_at?: string | null
          field_positions?: Json
          id?: string
          is_active?: boolean | null
          template_url?: string
        }
        Relationships: []
      }
      change_requests: {
        Row: {
          created_at: string | null
          field_name: string
          id: string
          new_value: string
          old_value: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["change_request_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: string
          new_value: string
          old_value: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: string
          new_value?: string
          old_value?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sent_by: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sent_by: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sent_by?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_recipients: {
        Row: {
          account_details: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          account_details: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          account_details?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          emirate: string
          emirates_id: string | null
          full_name: string
          id: string
          mandalam: string
          passport_number: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_proof_url: string | null
          payment_transaction_id: string | null
          phone_number: string
          profile_photo_url: string | null
          registration_year: number
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          emirate: string
          emirates_id?: string | null
          full_name: string
          id: string
          mandalam: string
          passport_number?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_proof_url?: string | null
          payment_transaction_id?: string | null
          phone_number: string
          profile_photo_url?: string | null
          registration_year?: number
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          emirate?: string
          emirates_id?: string | null
          full_name?: string
          id?: string
          mandalam?: string
          passport_number?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_proof_url?: string | null
          payment_transaction_id?: string | null
          phone_number?: string
          profile_photo_url?: string | null
          registration_year?: number
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      registration_questions: {
        Row: {
          created_at: string | null
          depends_on: string | null
          depends_on_value: string | null
          field_type: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          options: Json | null
          order_index: number
          question_text: string
        }
        Insert: {
          created_at?: string | null
          depends_on?: string | null
          depends_on_value?: string | null
          field_type: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          order_index: number
          question_text: string
        }
        Update: {
          created_at?: string | null
          depends_on?: string | null
          depends_on_value?: string | null
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_questions_depends_on_fkey"
            columns: ["depends_on"]
            isOneToOne: false
            referencedRelation: "registration_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_benefits: {
        Row: {
          amount_paid: number | null
          benefit_id: string
          benefit_type: string
          id: string
          remarks: string | null
          used_date: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          benefit_id: string
          benefit_type: string
          id?: string
          remarks?: string | null
          used_date?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          benefit_id?: string
          benefit_type?: string
          id?: string
          remarks?: string | null
          used_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          mandalam_access: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mandalam_access?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mandalam_access?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      year_configs: {
        Row: {
          created_at: string | null
          is_active: boolean | null
          year: number
        }
        Insert: {
          created_at?: string | null
          is_active?: boolean | null
          year: number
        }
        Update: {
          created_at?: string | null
          is_active?: boolean | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "mandalam_admin" | "master_admin"
      change_request_status: "pending" | "approved" | "rejected"
      user_status: "pending" | "approved" | "rejected" | "renewal_pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "mandalam_admin", "master_admin"],
      change_request_status: ["pending", "approved", "rejected"],
      user_status: ["pending", "approved", "rejected", "renewal_pending"],
    },
  },
} as const
