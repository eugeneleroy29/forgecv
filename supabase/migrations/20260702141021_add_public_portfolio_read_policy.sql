-- Allow anonymous/public visitors to view published portfolios
-- This is additive: combines via OR with the existing owner-only policy,
-- so drafts remain fully private to their owner.
CREATE POLICY "Public can view published portfolios"
ON portfolios
FOR SELECT
USING (is_published = true);
