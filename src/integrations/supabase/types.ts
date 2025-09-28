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
      branches: {
        Row: {
          course_id: string | null
          course_simple_id: string | null
          created_at: string
          exam_id: string | null
          exam_simple_id: string | null
          id: string
          name: string
          simple_id: string
          source_type: string
        }
        Insert: {
          course_id?: string | null
          course_simple_id?: string | null
          created_at?: string
          exam_id?: string | null
          exam_simple_id?: string | null
          id?: string
          name: string
          simple_id: string
          source_type: string
        }
        Update: {
          course_id?: string | null
          course_simple_id?: string | null
          created_at?: string
          exam_id?: string | null
          exam_simple_id?: string | null
          id?: string
          name?: string
          simple_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "competitive_exams_list"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_exams_list: {
        Row: {
          created_at: string
          id: string
          main_category: string
          name: string
          simple_id: string
          sub_category: string
        }
        Insert: {
          created_at?: string
          id?: string
          main_category?: string
          name: string
          simple_id: string
          sub_category?: string
        }
        Update: {
          created_at?: string
          id?: string
          main_category?: string
          name?: string
          simple_id?: string
          sub_category?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          id: string
          name: string
          simple_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          simple_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          simple_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      game_lobbies: {
        Row: {
          branch_id: string | null
          branch_simple_id: string | null
          course_id: string | null
          course_simple_id: string | null
          created_at: string
          creator_id: string
          current_players: number
          exam_id: string | null
          exam_simple_id: string | null
          game_mode: string | null
          id: string
          lobby_code: string
          lobby_type: string
          max_players: number
          source_type: string | null
          status: string
          subject: string | null
          subject_id: string | null
          subject_simple_id: string | null
          topic_id: string | null
          topic_simple_id: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          branch_simple_id?: string | null
          course_id?: string | null
          course_simple_id?: string | null
          created_at?: string
          creator_id: string
          current_players?: number
          exam_id?: string | null
          exam_simple_id?: string | null
          game_mode?: string | null
          id?: string
          lobby_code: string
          lobby_type?: string
          max_players: number
          source_type?: string | null
          status?: string
          subject?: string | null
          subject_id?: string | null
          subject_simple_id?: string | null
          topic_id?: string | null
          topic_simple_id?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          branch_simple_id?: string | null
          course_id?: string | null
          course_simple_id?: string | null
          created_at?: string
          creator_id?: string
          current_players?: number
          exam_id?: string | null
          exam_simple_id?: string | null
          game_mode?: string | null
          id?: string
          lobby_code?: string
          lobby_type?: string
          max_players?: number
          source_type?: string | null
          status?: string
          subject?: string | null
          subject_id?: string | null
          subject_simple_id?: string | null
          topic_id?: string | null
          topic_simple_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_lobbies_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_invites: {
        Row: {
          created_at: string
          id: string
          lobby_id: string
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lobby_id: string
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          lobby_id?: string
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_invites_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "game_lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_participants: {
        Row: {
          id: string
          joined_at: string
          lobby_id: string
          slot_number: number
          user_id: string
          username: string
        }
        Insert: {
          id?: string
          joined_at?: string
          lobby_id: string
          slot_number: number
          user_id: string
          username: string
        }
        Update: {
          id?: string
          joined_at?: string
          lobby_id?: string
          slot_number?: number
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_participants_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "game_lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          competitive_exams: Json | null
          competitive_exams_old: string[]
          course_name: string
          created_at: string
          display_user_id: string | null
          id: string
          quiz_points: number
          updated_at: string
          user_id: string
          username: string | null
          victory_count: number
        }
        Insert: {
          competitive_exams?: Json | null
          competitive_exams_old?: string[]
          course_name: string
          created_at?: string
          display_user_id?: string | null
          id?: string
          quiz_points?: number
          updated_at?: string
          user_id: string
          username?: string | null
          victory_count?: number
        }
        Update: {
          competitive_exams?: Json | null
          competitive_exams_old?: string[]
          course_name?: string
          created_at?: string
          display_user_id?: string | null
          id?: string
          quiz_points?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          victory_count?: number
        }
        Relationships: []
      }
      question_reports: {
        Row: {
          additional_comments: string | null
          created_at: string
          id: string
          question_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          additional_comments?: string | null
          created_at?: string
          id?: string
          question_id: string
          reason: string
          status?: string
          user_id: string
        }
        Update: {
          additional_comments?: string | null
          created_at?: string
          id?: string
          question_id?: string
          reason?: string
          status?: string
          user_id?: string
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
          correct_answer: number
          course_simple_id: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_simple_id: string | null
          explanation: string | null
          id: string
          option_1: string
          option_2: string
          option_3: string
          option_4: string
          question: string
          source_type: string | null
          subject: Database["public"]["Enums"]["quiz_subject"]
          subject_simple_id: string | null
          topic_simple_id: string | null
        }
        Insert: {
          correct_answer: number
          course_simple_id?: string | null
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_simple_id?: string | null
          explanation?: string | null
          id?: string
          option_1: string
          option_2: string
          option_3: string
          option_4: string
          question: string
          source_type?: string | null
          subject: Database["public"]["Enums"]["quiz_subject"]
          subject_simple_id?: string | null
          topic_simple_id?: string | null
        }
        Update: {
          correct_answer?: number
          course_simple_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_simple_id?: string | null
          explanation?: string | null
          id?: string
          option_1?: string
          option_2?: string
          option_3?: string
          option_4?: string
          question?: string
          source_type?: string | null
          subject?: Database["public"]["Enums"]["quiz_subject"]
          subject_simple_id?: string | null
          topic_simple_id?: string | null
        }
        Relationships: []
      }
      recent_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      subjects_hierarchy: {
        Row: {
          course_id: string | null
          course_simple_id: string | null
          created_at: string
          exam_id: string | null
          exam_simple_id: string | null
          id: string
          name: string
          simple_id: string
          source_type: string
        }
        Insert: {
          course_id?: string | null
          course_simple_id?: string | null
          created_at?: string
          exam_id?: string | null
          exam_simple_id?: string | null
          id?: string
          name: string
          simple_id: string
          source_type: string
        }
        Update: {
          course_id?: string | null
          course_simple_id?: string | null
          created_at?: string
          exam_id?: string | null
          exam_simple_id?: string | null
          id?: string
          name?: string
          simple_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_hierarchy_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_hierarchy_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "competitive_exams_list"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          id: string
          name: string
          simple_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          simple_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          simple_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profile_view: {
        Row: {
          competitive_exams: Json | null
          course_name: string | null
          created_at: string | null
          display_user_id: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          competitive_exams?: Json | null
          course_name?: string | null
          created_at?: string | null
          display_user_id?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          competitive_exams?: Json | null
          course_name?: string | null
          created_at?: string | null
          display_user_id?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      generate_8_digit_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_lobby_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      start_quiz_lobby: {
        Args: { lobby_id: string }
        Returns: boolean
      }
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
