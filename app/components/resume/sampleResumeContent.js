// Sample resume content used to render live thumbnails in the template picker.
// Premium (photo) templates get a placeholder headshot; ATS templates don't,
// since those are meant to stay photo-free.

const PREMIUM_PHOTO_BY_TEMPLATE = {
  'premium-sidebar-photo': 'https://randomuser.me/api/portraits/men/32.jpg',
  'premium-topheader-photo': 'https://randomuser.me/api/portraits/women/44.jpg',
  'premium-twocol-photo': 'https://randomuser.me/api/portraits/men/65.jpg',
}

export function getSampleResumeContent(templateSlug) {
  const photoUrl = PREMIUM_PHOTO_BY_TEMPLATE[templateSlug]

  return {
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 555 123 4567',
      location: 'Manila, Philippines',
      linkedin: 'linkedin.com/in/janedoe',
      ...(photoUrl ? { photoUrl } : {}),
    },
    summary:
      'Detail-oriented virtual assistant with 5+ years of experience supporting busy executives and growing teams.',
    experience: [
      {
        id: 'exp1',
        jobTitle: 'Executive Virtual Assistant',
        company: 'Acme Remote Co.',
        startDate: '2022-03',
        current: true,
        description: 'Managed calendars, inboxes, and client communications for 3 executives.',
      },
      {
        id: 'exp2',
        jobTitle: 'Administrative Assistant',
        company: 'Bright Solutions Inc.',
        startDate: '2019-06',
        endDate: '2022-02',
        description: 'Handled scheduling, data entry, and customer support tickets.',
      },
    ],
    education: [
      {
        id: 'edu1',
        degree: 'BS Business Administration',
        school: 'Sample State University',
        startDate: '2015-06',
        endDate: '2019-04',
      },
    ],
    skills: ['Calendar Management', 'Customer Support', 'Data Entry', 'Project Coordination'],
  }
}
