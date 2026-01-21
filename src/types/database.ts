// =====================================================
// AUTO-GENERATED TYPES FROM SUPABASE SCHEMA
// You can also generate these using: npx supabase gen types typescript
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
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          accent_color: string;
          subscription_tier: 'free' | 'team' | 'enterprise';
          subscription_status: 'active' | 'past_due' | 'cancelled' | 'trialing';
          max_users: number;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          subscription_tier?: 'free' | 'team' | 'enterprise';
          subscription_status?: 'active' | 'past_due' | 'cancelled' | 'trialing';
          max_users?: number;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          subscription_tier?: 'free' | 'team' | 'enterprise';
          subscription_status?: 'active' | 'past_due' | 'cancelled' | 'trialing';
          max_users?: number;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'rep' | 'manager' | 'admin' | 'super_admin';
          organization_id: string | null;
          job_title: string | null;
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
          role?: 'rep' | 'manager' | 'admin' | 'super_admin';
          organization_id?: string | null;
          job_title?: string | null;
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
          role?: 'rep' | 'manager' | 'admin' | 'super_admin';
          organization_id?: string | null;
          job_title?: string | null;
          territory?: string | null;
          manager_id?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      drugs: {
        Row: {
          id: string;
          organization_id: string | null;
          slug: string;
          name: string;
          category: string;
          indication: string;
          key_data: string;
          competitor_name: string | null;
          mechanism_of_action: string | null;
          approved_claims: Json;
          contraindications: string[] | null;
          common_objections: Json;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          slug: string;
          name: string;
          category: string;
          indication: string;
          key_data: string;
          competitor_name?: string | null;
          mechanism_of_action?: string | null;
          approved_claims?: Json;
          contraindications?: string[] | null;
          common_objections?: Json;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          slug?: string;
          name?: string;
          category?: string;
          indication?: string;
          key_data?: string;
          competitor_name?: string | null;
          mechanism_of_action?: string | null;
          approved_claims?: Json;
          contraindications?: string[] | null;
          common_objections?: Json;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      personas: {
        Row: {
          id: string;
          organization_id: string | null;
          slug: string;
          name: string;
          title: string;
          description: string;
          avatar_url: string | null;
          timer_seconds: number;
          difficulty: 'easy' | 'medium' | 'hard';
          system_prompt: string;
          personality_traits: Json;
          common_questions: Json;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          slug: string;
          name: string;
          title: string;
          description: string;
          avatar_url?: string | null;
          timer_seconds?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          system_prompt: string;
          personality_traits?: Json;
          common_questions?: Json;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          slug?: string;
          name?: string;
          title?: string;
          description?: string;
          avatar_url?: string | null;
          timer_seconds?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          system_prompt?: string;
          personality_traits?: Json;
          common_questions?: Json;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
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
      session_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          sequence_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          sequence_number: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          sequence_number?: number;
          created_at?: string;
        };
      };
      session_feedback: {
        Row: {
          id: string;
          session_id: string;
          overall_score: number;
          score_opening: number | null;
          score_clinical_knowledge: number | null;
          score_objection_handling: number | null;
          score_time_management: number | null;
          score_compliance: number | null;
          score_closing: number | null;
          strengths: string[];
          improvements: string[];
          tips: string | null;
          ai_model_used: string;
          raw_ai_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          overall_score: number;
          score_opening?: number | null;
          score_clinical_knowledge?: number | null;
          score_objection_handling?: number | null;
          score_time_management?: number | null;
          score_compliance?: number | null;
          score_closing?: number | null;
          strengths?: string[];
          improvements?: string[];
          tips?: string | null;
          ai_model_used?: string;
          raw_ai_response?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          overall_score?: number;
          score_opening?: number | null;
          score_clinical_knowledge?: number | null;
          score_objection_handling?: number | null;
          score_time_management?: number | null;
          score_compliance?: number | null;
          score_closing?: number | null;
          strengths?: string[];
          improvements?: string[];
          tips?: string | null;
          ai_model_used?: string;
          raw_ai_response?: Json | null;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          category: 'general' | 'streak' | 'score' | 'volume' | 'persona' | 'drug';
          requirement_type: string;
          requirement_value: number;
          points: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          category?: 'general' | 'streak' | 'score' | 'volume' | 'persona' | 'drug';
          requirement_type: string;
          requirement_value: number;
          points?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: 'general' | 'streak' | 'score' | 'volume' | 'persona' | 'drug';
          requirement_type?: string;
          requirement_value?: number;
          points?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string | null;
          action_type: string;
          action_details: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id?: string | null;
          action_type: string;
          action_details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string | null;
          action_type?: string;
          action_details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_user_stats: {
        Args: { target_user_id: string };
        Returns: Json;
      };
    };
  };
}

// =====================================================
// CONVENIENCE TYPE ALIASES
// =====================================================

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type DbDrug = Database['public']['Tables']['drugs']['Row'];
export type DbDrugInsert = Database['public']['Tables']['drugs']['Insert'];
export type DbDrugUpdate = Database['public']['Tables']['drugs']['Update'];

export type DbPersona = Database['public']['Tables']['personas']['Row'];
export type DbPersonaInsert = Database['public']['Tables']['personas']['Insert'];
export type DbPersonaUpdate = Database['public']['Tables']['personas']['Update'];

export type DbTrainingSession = Database['public']['Tables']['training_sessions']['Row'];
export type DbTrainingSessionInsert = Database['public']['Tables']['training_sessions']['Insert'];
export type DbTrainingSessionUpdate = Database['public']['Tables']['training_sessions']['Update'];

export type DbSessionMessage = Database['public']['Tables']['session_messages']['Row'];
export type DbSessionMessageInsert = Database['public']['Tables']['session_messages']['Insert'];

export type DbSessionFeedback = Database['public']['Tables']['session_feedback']['Row'];
export type DbSessionFeedbackInsert = Database['public']['Tables']['session_feedback']['Insert'];

export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];

export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type ActivityLogInsert = Database['public']['Tables']['activity_log']['Insert'];

// =====================================================
// JOINED/ENRICHED TYPES
// =====================================================

export interface TrainingSessionWithDetails extends DbTrainingSession {
  feedback: DbSessionFeedback | null;
  messages: DbSessionMessage[];
  drug?: DbDrug | null;
  persona?: DbPersona | null;
}

export interface ProfileWithOrganization extends Profile {
  organization: Organization | null;
}

export interface UserStats {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  highest_score: number;
  total_practice_time: number;
  sessions_this_week: number;
  current_streak: number;
}
