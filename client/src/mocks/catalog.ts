// Mock catalogue, shaped exactly like the real API payloads. Ten sample trips,
// each with its own photos (see src/data/placeholderMedia.ts).
import { placeholderImages, type PlaceholderKey } from '@/data/placeholderMedia'
import type { Category, DestinationDetail, Difficulty, RatingBreakdown, Review } from '@/types/api'

export const mockCategories: Category[] = [
  { id: 'cat-spiritual', slug: 'spiritual', name: 'Spiritual & Pilgrimage' },
  { id: 'cat-heritage', slug: 'heritage', name: 'Heritage & Culture' },
  { id: 'cat-food', slug: 'food', name: 'Food & Culinary' },
  { id: 'cat-crafts', slug: 'crafts', name: 'Crafts & Experiences' },
]

interface Seed {
  slug: string
  title: string
  tagline: string
  overview: string
  category: string
  city: string
  priceInr: number
  originalPriceInr: number | null
  days: number
  nights: number
  maxGroupSize: number
  difficulty: Difficulty
  bestTimeToVisit: string
  meetingPoint: string
  featured: boolean
  images: PlaceholderKey[]
  highlights: string[]
  itinerary: [string, string][]
  included: string[]
  excluded: string[]
  createdAt: string
  ratingAvg: number
  ratingCount: number
}

const common = ['Personal expenses', 'Travel insurance', 'Tips and gratuities']

const seeds: Seed[] = [
  {
    slug: 'ganga-aarti-boat-ride',
    title: 'Ganga Aarti & Evening Boat Ride',
    tagline: 'Watch the legendary Dashashwamedh Ghat aarti from the river itself',
    overview:
      'Glide across the Ganga at dusk as the ghats light up with thousands of diyas. Your guide explains the rituals while you drift past Manikarnika and Assi, then settle in for the grand Ganga Aarti from the water, the most memorable view in Varanasi.\n\nBoats are small and unhurried, so you can take photographs, ask questions and simply watch. We time every departure so you reach the aarti with the best position on the river.',
    category: 'spiritual',
    city: 'Varanasi',
    priceInr: 1499,
    originalPriceInr: 1999,
    days: 1,
    nights: 0,
    maxGroupSize: 12,
    difficulty: 'EASY',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Dashashwamedh Ghat, Steps 12',
    featured: true,
    images: ['gangaAarti', 'aartiGhat', 'boatsSunset', 'dashashwamedh', 'eveningPrayer'],
    highlights: [
      'Boat positioned for the evening aarti',
      'Local guide narrating the story of the ghats',
      'Floating diya offering at sunset',
      'Photography-friendly spot with a clear view',
    ],
    itinerary: [
      [
        'Ghats, aarti and diyas',
        'Meet at 4:30 pm, board the boat and cruise past the main ghats. Anchor near Dashashwamedh for the 6:45 pm aarti, offer a floating diya, and return to the ghat by 8:00 pm.',
      ],
    ],
    included: ['Boat ride with boatman', 'English and Hindi speaking guide', 'Diya offering', 'Bottled water'],
    excluded: [...common, 'Hotel pickup and drop'],
    createdAt: '2026-01-10T08:00:00.000Z',
    ratingAvg: 4.8,
    ratingCount: 46,
  },
  {
    slug: 'sunrise-boat-ride-assi-ghat',
    title: 'Sunrise Boat Ride & Morning Aarti',
    tagline: 'Start the day on the Ganga with the first light on the ghats',
    overview:
      'Varanasi is at its most peaceful just before dawn. Meet at Assi Ghat, watch the Subah-e-Banaras morning aarti, then take a slow boat ride north as the sun rises over the river, past ghat after ghat waking up with bathers, priests and yoga practitioners.\n\nA hot cup of chai on the boat is included, and you are back on land in time for a proper Banarasi breakfast.',
    category: 'spiritual',
    city: 'Varanasi',
    priceInr: 1199,
    originalPriceInr: 1499,
    days: 1,
    nights: 0,
    maxGroupSize: 10,
    difficulty: 'EASY',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Assi Ghat, near the Subah-e-Banaras stage',
    featured: false,
    images: ['morningAarti', 'assiGhat', 'riverBoats', 'ghatSunrise', 'boatBuilding'],
    highlights: [
      'Morning aarti at Assi Ghat',
      'Sunrise from the middle of the river',
      'Passing Harishchandra, Kedar and Dashashwamedh ghats',
      'Chai on the boat and a local breakfast recommendation',
    ],
    itinerary: [
      [
        'Dawn at the ghats',
        'Meet at 5:15 am at Assi Ghat for the morning aarti. Board the boat at 6:00 am and cruise for about 90 minutes while the sun rises. Disembark near Dashashwamedh and walk back through the waking lanes.',
      ],
    ],
    included: ['Private-style boat', 'Boatman and guide', 'Chai on board', 'Bottled water'],
    excluded: [...common, 'Breakfast', 'Hotel pickup'],
    createdAt: '2026-01-25T08:00:00.000Z',
    ratingAvg: 4.7,
    ratingCount: 38,
  },
  {
    slug: 'kashi-vishwanath-heritage-walk',
    title: 'Kashi Vishwanath Heritage Walk',
    tagline: 'Temples, lanes and stories in the oldest living city',
    overview:
      'A guided walk through the lanes around Kashi Vishwanath Temple and the new corridor, with stops at Annapurna Devi, Kaal Bhairav and the old silk lanes. Learn why Kashi has been a centre of faith and learning for thousands of years.\n\nYour guide knows the quietest times and the shortest queues, so you spend your morning in the temples instead of the lines.',
    category: 'heritage',
    city: 'Varanasi',
    priceInr: 1299,
    originalPriceInr: null,
    days: 1,
    nights: 0,
    maxGroupSize: 10,
    difficulty: 'EASY',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Godowlia Chowk',
    featured: false,
    images: ['temple', 'templeSpire', 'templeCourtyard', 'oldCityLane'],
    highlights: [
      'Guided darshan route that avoids the confusion',
      'Kashi Vishwanath corridor and Annapurna temple',
      'Kaal Bhairav temple visit',
      'Tea stop in a century-old lane shop',
    ],
    itinerary: [
      [
        'Morning heritage walk',
        'Start at 6:30 am from Godowlia, walk to the corridor for darshan, continue to Annapurna and Kaal Bhairav, and end with chai and kachori in Vishwanath Gali.',
      ],
    ],
    included: ['Expert local guide', 'Tea and breakfast snack', 'Small group walk'],
    excluded: [...common, 'Temple special-entry or puja fees'],
    createdAt: '2026-02-02T08:00:00.000Z',
    ratingAvg: 4.6,
    ratingCount: 21,
  },
  {
    slug: 'sarnath-buddhist-day-tour',
    title: 'Sarnath Buddhist Day Tour',
    tagline: 'Walk where the Buddha gave his first sermon',
    overview:
      'Spend a calm day at Sarnath, just 10 km from Varanasi. Explore the Dhamek Stupa, the Archaeological Museum with the Ashoka Lion Capital, the Mulagandha Kuti Vihara and the Deer Park, with a guide who ties each site back to Buddhist history.\n\nThe pace is gentle, with time to sit, reflect and take in the peaceful gardens around the ruins.',
    category: 'heritage',
    city: 'Sarnath',
    priceInr: 1799,
    originalPriceInr: 2199,
    days: 1,
    nights: 0,
    maxGroupSize: 14,
    difficulty: 'EASY',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Hotel pickup in Varanasi city',
    featured: true,
    images: ['dhamekStupa', 'dhamekRuins', 'mulagandha', 'sarnathRuins', 'dharmarajika'],
    highlights: [
      'Dhamek Stupa and Deer Park',
      'Archaeological Museum with the Ashoka Lion Capital',
      'Mulagandha Kuti Vihara murals',
      'Quiet meditation time near the ruins',
    ],
    itinerary: [
      [
        'Sarnath full day',
        'Hotel pickup at 9:00 am, visit the Dhamek Stupa and ruins, lunch break, museum and the Mulagandha Kuti Vihara, then a short meditation session before the drop at 4:00 pm.',
      ],
    ],
    included: ['AC car with driver', 'Guide', 'Museum entry tickets', 'Bottled water'],
    excluded: [...common, 'Lunch'],
    createdAt: '2026-02-20T08:00:00.000Z',
    ratingAvg: 4.7,
    ratingCount: 33,
  },
  {
    slug: 'varanasi-ayodhya-prayagraj-pilgrimage',
    title: 'Varanasi - Ayodhya - Prayagraj Pilgrimage',
    tagline: "Three of India's holiest cities in one five-day journey",
    overview:
      'A comfortable pilgrimage circuit connecting Kashi, Ayodhya and Prayagraj. Begin with the ghats and temples of Varanasi, travel to Ayodhya for Ram Janmabhoomi and Hanuman Garhi, then bathe at the Triveni Sangam in Prayagraj before returning to Varanasi.\n\nWe handle the long drives, hotels and darshan timings so that families and older travellers can focus on the journey itself.',
    category: 'spiritual',
    city: 'Varanasi',
    priceInr: 14999,
    originalPriceInr: 17999,
    days: 5,
    nights: 4,
    maxGroupSize: 16,
    difficulty: 'MODERATE',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Varanasi Junction railway station',
    featured: true,
    images: ['ghatSunrise', 'temple', 'hanumanGarhi', 'hanumanGarhiSteps', 'sangam', 'sangamBoats'],
    highlights: [
      'Kashi Vishwanath darshan and Ganga aarti',
      'Ram Janmabhoomi, Hanuman Garhi and Saryu aarti in Ayodhya',
      'Boat ride to Triveni Sangam in Prayagraj',
      'Comfortable hotels and an AC vehicle throughout',
    ],
    itinerary: [
      ['Arrival in Varanasi', 'Meet at the station, check in, visit Kashi Vishwanath and attend the evening Ganga Aarti.'],
      ['Varanasi and Sarnath', 'Sunrise boat ride, Kaal Bhairav and Sankat Mochan temples, afternoon at Sarnath.'],
      ['Varanasi to Ayodhya', 'Drive to Ayodhya (about 4.5 hours). Evening Saryu aarti at Ram Ki Paidi.'],
      ['Ayodhya to Prayagraj', 'Morning darshan at Ram Janmabhoomi and Hanuman Garhi, then drive to Prayagraj for the night.'],
      ['Prayagraj and return', 'Boat ride to the Triveni Sangam, visit Hanuman Mandir, then return to Varanasi for onward travel.'],
    ],
    included: ['4 nights hotel stay', 'Daily breakfast', 'AC vehicle with driver', 'Guide in each city', 'Boat rides'],
    excluded: [...common, 'Lunch and dinner', 'Train or flight tickets to Varanasi'],
    createdAt: '2026-03-05T08:00:00.000Z',
    ratingAvg: 4.9,
    ratingCount: 18,
  },
  {
    slug: 'banarasi-food-trail',
    title: 'Banarasi Food Trail',
    tagline: 'Kachori, malaiyo, tamatar chaat and paan, one lane at a time',
    overview:
      "Eat your way through Varanasi's most loved lanes with a local food guide. Taste hot kachori-sabzi, tamatar chaat, lassi from clay cups, seasonal malaiyo and finish with a legendary Banarasi paan.\n\nEvery stop is a family-run shop that has been serving the same recipe for generations, and your guide will tell you the story behind each one.",
    category: 'food',
    city: 'Varanasi',
    priceInr: 999,
    originalPriceInr: null,
    days: 1,
    nights: 0,
    maxGroupSize: 8,
    difficulty: 'EASY',
    bestTimeToVisit: 'November to February (for malaiyo)',
    meetingPoint: 'Lanka Gate, Banaras Hindu University',
    featured: false,
    images: ['streetFood', 'kachori', 'paan', 'oldCityLane'],
    highlights: [
      '8+ tastings at beloved local stalls',
      'Clay-cup lassi and seasonal malaiyo',
      'Vegetarian-friendly route',
      'Stories behind each family-run shop',
    ],
    itinerary: [
      [
        'Evening food walk',
        'Start at 5:00 pm near Lanka, move to Godowlia for chaat and kachori, try lassi and thandai, and end with sweets and a Banarasi paan around 8:30 pm.',
      ],
    ],
    included: ['All tastings', 'Food guide', 'Bottled water'],
    excluded: [...common, 'Extra food orders beyond the tastings'],
    createdAt: '2026-03-22T08:00:00.000Z',
    ratingAvg: 4.9,
    ratingCount: 58,
  },
  {
    slug: 'banarasi-silk-weaving-experience',
    title: 'Banarasi Silk Weaving Experience',
    tagline: "Meet the weavers behind India's most famous saree",
    overview:
      "Visit a weaver's family home in the Madanpura lanes and watch a Banarasi brocade come to life on a handloom. Understand motifs, zari work and what makes an authentic piece, with optional shopping at fair prices straight from the weaver.\n\nThere is no pressure to buy anything: the aim is to understand a craft that has survived for centuries.",
    category: 'crafts',
    city: 'Varanasi',
    priceInr: 1599,
    originalPriceInr: null,
    days: 1,
    nights: 0,
    maxGroupSize: 8,
    difficulty: 'EASY',
    bestTimeToVisit: 'Year round',
    meetingPoint: 'Madanpura Chowk',
    featured: false,
    images: ['loomOne', 'loomTwo', 'oldCityLane'],
    highlights: [
      'Live handloom demonstration',
      'Learn to tell real zari from imitation',
      'Try a turn at the loom',
      'No-pressure shopping direct from weavers',
    ],
    itinerary: [
      [
        "Weavers' lanes",
        "Meet at 10:30 am, walk to a weaver's home, watch brocade weaving, learn about motifs and zari, optional shopping, and finish with tea at 1:00 pm.",
      ],
    ],
    included: ['Weaver visit', 'Local guide', 'Tea and snacks'],
    excluded: [...common, 'Any purchases'],
    createdAt: '2026-04-01T08:00:00.000Z',
    ratingAvg: 4.5,
    ratingCount: 12,
  },
  {
    slug: 'ramnagar-fort-ganga-sunset',
    title: 'Ramnagar Fort & Ganga Sunset',
    tagline: 'The royal fort across the river, and the best sunset view in Kashi',
    overview:
      'Cross the Ganga to Ramnagar, the seat of the Maharajas of Banaras. Explore the 18th-century sandstone fort and its museum of vintage cars, royal palanquins, weapons and ceremonial costumes, then return by boat as the sun sets over the Varanasi skyline.\n\nIt is a quieter, more regal side of the city that most visitors never see.',
    category: 'heritage',
    city: 'Ramnagar',
    priceInr: 1399,
    originalPriceInr: 1699,
    days: 1,
    nights: 0,
    maxGroupSize: 12,
    difficulty: 'EASY',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Rajghat, near the Malviya Bridge',
    featured: false,
    images: ['ramnagarFort', 'ramnagarGate', 'ramnagarInside', 'ramnagarRiver'],
    highlights: [
      'Ramnagar Fort and its royal museum',
      'Vyasa Kashi temple inside the fort',
      'Sunset boat ride back across the Ganga',
      'A skyline view of the ghats from the river',
    ],
    itinerary: [
      [
        'Fort and sunset',
        'Meet at 2:30 pm, cross to Ramnagar by boat, tour the fort and museum with your guide, then take a golden-hour boat ride along the ghats and return by 6:30 pm.',
      ],
    ],
    included: ['Boat crossing and sunset cruise', 'Guide', 'Fort and museum tickets', 'Bottled water'],
    excluded: [...common, 'Photography charges inside the museum'],
    createdAt: '2026-04-12T08:00:00.000Z',
    ratingAvg: 4.5,
    ratingCount: 14,
  },
  {
    slug: 'chunar-fort-vindhyachal-excursion',
    title: 'Chunar Fort & Vindhyachal Excursion',
    tagline: 'A weekend escape to a hilltop fort and a Shakti Peeth',
    overview:
      'Leave the city behind for Chunar Fort, a Ganga-side stronghold with centuries of history, and Vindhyachal, one of the holiest Shakti Peeths. Includes a night in Mirzapur and a short hike to Ashtabhuja temple for sweeping views.\n\nA relaxed two-day trip that combines history, devotion and a little countryside.',
    category: 'heritage',
    city: 'Mirzapur',
    priceInr: 4999,
    originalPriceInr: 5999,
    days: 2,
    nights: 1,
    maxGroupSize: 12,
    difficulty: 'MODERATE',
    bestTimeToVisit: 'October to March',
    meetingPoint: 'Varanasi Cantt railway station',
    featured: false,
    images: ['chunarFort', 'chunarWalls', 'chunarGate', 'vindhyachal', 'vindhyachalGate'],
    highlights: [
      'Chunar Fort ramparts and Sonwa Mandap',
      'Vindhyavasini Devi temple darshan',
      'Short hill trek to Ashtabhuja temple',
      'Overnight stay in a comfortable Mirzapur hotel',
    ],
    itinerary: [
      ['Chunar Fort', 'Pickup at 8:00 am, explore Chunar Fort and the ghats, then drive to Mirzapur for check-in.'],
      ['Vindhyachal', 'Early darshan at Vindhyavasini temple, trek to Ashtabhuja and Kali Khoh, return to Varanasi by 5:00 pm.'],
    ],
    included: ['1 night hotel', 'Breakfast', 'AC vehicle', 'Guide', 'Fort entry'],
    excluded: [...common, 'Lunch and dinner'],
    createdAt: '2026-04-18T08:00:00.000Z',
    ratingAvg: 4.4,
    ratingCount: 9,
  },
  {
    slug: 'dev-deepawali-experience',
    title: 'Dev Deepawali Festival Experience',
    tagline: 'Millions of lamps on the ghats on the full moon of Kartika',
    overview:
      'Dev Deepawali, the festival of lights of the gods, turns every ghat of Varanasi into a river of flickering diyas. We secure a prime boat for the evening, guide you through the festival lanes and make sure you see the Ganga Aarti, the laser-lit skyline and the lamp-covered ghats at their best.\n\nThis is the busiest night in Varanasi, so we take care of access, timing and a comfortable seat so you can enjoy it.',
    category: 'spiritual',
    city: 'Varanasi',
    priceInr: 3499,
    originalPriceInr: 3999,
    days: 1,
    nights: 0,
    maxGroupSize: 10,
    difficulty: 'EASY',
    bestTimeToVisit: 'November (Kartika Purnima)',
    meetingPoint: 'Raj Ghat or hotel pickup on request',
    featured: true,
    images: ['kartikaPurnima', 'kartikaGhats', 'gangesDusk', 'gangaAarti', 'dashashwamedh'],
    highlights: [
      'Reserved boat seats for the lamp-lit ghats',
      'Ganga Aarti from the water on festival night',
      'Guide who knows the festival lanes and crowd flow',
      'Dinner stop in the old city after the lights',
    ],
    itinerary: [
      [
        'Festival night',
        'Meet at 4:00 pm, walk to the boat before the crowds, cruise past illuminated ghats, anchor for the grand aarti, release your own diya and finish with dinner at a local restaurant by 9:30 pm.',
      ],
    ],
    included: ['Reserved boat seats', 'Guide', 'Diya set', 'Dinner', 'Bottled water'],
    excluded: [...common, 'Hotel pickup (available on request)'],
    createdAt: '2026-05-02T08:00:00.000Z',
    ratingAvg: 4.9,
    ratingCount: 27,
  },
]

// Sample reviews, handed out to trips in rotation so every trip reads differently.
const reviewPool: Omit<Review, 'id'>[] = [
  ['Unforgettable evening', 'Everything was well timed and our guide had stories for every ghat. Highly recommended.', 5, 'Meera Iyer', '2026-05-02'],
  ['Worth every rupee', 'Small group, no rush and a very friendly team. We would happily book again.', 5, 'Daniel Fischer', '2026-04-11'],
  ['Great, just a bit early', 'The experience itself was wonderful. The start time was early but absolutely worth it.', 4, 'Anita Rao', '2026-03-20'],
  ['Like travelling with a friend', 'Our guide grew up here and it showed. He knew every shortcut, every shopkeeper and every story.', 5, 'Rohit Kapoor', '2026-03-02'],
  ['Perfect for my parents', 'Unhurried, comfortable and respectful. My parents loved it and so did I.', 5, 'Sneha Kapoor', '2026-02-18'],
  ['Good value', 'Well organised and clear about what was included. A couple of things ran a little late but nothing serious.', 4, 'James Whitfield', '2026-02-05'],
  ['Learned so much', 'I came for photographs and left understanding the city. Thoughtful and well paced.', 5, 'Ayesha Khan', '2026-01-22'],
  ['A highlight of our trip', 'Booking over WhatsApp was easy and the replies were fast. The day itself was even better.', 5, 'Lukas Meier', '2026-01-09'],
  ['Lovely but crowded', 'Beautiful experience, though it was busy. The guide handled the crowds very well.', 4, 'Priyanka Desai', '2025-12-28'],
  ['Would do it again', 'Friendly, punctual and knowledgeable. Already recommended it to friends.', 5, 'Tom Anderson', '2025-12-14'],
].map(([title, comment, rating, name, date]) => ({
  rating: rating as number,
  title: title as string,
  comment: comment as string,
  createdAt: `${date as string}T10:00:00.000Z`,
  updatedAt: `${date as string}T10:00:00.000Z`,
  user: { name: name as string },
}))

export const reviewStore: Record<string, (Review & { userId?: string })[]> = {}

export const ratingBaseline: Record<string, { count: number; sum: number; breakdown: RatingBreakdown }> = {}

const toCategory =(slug: string) => mockCategories.find((c) => c.slug === slug) ?? mockCategories[0]!

/** Spreads a total over 1-5 stars (mostly 5s) so the breakdown adds up to `count`. */
const breakdownFor = (count: number): RatingBreakdown => {
  const share = { '5': 0.72, '4': 0.2, '3': 0.05, '2': 0.02, '1': 0.01 } as const
  const result: RatingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  let left = count
  for (const star of ['4', '3', '2', '1'] as const) {
    result[star] = Math.round(count * share[star])
    left -= result[star]
  }
  result['5'] = Math.max(left, 0)
  return result
}

const buildDetail = (seed: Seed, index: number): DestinationDetail => {
  const images = seed.images.map((key, i) => ({
    url: placeholderImages[key].url,
    alt: placeholderImages[key].alt,
    isCover: i === 0,
  }))

  const own = [0, 1, 2, 3].map((offset) => ({
    ...reviewPool[(index + offset * 2) % reviewPool.length]!,
    id: `rev-${index}-${offset}`,
  }))
  reviewStore[seed.slug] = own

  // The headline rating covers more reviews than the handful stored here. Keep the
  // remainder as a baseline so adding or deleting a review moves the totals sensibly.
  const baseCount = seed.ratingCount - own.length
  const baseBreakdown = breakdownFor(baseCount)
  for (const review of own) {
    const star = String(review.rating) as keyof RatingBreakdown
    baseBreakdown[star] = Math.max(baseBreakdown[star] - 1, 0)
  }
  ratingBaseline[seed.slug] = {
    count: baseCount,
    sum: Math.round(seed.ratingAvg * seed.ratingCount) - own.reduce((sum, review) => sum + review.rating, 0),
    breakdown: baseBreakdown,
  }

  return {
    id: `dest-${index + 1}`,
    slug: seed.slug,
    title: seed.title,
    tagline: seed.tagline,
    overview: seed.overview,
    city: seed.city,
    state: 'Uttar Pradesh',
    country: 'India',
    category: toCategory(seed.category),
    coverImage: images[0]!.url,
    priceInr: seed.priceInr,
    originalPriceInr: seed.originalPriceInr,
    discountPercent: seed.originalPriceInr
      ? Math.round(((seed.originalPriceInr - seed.priceInr) / seed.originalPriceInr) * 100)
      : 0,
    duration: { days: seed.days, nights: seed.nights },
    maxGroupSize: seed.maxGroupSize,
    difficulty: seed.difficulty,
    bestTimeToVisit: seed.bestTimeToVisit,
    meetingPoint: seed.meetingPoint,
    videoUrl: null,
    isFeatured: seed.featured,
    ratingAvg: seed.ratingAvg,
    ratingCount: seed.ratingCount,
    ratingBreakdown: breakdownFor(seed.ratingCount),
    images,
    highlights: seed.highlights,
    itinerary: seed.itinerary.map(([title, description], i) => ({
      dayNumber: i + 1,
      title,
      description,
    })),
    inclusions: seed.included,
    exclusions: seed.excluded,
    latestReviews: [],
    related: [],
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
  }
}

export const mockDestinations: DestinationDetail[] = seeds.map(buildDetail)
