-- Add provider_customer_id to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN provider_customer_id text;

-- Add provider_customer_id to payments table
ALTER TABLE payments
  ADD COLUMN provider_customer_id text;
