// Site-wide business content. Edit values here; components never hard-code them.

export const site = {
  name: 'VaranasiTrails',
  /** Text logo, shown in the header and footer. */
  logoText: 'Varanasi',
  logoAccent: 'Trails',
  tagline: 'Guided trips in Varanasi and Uttar Pradesh',
  description:
    'Boat rides, heritage walks, food trails and pilgrimages in Varanasi, Sarnath and Uttar Pradesh. Book through WhatsApp.',
  // TODO(business): replace with the real production URL.
  siteUrl: 'https://www.varanasitrails.example',
  contactEmail: 'hello@varanasitrails.example',
  office: {
    name: 'VaranasiTrails Travel Desk',
    lines: ['D 12/40, Godowlia Road', 'Varanasi, Uttar Pradesh 221001', 'India'],
  },
  supportHours: 'Every day, 7:00 am to 9:00 pm IST',
  seo: {
    titleTemplate: '%s | VaranasiTrails',
    defaultTitle: 'VaranasiTrails | Guided trips in Varanasi and Uttar Pradesh',
    defaultDescription:
      'Guided trips in Varanasi: Ganga aarti boat rides, Kashi heritage walks, Sarnath day tours, food trails and pilgrimages. Chat with us on WhatsApp to book.',
    ogImageAlt: 'Boats on the Ganges at sunrise in Varanasi',
  },
} as const
