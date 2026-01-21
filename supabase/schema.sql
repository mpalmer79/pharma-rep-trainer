-- =====================================================
-- PharmaRep Trainer (RepIQ) - Supabase Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates all tables, indexes, RLS policies, and functions
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ORGANIZATIONS TABLE
-- For B2B: pharma companies, training organizations
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1B4D7A',
  accent_color TEXT DEFAULT '#E67E22',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'team', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
  max_users INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. USER PROFILES TABLE
-- Extended user data linked to Supabase Auth
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'rep' CHECK (role IN ('rep', 'manager', 'admin', 'super_admin')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  job_title TEXT,
  territory TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{
    "notifications_email": true,
    "notifications_push": false,
    "theme": "light",
    "default_timer_multiplier": 1.0
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CUSTOM DRUGS TABLE
-- Organization-specific drug/product configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS drugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  indication TEXT NOT NULL,
  key_data TEXT NOT NULL,
  competitor_name TEXT,
  mechanism_of_action TEXT,
  approved_claims JSONB DEFAULT '[]',
  contraindications TEXT[],
  common_objections JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE, -- For system-wide default drugs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- =====================================================
-- 4. CUSTOM PERSONAS TABLE
-- Organization-specific physician personas
-- =====================================================
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_url TEXT,
  timer_seconds INTEGER DEFAULT 180,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  system_prompt TEXT NOT NULL,
  personality_traits JSONB DEFAULT '[]',
  common_questions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE, -- For system-wide default personas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- =====================================================
-- 5. TRAINING SESSIONS TABLE
-- Core session data - the heart of the application
-- =====================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  drug_id UUID REFERENCES drugs(id) ON DELETE SET NULL,
  drug_slug TEXT NOT NULL, -- Fallback if drug_id is null (for default drugs)
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  persona_slug TEXT NOT NULL, -- Fallback if persona_id is null
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  time_limit_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. SESSION MESSAGES TABLE
-- Individual messages within a training session
-- =====================================================
CREATE TABLE IF NOT EXISTS session_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. SESSION FEEDBACK TABLE
-- AI-generated feedback and scores
-- =====================================================
CREATE TABLE IF NOT EXISTS session_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE UNIQUE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  score_opening INTEGER CHECK (score_opening >= 0 AND score_opening <= 100),
  score_clinical_knowledge INTEGER CHECK (score_clinical_knowledge >= 0 AND score_clinical_knowledge <= 100),
  score_objection_handling INTEGER CHECK (score_objection_handling >= 0 AND score_objection_handling <= 100),
  score_time_management INTEGER CHECK (score_time_management >= 0 AND score_time_management <= 100),
  score_compliance INTEGER CHECK (score_compliance >= 0 AND score_compliance <= 100),
  score_closing INTEGER CHECK (score_closing >= 0 AND score_closing <= 100),
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  tips TEXT,
  ai_model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. USER ACHIEVEMENTS TABLE
-- Gamification - badges, milestones
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'streak', 'score', 'volume', 'persona', 'drug')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- 9. ACTIVITY LOG TABLE
-- For manager dashboards and audit trails
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_manager ON profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_drugs_organization ON drugs(organization_id);
CREATE INDEX IF NOT EXISTS idx_drugs_active ON drugs(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_personas_organization ON personas(organization_id);
CREATE INDEX IF NOT EXISTS idx_personas_active ON personas(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_sessions_user ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_organization ON training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON training_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_completed ON training_sessions(user_id, status) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_messages_session ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_sequence ON session_messages(session_id, sequence_number);

CREATE INDEX IF NOT EXISTS idx_feedback_session ON session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_score ON session_feedback(overall_score DESC);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_organization ON activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Managers can view team profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.role IN ('manager', 'admin', 'super_admin'))
      AND p.organization_id = profiles.organization_id
    )
  );

-- ORGANIZATIONS POLICIES
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = organizations.id
    )
  );

CREATE POLICY "Admins can update own organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = organizations.id
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- DRUGS POLICIES
CREATE POLICY "Users can view default drugs"
  ON drugs FOR SELECT
  USING (is_default = TRUE AND is_active = TRUE);

CREATE POLICY "Users can view organization drugs"
  ON drugs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = drugs.organization_id
    )
    AND is_active = TRUE
  );

CREATE POLICY "Admins can manage organization drugs"
  ON drugs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = drugs.organization_id
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- PERSONAS POLICIES
CREATE POLICY "Users can view default personas"
  ON personas FOR SELECT
  USING (is_default = TRUE AND is_active = TRUE);

CREATE POLICY "Users can view organization personas"
  ON personas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = personas.organization_id
    )
    AND is_active = TRUE
  );

CREATE POLICY "Admins can manage organization personas"
  ON personas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = personas.organization_id
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- TRAINING SESSIONS POLICIES
CREATE POLICY "Users can view own sessions"
  ON training_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON training_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team sessions"
  ON training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles manager
      JOIN profiles rep ON rep.manager_id = manager.id OR rep.organization_id = manager.organization_id
      WHERE manager.id = auth.uid()
      AND manager.role IN ('manager', 'admin', 'super_admin')
      AND rep.id = training_sessions.user_id
    )
  );

-- SESSION MESSAGES POLICIES
CREATE POLICY "Users can view own session messages"
  ON session_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = session_messages.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session messages"
  ON session_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = session_messages.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- SESSION FEEDBACK POLICIES
CREATE POLICY "Users can view own feedback"
  ON session_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = session_feedback.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert feedback"
  ON session_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = session_feedback.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- ACHIEVEMENTS POLICIES (readable by all authenticated users)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (is_active = TRUE);

-- USER ACHIEVEMENTS POLICIES
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can grant achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ACTIVITY LOG POLICIES
CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view team activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin', 'super_admin')
      AND profiles.organization_id = activity_log.organization_id
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drugs_updated_at
  BEFORE UPDATE ON drugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Calculate user stats function
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COUNT(*)::INTEGER,
    'completed_sessions', COUNT(*) FILTER (WHERE status = 'completed')::INTEGER,
    'average_score', COALESCE(ROUND(AVG(sf.overall_score))::INTEGER, 0),
    'highest_score', COALESCE(MAX(sf.overall_score)::INTEGER, 0),
    'total_practice_time', COALESCE(SUM(duration_seconds)::INTEGER, 0),
    'sessions_this_week', COUNT(*) FILTER (WHERE started_at >= NOW() - INTERVAL '7 days')::INTEGER,
    'current_streak', 0 -- Calculated separately if needed
  )
  INTO result
  FROM training_sessions ts
  LEFT JOIN session_feedback sf ON sf.session_id = ts.id
  WHERE ts.user_id = target_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA: Default Drugs
-- =====================================================
INSERT INTO drugs (slug, name, category, indication, key_data, competitor_name, mechanism_of_action, is_default, is_active)
VALUES
  ('cardiostat', 'CardioStat', 'Cardiovascular', 'Hypertension', 
   'Phase 3 trials showed 23% greater BP reduction vs. ACE inhibitors, with 40% fewer instances of dry cough',
   'Lisinopril', 'Novel calcium channel blocker with dual endothelin receptor antagonism', TRUE, TRUE),
  
  ('gluconorm', 'GlucoNorm XR', 'Diabetes', 'Type 2 Diabetes',
   'A1C reduction of 1.4% at 12 weeks, weight-neutral profile, once-daily dosing',
   'Metformin', 'GLP-1 receptor agonist with enhanced tissue selectivity', TRUE, TRUE),
  
  ('immunex', 'Immunex Pro', 'Immunology', 'Rheumatoid Arthritis',
   'ACR50 response in 62% of patients at week 24, convenient auto-injector, 2-week dosing interval',
   'Humira', 'IL-6 inhibitor with modified Fc region for extended half-life', TRUE, TRUE),
  
  ('neurocalm', 'NeuroCalm', 'CNS', 'Generalized Anxiety Disorder',
   'HAM-A score reduction of 12.4 points vs 8.2 for placebo at week 8, low discontinuation rate',
   'Lexapro', 'Selective serotonin reuptake inhibitor with 5-HT1A partial agonism', TRUE, TRUE),
  
  ('oncoshield', 'OncoShield', 'Oncology', 'Non-Small Cell Lung Cancer',
   'Median PFS of 18.9 months vs 10.2 months for standard of care, manageable safety profile',
   'Keytruda', 'PD-L1 inhibitor with novel tumor microenvironment modulation', TRUE, TRUE)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- =====================================================
-- SEED DATA: Default Personas
-- =====================================================
INSERT INTO personas (slug, name, title, description, avatar_url, timer_seconds, difficulty, system_prompt, is_default, is_active)
VALUES
  ('rush', 'Dr. Sarah Chen', 'Time-Pressed PCP', 
   'Busy primary care physician. You have exactly 90 seconds before her next patient.',
   'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
   90, 'hard',
   'You are Dr. Sarah Chen, a busy primary care physician at a large medical group. You''re between patients and a pharmaceutical rep has just walked in.

YOUR PERSONALITY & BEHAVIOR:
- You''re professionally courteous but visibly rushed - you keep glancing at your watch or the door
- You have about 90 seconds before your next patient
- You interrupt if the rep rambles or doesn''t get to the point quickly
- You ask pointed questions: "What''s the NNT?" "How does it compare to [competitor]?" "What''s the copay situation?"
- You''re skeptical of marketing claims - you want data
- If the rep wastes time with small talk beyond a brief greeting, you redirect them
- You might get paged or interrupted

YOUR KNOWLEDGE:
- You''re familiar with standard treatments in this therapeutic area
- You''ve seen many reps and heard many pitches
- You care about: efficacy data, side effect profile, cost/coverage, patient convenience

CONVERSATION RULES:
- Keep responses brief (1-3 sentences typically)
- After 4-5 exchanges, start wrapping up ("I really need to get to my next patient")
- If the rep makes unsupported claims, push back
- If they handle objections well, show slight warming
- Never break character - you ARE Dr. Chen
- Use natural speech patterns with occasional interruptions like "*glances at door*" or "*phone buzzes*"',
   TRUE, TRUE),

  ('skeptic', 'Dr. Michael Torres', 'Data-Driven Skeptic',
   'Academic physician who challenges every claim. Bring your clinical evidence.',
   'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
   180, 'hard',
   'You are Dr. Michael Torres, an academic physician at a university medical center who also sees patients. A pharmaceutical rep wants to discuss a medication with you.

YOUR PERSONALITY & BEHAVIOR:
- You''re intellectually rigorous and somewhat intimidating
- You''ve read the clinical trials and know the limitations
- You ask about: confidence intervals, NNT/NNH, study populations, real-world vs. trial data
- You challenge claims: "That''s the relative risk reduction. What''s the absolute risk reduction?"
- You''re not rude, but you don''t suffer vague marketing language
- If the rep demonstrates genuine clinical knowledge, you engage more warmly
- You appreciate when reps admit they don''t know something rather than bluffing

YOUR KNOWLEDGE:
- You know the published literature well
- You''re aware of competitor data
- You understand pharma marketing tactics
- You''ve been on FDA advisory committees

CONVERSATION RULES:
- Ask follow-up questions that test depth of knowledge
- If the rep doesn''t know something, note whether they admit it honestly or try to bluff
- You can be convinced by good data and honest engagement
- Show respect for reps who know their science
- Never break character
- Use phrases like "*leans forward*" or "*raises eyebrow*" to convey skepticism',
   TRUE, TRUE),

  ('loyalist', 'Dr. Patricia Williams', 'Competitor Loyalist',
   'Happy with her current prescribing. You need a compelling reason to switch.',
   'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face',
   150, 'medium',
   'You are Dr. Patricia Williams, a community physician who has been prescribing a competitor medication successfully for years. A rep wants you to consider switching.

YOUR PERSONALITY & BEHAVIOR:
- You''re friendly but firmly attached to your current choice
- "I''ve been using [competitor] for years and my patients do well on it"
- You need a COMPELLING reason to change - "Why would I switch?"
- You bring up real concerns: "What about patients who are stable on their current regimen?"
- You''re open to listening but skeptical of change for change''s sake
- You value your relationship with patients and don''t want to disrupt their care

YOUR KNOWLEDGE:
- Deep experience with the competitor product
- You know its side effects and how to manage them
- You''ve tried new drugs before that didn''t live up to the hype
- You''re aware of the hassle of prior authorizations for new drugs

CONVERSATION RULES:
- Keep coming back to "but why switch?"
- If the rep finds a genuine differentiator relevant to your patients, show interest
- Don''t be a pushover - make them work for it
- Warm up if they identify specific patient populations who might benefit
- Never break character
- Use warm but skeptical body language cues',
   TRUE, TRUE),

  ('gatekeeper', 'Monica Reynolds', 'Office Manager / Gatekeeper',
   'Controls access to the physicians. Get past her first.',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
   120, 'medium',
   'You are Monica Reynolds, the office manager at a busy medical practice. You control which pharmaceutical reps get face time with the doctors.

YOUR PERSONALITY & BEHAVIOR:
- You''re professional but protective of the physicians'' time
- You''ve seen every trick in the book from reps
- You respond well to: respect, efficiency, genuine value propositions
- You respond poorly to: pushiness, going over your head, treating you as "just" the gatekeeper
- You can be an ally if the rep treats you well
- You know which doctors are interested in which therapeutic areas

YOUR KNOWLEDGE:
- You know the practice''s prescribing patterns generally
- You know which reps have been helpful vs. annoying in the past
- You understand insurance and prior auth headaches

CONVERSATION RULES:
- Start somewhat guarded
- If the rep is respectful and has something genuinely useful, warm up
- You can offer to schedule time or pass along materials
- If they''re pushy or dismissive, become more resistant
- Never break character
- You''re the first test - a good rep relationship starts here',
   TRUE, TRUE),

  ('curious', 'Dr. James Park', 'Early Adopter',
   'Interested in new treatments but asks deep mechanistic questions.',
   'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
   180, 'easy',
   'You are Dr. James Park, a physician who enjoys learning about new treatments and is open to trying them with appropriate patients.

YOUR PERSONALITY & BEHAVIOR:
- You''re genuinely curious and engaged
- You ask deep questions about mechanism of action
- "How does this work at the receptor level?"
- You''re interested in where this fits in your treatment algorithm
- You want to understand which patients are ideal candidates
- You''re friendly and make the rep feel comfortable

YOUR KNOWLEDGE:
- You keep up with medical literature
- You''ve been an early adopter of other successful drugs
- You understand you might be getting the "marketing version" and probe deeper

CONVERSATION RULES:
- Be encouraging but still ask substantive questions
- Show genuine interest in the science
- If the rep knows their stuff, express enthusiasm
- Still test their knowledge, but in a friendly way
- Ask about real-world experience and post-marketing data
- Never break character',
   TRUE, TRUE)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- =====================================================
-- SEED DATA: Default Achievements
-- =====================================================
INSERT INTO achievements (slug, name, description, icon, category, requirement_type, requirement_value, points)
VALUES
  ('first_session', 'First Steps', 'Complete your first training session', '🎯', 'general', 'sessions_completed', 1, 10),
  ('five_sessions', 'Getting Started', 'Complete 5 training sessions', '📚', 'volume', 'sessions_completed', 5, 25),
  ('ten_sessions', 'Dedicated Learner', 'Complete 10 training sessions', '🏃', 'volume', 'sessions_completed', 10, 50),
  ('twentyfive_sessions', 'Training Enthusiast', 'Complete 25 training sessions', '💪', 'volume', 'sessions_completed', 25, 100),
  ('fifty_sessions', 'Sales Warrior', 'Complete 50 training sessions', '🏆', 'volume', 'sessions_completed', 50, 200),
  
  ('score_70', 'Competent', 'Score 70 or higher on a session', '⭐', 'score', 'min_score', 70, 15),
  ('score_80', 'Strong Performer', 'Score 80 or higher on a session', '🌟', 'score', 'min_score', 80, 30),
  ('score_90', 'Excellence', 'Score 90 or higher on a session', '💫', 'score', 'min_score', 90, 50),
  ('score_95', 'Near Perfect', 'Score 95 or higher on a session', '🎖️', 'score', 'min_score', 95, 100),
  
  ('streak_3', 'Consistent', 'Practice 3 days in a row', '🔥', 'streak', 'streak_days', 3, 20),
  ('streak_7', 'Weekly Warrior', 'Practice 7 days in a row', '🔥🔥', 'streak', 'streak_days', 7, 50),
  ('streak_14', 'Unstoppable', 'Practice 14 days in a row', '🔥🔥🔥', 'streak', 'streak_days', 14, 100),
  ('streak_30', 'Legend', 'Practice 30 days in a row', '👑', 'streak', 'streak_days', 30, 250),
  
  ('all_personas', 'Versatile', 'Complete a session with each default persona', '🎭', 'persona', 'unique_personas', 5, 75),
  ('all_drugs', 'Product Expert', 'Complete a session with each default drug', '💊', 'drug', 'unique_drugs', 5, 75),
  
  ('time_master_rush', 'Time Master', 'Score 80+ with Dr. Sarah Chen (Time-Pressed)', '⏱️', 'persona', 'persona_score', 80, 50),
  ('skeptic_slayer', 'Skeptic Slayer', 'Score 80+ with Dr. Michael Torres (Skeptic)', '🧪', 'persona', 'persona_score', 80, 50),
  ('loyalty_breaker', 'Loyalty Breaker', 'Score 80+ with Dr. Patricia Williams (Loyalist)', '💔', 'persona', 'persona_score', 80, 50)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
