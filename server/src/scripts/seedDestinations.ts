// Seeds categories and sample Varanasi / Uttar Pradesh trips. Safe to re-run:
// destinations are matched by slug and their child rows are replaced.
//
// R2 key convention:  destinations/<slug>/<NN>.webp   (01 is the cover image)
// Upload matching files to the bucket, or change the keys here.
import type { Difficulty } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

interface SeedDestination {
  slug: string;
  title: string;
  tagline: string;
  overview: string;
  category: string;
  city: string;
  priceInr: number;
  originalPriceInr?: number;
  durationDays: number;
  durationNights: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  bestTimeToVisit: string;
  meetingPoint: string;
  isFeatured?: boolean;
  videoUrl?: string;
  images: number;
  highlights: string[];
  itinerary: [title: string, description: string][];
  included: string[];
  excluded: string[];
}

const categories = [
  { slug: "spiritual", name: "Spiritual & Pilgrimage" },
  { slug: "heritage", name: "Heritage & Culture" },
  { slug: "food", name: "Food & Culinary" },
  { slug: "crafts", name: "Crafts & Experiences" },
];

const standardExcluded = ["Personal expenses", "Travel insurance", "Tips and gratuities"];

const destinations: SeedDestination[] = [
  {
    slug: "ganga-aarti-boat-ride",
    title: "Ganga Aarti & Evening Boat Ride",
    tagline: "Watch the legendary Dashashwamedh Ghat aarti from the river itself",
    overview:
      "Glide across the Ganga at dusk as the ghats light up with thousands of diyas. Your guide explains the rituals while you drift past Manikarnika and Assi, then settle in for the grand Ganga Aarti from the water - the most memorable view in Varanasi.",
    category: "spiritual",
    city: "Varanasi",
    priceInr: 1499,
    originalPriceInr: 1999,
    durationDays: 1,
    durationNights: 0,
    maxGroupSize: 12,
    difficulty: "EASY",
    bestTimeToVisit: "October to March",
    meetingPoint: "Dashashwamedh Ghat, Steps 12",
    isFeatured: true,
    images: 4,
    highlights: [
      "Private-style boat for the evening aarti",
      "Local guide narrating the story of the ghats",
      "Floating diya offering at sunset",
      "Photography-friendly spot with a clear view",
    ],
    itinerary: [
      [
        "Ghats, aarti and diyas",
        "Meet at 4:30 pm, board the boat and cruise past the main ghats. Anchor near Dashashwamedh for the 6:45 pm aarti, offer a floating diya, and return to the ghat by 8:00 pm.",
      ],
    ],
    included: ["Boat ride with boatman", "English/Hindi speaking guide", "Diya offering", "Bottled water"],
    excluded: [...standardExcluded, "Hotel pickup and drop"],
  },
  {
    slug: "kashi-vishwanath-heritage-walk",
    title: "Kashi Vishwanath Heritage Walk",
    tagline: "Temples, lanes and stories in the oldest living city",
    overview:
      "A guided walk through the lanes around Kashi Vishwanath Temple and the new corridor, with stops at Annapurna Devi, Gyanvapi precinct viewpoints, Kaal Bhairav and the old silk lanes. Learn why Kashi has been a centre of faith and learning for thousands of years.",
    category: "heritage",
    city: "Varanasi",
    priceInr: 1299,
    durationDays: 1,
    durationNights: 0,
    maxGroupSize: 10,
    difficulty: "EASY",
    bestTimeToVisit: "October to March",
    meetingPoint: "Godowlia Chowk",
    images: 3,
    highlights: [
      "Skip-the-confusion guided darshan route",
      "Kashi Vishwanath corridor and Annapurna temple",
      "Kaal Bhairav temple visit",
      "Tea stop in a century-old lane shop",
    ],
    itinerary: [
      [
        "Morning heritage walk",
        "Start at 6:30 am from Godowlia, walk to the corridor for darshan, continue to Annapurna and Kaal Bhairav, and end with chai and kachori in Vishwanath Gali.",
      ],
    ],
    included: ["Expert local guide", "Tea and breakfast snack", "Small group walk"],
    excluded: [...standardExcluded, "Temple special-entry or puja fees"],
  },
  {
    slug: "sarnath-buddhist-day-tour",
    title: "Sarnath Buddhist Day Tour",
    tagline: "Walk where the Buddha gave his first sermon",
    overview:
      "Spend a calm day at Sarnath, just 10 km from Varanasi. Explore the Dhamek Stupa, the Archaeological Museum with the Ashoka Lion Capital, the Mulagandha Kuti Vihara and the Deer Park, with a guide who ties each site back to Buddhist history.",
    category: "heritage",
    city: "Sarnath",
    priceInr: 1799,
    originalPriceInr: 2199,
    durationDays: 1,
    durationNights: 0,
    maxGroupSize: 14,
    difficulty: "EASY",
    bestTimeToVisit: "October to March",
    meetingPoint: "Hotel pickup in Varanasi city",
    isFeatured: true,
    images: 4,
    highlights: [
      "Dhamek Stupa and Deer Park",
      "Archaeological Museum with Ashoka Lion Capital",
      "Mulagandha Kuti Vihara murals",
      "Quiet meditation time near the ruins",
    ],
    itinerary: [
      [
        "Sarnath full day",
        "Hotel pickup at 9:00 am, visit the Dhamek Stupa and ruins, lunch break, museum and the Mulagandha Kuti Vihara, then a short meditation session before the drop at 4:00 pm.",
      ],
    ],
    included: ["AC car with driver", "Guide", "Museum entry tickets", "Bottled water"],
    excluded: [...standardExcluded, "Lunch"],
  },
  {
    slug: "varanasi-ayodhya-prayagraj-pilgrimage",
    title: "Varanasi - Ayodhya - Prayagraj Pilgrimage",
    tagline: "Three of India's holiest cities in one five-day journey",
    overview:
      "A comfortable pilgrimage circuit connecting Kashi, Ayodhya and Prayagraj. Begin with the ghats and temples of Varanasi, travel to Ayodhya for Ram Janmabhoomi and Hanuman Garhi, then bathe at the Triveni Sangam in Prayagraj before returning to Varanasi.",
    category: "spiritual",
    city: "Varanasi",
    priceInr: 14999,
    originalPriceInr: 17999,
    durationDays: 5,
    durationNights: 4,
    maxGroupSize: 16,
    difficulty: "MODERATE",
    bestTimeToVisit: "October to March",
    meetingPoint: "Varanasi Junction railway station",
    isFeatured: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    images: 5,
    highlights: [
      "Kashi Vishwanath darshan and Ganga aarti",
      "Ram Janmabhoomi, Hanuman Garhi and Saryu aarti in Ayodhya",
      "Boat ride to Triveni Sangam in Prayagraj",
      "Comfortable hotels and an AC vehicle throughout",
    ],
    itinerary: [
      ["Arrival in Varanasi", "Meet at the station, check in, visit Kashi Vishwanath and attend the evening Ganga Aarti."],
      ["Varanasi and Sarnath", "Sunrise boat ride, Kaal Bhairav and Sankat Mochan temples, afternoon at Sarnath."],
      ["Varanasi to Ayodhya", "Drive to Ayodhya (about 4.5 hours). Evening Saryu aarti at Ram Ki Paidi."],
      ["Ayodhya to Prayagraj", "Morning darshan at Ram Janmabhoomi and Hanuman Garhi, then drive to Prayagraj for the night."],
      ["Prayagraj and return", "Boat ride to the Triveni Sangam, visit Hanuman Mandir, then return to Varanasi for onward travel."],
    ],
    included: ["4 nights hotel stay", "Daily breakfast", "AC vehicle with driver", "Guide in each city", "Boat rides"],
    excluded: [...standardExcluded, "Lunch and dinner", "Train or flight tickets to Varanasi"],
  },
  {
    slug: "banarasi-food-trail",
    title: "Banarasi Food Trail",
    tagline: "Kachori, malaiyo, tamatar chaat and paan - one lane at a time",
    overview:
      "Eat your way through Varanasi's most loved lanes with a local food guide. Taste hot kachori-sabzi, tamatar chaat, lassi from clay cups, seasonal malaiyo and finish with a legendary Banarasi paan.",
    category: "food",
    city: "Varanasi",
    priceInr: 999,
    durationDays: 1,
    durationNights: 0,
    maxGroupSize: 8,
    difficulty: "EASY",
    bestTimeToVisit: "November to February (for malaiyo)",
    meetingPoint: "Lanka Gate, Banaras Hindu University",
    images: 3,
    highlights: [
      "8+ tastings at beloved local stalls",
      "Clay-cup lassi and seasonal malaiyo",
      "Vegetarian-friendly route",
      "Stories behind each family-run shop",
    ],
    itinerary: [
      [
        "Evening food walk",
        "Start at 5:00 pm near Lanka, move to Godowlia for chaat and kachori, try lassi and thandai, and end with sweets and a Banarasi paan around 8:30 pm.",
      ],
    ],
    included: ["All tastings", "Food guide", "Bottled water"],
    excluded: [...standardExcluded, "Extra food orders beyond the tastings"],
  },
  {
    slug: "banarasi-silk-weaving-experience",
    title: "Banarasi Silk Weaving Experience",
    tagline: "Meet the weavers behind India's most famous saree",
    overview:
      "Visit a weaver's family home in the Madanpura lanes and watch a Banarasi brocade come to life on a handloom. Understand motifs, zari work and what makes an authentic piece, with optional shopping at fair prices straight from the weaver.",
    category: "crafts",
    city: "Varanasi",
    priceInr: 1599,
    durationDays: 1,
    durationNights: 0,
    maxGroupSize: 8,
    difficulty: "EASY",
    bestTimeToVisit: "Year round",
    meetingPoint: "Madanpura Chowk",
    images: 3,
    highlights: [
      "Live handloom demonstration",
      "Learn to tell real zari from imitation",
      "Try a turn at the loom",
      "No-pressure shopping direct from weavers",
    ],
    itinerary: [
      [
        "Weavers' lanes",
        "Meet at 10:30 am, walk to a weaver's home, watch brocade weaving, learn about motifs and zari, optional shopping, and finish with tea at 1:00 pm.",
      ],
    ],
    included: ["Weaver visit", "Local guide", "Tea and snacks"],
    excluded: [...standardExcluded, "Any purchases"],
  },
  {
    slug: "chunar-fort-vindhyachal-excursion",
    title: "Chunar Fort & Vindhyachal Excursion",
    tagline: "A weekend escape to a hilltop fort and a Shakti Peeth",
    overview:
      "Leave the city behind for Chunar Fort, a Ganga-side stronghold with centuries of history, and Vindhyachal, one of the holiest Shakti Peeths. Includes a night in Mirzapur and a short hike to Ashtabhuja temple for sweeping views.",
    category: "heritage",
    city: "Mirzapur",
    priceInr: 4999,
    originalPriceInr: 5999,
    durationDays: 2,
    durationNights: 1,
    maxGroupSize: 12,
    difficulty: "MODERATE",
    bestTimeToVisit: "October to March",
    meetingPoint: "Varanasi Cantt railway station",
    images: 4,
    highlights: [
      "Chunar Fort ramparts and Sonwa Mandap",
      "Vindhyavasini Devi temple darshan",
      "Short hill trek to Ashtabhuja temple",
      "Overnight stay in a comfortable Mirzapur hotel",
    ],
    itinerary: [
      ["Chunar Fort", "Pickup at 8:00 am, explore Chunar Fort and the ghats, then drive to Mirzapur for check-in."],
      ["Vindhyachal", "Early darshan at Vindhyavasini temple, trek to Ashtabhuja and Kali Khoh, return to Varanasi by 5:00 pm."],
    ],
    included: ["1 night hotel", "Breakfast", "AC vehicle", "Guide", "Fort entry"],
    excluded: [...standardExcluded, "Lunch and dinner"],
  },
];

const seed = async () => {
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name },
    });
    categoryIds.set(category.slug, row.id);
  }

  for (const item of destinations) {
    const { category, images, highlights, itinerary, included, excluded, ...rest } = item;
    const fields = { state: "Uttar Pradesh", ...rest };
    const categoryId = categoryIds.get(category)!;

    await prisma.$transaction(async (tx) => {
      const destination = await tx.destination.upsert({
        where: { slug: item.slug },
        create: { ...fields, categoryId, isPublished: true },
        update: { ...fields, categoryId, isPublished: true },
      });

      await tx.destinationImage.deleteMany({ where: { destinationId: destination.id } });
      await tx.destinationHighlight.deleteMany({ where: { destinationId: destination.id } });
      await tx.destinationInclusion.deleteMany({ where: { destinationId: destination.id } });
      await tx.itineraryDay.deleteMany({ where: { destinationId: destination.id } });

      await tx.destinationImage.createMany({
        data: Array.from({ length: images }, (_, index) => ({
          destinationId: destination.id,
          key: `destinations/${item.slug}/${String(index + 1).padStart(2, "0")}.webp`,
          alt: `${item.title} - photo ${index + 1}`,
          sortOrder: index,
          isCover: index === 0,
        })),
      });
      await tx.destinationHighlight.createMany({
        data: highlights.map((text, sortOrder) => ({ destinationId: destination.id, text, sortOrder })),
      });
      await tx.destinationInclusion.createMany({
        data: [
          ...included.map((text, sortOrder) => ({ destinationId: destination.id, text, isIncluded: true, sortOrder })),
          ...excluded.map((text, sortOrder) => ({ destinationId: destination.id, text, isIncluded: false, sortOrder })),
        ],
      });
      await tx.itineraryDay.createMany({
        data: itinerary.map(([title, description], index) => ({
          destinationId: destination.id,
          dayNumber: index + 1,
          title,
          description,
        })),
      });
    });
  }

  console.log(`Seeded ${categories.length} categories and ${destinations.length} destinations.`);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
