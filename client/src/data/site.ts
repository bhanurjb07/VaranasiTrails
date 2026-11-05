// Site-wide business content. Edit values here; components never hard-code them.

export const site = {
  name: 'VaranasiTrails',
  /** Text logo, shown in the header and footer. */
  logoText: 'Varanasi',
  logoAccent: 'Trails',
  tagline: 'Guided journeys through the oldest living city',
  description:
    'Hand-planned boat rides, heritage walks, food trails and pilgrimages in Varanasi, Sarnath and Uttar Pradesh, led by local guides who grew up on the ghats.',
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
      'Plan a Varanasi trip with local guides: Ganga aarti boat rides, Kashi heritage walks, Sarnath day tours, food trails and pilgrimages. Chat with us on WhatsApp to book.',
    ogImageAlt: 'Boats on the Ganges at sunrise in Varanasi',
  },
  foundedYear: 2016,
} as const
