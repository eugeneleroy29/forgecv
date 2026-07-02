-- Add slots tracking to payments
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS slots_purchased integer;

-- Replace case-sensitive slug uniqueness with case-insensitive
ALTER TABLE portfolios
  DROP CONSTRAINT IF EXISTS portfolios_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS portfolios_slug_unique_idx
  ON portfolios (lower(slug))
  WHERE slug IS NOT NULL;

-- Link each lifetime portfolio to the payment that unlocked it
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES payments(id) ON DELETE SET NULL;

-- Track when a portfolio was actually published
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;

-- Lock down template to the defined niche list
ALTER TABLE portfolios
  ADD CONSTRAINT portfolios_template_check
  CHECK (template IN (
    'basic',
    'medical_va',
    'social_media_manager',
    'data_entry',
    'content_writer',
    'ecommerce',
    'customer_service',
    'bookkeeping',
    'graphic_design'
  ));

-- Enforce NOT NULL on user_id
ALTER TABLE portfolios
  ALTER COLUMN user_id SET NOT NULL;
