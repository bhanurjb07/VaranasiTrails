import { Save, UserRound } from 'lucide-react'
import { useState } from 'react'

import { CrudPage, type ColumnDef, type FieldDef } from '@/components/crud/CrudPage'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { SectionCard } from '@/components/ui/SectionCard'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { useLocalValue, type HasId } from '@/lib/localStore'

interface AboutContent {
  title: string
  intro: string
  lead: string
  /** One paragraph per block, separated by a blank line. */
  story: string
  peopleTitle: string
  peopleText: string
  closingTitle: string
  closingText: string
}

const ABOUT_SEED: AboutContent = {
  title: 'About VaranasiTrails',
  intro: 'We plan and run guided trips in Varanasi, Sarnath and across Uttar Pradesh.',
  lead: 'Varanasi is best seen slowly: from the water at first light, on foot through the old lanes, and at the ghats when the lamps are lit.',
  story:
    'Our trips include boat rides on the Ganga, walks through the old city, food trails and pilgrimage routes. Each one has a written itinerary, a fixed meeting point and a clear list of what is included.\n\nWe keep groups small and agree the details with every traveller directly, so you know the plan, the price and the pickup before the day.\n\nTo ask about a trip, use the enquiry form or message us on WhatsApp.',
  peopleTitle: 'Meet the people behind VaranasiTrails',
  peopleText: 'Read who started the company and how to reach them directly.',
  closingTitle: 'Plan your trip with us',
  closingText: 'Browse the trips, or send us your dates on WhatsApp and we will help you choose.',
}

interface Founder extends HasId {
  name: string
  role: string
  photo: string
  photoAlt: string
  shortIntro: string
  fullIntro: string
  instagram: string
  facebook: string
  phone: string
  email: string
}

const NO_FOUNDERS: readonly Founder[] = []

const founderFields: readonly FieldDef<Founder>[] = [
  { name: 'name', label: 'Name', required: true },
  { name: 'role', label: 'Role', required: true, placeholder: 'Co-founder' },
  { name: 'photo', label: 'Photo link', type: 'url', hint: 'Pick one from the Media library.' },
  { name: 'photoAlt', label: 'Describe the photo' },
  { name: 'shortIntro', label: 'Short introduction', type: 'textarea', required: true, hint: 'Two or three sentences, always shown.' },
  { name: 'fullIntro', label: 'Full story', type: 'textarea', hint: 'Shown when a visitor taps "Know more". Separate paragraphs with a blank line.' },
  { name: 'instagram', label: 'Instagram link', type: 'url' },
  { name: 'facebook', label: 'Facebook link', type: 'url' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
]

const founderColumns: readonly ColumnDef<Founder>[] = [
  {
    header: 'Founder',
    cell: (row) => (
      <div className="flex items-center gap-3">
        {row.photo ? <img src={row.photo} alt="" className="size-10 rounded-full object-cover" /> : <span className="flex size-10 items-center justify-center rounded-full bg-canvas-alt text-muted"><UserRound className="size-5" aria-hidden="true" /></span>}
        <div>
          <span className="block font-semibold text-ink">{row.name}</span>
          <span className="block text-xs text-muted">{row.role}</span>
        </div>
      </div>
    ),
  },
  { header: 'Introduction', cell: (row) => <span className="line-clamp-2 max-w-md text-muted">{row.shortIntro}</span> },
  {
    header: 'Contact',
    cell: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.phone && <Badge variant="info">Phone</Badge>}
        {row.email && <Badge variant="info">Email</Badge>}
        {row.instagram && <Badge variant="info">Instagram</Badge>}
        {row.facebook && <Badge variant="info">Facebook</Badge>}
        {!row.phone && !row.email && !row.instagram && !row.facebook && <span className="text-muted">None</span>}
      </div>
    ),
  },
]

type Tab = 'about' | 'founders'

export const AboutEditorPage = () => {
  const [tab, setTab] = useState<Tab>('about')
  const [saved, setSaved] = useLocalValue<AboutContent>('about', ABOUT_SEED)
  const [draft, setDraft] = useState<AboutContent>(saved)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const set = (key: keyof AboutContent, value: string) => setDraft((current) => ({ ...current, [key]: value }))

  const text = (key: keyof AboutContent, label: string, hint?: string) => (
    <Field label={label} hint={hint}>{({ id }) => <Input id={id} value={draft[key]} onChange={(event) => set(key, event.target.value)} />}</Field>
  )

  return (
    <>
      <PageHeader
        title="About and founders"
        description="The text on the About page and the people on the Founders page."
        actions={
          tab === 'about' ? (
            <>
              <Button variant="outline" disabled={!dirty} onClick={() => setDraft(saved)}>
                Discard changes
              </Button>
              <Button
                disabled={!dirty}
                onClick={() => {
                  if (setSaved(draft)) toast.success('About page saved')
                  else toast.error('Could not save in this browser')
                }}
              >
                <Save className="size-4" aria-hidden="true" /> Save
              </Button>
            </>
          ) : undefined
        }
      />
      <PreviewNotice />

      <Tabs<Tab>
        label="Page"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'about', label: 'About page' },
          { value: 'founders', label: 'Founders' },
        ]}
        className="mb-5"
      />

      {tab === 'about' ? (
        <div className="space-y-6">
          <SectionCard title="Top of the page">
            <div className="grid gap-4">
              {text('title', 'Page title')}
              {text('intro', 'Intro line')}
            </div>
          </SectionCard>
          <SectionCard title="Our story" description="A short line about the city, then the paragraphs about your business.">
            <div className="grid gap-4">
              <Field label="Lead line">{({ id }) => <Textarea id={id} className="min-h-20" value={draft.lead} onChange={(event) => set('lead', event.target.value)} />}</Field>
              <Field label="Paragraphs" hint="Leave a blank line between paragraphs.">{({ id }) => <Textarea id={id} className="min-h-48" value={draft.story} onChange={(event) => set('story', event.target.value)} />}</Field>
            </div>
          </SectionCard>
          <SectionCard title="Bottom of the page">
            <div className="grid gap-4 sm:grid-cols-2">
              {text('peopleTitle', 'Founders card title')}
              {text('peopleText', 'Founders card text')}
              {text('closingTitle', 'Closing panel title')}
              {text('closingText', 'Closing panel text')}
            </div>
          </SectionCard>
        </div>
      ) : (
        <CrudPage<Founder>
          embedded
          storeKey="founders"
          seed={NO_FOUNDERS}
          title="Founders"
          description="People shown on the Founders page, in this order. Empty contact fields are simply not shown."
          noun="founder"
          icon={UserRound}
          emptyText="Add each founder with a photo, a short introduction and how to reach them."
          blank={{ name: '', role: 'Co-founder', photo: '', photoAlt: '', shortIntro: '', fullIntro: '', instagram: '', facebook: '', phone: '', email: '' }}
          fields={founderFields}
          columns={founderColumns}
          searchText={(row) => `${row.name} ${row.role} ${row.shortIntro}`}
        />
      )}
    </>
  )
}
