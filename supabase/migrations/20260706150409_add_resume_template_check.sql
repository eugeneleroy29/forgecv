
-- Restrict resumes.template to known template slugs

ALTER TABLE resumes

ADD CONSTRAINT resumes_template_check

CHECK (template IN (

  'basic',

  'ats-harvard-classic',

  'ats-harvard-modern',

  'premium-sidebar-photo',

  'premium-topheader-photo',

  'premium-twocol-photo'

));

