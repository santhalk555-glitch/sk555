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
      quiz_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          subject: Database["public"]["Enums"]["quiz_subject"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject: Database["public"]["Enums"]["quiz_subject"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject?: Database["public"]["Enums"]["quiz_subject"]
        }
        Relationships: []
      }
      quiz_lobbies: {
        Row: {
          created_at: string
          current_players: number
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          ended_at: string | null
          host_id: string
          id: string
          max_players: number
          name: string
          started_at: string | null
          status: Database["public"]["Enums"]["quiz_status"]
          subject: Database["public"]["Enums"]["quiz_subject"]
          time_limit: number
        }
        Insert: {
          created_at?: string
          current_players?: number
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          ended_at?: string | null
          host_id: string
          id?: string
          max_players?: number
          name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["quiz_status"]
          subject: Database["public"]["Enums"]["quiz_subject"]
          time_limit?: number
        }
        Update: {
          created_at?: string
          current_players?: number
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          ended_at?: string | null
          host_id?: string
          id?: string
          max_players?: number
          name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["quiz_status"]
          subject?: Database["public"]["Enums"]["quiz_subject"]
          time_limit?: number
        }
        Relationships: []
      }
      quiz_participants: {
        Row: {
          answers: Json | null
          id: string
          joined_at: string
          lobby_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          id?: string
          joined_at?: string
          lobby_id: string
          score?: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          id?: string
          joined_at?: string
          lobby_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_participants_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "quiz_lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: Database["public"]["Enums"]["quiz_subject"]
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: Database["public"]["Enums"]["quiz_subject"]
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          subject?: Database["public"]["Enums"]["quiz_subject"]
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
      difficulty_level: "easy" | "medium" | "hard"
      quiz_status: "waiting" | "active" | "completed"
      quiz_subject:
        | "aptitude_quantitative"
        | "aptitude_reasoning"
        | "aptitude_verbal"
        | "general_science"
        | "mechanical_engineering"
        | "civil_engineering"
        | "electrical_engineering"
        | "electronics_communication"
        | "computer_science_it"
        | "metallurgy"
        | "chemical_engineering"
        | "other_engineering"
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
      difficulty_level: ["easy", "medium", "hard"],
      quiz_status: ["waiting", "active", "completed"],
      quiz_subject: [
        "aptitude_quantitative",
        "aptitude_reasoning",
        "aptitude_verbal",
        "general_science",
        "mechanical_engineering",
        "civil_engineering",
        "electrical_engineering",
        "electronics_communication",
        "computer_science_it",
        "metallurgy",
        "chemical_engineering",
        "other_engineering",
      ],
    },
  },
} as const
