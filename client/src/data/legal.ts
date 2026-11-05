// Legal page copy. TODO(business): have this reviewed by a lawyer before launch.

export interface LegalSection {
  heading: string
  paragraphs: readonly string[]
}

export const legalUpdated = '1 November 2026'

export const privacyPolicy: readonly LegalSection[] = [
  {
    heading: 'What we collect',
    paragraphs: [
      'When you create an account we collect your name, email address, mobile number and a password (stored only as a one-way hash). When you send an enquiry we collect the details you type into the form.',
      'We also keep basic technical information, such as your IP address and browser type, to keep the service secure and to understand how the site is used.',
    ],
  },
  {
    heading: 'How we use it',
    paragraphs: [
      'We use your details to run your account, verify your email, reply to enquiries and plan the trips you ask us about. We may contact you on WhatsApp, phone or email about a trip you have asked about.',
      'We do not sell your personal information. We share it only with service providers who help us run the site (for example email delivery and hosting), and only as needed for them to do so.',
    ],
  },
  {
    heading: 'Cookies and sign-in',
    paragraphs: [
      'We use a secure, httpOnly cookie to keep you signed in. It is needed for the site to work and is not used for advertising. We do not use third-party advertising cookies.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can update your name and phone number from your profile at any time. To have your account and data deleted, email us and we will action the request promptly.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: ['Questions about privacy can be sent to the email address listed on our Contact page.'],
  },
]

export const termsOfService: readonly LegalSection[] = [
  {
    heading: 'Using this website',
    paragraphs: [
      'By using VaranasiTrails you agree to these terms. The site is provided to help you discover and enquire about trips. Please use it lawfully and keep your account details accurate and secure.',
    ],
  },
  {
    heading: 'Trips, prices and bookings',
    paragraphs: [
      'Prices and itineraries shown on the site are a guide. Trips are confirmed, and prices finalised, only when we agree dates and details with you directly, for example on WhatsApp. The website does not take online payments or create bookings.',
      'Itineraries can change because of weather, river levels, festivals, security arrangements or temple timings. We will always try to offer a comparable alternative.',
    ],
  },
  {
    heading: 'Cancellations and refunds',
    paragraphs: [
      'Cancellation and refund terms depend on the trip and how close the date is. We share the exact terms with you before you confirm anything.',
    ],
  },
  {
    heading: 'Reviews and content',
    paragraphs: [
      'Reviews must be honest and based on your own experience. We may remove content that is abusive, misleading or unlawful.',
    ],
  },
  {
    heading: 'Liability',
    paragraphs: [
      'Travel involves risk. Please follow your guide’s instructions, respect local customs and take care of your belongings. To the extent the law allows, we are not liable for losses outside our reasonable control.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: ['We may update these terms from time to time. Continued use of the site means you accept the updated terms.'],
  },
]
