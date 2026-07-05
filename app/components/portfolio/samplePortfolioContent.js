export function getSamplePortfolioContent(templateLabel) {
  return {
    personalInfo: {
      fullName: "Maria Santos",
      tagline: `${templateLabel} | 5+ Years Experience`,
      bio: "I help busy business owners stay organized, respond faster, and grow with confidence. Reliable, detail-oriented, and easy to work with.",
    },
    services: [
      { id: 1, name: "Service One", description: "A short description of what this service covers for clients." },
      { id: 2, name: "Service Two", description: "A short description of what this service covers for clients." },
    ],
    experience: [
      {
        id: 1,
        jobTitle: "Previous Role",
        company: "Company Name",
        startDate: "2022-01",
        endDate: "",
        current: true,
        description: "Brief description of responsibilities and achievements in this role.",
      },
    ],
    tools: ["Tool One", "Tool Two", "Tool Three"],
    portfolioItems: [
      { id: 1, title: "Sample Project", description: "A short description of this piece of work.", link: "" },
    ],
    testimonials: [
      { id: 1, name: "Client Name", role: "Founder, Company", quote: "Working with them was a game changer for our business." },
    ],
    contact: { email: "hello@example.com", linkedin: "", website: "" },
  };
}
