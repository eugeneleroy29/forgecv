-- Add subscriptions table for recurring plans (Starter/Pro)
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('paymongo', 'stripe')),
  provider_subscription_id text,
  plan text NOT NULL CHECK (plan IN ('starter', 'pro')),
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  renewal_type text NOT NULL CHECK (renewal_type IN ('auto', 'manual')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup of a user's active subscription
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription rows
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Extend payments table with provider + payment_type
ALTER TABLE payments
  ADD COLUMN provider text CHECK (provider IN ('paymongo', 'stripe')),
  ADD COLUMN payment_type text CHECK (payment_type IN ('subscription', 'lifetime_slot'));