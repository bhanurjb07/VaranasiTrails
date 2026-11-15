// The people behind VaranasiTrails, shown on the Founders page (/founders).
// TODO(business): replace every value marked below with the real details. Any optional field
// left empty (instagram, facebook, phone, email) is simply not shown on the page.

import founder1Photo from '@/assets/founder1.jpg'
import founder2Photo from '@/assets/founder2.jpg'

export interface Founder {
  id: string
  name: string
  role: string
  photo: string
  /** Describe the photo for people who cannot see it. */
  photoAlt: string
  /** Two or three sentences, always visible. */
  shortIntro: string
  /** The longer story, one paragraph per item. Shown when the visitor taps "Know more". */
  fullIntro: readonly string[]
  /** Full profile links, for example https://www.instagram.com/yourname. Leave empty to hide. */
  instagram: string
  facebook: string
  /** Indian mobile number with country code, for example +919876543210. Leave empty to hide. */
  phone: string
  email: string
}

export const founders: readonly Founder[] = [
  {
    id: 'founder-1',
    // TODO(business): real name, role, photo description, introduction and contact details.
    name: 'Founder name',
    role: 'Co-founder',
    photo: founder1Photo,
    photoAlt: 'Portrait of the first founder',
    shortIntro: 'Write two or three sentences here about who this founder is and what they do at VaranasiTrails.',
    fullIntro: ['Write the longer story here. Add more items to this list for more paragraphs.'],
    instagram: 'https://www.instagram.com/virat.kohli',
    facebook: 'https://www.facebook.com/virat.kohli/',
    phone: 'XXXXXXXXXXX',
    email: 'abc@example.com',
  },
  {
    id: 'founder-2',
    // TODO(business): replace founder2.jpg in src/assets with the second founder's photo (it is
    // currently a copy of founder1.jpg), then fill in the details.
    name: 'Founder name',
    role: 'Co-founder',
    photo: founder2Photo,
    photoAlt: 'Portrait of the second founder',
    shortIntro: 'Write two or three sentences here about who this founder is and what they do at VaranasiTrails.',
    fullIntro: ['Write the longer story here. Add more items to this list for more paragraphs.'],
    instagram: 'https://www.instagram.com/virat.kohli',
    facebook: 'https://www.facebook.com/virat.kohli/',
    phone: 'XXXXXXXXXXX',
    email: 'abc@example.com',
  },
]
