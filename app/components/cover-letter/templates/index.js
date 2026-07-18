import AtsClassic from './AtsClassic'
import AtsModern from './AtsModern'
import PremiumSidebar from './PremiumSidebar'
import PremiumMinimal from './PremiumMinimal'

export const COVER_LETTER_TEMPLATES = {
  'ats-classic': AtsClassic,
  'ats-modern': AtsModern,
  'premium-sidebar': PremiumSidebar,
  'premium-minimal': PremiumMinimal,
}

export function getCoverLetterTemplateComponent(templateSlug) {
  return COVER_LETTER_TEMPLATES[templateSlug] || AtsClassic
}