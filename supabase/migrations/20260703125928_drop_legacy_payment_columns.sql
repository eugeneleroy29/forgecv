-- Drop unused legacy columns from earlier payments schema planning.
-- Table confirmed empty and columns confirmed unreferenced in codebase
-- before this migration was written. Standardizing on provider/payment_type
-- (added in 20260703123926) which have proper CHECK constraints.
ALTER TABLE payments
  DROP COLUMN payment_provider,
  DROP COLUMN type;