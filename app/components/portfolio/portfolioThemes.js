// Visual theme tokens per portfolio template.
// Each niche gets a distinct accent color and headline treatment,
// while sharing the same overall page layout and structure.

export const PORTFOLIO_THEMES = {
  medical_va: {
    label: "Medical VA",
    accent: "#0F766E",
    accentSoft: "#CCFBF1",
    headingFont: "sans",
  },
  social_media_manager: {
    label: "Social Media Manager",
    accent: "#DB2777",
    accentSoft: "#FCE7F3",
    headingFont: "sans",
  },
  data_entry: {
    label: "Data Entry",
    accent: "#334155",
    accentSoft: "#E2E8F0",
    headingFont: "sans",
  },
  content_writer: {
    label: "Content Writer",
    accent: "#9F1239",
    accentSoft: "#FFE4E6",
    headingFont: "serif",
  },
  ecommerce: {
    label: "E-commerce VA",
    accent: "#C2410C",
    accentSoft: "#FFEDD5",
    headingFont: "sans",
  },
  customer_service: {
    label: "Customer Service",
    accent: "#B45309",
    accentSoft: "#FEF3C7",
    headingFont: "sans",
  },
  bookkeeping: {
    label: "Bookkeeping",
    accent: "#1E3A5F",
    accentSoft: "#DBEAFE",
    headingFont: "serif",
  },
  graphic_design: {
    label: "Graphic Design",
    accent: "#7C3AED",
    accentSoft: "#EDE9FE",
    headingFont: "sans",
  },
  aurora: {
    label: "Aurora (Premium)",
    accent: "#6366f1", // Indigo
    accentSoft: "#f5f3ff",
    headingFont: "sans",
    variant: "aurora", // Special flag for the renderer
  },
  basic: {
    label: "General",
    accent: "#4F46E5",
    accentSoft: "#E0E7FF",
    headingFont: "sans",
  },
};

export function getPortfolioTheme(template) {
  return PORTFOLIO_THEMES[template] || PORTFOLIO_THEMES.basic;
}