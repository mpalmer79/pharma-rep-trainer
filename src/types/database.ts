// =====================================================
// SUPABASE DATABASE TYPES
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          company: string | null;
          job_title: string | null;
          experience_level: string | null;
          role: 'rep' | 'manager' | 'admin' | 'super_admin';
          organization_id: string | null;
          territory: string | null;
          manager_id: string | null;
          onboarding_completed: boolean;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          job_title?: string | null;
          experience_level?: string | null;
          role?: 'rep' | 'manager' | 'admin' | 'super_admin';
          organization_id?: string | null;
          territory?: string | null;
          manager_id?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          job_title?: string | null;
          experience_level?: string | null;
          role?: 'rep' | 'manager' | 'admin' | 'super_admin';
          organization_id?: string | null;
          territory?: string | null;
          manager_id?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      training_sessions_simple: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          drug_name: string;
          persona_name: string;
          score: number;
          duration_seconds: number;
          messages: Json;
          feedback: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          drug_name: string;
          persona_name: string;
          score: number;
          duration_seconds: number;
          messages?: Json;
          feedback?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          drug_name?: string;
          persona_name?: string;
          score?: number;
          duration_seconds?: number;
          messages?: Json;
          feedback?: Json | null;
        };
      };
      // Keep original training_sessions for enterprise features
      training_sessions: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string | null;
          drug_id: string | null;
          drug_slug: string;
          persona_id: string | null;
          persona_slug: string;
          status: 'in_progress' | 'completed' | 'abandoned';
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          time_limit_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id?: string | null;
          drug_id?: string | null;
          drug_slug: string;
          persona_id?: string | null;
          persona_slug: string;
          status?: 'in_progress' | 'completed' | 'abandoned';
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          time_limit_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string | null;
          drug_id?: string | null;
          drug_slug?: string;
          persona_id?: string | null;
          persona_slug?: string;
          status?: 'in_progress' | 'completed' | 'abandoned';
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          time_limit_seconds?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// =====================================================
// CONVENIENCE TYPE ALIASES
// =====================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type TrainingSessionSimple = Database['public']['Tables']['training_sessions_simple']['Row'];
export type TrainingSessionSimpleInsert = Database['public']['Tables']['training_sessions_simple']['Insert'];
export type TrainingSessionSimpleUpdate = Database['public']['Tables']['training_sessions_simple']['Update'];

export type TrainingSession = Database['public']['Tables']['training_sessions']['Row'];
export type TrainingSessionInsert = Database['public']['Tables']['training_sessions']['Insert'];
export type TrainingSessionUpdate = Database['public']['Tables']['training_sessions']['Update'];
