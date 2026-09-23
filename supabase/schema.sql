-- ============================================================================
-- AdvokatAI - Supabase PostgreSQL Production Database Schema
-- Idempotent & Non-Destructive: Safe to run multiple times without data loss
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  plan_id TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan_id);

-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'so''m',
  payment_method TEXT DEFAULT 'card',
  transaction_reference TEXT,
  payer_name TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING | PAID | REJECTED | REFUNDED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON public.payments(transaction_reference);

-- 3. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  plan_id TEXT PRIMARY KEY, -- 'free' | 'pro' | 'premium'
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'so''m',
  daily_limit INTEGER DEFAULT 10,
  monthly_limit INTEGER DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  duration TEXT DEFAULT '30 kun',
  popular BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default plans if not existing
INSERT INTO public.plans (plan_id, name, price, currency, daily_limit, monthly_limit, active, duration, popular)
VALUES
  ('free', 'Bepul', 0, 'so''m', 10, 100, true, 'doim', false),
  ('pro', 'Pro', 18000, 'so''m', 50, 500, true, '30 kun', true),
  ('premium', 'Premium', 30000, 'so''m', 200, 2000, true, '30 kun', false)
ON CONFLICT (plan_id) DO NOTHING;

-- 4. TEMPLATE ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.template_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- download | copy | edit | export
  meta JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_actions_user ON public.template_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_template_actions_type ON public.template_actions(action_type);

-- 5. USER TEMPLATES (DRAFT SAVES)
CREATE TABLE IF NOT EXISTS public.user_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_templates_lookup ON public.user_templates(user_id, template_id);

-- 6. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
  id TEXT PRIMARY KEY,
  query_id TEXT,
  user_id TEXT,
  rating TEXT NOT NULL, -- positive | negative
  reason TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- 7. ANALYTICS & QUERY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.analytics (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  intent TEXT,
  query TEXT,
  confidence NUMERIC,
  composite_confidence JSONB,
  latency_ms INTEGER,
  is_error BOOLEAN DEFAULT FALSE,
  needs_clarification BOOLEAN DEFAULT FALSE,
  safety_interception JSONB,
  raw_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_intent ON public.analytics(intent);

-- 8. USAGE TRACKING (DAILY & MONTHLY QUOTAS)
CREATE TABLE IF NOT EXISTS public.usage (
  id TEXT PRIMARY KEY, -- e.g. {userId}:{YYYY-MM-DD}
  user_id TEXT NOT NULL,
  day_key TEXT,
  month_key TEXT,
  daily_used INTEGER DEFAULT 0,
  monthly_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_user ON public.usage(user_id);

-- 9. APP SETTINGS (LIVE PAYMENT CARD CONFIG)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.settings (key, value)
VALUES (
  'payment_config',
  '{
    "payment_card_number": "4466 1369 5151 4448",
    "payment_card_holder": "Zokirov Zafar",
    "payment_bank_name": "Humo / Uzcard / Visa",
    "payment_instructions": "Kartaga to''lovni o''tkazing va chek yoki tranzaksiya ID raqamini kiriting."
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Plans & Public Settings: readable by all visitors
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public plans readable by everyone') THEN
    CREATE POLICY "Public plans readable by everyone" ON public.plans FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public settings readable by everyone') THEN
    CREATE POLICY "Public settings readable by everyone" ON public.settings FOR SELECT USING (true);
  END IF;
END $$;

-- Service role: full access to all tables for server backend operations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on users') THEN
    CREATE POLICY "Service role full access on users" ON public.users FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on payments') THEN
    CREATE POLICY "Service role full access on payments" ON public.payments FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on template_actions') THEN
    CREATE POLICY "Service role full access on template_actions" ON public.template_actions FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on feedback') THEN
    CREATE POLICY "Service role full access on feedback" ON public.feedback FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on analytics') THEN
    CREATE POLICY "Service role full access on analytics" ON public.analytics FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on usage') THEN
    CREATE POLICY "Service role full access on usage" ON public.usage FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
