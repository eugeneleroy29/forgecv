-- Allow new portfolio templates without constraint updates
-- The 'aurora' template and future templates will be validated in application code
ALTER TABLE portfolios
  DROP CONSTRAINT IF EXISTS portfolios_template_check;

-- Add a comment documenting the change
COMMENT ON COLUMN portfolios.template IS 'Portfolio template identifier. Previously constrained to 9 values, now free-form. Validated in application code.';
