export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function getFontFamily(content) {
  const fontMap = {
    inter: 'Inter, system-ui, sans-serif',
    georgia: 'Georgia, "Times New Roman", serif',
  }
  return fontMap[content?.customization?.fontFamily] || fontMap.inter
}