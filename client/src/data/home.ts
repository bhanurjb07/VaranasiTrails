// Home page copy. Testimonials and stats are SAMPLE content: replace before launch.

export const hero = {
  eyebrow: 'Varanasi and Uttar Pradesh',
  title: 'Meet the oldest living city, the way locals do',
  subtitle:
    'Dawn boat rides, lantern-lit aarti, quiet lanes and the best breakfast of your life. Small-group trips planned by guides who grew up on the ghats.',
  searchPlaceholder: 'Search trips, e.g. Ganga aarti, Sarnath, food',
  primaryCta: 'Browse trips',
  quickLinks: [
    { label: 'Boat rides', to: '/destinations?q=boat' },
    { label: 'Pilgrimages', to: '/destinations?category=spiritual' },
    { label: 'Food trails', to: '/destinations?category=food' },
  ],
} as const

export const howItWorks = {
  title: 'Planning a trip is a conversation, not a checkout',
  subtitle: 'No forms to fight with. You talk to a real person who knows the city.',
  steps: [
    {
      icon: 'search',
      title: 'Browse',
      text: 'Explore our trips, compare itineraries and read what other travellers said.',
    },
    {
      icon: 'message',
      title: 'Message us on WhatsApp',
      text: 'One tap opens a chat with your chosen trip pre-filled. Ask anything, change anything.',
    },
    {
      icon: 'map',
      title: 'We plan your trip',
      text: 'We confirm dates, pickups and guides, then handle the details so you can just arrive.',
    },
  ],
} as const

export const whyUs = {
  title: 'Why travellers choose VaranasiTrails',
  subtitle: 'Varanasi rewards preparation. We do the preparing.',
  items: [
    {
      icon: 'users',
      title: 'Local guides, not scripts',
      text: 'Our guides are Banarasis who can tell you which lane has the best kachori and why the ghats matter.',
    },
    {
      icon: 'group',
      title: 'Small groups',
      text: 'Most trips cap at 8 to 14 people, so you see the city instead of the back of someone’s head.',
    },
    {
      icon: 'shield',
      title: 'Transparent pricing',
      text: 'The price you see covers what is listed under Included. No surprise add-ons at the ghat.',
    },
    {
      icon: 'clock',
      title: 'Perfectly timed',
      text: 'We schedule around sunrise light, aarti timings and crowds, so you are in the right place at the right moment.',
    },
    {
      icon: 'heart',
      title: 'Respectful by design',
      text: 'We brief every group on etiquette at temples and cremation ghats, and we keep tours low-impact.',
    },
    {
      icon: 'chat',
      title: 'A human on WhatsApp',
      text: 'Before, during and after your trip, you can reach us directly. Replies usually take minutes.',
    },
  ],
} as const

export const stats = {
  note: 'Sample figures. Replace with real numbers.',
  items: [
    { value: '12,000+', label: 'Travellers guided' },
    { value: '40+', label: 'Local guides' },
    { value: '4.8/5', label: 'Average rating' },
    { value: '2016', label: 'Guiding since' },
  ],
} as const

export const testimonials = {
  title: 'Travellers write to us',
  note: 'Sample testimonials. Replace with real reviews.',
  items: [
    {
      name: 'Meera Iyer',
      from: 'Bengaluru',
      trip: 'Ganga Aarti and Evening Boat Ride',
      quote:
        'Watching the aarti from the water was the highlight of our whole India trip. Our boatman knew every ghat by its story.',
    },
    {
      name: 'Daniel Fischer',
      from: 'Hamburg',
      trip: 'Banarasi Food Trail',
      quote:
        'I thought I knew Indian food. The malaiyo alone was worth the flight. Our guide made every stop feel like visiting family.',
    },
    {
      name: 'Rohit and Sneha Kapoor',
      from: 'Pune',
      trip: 'Varanasi to Ayodhya to Prayagraj',
      quote:
        'We travelled with my parents and everything was smooth: comfortable hotels, unhurried darshan, and a guide who looked after them.',
    },
  ],
} as const

export const faq = {
  title: 'Questions, answered',
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
      q: 'Are your trips suitable for older travellers and children?',
      a: 'Most trips are rated Easy and move at a relaxed pace. Tell us who is travelling when you message and we will adjust timing and transport.',
    },
    {
      q: 'Can you customise a trip?',
      a: 'Yes. Longer stays, private guides, different pickups and combined itineraries are all common. Start a chat and describe what you have in mind.',
    },
    {
      q: 'What is your cancellation policy?',
      a: 'It depends on the trip and how close the date is. We share the exact terms in the chat before you confirm anything.',
    },
  ],
} as const

export const ctaBanner = {
  title: 'Ready to see Varanasi properly?',
  text: 'Tell us your dates and who is travelling. We will suggest the right trip within the hour.',
  button: 'Chat on WhatsApp',
} as const

export const aboutContent = {
  title: 'Local guides. Honest planning. Unhurried trips.',
  intro:
    'VaranasiTrails began in 2016 with one boat and a simple idea: visitors deserve to understand the city, not just photograph it.',
  paragraphs: [
    'Varanasi is overwhelming at first. The lanes twist, the ghats run for miles, and every stone has a story. A good guide turns that into the best trip of your life; a rushed one turns it into a blur.',
    'So we keep groups small, we schedule around light and ritual, and we only work with guides who were born here or have spent years learning the city. We do not do hard sells and we do not do hidden fees.',
    'Whether you want a two-hour boat ride or a five-day pilgrimage across Uttar Pradesh, we plan it the way we would for our own family.',
  ],
  values: [
    { title: 'Respect', text: 'For the city, its rituals and the people who live here.' },
    { title: 'Honesty', text: 'Clear prices, clear itineraries, clear answers.' },
    { title: 'Craft', text: 'Every trip is timed, tested and refined by people who walk it often.' },
  ],
} as const
