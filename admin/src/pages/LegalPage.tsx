import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { SectionCard } from '@/components/ui/SectionCard'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { formatDate } from '@/lib/format'
import { newId, useLocalValue } from '@/lib/localStore'

interface LegalSection {
  id: string
  heading: string
  /** One paragraph per block, separated by a blank line. */
  body: string
}

interface LegalDoc {
  updatedOn: string
  sections: LegalSection[]
}

interface LegalPages {
  privacy: LegalDoc
  terms: LegalDoc
}

const section = (id: string, heading: string, ...paragraphs: string[]): LegalSection => ({ id, heading, body: paragraphs.join('\n\n') })

const LEGAL_SEED: LegalPages = {
  privacy: {
    updatedOn: '2026-11-01',
    sections: [
      section('p1', 'What we collect', 'When you create an account we collect your name, email address, mobile number and a password (stored only as a one-way hash). When you send an enquiry we collect the details you type into the form.', 'We also keep basic technical information, such as your IP address and browser type, to keep the service secure and to understand how the site is used.'),
      section('p2', 'How we use it', 'We use your details to run your account, verify your email, reply to enquiries and plan the trips you ask us about. We may contact you on WhatsApp, phone or email about a trip you have asked about.', 'We do not sell your personal information. We share it only with service providers who help us run the site (for example email delivery and hosting), and only as needed for them to do so.'),
      section('p3', 'Cookies and sign-in', 'We use a secure, httpOnly cookie to keep you signed in. It is needed for the site to work and is not used for advertising. We do not use third-party advertising cookies.'),
      section('p4', 'Your choices', 'You can update your name and phone number from your profile at any time. To have your account and data deleted, email us and we will action the request promptly.'),
      section('p5', 'Contact', 'Questions about privacy can be sent to the email address listed on our Contact page.'),
    ],
  },
  terms: {
    updatedOn: '2026-11-01',
    sections: [
      section('t1', 'Using this website', 'By using VaranasiTrails you agree to these terms. The site is provided to help you discover and enquire about trips. Please use it lawfully and keep your account details accurate and secure.'),
      section('t2', 'Trips, prices and bookings', 'Prices and itineraries shown on the site are a guide. Trips are confirmed, and prices finalised, only when we agree dates and details with you directly, for example on WhatsApp. The website does not take online payments or create bookings.', 'Itineraries can change because of weather, river levels, festivals, security arrangements or temple timings. We will always try to offer a comparable alternative.'),
      section('t3', 'Cancellations and refunds', 'Cancellation and refund terms depend on the trip and how close the date is. We share the exact terms with you before you confirm anything.'),
      section('t4', 'Reviews and content', 'Reviews must be honest and based on your own experience. We may remove content that is abusive, misleading or unlawful.'),
      section('t5', 'Liability', 'Travel involves risk. Please follow your guide’s instructions, respect local customs and take care of your belongings. To the extent the law allows, we are not liable for losses outside our reasonable control.'),
      section('t6', 'Changes', 'We may update these terms from time to time. Continued use of the site means you accept the updated terms.'),
    ],
  },
}

type Tab = 'privacy' | 'terms'

export const LegalPage = () => {
  const [tab, setTab] = useState<Tab>('privacy')
  const [saved, setSaved] = useLocalValue<LegalPages>('legal', LEGAL_SEED)
  const [draft, setDraft] = useState<LegalPages>(saved)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const doc = draft[tab]

  const patchDoc = (patch: Partial<LegalDoc>) => setDraft((current) => ({ ...current, [tab]: { ...current[tab], ...patch } }))
  const patchSection = (id: string, patch: Partial<LegalSection>) => patchDoc({ sections: doc.sections.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  const move = (index: number, delta: number) => {
    const next = [...doc.sections]
    const target = index + delta
    const [item] = next.splice(index, 1)
    if (!item || target < 0 || target > next.length) return
    next.splice(target, 0, item)
    patchDoc({ sections: next })
  }

  return (
    <>
      <PageHeader
        title="Legal pages"
        description="The Privacy policy and Terms of service shown in the website footer. Have a lawyer review them before launch."
        actions={
          <>
            <Button variant="outline" disabled={!dirty} onClick={() => setDraft(saved)}>
              Discard changes
            </Button>
            <Button
              disabled={!dirty}
              onClick={() => {
                if (setSaved(draft)) toast.success('Legal pages saved')
                else toast.error('Could not save in this browser')
              }}
            >
              <Save className="size-4" aria-hidden="true" /> Save
            </Button>
          </>
        }
      />
      <PreviewNotice />

      <Tabs<Tab>
        label="Document"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'privacy', label: 'Privacy policy' },
          { value: 'terms', label: 'Terms of service' },
        ]}
        className="mb-5"
      />

      <div className="space-y-4">
        <SectionCard title="Last updated" description={`Shown at the top of the page. Currently ${formatDate(doc.updatedOn)}.`}>
          <div className="max-w-xs">
            <Field label="Date">{({ id }) => <Input id={id} type="date" value={doc.updatedOn} onChange={(event) => patchDoc({ updatedOn: event.target.value })} />}</Field>
          </div>
        </SectionCard>

        {doc.sections.map((item, index) => (
          <SectionCard
            key={item.id}
            title={`Section ${index + 1}`}
            actions={
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Move down" disabled={index === doc.sections.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete section" onClick={() => patchDoc({ sections: doc.sections.filter((entry) => entry.id !== item.id) })}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            }
          >
            <div className="grid gap-4">
              <Field label="Heading">{({ id }) => <Input id={id} value={item.heading} onChange={(event) => patchSection(item.id, { heading: event.target.value })} />}</Field>
              <Field label="Text" hint="Leave a blank line between paragraphs.">{({ id }) => <Textarea id={id} className="min-h-32" value={item.body} onChange={(event) => patchSection(item.id, { body: event.target.value })} />}</Field>
            </div>
          </SectionCard>
        ))}

        <Button variant="outline" onClick={() => patchDoc({ sections: [...doc.sections, { id: newId(), heading: '', body: '' }] })}>
          <Plus className="size-4" aria-hidden="true" /> Add section
        </Button>
      </div>
    </>
  )
}
