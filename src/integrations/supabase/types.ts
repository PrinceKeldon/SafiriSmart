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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: boolean
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: boolean
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: boolean
        }
        Relationships: []
      }
      completed_leads: {
        Row: {
          completed_at: string | null
          created_at: string | null
          destinations: string[] | null
          group_size: number | null
          id: string
          itinerary_summary: Json | null
          operator_id: string
          original_lead_id: string
          quoted_currency: string | null
          quoted_price: number | null
          travel_dates: Json | null
          traveler_country: string | null
          traveler_email: string
          traveler_name: string
          traveler_phone: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          destinations?: string[] | null
          group_size?: number | null
          id?: string
          itinerary_summary?: Json | null
          operator_id: string
          original_lead_id: string
          quoted_currency?: string | null
          quoted_price?: number | null
          travel_dates?: Json | null
          traveler_country?: string | null
          traveler_email: string
          traveler_name: string
          traveler_phone?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          destinations?: string[] | null
          group_size?: number | null
          id?: string
          itinerary_summary?: Json | null
          operator_id?: string
          original_lead_id?: string
          quoted_currency?: string | null
          quoted_price?: number | null
          travel_dates?: Json | null
          traveler_country?: string | null
          traveler_email?: string
          traveler_name?: string
          traveler_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_leads_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string | null
          note: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string | null
          note: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string | null
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_selected_packages: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          package_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          package_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_selected_packages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_selected_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "operator_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_visibility: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          operator_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          operator_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          operator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_visibility_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_visibility_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archived: boolean | null
          assigned_operator_id: string | null
          created_at: string | null
          id: string
          itinerary: Json | null
          preferences: Json
          quoted_currency: string | null
          quoted_price: number | null
          selection_type: string | null
          status: string | null
          todo_checklist: Json | null
          traveler_country: string | null
          traveler_email: string
          traveler_name: string
          traveler_phone: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          assigned_operator_id?: string | null
          created_at?: string | null
          id?: string
          itinerary?: Json | null
          preferences: Json
          quoted_currency?: string | null
          quoted_price?: number | null
          selection_type?: string | null
          status?: string | null
          todo_checklist?: Json | null
          traveler_country?: string | null
          traveler_email: string
          traveler_name: string
          traveler_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          assigned_operator_id?: string | null
          created_at?: string | null
          id?: string
          itinerary?: Json | null
          preferences?: Json
          quoted_currency?: string | null
          quoted_price?: number | null
          selection_type?: string | null
          status?: string | null
          todo_checklist?: Json | null
          traveler_country?: string | null
          traveler_email?: string
          traveler_name?: string
          traveler_phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_packages: {
        Row: {
          budget_tier: string
          created_at: string | null
          description: string | null
          estimated_cost_per_person_per_day: number
          id: string
          included_activities: Json | null
          included_locations: Json | null
          max_duration: number
          max_group_size: number
          min_duration: number
          min_group_size: number
          operator_id: string
          package_name: string
          updated_at: string | null
        }
        Insert: {
          budget_tier: string
          created_at?: string | null
          description?: string | null
          estimated_cost_per_person_per_day: number
          id?: string
          included_activities?: Json | null
          included_locations?: Json | null
          max_duration: number
          max_group_size: number
          min_duration: number
          min_group_size: number
          operator_id: string
          package_name: string
          updated_at?: string | null
        }
        Update: {
          budget_tier?: string
          created_at?: string | null
          description?: string | null
          estimated_cost_per_person_per_day?: number
          id?: string
          included_activities?: Json | null
          included_locations?: Json | null
          max_duration?: number
          max_group_size?: number
          min_duration?: number
          min_group_size?: number
          operator_id?: string
          package_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_packages_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_permit_url: string | null
          certificate_of_incorporation_url: string | null
          city: string | null
          company: string
          company_name: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          country: string | null
          created_at: string | null
          description: string | null
          destinations_covered: Json | null
          document_verification_notes: string | null
          document_verification_status: string | null
          document_verified_at: string | null
          document_verified_by: string | null
          email: string
          id: string
          is_active: boolean | null
          kato_membership_url: string | null
          location: string | null
          name: string
          password_hash: string
          rating: number | null
          registration_number: string | null
          role: string | null
          services_offered: Json | null
          specializations: string[] | null
          specialties: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_permit_url?: string | null
          certificate_of_incorporation_url?: string | null
          city?: string | null
          company: string
          company_name?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          destinations_covered?: Json | null
          document_verification_notes?: string | null
          document_verification_status?: string | null
          document_verified_at?: string | null
          document_verified_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          kato_membership_url?: string | null
          location?: string | null
          name: string
          password_hash: string
          rating?: number | null
          registration_number?: string | null
          role?: string | null
          services_offered?: Json | null
          specializations?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_permit_url?: string | null
          certificate_of_incorporation_url?: string | null
          city?: string | null
          company?: string
          company_name?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          destinations_covered?: Json | null
          document_verification_notes?: string | null
          document_verification_status?: string | null
          document_verified_at?: string | null
          document_verified_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          kato_membership_url?: string | null
          location?: string | null
          name?: string
          password_hash?: string
          rating?: number | null
          registration_number?: string | null
          role?: string | null
          services_offered?: Json | null
          specializations?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operators_document_verified_by_fkey"
            columns: ["document_verified_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      safari_guide_visits: {
        Row: {
          id: string
          ip_address: string | null
          user_agent: string | null
          user_session: string | null
          visited_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_session?: string | null
          visited_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_session?: string | null
          visited_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      is_admin_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "operator" | "user"
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
      app_role: ["admin", "operator", "user"],
    },
  },
} as const
