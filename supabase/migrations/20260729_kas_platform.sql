-- KAS Pass — Definitive Platform Migration
-- Run this in the Supabase SQL Editor (replaces 001_kas_schema.sql)

-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Drop existing tables (clean slate) ──────────────────────────────────────
DROP TABLE IF EXISTS public.kas_redemptions   CASCADE;
DROP TABLE IF EXISTS public.kas_subscriptions CASCADE;
DROP TABLE IF EXISTS public.kas_merchants     CASCADE;
DROP TABLE IF EXISTS public.kas_plans         CASCADE;

-- ─── 1. KAS_PLANS ─────────────────────────────────────────────────────────────
CREATE TABLE public.kas_plans (
  id                    UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT    NOT NULL,
  slug                  TEXT    UNIQUE NOT NULL,
  price_monthly         INTEGER NOT NULL,  -- pence: 1499 = £14.99
  price_annual          INTEGER NOT NULL,  -- pence: 14388 = £143.88/yr
  credits_per_month     INTEGER NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual  TEXT,
  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. KAS_MERCHANTS ─────────────────────────────────────────────────────────
CREATE TABLE public.kas_merchants (
  id                      UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT    NOT NULL,
  slug                    TEXT    UNIQUE NOT NULL,
  neighborhood            TEXT    NOT NULL, -- 'City Centre' | 'FarGo Village' | 'Earlsdon' | 'Leamington Spa'
  address                 TEXT    NOT NULL,
  perk_description        TEXT    NOT NULL,
  image_url               TEXT,
  secret_pin              TEXT    NOT NULL, -- SHA-256 hash of the 4-digit scanner PIN
  payout_rate_per_credit  INTEGER DEFAULT 170, -- pence (£1.70)
  active                  BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. KAS_SUBSCRIPTIONS ─────────────────────────────────────────────────────
CREATE TABLE public.kas_subscriptions (
  id                      UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                 UUID    NOT NULL REFERENCES public.kas_plans(id),
  stripe_subscription_id  TEXT    UNIQUE,
  stripe_customer_id      TEXT,
  status                  TEXT    NOT NULL DEFAULT 'active', -- 'active' | 'past_due' | 'canceled'
  remaining_credits       INTEGER NOT NULL DEFAULT 0,
  billing_cycle           TEXT    NOT NULL DEFAULT 'monthly', -- 'monthly' | 'annual'
  current_period_end      TIMESTAMPTZ NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX kas_subscriptions_active_user_idx
  ON public.kas_subscriptions (user_id)
  WHERE status = 'active';

-- ─── 4. KAS_REDEMPTIONS ───────────────────────────────────────────────────────
CREATE TABLE public.kas_redemptions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  merchant_id  UUID NOT NULL REFERENCES public.kas_merchants(id),
  credits_used INTEGER DEFAULT 1,
  redeemed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE public.kas_plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_merchants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_redemptions    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_public_read"
  ON public.kas_plans FOR SELECT USING (active = true);

CREATE POLICY "merchants_public_read"
  ON public.kas_merchants FOR SELECT USING (active = true);

CREATE POLICY "subscriptions_own"
  ON public.kas_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "redemptions_own"
  ON public.kas_redemptions FOR SELECT USING (auth.uid() = user_id);

-- ─── SEED DATA — PLANS ────────────────────────────────────────────────────────
INSERT INTO public.kas_plans
  (name, slug, price_monthly, price_annual, credits_per_month)
VALUES
  ('Coffee Pass',       'coffee-pass', 1499, 14388, 6),
  ('KAS VIP All-Access','kas-vip',     2999, 28788, 12);

-- ─── SEED DATA — MERCHANTS ────────────────────────────────────────────────────
-- Default PIN for all seed merchants is '1234'
-- SHA-256('1234') = 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
INSERT INTO public.kas_merchants
  (name, slug, neighborhood, address, perk_description, secret_pin)
VALUES
  (
    'Bean & Leaf Coffee House',
    'bean-and-leaf',
    'City Centre',
    '14 Broadgate, Coventry CV1 1NG',
    'Specialty Coffee & Single-Origin Pour-Overs',
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
  ),
  (
    'Sugar & Spice Tea Room',
    'sugar-and-spice',
    'FarGo Village',
    'FarGo Village, Far Gosford St, Coventry CV1 5ED',
    'Specialty Teas, Pastries & Seasonal Bakes',
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
  ),
  (
    'Shortland Coffee Co',
    'shortland-coffee',
    'City Centre',
    '12 Shortland Street, Coventry CV1 2HR',
    'Specialty Coffee & Matchas',
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
  ),
  (
    'O''Tooles Cafe',
    'otooles-cafe',
    'Earlsdon',
    '88 Earlsdon Street, Coventry CV5 6EJ',
    'Brunch Plates, Filter Coffee & House Bakes',
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
  );
