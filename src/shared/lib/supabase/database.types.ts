export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          condition_type: string
          condition_value: Json | null
          created_at: string | null
          description_key: string
          icon: string
          id: string
          name_key: string
        }
        Insert: {
          category?: string
          condition_type: string
          condition_value?: Json | null
          created_at?: string | null
          description_key: string
          icon?: string
          id: string
          name_key: string
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: Json | null
          created_at?: string | null
          description_key?: string
          icon?: string
          id?: string
          name_key?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          created_at: string | null
          id: string
          mission_id: string
          note: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mission_id: string
          note?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mission_id?: string
          note?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'mission_completions_mission_id_fkey'
            columns: ['mission_id']
            isOneToOne: false
            referencedRelation: 'missions'
            referencedColumns: ['id']
          },
        ]
      }
      missions: {
        Row: {
          adoption_count: number | null
          completed_at: string | null
          completion_count: number | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          public_status: Database['public']['Enums']['public_status'] | null
          rarity: Database['public']['Enums']['mission_rarity']
          rejection_reason: string | null
          status: Database['public']['Enums']['mission_status'] | null
          tags: string[] | null
          title: string
          type: Database['public']['Enums']['mission_type']
          updated_at: string | null
          user_id: string
          weekly_reset_day: number | null
        }
        Insert: {
          adoption_count?: number | null
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          public_status?: Database['public']['Enums']['public_status'] | null
          rarity?: Database['public']['Enums']['mission_rarity']
          rejection_reason?: string | null
          status?: Database['public']['Enums']['mission_status'] | null
          tags?: string[] | null
          title: string
          type?: Database['public']['Enums']['mission_type']
          updated_at?: string | null
          user_id: string
          weekly_reset_day?: number | null
        }
        Update: {
          adoption_count?: number | null
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          public_status?: Database['public']['Enums']['public_status'] | null
          rarity?: Database['public']['Enums']['mission_rarity']
          rejection_reason?: string | null
          status?: Database['public']['Enums']['mission_status'] | null
          tags?: string[] | null
          title?: string
          type?: Database['public']['Enums']['mission_type']
          updated_at?: string | null
          user_id?: string
          weekly_reset_day?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          mission_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          mission_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          mission_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_mission_id_fkey'
            columns: ['mission_id']
            isOneToOne: false
            referencedRelation: 'missions'
            referencedColumns: ['id']
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey'
            columns: ['achievement_id']
            isOneToOne: false
            referencedRelation: 'achievements'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_admin: boolean
          language: Database['public']['Enums']['user_language']
          onboarding_completed: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          is_admin?: boolean
          language?: Database['public']['Enums']['user_language']
          onboarding_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          language?: Database['public']['Enums']['user_language']
          onboarding_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: Record<string, never>
        Returns: undefined
      }
      increment_adoption_count: {
        Args: { mission_id_input: string }
        Returns: undefined
      }
      increment_completion_count: {
        Args: { mission_id_input: string }
        Returns: undefined
      }
    }
    Enums: {
      mission_rarity: 'common' | 'rare' | 'epic' | 'legendary'
      mission_status: 'active' | 'completed' | 'failed' | 'expired'
      mission_type: 'one_time' | 'weekly'
      public_status: 'draft' | 'pending' | 'approved' | 'rejected'
      user_language: 'es' | 'en'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mission_rarity: ['common', 'rare', 'epic', 'legendary'],
      mission_status: ['active', 'completed', 'failed', 'expired'],
      mission_type: ['one_time', 'weekly'],
      public_status: ['draft', 'pending', 'approved', 'rejected'],
      user_language: ['es', 'en'],
    },
  },
} as const
