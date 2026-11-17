import { HelpCircle, Sparkles, Tag } from 'lucide-react'
import { useState } from 'react'

import { CrudPage, type ColumnDef, type FieldDef } from '@/components/crud/CrudPage'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { formatDate } from '@/lib/format'
import type { HasId } from '@/lib/localStore'

// ---- Offers ----

interface Offer extends HasId {
  label: string
  title: string
  text: string
  cta: string
  link: string
  tone: 'light' | 'dark'
  image: string
  startsOn: string
  endsOn: string
  active: boolean
}

const OFFERS_SEED: readonly Offer[] = [
  { id: 'o1', label: 'Sunrise special', title: 'Sunrise boat ride on the Ganga', text: 'See the ghats light up from the water. Message us on WhatsApp for the current price and available dates.', cta: 'Search deals', link: '/destinations', tone: 'light', image: '', startsOn: '', endsOn: '', active: true },
  { id: 'o2', label: 'Save on your next trip', title: 'Weekend Deal', text: 'Plan a weekend in Varanasi with a guided itinerary. Ask us about the current weekend offers.', cta: 'See weekend trips', link: '/destinations', tone: 'dark', image: '', startsOn: '', endsOn: '', active: true },
]

const offerFields: readonly FieldDef<Offer>[] = [
  { name: 'label', label: 'Small label', placeholder: 'Weekend Deal' },
  { name: 'title', label: 'Title', required: true },
  { name: 'text', label: 'Text', type: 'textarea', required: true },
  { name: 'cta', label: 'Button text', required: true },
  { name: 'link', label: 'Button link', required: true, hint: 'A page on the site, for example /destinations.' },
  { name: 'tone', label: 'Card colour', type: 'select', options: [{ value: 'light', label: 'White card' }, { value: 'dark', label: 'Blue card' }] },
  { name: 'image', label: 'Photo link', type: 'url', hint: 'Optional. Pick one from the Media library.' },
  { name: 'startsOn', label: 'Starts on', type: 'date', hint: 'Leave empty to start now.' },
  { name: 'endsOn', label: 'Ends on', type: 'date', hint: 'Leave empty for no end date.' },
  { name: 'active', label: 'Show on the home page', type: 'switch' },
]

const offerStatus = (offer: Offer) => {
  const today = new Date().toISOString().slice(0, 10)
  if (!offer.active) return <Badge variant="draft">Hidden</Badge>
  if (offer.startsOn && offer.startsOn > today) return <Badge variant="info">Scheduled</Badge>
  if (offer.endsOn && offer.endsOn < today) return <Badge variant="archived">Ended</Badge>
  return <Badge variant="published">Live</Badge>
}

const offerColumns: readonly ColumnDef<Offer>[] = [
  {
    header: 'Offer',
    cell: (row) => (
      <>
        <span className="block font-semibold text-ink">{row.title}</span>
        <span className="block text-xs text-muted">{row.label}</span>
      </>
    ),
  },
  { header: 'Card', cell: (row) => <span className="text-muted">{row.tone === 'dark' ? 'Blue' : 'White'}</span> },
  { header: 'Dates', className: 'whitespace-nowrap', cell: (row) => <span className="text-muted">{row.startsOn || row.endsOn ? `${row.startsOn ? formatDate(row.startsOn) : 'Now'} to ${row.endsOn ? formatDate(row.endsOn) : 'no end'}` : 'Always'}</span> },
  { header: 'Status', cell: offerStatus },
  { header: 'Visible', cell: (row, ctl) => <Switch label={`Show ${row.title} on the home page`} checked={row.active} onChange={(active) => ctl.update({ active })} /> },
]

// ---- Why VaranasiTrails cards ----

interface WhyCard extends HasId {
  icon: string
  title: string
  text: string
  active: boolean
}

const WHY_SEED: readonly WhyCard[] = [
  { id: 'w1', icon: 'shield', title: 'Know what the price covers', text: 'Every trip lists what is included and what is not, before you message us.', active: true },
  { id: 'w2', icon: 'map', title: 'A clear day-by-day plan', text: 'Full itineraries with the meeting point and the best time to visit.', active: true },
  { id: 'w3', icon: 'group', title: 'Group size and difficulty', text: 'Maximum group size and an Easy, Moderate or Hard rating on every trip.', active: true },
  { id: 'w4', icon: 'chat', title: 'Answers straight from us', text: 'Ask about dates, pickups or changes on WhatsApp or the enquiry form.', active: true },
]

const whyFields: readonly FieldDef<WhyCard>[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'text', label: 'Text', type: 'textarea', required: true },
  {
    name: 'icon',
    label: 'Picture',
    type: 'select',
    options: [
      { value: 'shield', label: 'Document with a tick' },
      { value: 'map', label: 'Folded map' },
      { value: 'group', label: 'Group of people' },
      { value: 'chat', label: 'Chat bubbles' },
    ],
  },
  { name: 'active', label: 'Show on the home page', type: 'switch' },
]

const whyColumns: readonly ColumnDef<WhyCard>[] = [
  { header: 'Card', cell: (row) => <><span className="block font-semibold text-ink">{row.title}</span><span className="block max-w-md text-xs text-muted">{row.text}</span></> },
  { header: 'Picture', cell: (row) => <span className="text-muted">{row.icon}</span> },
  { header: 'Visible', cell: (row, ctl) => <Switch label={`Show ${row.title}`} checked={row.active} onChange={(active) => ctl.update({ active })} /> },
]

// ---- FAQ ----

interface FaqItem extends HasId {
  question: string
  answer: string
  active: boolean
}

const FAQ_SEED: readonly FaqItem[] = [
  { id: 'f1', question: 'How do I book a trip?', answer: 'There is no online checkout. Open any trip and tap Book on WhatsApp. It starts a chat with the trip details already filled in, and we confirm dates, price and pickup with you directly.', active: true },
  { id: 'f2', question: 'Do I need an account?', answer: 'No. You can browse and message us without one. An account lets you save trips to a wishlist and leave reviews.', active: true },
  { id: 'f3', question: 'What is the best time to visit Varanasi?', answer: 'October to March is the most comfortable, with cool mornings that suit boat rides and walks. Summers are hot, and the monsoon raises the river and can limit boat access.', active: true },
  { id: 'f4', question: 'Are the trips suitable for older travellers and children?', answer: 'Each trip shows a difficulty rating. Tell us who is travelling when you message and we will tell you whether the trip suits them.', active: true },
  { id: 'f5', question: 'Can you customise a trip?', answer: 'Tell us what you have in mind when you message us, and we will say what is possible.', active: true },
  { id: 'f6', question: 'What is your cancellation policy?', answer: 'It depends on the trip and how close the date is. We share the exact terms in the chat before you confirm anything.', active: true },
]

const faqFields: readonly FieldDef<FaqItem>[] = [
  { name: 'question', label: 'Question', required: true },
  { name: 'answer', label: 'Answer', type: 'textarea', required: true },
  { name: 'active', label: 'Show on the home page', type: 'switch' },
]

const faqColumns: readonly ColumnDef<FaqItem>[] = [
  { header: 'Question', cell: (row) => <><span className="block font-semibold text-ink">{row.question}</span><span className="block max-w-xl truncate text-xs text-muted">{row.answer}</span></> },
  { header: 'Visible', cell: (row, ctl) => <Switch label={`Show ${row.question}`} checked={row.active} onChange={(active) => ctl.update({ active })} /> },
]

type Tab = 'offers' | 'why' | 'faq'

export const ContentPage = () => {
  const [tab, setTab] = useState<Tab>('offers')

  return (
    <>
      <PageHeader title="Offers and homepage" description="Edit the offer cards, the reasons to choose you and the questions travellers ask, without touching code." />
      <PreviewNotice />
      <Tabs<Tab>
        label="Homepage sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'offers', label: 'Offers' },
          { value: 'why', label: 'Why VaranasiTrails' },
          { value: 'faq', label: 'FAQ' },
        ]}
        className="mb-5"
      />

      {tab === 'offers' && (
        <CrudPage<Offer>
          embedded
          storeKey="offers"
          seed={OFFERS_SEED}
          title="Offers"
          description="The two cards under Why VaranasiTrails on the home page."
          noun="offer"
          icon={Tag}
          emptyText="Add an offer card with a title, a line of text and a button."
          blank={{ label: '', title: '', text: '', cta: 'See trips', link: '/destinations', tone: 'light', image: '', startsOn: '', endsOn: '', active: true }}
          fields={offerFields}
          columns={offerColumns}
          searchText={(row) => `${row.title} ${row.label} ${row.text}`}
        />
      )}
      {tab === 'why' && (
        <CrudPage<WhyCard>
          embedded
          storeKey="why-cards"
          seed={WHY_SEED}
          title="Why VaranasiTrails"
          description="The grey cards right under the search bar. Four fit the page best."
          noun="card"
          icon={Sparkles}
          emptyText="Add a card with a short title and one sentence."
          blank={{ icon: 'shield', title: '', text: '', active: true }}
          fields={whyFields}
          columns={whyColumns}
          searchText={(row) => `${row.title} ${row.text}`}
        />
      )}
      {tab === 'faq' && (
        <CrudPage<FaqItem>
          embedded
          storeKey="faq"
          seed={FAQ_SEED}
          title="FAQ"
          description="Questions travellers ask most. They appear on the home page in this order."
          noun="question"
          icon={HelpCircle}
          emptyText="Add the questions you answer again and again."
          blank={{ question: '', answer: '', active: true }}
          fields={faqFields}
          columns={faqColumns}
          searchText={(row) => `${row.question} ${row.answer}`}
        />
      )}
    </>
  )
}
