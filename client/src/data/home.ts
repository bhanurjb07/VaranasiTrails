// Home page copy. Only state things that are true for the business.
// TODO(business): review every line here, and add a real "our story" to aboutContent.

export const hero = {
  eyebrow: 'Varanasi and Uttar Pradesh',
  title: 'Guided trips in Varanasi and across Uttar Pradesh',
  subtitle:
    'Boat rides, ghat walks, food trails and pilgrimages. Every trip lists its price, itinerary and what is included.',
  searchPlaceholder: 'Search trips, e.g. Ganga aarti, Sarnath, food',
  primaryCta: 'Browse trips',
  quickLinks: [
    { label: 'Boat rides', to: '/destinations?q=boat' },
    { label: 'Pilgrimages', to: '/destinations?category=spiritual' },
    { label: 'Food trails', to: '/destinations?category=food' },
  ],
} as const

export const howItWorks = {
  title: 'How booking works',
  subtitle: 'There is no online checkout. You confirm everything with us on WhatsApp.',
  steps: [
    {
      icon: 'search',
      title: 'Choose a trip',
      text: 'Compare itineraries, prices and inclusions, and read reviews from other travellers.',
    },
    {
      icon: 'message',
      title: 'Message us on WhatsApp',
      text: 'The Book button opens a chat with the trip name and price already filled in.',
    },
    {
      icon: 'map',
      title: 'Confirm the details',
      text: 'We agree the date, pickup point and final price with you before anything is booked.',
    },
  ],
} as const

export const whyUs = {
  title: 'What every trip page tells you',
  items: [
    {
      icon: 'shield',
      title: 'What the price covers',
      text: 'Each trip lists what is included and what is not, so you know the total before you message us.',
    },
    {
      icon: 'map',
      title: 'A day-by-day plan',
      text: 'Itineraries are written out in full, with meeting point and best time to visit.',
    },
    {
      icon: 'group',
      title: 'Group size and difficulty',
      text: 'The maximum group size and an Easy, Moderate or Hard rating are shown on every trip.',
    },
    {
      icon: 'chat',
      title: 'Questions answered directly',
      text: 'Ask about dates, pickups or changes on WhatsApp or through the enquiry form.',
    },
  ],
} as const

export const faq = {
  title: 'Frequently asked questions',
  items: [
    {
      q: 'How do I book a trip?',
      a: 'There is no online checkout. Open any trip and tap Book on WhatsApp. It starts a chat with the trip details already filled in, and we confirm dates, price and pickup with you directly.',
    },
    {
      q: 'Do I need an account?',
      a: 'No. You can browse and message us without one. An account lets you save trips to a wishlist and leave reviews.',
    },
    {
      q: 'What is the best time to visit Varanasi?',
      a: 'October to March is the most comfortable, with cool mornings that suit boat rides and walks. Summers are hot, and the monsoon raises the river and can limit boat access.',
    },
    {
      q: 'Are the trips suitable for older travellers and children?',
      a: 'Each trip shows a difficulty rating. Tell us who is travelling when you message and we will tell you whether the trip suits them.',
    },
    {
      q: 'Can you customise a trip?',
      a: 'Tell us what you have in mind when you message us, and we will say what is possible.',
    },
    {
      q: 'What is your cancellation policy?',
      a: 'It depends on the trip and how close the date is. We share the exact terms in the chat before you confirm anything.',
    },
  ],
} as const

export const ctaBanner = {
  title: 'Ask us about a trip',
  text: 'Send your dates and group size on WhatsApp and we will reply with availability and the final price.',
  button: 'Chat on WhatsApp',
} as const

export const aboutContent = {
  title: 'About VaranasiTrails',
  intro: 'We plan and run guided trips in Varanasi, Sarnath and across Uttar Pradesh.',
  paragraphs: [
    'Our trips include boat rides on the Ganga, walks through the old city, food trails and pilgrimage routes. Each one has a written itinerary, a fixed meeting point and a clear list of what is included.',
    'We keep groups small and agree the details with every traveller directly, so you know the plan, the price and the pickup before the day.',
    'To ask about a trip, use the enquiry form or message us on WhatsApp.',
  ],
  values: [
    { title: 'Clear prices', text: 'Each trip lists what is included and what is not.' },
    { title: 'Written itineraries', text: 'The plan for every day is on the trip page before you ask.' },
    { title: 'Direct contact', text: 'You talk to us, not a call centre, to confirm dates and pickup.' },
  ],
} as const
