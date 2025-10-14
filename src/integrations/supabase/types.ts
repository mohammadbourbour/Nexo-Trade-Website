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
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          question: string
          response: string
          user_id: string
          was_helpful: boolean | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          question: string
          response: string
          user_id: string
          was_helpful?: boolean | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          question?: string
          response?: string
          user_id?: string
          was_helpful?: boolean | null
        }
        Relationships: []
      }
      dashboard_preferences: {
        Row: {
          chart_indicators: Json | null
          favorite_sections: string[] | null
          id: string
          layout_config: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chart_indicators?: Json | null
          favorite_sections?: string[] | null
          id?: string
          layout_config?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chart_indicators?: Json | null
          favorite_sections?: string[] | null
          id?: string
          layout_config?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tutorial_progress: {
        Row: {
          completed: boolean | null
          completion_time_seconds: number | null
          created_at: string | null
          id: string
          tutorial_id: string
          user_id: string
          was_helpful: boolean | null
        }
        Insert: {
          completed?: boolean | null
          completion_time_seconds?: number | null
          created_at?: string | null
          id?: string
          tutorial_id: string
          user_id: string
          was_helpful?: boolean | null
        }
        Update: {
          completed?: boolean | null
          completion_time_seconds?: number | null
          created_at?: string | null
          id?: string
          tutorial_id?: string
          user_id?: string
          was_helpful?: boolean | null
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string | null
          details: Json | null
          duration_seconds: number | null
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          section: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          duration_seconds?: number | null
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          section: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          duration_seconds?: number | null
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          section?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string | null
          generation: string | null
          id: string
          personality: string | null
          preferred_name: string | null
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          skill_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          generation?: string | null
          id?: string
          personality?: string | null
          preferred_name?: string | null
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          skill_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          generation?: string | null
          id?: string
          personality?: string | null
          preferred_name?: string | null
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          skill_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      interaction_type:
        | "click"
        | "hover"
        | "scroll"
        | "zoom"
        | "pan"
        | "view"
        | "question"
        | "tutorial_view"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
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
      interaction_type: [
        "click",
        "hover",
        "scroll",
        "zoom",
        "pan",
        "view",
        "question",
        "tutorial_view",
      ],
      skill_level: ["beginner", "intermediate", "advanced", "expert"],
    },
  },
} as const
