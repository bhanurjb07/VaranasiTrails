// Temporary photos, hotlinked from Wikimedia Commons (CC licensed). Every URL was
// checked and loads. They stand in until real images come from the API (R2).
// To swap one, change `url`, `alt` and `credit` here. See the README.

export interface PlaceholderImage {
  key: string
  url: string
  alt: string
  credit: string
}

export const placeholderImages = {
  ghatSunrise: {
    key: 'ghatSunrise',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Sunrise_at_the_Ganges_near_Varanasi.JPG/1920px-Sunrise_at_the_Ganges_near_Varanasi.JPG',
    alt: 'Sunrise over the ghats of Varanasi on the river Ganges',
    credit: 'Ilya Mauter, CC BY 3.0, via Wikimedia Commons',
  },
  gangaAarti: {
    key: 'gangaAarti',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Ganga_Aarti_at_Varanasi_in_the_evening.jpg/1920px-Ganga_Aarti_at_Varanasi_in_the_evening.jpg',
    alt: 'Priests performing the evening Ganga Aarti at Varanasi',
    credit: 'Vimalinarc, CC BY-SA 4.0, via Wikimedia Commons',
  },
  aartiGhat: {
    key: 'aartiGhat',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Ganga_Aarti_Varanasi.jpg/1920px-Ganga_Aarti_Varanasi.jpg',
    alt: 'Crowds gathered at the ghat for the Ganga Aarti ceremony',
    credit: 'Philip Nalangan, CC BY-SA 4.0, via Wikimedia Commons',
  },
  eveningPrayer: {
    key: 'eveningPrayer',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/EVENING_PRAYER_ON_BANK_OF_GANGES%2C_VARANASI.jpg/1920px-EVENING_PRAYER_ON_BANK_OF_GANGES%2C_VARANASI.jpg',
    alt: 'Evening prayer on the bank of the Ganges in Varanasi',
    credit: 'Sanchayankar09, CC BY-SA 4.0, via Wikimedia Commons',
  },
  dashashwamedh: {
    key: 'dashashwamedh',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Dashashwamedh_Ghat%2C_Ganga%2C_Varanasi.jpg/1920px-Dashashwamedh_Ghat%2C_Ganga%2C_Varanasi.jpg',
    alt: 'Dashashwamedh Ghat on the Ganga in Varanasi',
    credit: 'Ravi Raj Gupta, CC BY-SA 4.0, via Wikimedia Commons',
  },
  riverBoats: {
    key: 'riverBoats',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg/1920px-Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg',
    alt: 'Wooden boats on the Ganges at sunrise in Varanasi',
    credit: 'Schwiki, CC BY-SA 4.0, via Wikimedia Commons',
  },
  boatsSunset: {
    key: 'boatsSunset',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Varanasi%2C_India%2C_Sunset_in_Varanasi%2C_Boats_on_Ganges_River.jpg/1920px-Varanasi%2C_India%2C_Sunset_in_Varanasi%2C_Boats_on_Ganges_River.jpg',
    alt: 'Boats on the Ganges at sunset in Varanasi',
    credit: 'Vyacheslav Argenberg, CC BY 4.0, via Wikimedia Commons',
  },
  gangesDusk: {
    key: 'gangesDusk',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Varanasi%2C_India%2C_Ganges_River_after_sunset.jpg/1920px-Varanasi%2C_India%2C_Ganges_River_after_sunset.jpg',
    alt: 'The Ganges just after sunset in Varanasi',
    credit: 'Vyacheslav Argenberg, CC BY 4.0, via Wikimedia Commons',
  },
  morningAarti: {
    key: 'morningAarti',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Morning_Aarti_at_Assi_Ghat%2C_Varanasi_5.jpg/1920px-Morning_Aarti_at_Assi_Ghat%2C_Varanasi_5.jpg',
    alt: 'Morning aarti at Assi Ghat in Varanasi',
    credit: 'Rangan Datta Wiki, CC BY-SA 4.0, via Wikimedia Commons',
  },
  assiGhat: {
    key: 'assiGhat',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Varanasi_Assi_Ghat.jpg/1920px-Varanasi_Assi_Ghat.jpg',
    alt: 'Assi Ghat on the river Ganges in Varanasi',
    credit: 'Ankitsingh123, CC BY-SA 4.0, via Wikimedia Commons',
  },
  boatBuilding: {
    key: 'boatBuilding',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Boat_being_made_at_Assi_Ghat_Varanasi_Uttar_Pradesh_India.jpg/1920px-Boat_being_made_at_Assi_Ghat_Varanasi_Uttar_Pradesh_India.jpg',
    alt: 'A wooden boat being built at Assi Ghat',
    credit: 'User4edits, CC BY-SA 4.0, via Wikimedia Commons',
  },
  kartikaPurnima: {
    key: 'kartikaPurnima',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Kartika_Purnima_Varanasi_India_Buiobuione_01.jpg/1920px-Kartika_Purnima_Varanasi_India_Buiobuione_01.jpg',
    alt: 'Thousands of lamps lit on the ghats for Kartika Purnima',
    credit: 'Buiobuione, CC BY-SA 4.0, via Wikimedia Commons',
  },
  kartikaGhats: {
    key: 'kartikaGhats',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Kartika_Purnima_Varanasi_India_Buiobuione_05.jpg/1920px-Kartika_Purnima_Varanasi_India_Buiobuione_05.jpg',
    alt: 'The ghats of Varanasi glowing during Dev Deepawali',
    credit: 'Buiobuione, CC BY-SA 4.0, via Wikimedia Commons',
  },
  temple: {
    key: 'temple',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Shri_Kashi_Vishwanath_Temple_3.jpg/1920px-Shri_Kashi_Vishwanath_Temple_3.jpg',
    alt: 'Shri Kashi Vishwanath Temple in Varanasi',
    credit: 'Gannu03, CC BY-SA 4.0, via Wikimedia Commons',
  },
  templeSpire: {
    key: 'templeSpire',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Shri_Kashi_Vishwanath_Temple_5.jpg/1920px-Shri_Kashi_Vishwanath_Temple_5.jpg',
    alt: 'The golden spire of Kashi Vishwanath Temple',
    credit: 'Gannu03, CC BY-SA 4.0, via Wikimedia Commons',
  },
  templeCourtyard: {
    key: 'templeCourtyard',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Shri_Kashi_Vishwanath_Temple_7.jpg/1920px-Shri_Kashi_Vishwanath_Temple_7.jpg',
    alt: 'The courtyard of Kashi Vishwanath Temple',
    credit: 'Gannu03, CC BY-SA 4.0, via Wikimedia Commons',
  },
  oldCityLane: {
    key: 'oldCityLane',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Man_with_pushcart_in_the_old_city_of_Varanasi.JPG/1920px-Man_with_pushcart_in_the_old_city_of_Varanasi.JPG',
    alt: 'A narrow lane in the old city of Varanasi',
    credit: 'Ryan Hartman (PDXDUS), CC BY 3.0, via Wikimedia Commons',
  },
  dhamekStupa: {
    key: 'dhamekStupa',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/The_Dhamek_Stupa_%2C_500_CE_%2CSarnath%2C_Varanasi_Uttar_Pradesh.jpg',
    alt: 'The Dhamek Stupa at Sarnath near Varanasi',
    credit: 'SpeakingArch, CC BY-SA 4.0, via Wikimedia Commons',
  },
  dhamekRuins: {
    key: 'dhamekRuins',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Ruins_Duhamek_Stupa.jpg/1920px-Ruins_Duhamek_Stupa.jpg',
    alt: 'Ruins around the Dhamek Stupa at Sarnath',
    credit: 'ProbuddhoG., CC BY-SA 4.0, via Wikimedia Commons',
  },
  mulagandha: {
    key: 'mulagandha',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Mulagandha_Kuti_Vihara_%E2%80%93_Sarnath.jpg/1920px-Mulagandha_Kuti_Vihara_%E2%80%93_Sarnath.jpg',
    alt: 'Mulagandha Kuti Vihara temple at Sarnath',
    credit: 'MaximusPrasad, CC0, via Wikimedia Commons',
  },
  sarnathRuins: {
    key: 'sarnathRuins',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Sarnath_ruins.jpg/1920px-Sarnath_ruins.jpg',
    alt: 'Ancient monastery ruins at Sarnath',
    credit: 'Yashaswi RKG, CC BY-SA 4.0, via Wikimedia Commons',
  },
  dharmarajika: {
    key: 'dharmarajika',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Ruins_of_Dharamrajika_stupa_Sarnath.jpg/1920px-Ruins_of_Dharamrajika_stupa_Sarnath.jpg',
    alt: 'The Dharmarajika Stupa ruins at Sarnath',
    credit: 'Jamuna Prasad sharma, CC BY-SA 4.0, via Wikimedia Commons',
  },
  hanumanGarhi: {
    key: 'hanumanGarhi',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Hanuman_Garhi_Temple-20.jpg/1920px-Hanuman_Garhi_Temple-20.jpg',
    alt: 'Hanuman Garhi Temple in Ayodhya',
    credit: 'Immanuelle, CC BY 4.0, via Wikimedia Commons',
  },
  hanumanGarhiSteps: {
    key: 'hanumanGarhiSteps',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Hanuman_Garhi_Temple-27.jpg/1920px-Hanuman_Garhi_Temple-27.jpg',
    alt: 'The hilltop Hanuman Garhi Temple in Ayodhya',
    credit: 'Immanuelle, CC BY 4.0, via Wikimedia Commons',
  },
  sangam: {
    key: 'sangam',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Triveni_sangam_prayagraj.jpg/1920px-Triveni_sangam_prayagraj.jpg',
    alt: 'The Triveni Sangam at Prayagraj where the rivers meet',
    credit: 'Pradum Shukla, CC BY 4.0, via Wikimedia Commons',
  },
  sangamBoats: {
    key: 'sangamBoats',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Prayagraj_Sangam_2.jpg/1920px-Prayagraj_Sangam_2.jpg',
    alt: 'Boats at the Sangam in Prayagraj',
    credit: 'Rangan Datta Wiki, CC BY-SA 4.0, via Wikimedia Commons',
  },
  chunarFort: {
    key: 'chunarFort',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Chunar_Fort%2C_Mirzapur%2C_Uttar_Pradesh_01.jpg/1920px-Chunar_Fort%2C_Mirzapur%2C_Uttar_Pradesh_01.jpg',
    alt: 'Chunar Fort above the Ganges in Mirzapur',
    credit: 'Paramanu Sarkar, CC BY-SA 4.0, via Wikimedia Commons',
  },
  chunarWalls: {
    key: 'chunarWalls',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Chunar_Fort%2C_Mirzapur%2C_Uttar_Pradesh_03.jpg/1920px-Chunar_Fort%2C_Mirzapur%2C_Uttar_Pradesh_03.jpg',
    alt: 'The ramparts of Chunar Fort',
    credit: 'Paramanu Sarkar, CC BY-SA 4.0, via Wikimedia Commons',
  },
  chunarGate: {
    key: 'chunarGate',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Chunar_Fort_3.jpg/1920px-Chunar_Fort_3.jpg',
    alt: 'A gateway of Chunar Fort',
    credit: 'Rangan Datta Wiki, CC BY-SA 4.0, via Wikimedia Commons',
  },
  vindhyachal: {
    key: 'vindhyachal',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Vindyvashni_temple.jpg/1920px-Vindyvashni_temple.jpg',
    alt: 'Vindhyavasini Devi Temple at Vindhyachal',
    credit: 'Rasvihari mishra, CC BY-SA 4.0, via Wikimedia Commons',
  },
  vindhyachalGate: {
    key: 'vindhyachalGate',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Inside_Vindhyachal_Temple_enterance.JPG/1920px-Inside_Vindhyachal_Temple_enterance.JPG',
    alt: 'The entrance of the Vindhyachal temple complex',
    credit: 'Ramshankaryadav, CC BY-SA 3.0, via Wikimedia Commons',
  },
  ramnagarFort: {
    key: 'ramnagarFort',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Ramnagar_Fort%2C_Varanasi%2C_UP.JPG/1920px-Ramnagar_Fort%2C_Varanasi%2C_UP.JPG',
    alt: 'Ramnagar Fort on the eastern bank of the Ganges',
    credit: 'Cpsinghvns, CC BY-SA 3.0, via Wikimedia Commons',
  },
  ramnagarGate: {
    key: 'ramnagarGate',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Main_Entrance_of_Ramnagar_Fort%2C_Varanasi.jpg/1920px-Main_Entrance_of_Ramnagar_Fort%2C_Varanasi.jpg',
    alt: 'The main entrance of Ramnagar Fort',
    credit: 'Sujay25, CC BY-SA 4.0, via Wikimedia Commons',
  },
  ramnagarInside: {
    key: 'ramnagarInside',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Inside_Ramnagar_fort%2C_Varanasi.jpg/1920px-Inside_Ramnagar_fort%2C_Varanasi.jpg',
    alt: 'Inside the courtyard of Ramnagar Fort',
    credit: 'Sujay25, CC BY-SA 4.0, via Wikimedia Commons',
  },
  ramnagarRiver: {
    key: 'ramnagarRiver',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/The_Ganga_River_and_Ramnagar_bridge_from_Ramnagar_fort%2C_Vyasa_kasi%2C_Varanasi%2C_U.P.jpg/1920px-The_Ganga_River_and_Ramnagar_bridge_from_Ramnagar_fort%2C_Vyasa_kasi%2C_Varanasi%2C_U.P.jpg',
    alt: 'The Ganga seen from Ramnagar Fort',
    credit: 'K.Venkataramana, CC0, via Wikimedia Commons',
  },
  streetFood: {
    key: 'streetFood',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Tamater_Chaat_%28Tomato_Chaat%29.jpg/1920px-Tamater_Chaat_%28Tomato_Chaat%29.jpg',
    alt: 'A plate of Banarasi tomato chaat',
    credit: 'Pandey jayesh, CC BY-SA 4.0, via Wikimedia Commons',
  },
  kachori: {
    key: 'kachori',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Aloo_ki_sabji_with_Kachori.JPG/1920px-Aloo_ki_sabji_with_Kachori.JPG',
    alt: 'Kachori served with spiced potato sabzi',
    credit: 'Shobhit Dwivedi, CC BY-SA 4.0, via Wikimedia Commons',
  },
  paan: {
    key: 'paan',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Banarasi_Ice_Paan_-_Kolkata_2016-02-02_0449.JPG/1920px-Banarasi_Ice_Paan_-_Kolkata_2016-02-02_0449.JPG',
    alt: 'Banarasi-style paan, a folded betel leaf treat',
    credit: 'Biswarup Ganguly, CC BY 3.0, via Wikimedia Commons',
  },
  loomOne: {
    key: 'loomOne',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/India_-_Varanasi_loom_-_0985.jpg/1920px-India_-_Varanasi_loom_-_0985.jpg',
    alt: 'A handloom in a weaver’s home in Varanasi',
    credit: 'Jorge Royan, CC BY-SA 3.0, via Wikimedia Commons',
  },
  loomTwo: {
    key: 'loomTwo',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/India_-_Varanasi_loom_-_0987.jpg/1920px-India_-_Varanasi_loom_-_0987.jpg',
    alt: 'Silk threads strung on a Varanasi loom',
    credit: 'Jorge Royan, CC BY-SA 3.0, via Wikimedia Commons',
  },
} as const satisfies Record<string, PlaceholderImage>

export type PlaceholderKey = keyof typeof placeholderImages

/** Which placeholder photo represents each trip category (by category slug). */
export const categoryImageKeys: Record<string, PlaceholderKey> = {
  spiritual: 'gangaAarti',
  heritage: 'temple',
  food: 'streetFood',
  crafts: 'loomOne',
}

/** Used whenever an image fails to load. */
export const fallbackImage: PlaceholderImage = {
  key: 'fallback',
  url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Ghat_Varanasi.jpg/1920px-Ghat_Varanasi.jpg',
  alt: 'A ghat on the Ganges in Varanasi',
  credit: 'Philip Nalangan, CC BY 4.0, via Wikimedia Commons',
}

export const placeholderList: readonly PlaceholderImage[] = Object.values(placeholderImages)

/**
 * Picks a placeholder photo from a seed (usually the missing image's URL). The same
 * seed always gives the same photo, so a card and its detail page agree, but
 * different missing images get different photos instead of one repeated picture.
 */
export const fallbackFor = (seed: string): PlaceholderImage => {
  let hash = 0
  for (let index = 0; index < seed.length; index++) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  return placeholderList[hash % placeholderList.length] ?? fallbackImage
}
