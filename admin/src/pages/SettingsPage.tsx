import { Save } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { SectionCard } from '@/components/ui/SectionCard'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { useLocalValue } from '@/lib/localStore'

interface SocialSetting {
  platform: 'instagram' | 'facebook' | 'x' | 'youtube'
  label: string
  url: string
  handle: string
  enabled: boolean
}

export interface BusinessSettings {
  businessName: string
  tagline: string
  description: string
  phone: string
  whatsapp: string
  email: string
  officeName: string
  addressLines: string
  supportHours: string
  greeting: string
  social: SocialSetting[]
}

export const SETTINGS_KEY = 'settings'

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'VaranasiTrails',
  tagline: 'Guided trips in Varanasi and Uttar Pradesh',
  description: 'Boat rides, heritage walks, food trails and pilgrimages in Varanasi, Sarnath and Uttar Pradesh. Book through WhatsApp.',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'hello@varanasitrails.example',
  officeName: 'VaranasiTrails Travel Desk',
  addressLines: 'D 12/40, Godowlia Road\nVaranasi, Uttar Pradesh 221001\nIndia',
  supportHours: 'Every day, 7:00 am to 9:00 pm IST',
  greeting: "Hi VaranasiTrails, I'm interested in a trip.",
  social: [
    { platform: 'instagram', label: 'Instagram', url: '', handle: '', enabled: false },
    { platform: 'facebook', label: 'Facebook', url: '', handle: '', enabled: false },
    { platform: 'x', label: 'X (Twitter)', url: '', handle: '', enabled: false },
    { platform: 'youtube', label: 'YouTube', url: '', handle: '', enabled: false },
  ],
}

export const SettingsPage = () => {
  const [saved, setSaved] = useLocalValue<BusinessSettings>(SETTINGS_KEY, DEFAULT_SETTINGS)
  const [draft, setDraft] = useState<BusinessSettings>(saved)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const set = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const setSocial = (index: number, patch: Partial<SocialSetting>) =>
    setDraft((current) => ({ ...current, social: current.social.map((item, i) => (i === index ? { ...item, ...patch } : item)) }))

  const save = () => {
    if (setSaved(draft)) toast.success('Settings saved')
    else toast.error('Could not save in this browser')
  }

  return (
    <>
      <PageHeader
        title="Business details"
        description="The contact details and links shown on the website: header, footer, Contact page and WhatsApp messages."
        actions={
          <>
            <Button variant="outline" disabled={!dirty} onClick={() => setDraft(saved)}>
              Discard changes
            </Button>
            <Button disabled={!dirty} onClick={save}>
              <Save className="size-4" aria-hidden="true" /> Save settings
            </Button>
          </>
        }
      />
      <PreviewNotice />

      <div className="space-y-6">
        <SectionCard title="About the business" description="Shown in the footer and in search results.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name">{({ id }) => <Input id={id} value={draft.businessName} onChange={(event) => set('businessName', event.target.value)} />}</Field>
            <Field label="Tagline">{({ id }) => <Input id={id} value={draft.tagline} onChange={(event) => set('tagline', event.target.value)} />}</Field>
            <Field label="Short description" className="sm:col-span-2">
              {({ id }) => <Textarea id={id} value={draft.description} onChange={(event) => set('description', event.target.value)} />}
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Contact" description="How travellers reach you.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone number">{({ id }) => <Input id={id} type="tel" value={draft.phone} onChange={(event) => set('phone', event.target.value)} />}</Field>
            <Field label="WhatsApp number" hint="Booking buttons on the site open a chat with this number.">
              {({ id }) => <Input id={id} type="tel" value={draft.whatsapp} onChange={(event) => set('whatsapp', event.target.value)} />}
            </Field>
            <Field label="Email address">{({ id }) => <Input id={id} type="email" value={draft.email} onChange={(event) => set('email', event.target.value)} />}</Field>
            <Field label="Support hours">{({ id }) => <Input id={id} value={draft.supportHours} onChange={(event) => set('supportHours', event.target.value)} />}</Field>
          </div>
        </SectionCard>

        <SectionCard title="Office" description="Shown on the Contact page and in the footer.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Office name">{({ id }) => <Input id={id} value={draft.officeName} onChange={(event) => set('officeName', event.target.value)} />}</Field>
            <Field label="Address" hint="One line per row." className="sm:row-span-2">
              {({ id }) => <Textarea id={id} value={draft.addressLines} onChange={(event) => set('addressLines', event.target.value)} />}
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="WhatsApp" description="The first line of the message a traveller sends when they tap a general WhatsApp button.">
          <Field label="Opening message">{({ id }) => <Textarea id={id} value={draft.greeting} onChange={(event) => set('greeting', event.target.value)} className="min-h-20" />}</Field>
        </SectionCard>

        <SectionCard title="Social media" description="Switch an account on to show its icon in the footer.">
          <ul className="divide-y divide-line">
            {draft.social.map((item, index) => (
              <li key={item.platform} className="grid gap-3 py-4 sm:grid-cols-[8rem_1fr_12rem_auto] sm:items-end">
                <p className="font-medium text-ink sm:pb-2.5">{item.label}</p>
                <Field label="Profile link">{({ id }) => <Input id={id} type="url" placeholder="https://" value={item.url} onChange={(event) => setSocial(index, { url: event.target.value })} />}</Field>
                <Field label="Handle">{({ id }) => <Input id={id} placeholder="@name" value={item.handle} onChange={(event) => setSocial(index, { handle: event.target.value })} />}</Field>
                <div className="flex items-center gap-2 sm:pb-2">
                  <Switch label={`Show ${item.label} in the footer`} checked={item.enabled} onChange={(enabled) => setSocial(index, { enabled })} />
                  <span className="text-sm text-muted">{item.enabled ? 'Shown' : 'Hidden'}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  )
}
