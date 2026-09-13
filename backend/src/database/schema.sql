-- ====================================================================
-- LIFE RPG — PostgreSQL Database Schema (3NF, Supabase-Optimized)
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- AUTH STUB (Supports running outside Supabase environment if needed)
-- ====================================================================
DO $$
BEGIN
  -- Only create auth stub if auth schema does not exist (local dev)
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE,
      raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auth schema creation: %', SQLERRM;
END $$;

-- ====================================================================
-- 1. PROFILES (Mirrors auth.users, holds core RPG player state)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id                  UUID PRIMARY KEY
                            REFERENCES auth.users(id) ON DELETE CASCADE,
    username            VARCHAR(50) UNIQUE NOT NULL,
    current_level       INTEGER NOT NULL DEFAULT 1,
    total_xp            BIGINT  NOT NULL DEFAULT 0,     -- lifetime cumulative XP
    coins               INTEGER NOT NULL DEFAULT 25,    -- currency for bazaar rewards
    equipped_gear       JSONB   NOT NULL DEFAULT '[]'::jsonb, -- persistent equipped items
    current_streak      INTEGER NOT NULL DEFAULT 0,
    longest_streak      INTEGER NOT NULL DEFAULT 0,
    last_activity_date  DATE,                           -- UTC date of last completion
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Safely attach trigger to auth.users if permissions allow
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Notice: Auth trigger on auth.users can be created via Supabase SQL Editor if permissions are restricted.';
END $$;

-- ====================================================================
-- 2. ATTRIBUTES (Intellect, Strength, Agility, Discipline, etc.)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.attributes (
    attribute_id        SERIAL PRIMARY KEY,
    attribute_name      VARCHAR(30) UNIQUE NOT NULL,
    description         TEXT
);

-- Junction table: profile <-> attribute many-to-many
CREATE TABLE IF NOT EXISTS public.profile_attributes (
    profile_id          UUID NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
    attribute_id        INTEGER NOT NULL
                            REFERENCES public.attributes(attribute_id) ON DELETE RESTRICT,
    attribute_value     INTEGER NOT NULL DEFAULT 0,
    attribute_xp        BIGINT  NOT NULL DEFAULT 0,
    PRIMARY KEY (profile_id, attribute_id)
);

-- ====================================================================
-- 3. TASKS (Quests and Activities)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    task_id             SERIAL PRIMARY KEY,
    profile_id          UUID NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
    title               VARCHAR(120) NOT NULL,
    description         TEXT,
    difficulty          SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    xp_reward           INTEGER NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'active', 'completed', 'archived')),
    remind_daily        BOOLEAN NOT NULL DEFAULT FALSE,
    due_date            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_attribute_rewards (
    task_id             INTEGER NOT NULL
                            REFERENCES public.tasks(task_id) ON DELETE CASCADE,
    attribute_id        INTEGER NOT NULL
                            REFERENCES public.attributes(attribute_id) ON DELETE RESTRICT,
    attribute_xp_value  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (task_id, attribute_id)
);

-- Immutable completion history — insert-only audit trail
CREATE TABLE IF NOT EXISTS public.task_completions (
    completion_id       SERIAL PRIMARY KEY,
    task_id             INTEGER NOT NULL
                            REFERENCES public.tasks(task_id) ON DELETE CASCADE,
    profile_id          UUID NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
    xp_awarded          INTEGER NOT NULL,
    completed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 4. INVENTORY & ITEMS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.items (
    item_id             SERIAL PRIMARY KEY,
    item_name           VARCHAR(80) NOT NULL,
    item_type           VARCHAR(30) NOT NULL,
    description         TEXT,
    rarity              VARCHAR(20) NOT NULL DEFAULT 'common'
                            CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'))
);

CREATE TABLE IF NOT EXISTS public.inventory (
    inventory_id        SERIAL PRIMARY KEY,
    profile_id          UUID NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id             INTEGER NOT NULL
                            REFERENCES public.items(item_id) ON DELETE RESTRICT,
    quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    acquired_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, item_id)
);

-- ====================================================================
-- 5. STREAK ACTIVITIES (Daily completion audit log)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.streak_activities (
    profile_id          UUID NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_date       DATE NOT NULL,          -- UTC calendar day
    completions_count   INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (profile_id, activity_date)
);

-- ====================================================================
-- 6. STREAK AUTOMATION TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_activity_date DATE := (NEW.completed_at AT TIME ZONE 'UTC')::date;
  v_last_date     DATE;
  v_current       INTEGER;
  v_longest       INTEGER;
BEGIN
  -- 1. Log today's activity (idempotent per calendar day)
  INSERT INTO public.streak_activities (profile_id, activity_date, completions_count)
  VALUES (NEW.profile_id, v_activity_date, 1)
  ON CONFLICT (profile_id, activity_date)
  DO UPDATE SET completions_count = streak_activities.completions_count + 1;

  -- 2. Retrieve last activity and streak state
  SELECT last_activity_date, current_streak, longest_streak
    INTO v_last_date, v_current, v_longest
    FROM public.profiles WHERE id = NEW.profile_id;

  IF v_last_date = v_activity_date THEN
    -- Already counted today via an earlier completion — no-op on streak increment
    RETURN NEW;
  ELSIF v_last_date = v_activity_date - INTERVAL '1 day' THEN
    -- Consecutive day — streak increments
    v_current := v_current + 1;
  ELSE
    -- Gap of 2+ days (or first-ever completion) — streak resets to 1
    v_current := 1;
  END IF;

  UPDATE public.profiles
    SET current_streak = v_current,
        longest_streak = GREATEST(COALESCE(v_longest, 0), v_current),
        last_activity_date = v_activity_date
    WHERE id = NEW.profile_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_completed ON public.task_completions;
CREATE TRIGGER on_task_completed
  AFTER INSERT ON public.task_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- ====================================================================
-- 7. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_profile        ON public.tasks(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status         ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_completions_profile  ON public.task_completions(profile_id);
CREATE INDEX IF NOT EXISTS idx_completions_task     ON public.task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_inventory_profile    ON public.inventory(profile_id);
CREATE INDEX IF NOT EXISTS idx_streak_profile       ON public.streak_activities(profile_id);
