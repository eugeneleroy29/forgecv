import AtsHarvardClassic from './AtsHarvardClassic'
import AtsHarvardModern from './AtsHarvardModern'
import PremiumSidebarPhoto from './PremiumSidebarPhoto'
import PremiumTopHeaderPhoto from './PremiumTopHeaderPhoto'
import PremiumTwoColPhoto from './PremiumTwoColPhoto'

// Maps the `template` column value (see resumes_template_check constraint)
// to its rendering component. 'basic' falls back to the original
// ResumePreview component for any pre-existing resumes.
export const RESUME_TEMPLATES = {
  'ats-harvard-classic': AtsHarvardClassic,
  'ats-harvard-modern': AtsHarvardModern,
  'premium-sidebar-photo': PremiumSidebarPhoto,
  'premium-topheader-photo': PremiumTopHeaderPhoto,
  'premium-twocol-photo': PremiumTwoColPhoto,
}

// Returns the component for a given template slug, defaulting to
// AtsHarvardClassic if the slug is unrecognized (shouldn't happen given
// the DB CHECK constraint, but keeps rendering safe either way).
export function getTemplateComponent(templateSlug) {
  return RESUME_TEMPLATES[templateSlug] || AtsHarvardClassic
}
