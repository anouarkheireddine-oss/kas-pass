-- KAS Pass schema
-- Run in Supabase SQL editor or via `supabase db push`

-- ── Plans ────────────────────────────────────────────────────────────────────
create table if not exists kas_plans (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  price_monthly       integer not null,          -- pence
  credits_per_month   integer not null,
  stripe_price_id     text not null,
  active              boolean not null default true,
  created_at          timestamptz default now()
);

-- ── Subscriptions ─────────────────────────────────────────────────────────────
create table if not exists kas_subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  plan_id                 uuid not null references kas_plans(id),
  stripe_subscription_id  text unique not null,
  status                  text not null check (status in ('active','past_due','canceled')),
  remaining_credits       integer not null default 0,
  current_period_end      timestamptz not null,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create unique index if not exists kas_subscriptions_user_active
  on kas_subscriptions (user_id)
  where status = 'active';

-- ── Merchants ─────────────────────────────────────────────────────────────────
create table if not exists kas_merchants (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  slug                  text unique not null,
  address               text,
  category              text not null check (category in ('cafe','bakery','pub','event')),
  secret_pin_hash       text not null,            -- bcrypt hash
  payout_rate_per_credit integer not null default 170,  -- pence
  active                boolean not null default true,
  created_at            timestamptz default now()
);

-- ── Redemptions ───────────────────────────────────────────────────────────────
create table if not exists kas_redemptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id),
  merchant_id     uuid not null references kas_merchants(id),
  subscription_id uuid not null references kas_subscriptions(id),
  credit_amount   integer not null default 1,
  redeemed_at     timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table kas_plans          enable row level security;
alter table kas_subscriptions  enable row level security;
alter table kas_merchants      enable row level security;
alter table kas_redemptions    enable row level security;

-- Plans: anyone can read active plans
create policy "plans_public_read" on kas_plans
  for select using (active = true);

-- Subscriptions: users read/manage their own only
create policy "subs_own_read" on kas_subscriptions
  for select using (auth.uid() = user_id);

create policy "subs_own_update" on kas_subscriptions
  for update using (auth.uid() = user_id);

-- Redemptions: users read their own; service role inserts
create policy "redemptions_own_read" on kas_redemptions
  for select using (auth.uid() = user_id);

-- Merchants: public read of active merchants
create policy "merchants_public_read" on kas_merchants
  for select using (active = true);

-- ── Seed plans ───────────────────────────────────────────────────────────────
insert into kas_plans (name, price_monthly, credits_per_month, stripe_price_id) values
  ('Coffee Pass', 1499, 6,  'price_REPLACE_COFFEE'),
  ('VIP Pass',    2999, 15, 'price_REPLACE_VIP')
on conflict do nothing;
