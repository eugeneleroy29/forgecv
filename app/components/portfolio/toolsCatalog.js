// Preset catalog for the "Skills & Tools I Use" portfolio section.
// Each tool's `slug` maps to a Simple Icons CDN URL: https://cdn.simpleicons.org/{slug}
// If a slug is ever wrong/removed upstream, that single icon will just fail to load —
// the <img onError> handler in the UI hides it gracefully rather than showing a broken image.

export const TOOLS_CATALOG = [
  {
    id: "productivity",
    label: "Productivity & Documents",
    tools: [
      { name: "Google Workspace", slug: "google" },
      { name: "Gmail", slug: "gmail" },
      { name: "Google Calendar", slug: "googlecalendar" },
      { name: "Google Docs", slug: "googledocs" },
      { name: "Google Sheets", slug: "googlesheets" },
      { name: "Google Slides", slug: "googleslides" },
      { name: "Google Drive", slug: "googledrive" },
      { name: "Microsoft Word", slug: "microsoftword" },
      { name: "Microsoft Excel", slug: "microsoftexcel" },
      { name: "Microsoft PowerPoint", slug: "microsoftpowerpoint" },
      { name: "Microsoft OneNote", slug: "microsoftonenote" },
      { name: "Microsoft Outlook", slug: "microsoftoutlook" },
      { name: "Microsoft OneDrive", slug: "microsoftonedrive" },
      { name: "Notion", slug: "notion" },
    ],
  },
  {
    id: "design",
    label: "Design & Content Creation",
    tools: [
      { name: "Canva", slug: "canva" },
      { name: "Figma", slug: "figma" },
      { name: "ChatGPT", slug: "openai" },
      { name: "Claude", slug: "claude" },
      { name: "CapCut", slug: "capcut" },
    ],
  },
  {
    id: "crm",
    label: "CRM & Business Tools",
    tools: [
      { name: "Salesforce", slug: "salesforce" },
      { name: "HubSpot", slug: "hubspot" },
      { name: "Trello", slug: "trello" },
      { name: "Asana", slug: "asana" },
      { name: "ClickUp", slug: "clickup" },
    ],
  },
  {
    id: "communication",
    label: "Communication & Call Tools",
    tools: [
      { name: "Slack", slug: "slack" },
      { name: "Zoom", slug: "zoom" },
      { name: "Microsoft Teams", slug: "microsoftteams" },
      { name: "Google Meet", slug: "googlemeet" },
      { name: "WhatsApp", slug: "whatsapp" },
    ],
  },
  {
    id: "social",
    label: "Social Media & Outreach",
    tools: [
      { name: "Facebook", slug: "facebook" },
      { name: "Instagram", slug: "instagram" },
      { name: "LinkedIn", slug: "linkedin" },
      { name: "X (Twitter)", slug: "x" },
    ],
  },
];

// Flat lookup: slug -> tool name, used for quick search/matching.
export const ALL_CATALOG_TOOLS = TOOLS_CATALOG.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool, categoryId: category.id }))
);