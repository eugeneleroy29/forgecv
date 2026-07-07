// Shared helpers used by all resume templates.
// Keeps date formatting, section ordering, and empty-section checks
// consistent across every template component.

export const DEFAULT_SECTION_ORDER = [
  'personalInfo',
  'summary',
  'experience',
  'education',
  'skills',
]

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} ${year}`
}

// Returns the final list of section keys to render, in order.
// Built-in sections are keys like 'summary', 'experience', etc.
// Custom sections are referenced by their own id (e.g. 'custom_abc123').
export function getOrderedSections(content) {
  const savedOrder = content?.sectionOrder
  const customSections = content?.customSections || []
  const customSectionIds = customSections.map((s) => s.id)

  if (savedOrder && savedOrder.length > 0) {
    // Make sure any custom sections not yet present in a saved order
    // (e.g. added after the order was last saved) still show up, appended at the end.
    const missingCustomIds = customSectionIds.filter((id) => !savedOrder.includes(id))
    return [...savedOrder, ...missingCustomIds]
  }

  // No saved order yet (existing resumes created before this feature) —
  // fall back to default built-in order, with any custom sections appended at the end.
  return [...DEFAULT_SECTION_ORDER, ...customSectionIds]
}

// Given a section key (built-in or custom id), returns true if it has no
// content and should be skipped when rendering.
export function isSectionEmpty(sectionKey, content) {
  switch (sectionKey) {
    case 'personalInfo':
      return !content?.personalInfo?.fullName
    case 'summary':
      return !content?.summary
    case 'experience':
      return !(content?.experience?.length > 0)
    case 'education':
      return !(content?.education?.length > 0)
    case 'skills':
      return !(content?.skills?.length > 0)
    default: {
      // Custom section — look it up by id and check if it has any non-empty items.
      const customSection = (content?.customSections || []).find((s) => s.id === sectionKey)
      if (!customSection) return true
      return !(customSection.items?.some((item) => item.text?.trim()))
    }
  }
}

// Convenience lookup used by templates to get a custom section's data by id.
export function getCustomSectionById(sectionKey, content) {
  return (content?.customSections || []).find((s) => s.id === sectionKey) || null
}

// Returns the user's chosen accent color, or the brand default if unset.
export function getAccentColor(content) {
  return content?.customization?.accentColor || '#4F46E5'
}

// Returns the user's chosen font family CSS value, or Inter (default) if unset.
export function getFontFamily(content) {
  const choice = content?.customization?.fontFamily
  return choice === 'georgia' ? 'Georgia, serif' : 'Inter, sans-serif'
}
