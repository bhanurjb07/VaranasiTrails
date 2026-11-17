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
  title: 'Why VaranasiTrails?',
  items: [
    {
      icon: 'shield',
      title: 'Know what the price covers',
      text: 'Every trip lists what is included and what is not, before you message us.',
    },
    {
      icon: 'map',
      title: 'A clear day-by-day plan',
      text: 'Full itineraries with the meeting point and the best time to visit.',
    },
    {
      icon: 'group',
      title: 'Group size and difficulty',
      text: 'Maximum group size and an Easy, Moderate or Hard rating on every trip.',
    },
    {
      icon: 'chat',
      title: 'Answers straight from us',
      text: 'Ask about dates, pickups or changes on WhatsApp or the enquiry form.',
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
  // A short line set large at the top of the story. Describes the city, not the business.
  lead: 'Varanasi is best seen slowly: from the water at first light, on foot through the old lanes, and at the ghats when the lamps are lit.',
  paragraphs: [
    'Our trips include boat rides on the Ganga, walks through the old city, food trails and pilgrimage routes. Each one has a written itinerary, a fixed meeting point and a clear list of what is included.',
    'We keep groups small and agree the details with every traveller directly, so you know the plan, the price and the pickup before the day.',
    'To ask about a trip, use the enquiry form or message us on WhatsApp.',
  ],
  experiences: {
    eyebrow: 'What we do',
    title: 'Four ways to see the city',
    items: [
      {
        category: 'spiritual',
        title: 'On the river',
        text: 'Boat rides at sunrise and for the evening aarti, and pilgrimage routes beyond the city.',
      },
      {
        category: 'heritage',
        title: 'Through the old city',
        text: 'Walks through the lanes, temples and ghats, with the stories behind them.',
      },
      {
        category: 'food',
        title: 'At the table',
        text: 'Food trails through the places locals eat, one stop at a time.',
      },
      {
        category: 'crafts',
        title: 'With the makers',
        text: 'Time with the weavers and artisans whose work Varanasi is known for.',
      },
    ],
  },
  places: {
    eyebrow: 'Where we go',
    title: 'From the ghats to the forts',
    text: 'Most trips begin in Varanasi. Some go further, to the places below.',
    items: [
      { name: 'Varanasi', note: 'The ghats, the river and the old city', image: 'ghatSunrise', query: 'Varanasi' },
      { name: 'Sarnath', note: 'Where the Buddha gave his first sermon', image: 'dhamekStupa', query: 'Sarnath' },
      { name: 'Ramnagar', note: 'The fort across the river', image: 'ramnagarFort', query: 'Ramnagar' },
      { name: 'Prayagraj', note: 'The meeting of the rivers at the Sangam', image: 'sangam', query: 'Prayagraj' },
      { name: 'Ayodhya', note: 'Temples on the banks of the Sarayu', image: 'hanumanGarhi', query: 'Ayodhya' },
      { name: 'Chunar and Vindhyachal', note: 'A hill fort and a temple town upriver', image: 'chunarFort', query: 'Chunar' },
    ],
  },
  values: [
    { title: 'Clear prices', text: 'Each trip lists what is included and what is not.' },
    { title: 'Written itineraries', text: 'The plan for every day is on the trip page before you ask.' },
    { title: 'Small groups', text: 'Groups stay small, so there is time for questions and nobody is rushed.' },
    { title: 'Direct contact', text: 'You talk to us, not a call centre, to confirm dates and pickup.' },
  ],
  people: {
    eyebrow: 'The people',
    title: 'Meet the people behind VaranasiTrails',
    text: 'Read who started the company and how to reach them directly.',
    link: 'Meet the founders',
  },
  closing: {
    title: 'Plan your trip with us',
    text: 'Browse the trips, or send us your dates on WhatsApp and we will help you choose.',
  },
} as const

// Offer cards under "Why VaranasiTrails?". Placeholder wording: edit before launch so it
// matches the offers you actually run. Images are keys of `placeholderImages`.
export const offers = {
  title: 'Offers',
  subtitle: 'Promotions, deals and special offers for you',
  items: [
    {
      tone: 'light',
      label: 'Sunrise special',
      title: 'Sunrise boat ride on the Ganga',
      text: 'See the ghats light up from the water. Message us on WhatsApp for the current price and available dates.',
      cta: 'Search deals',
      to: '/destinations',
      image: 'boatsSunset',
    },
    {
      tone: 'dark',
      label: 'Save on your next trip',
      title: 'Weekend Deal',
      text: 'Plan a weekend in Varanasi with a guided itinerary. Ask us about the current weekend offers.',
      cta: 'See weekend trips',
      to: '/destinations',
      image: 'gangaAarti',
    },
  ],
} as const
