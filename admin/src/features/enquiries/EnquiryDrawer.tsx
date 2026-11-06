import { Mail, MessageCircle, Phone, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { formatDateTime } from '@/lib/format'
import type { AdminEnquiry, EnquiryStatus } from '@/types/api'
import { EnquiryStatusBadge } from './EnquiryStatusBadge'
import { useEnquiryMutations } from './useEnquiries'

interface EnquiryDrawerProps {
  enquiry: AdminEnquiry | null
  onClose: () => void
}

/** Detail panel. Mounted fresh per enquiry, so the form always starts from its data. */
export const EnquiryDrawer = ({ enquiry, onClose }: EnquiryDrawerProps) =>
  enquiry ? <EnquiryPanel key={enquiry.id} enquiry={enquiry} onClose={onClose} /> : null

const contactLink = 'inline-flex items-center gap-2 rounded-control border border-line px-3 py-2 text-sm font-semibold text-indigo transition-colors hover:border-indigo/40 hover:bg-cream'

const EnquiryPanel = ({ enquiry, onClose }: { enquiry: AdminEnquiry; onClose: () => void }) => {
  const { update, remove } = useEnquiryMutations()
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status)
  const [notes, setNotes] = useState(enquiry.adminNotes ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const dirty = status !== enquiry.status || notes.trim() !== (enquiry.adminNotes ?? '')
  const whatsappDigits = enquiry.phone.replace(/\D/g, '')

  return (
    <>
      <Drawer
        open={enquiry !== null}
        onClose={onClose}
        title={enquiry?.name ?? 'Enquiry'}
        description={enquiry ? `Received ${formatDateTime(enquiry.createdAt)}` : undefined}
        footer={
          enquiry && (
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4 text-danger" aria-hidden="true" /> Delete
              </Button>
              <Button
                loading={update.isPending}
                disabled={!dirty}
                onClick={() => update.mutate({ id: enquiry.id, input: { status, adminNotes: notes.trim() || null } })}
              >
                Save changes
              </Button>
            </div>
          )
        }
      >
        {enquiry && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <EnquiryStatusBadge status={enquiry.status} />
              {enquiry.destination ? (
                <Link to={`/destinations/${enquiry.destination.id}`} className="text-sm font-semibold text-saffron-dark hover:underline">
                  About: {enquiry.destination.title}
                </Link>
              ) : (
                <span className="text-sm text-muted">General enquiry</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <a href={`tel:${enquiry.phone}`} className={contactLink}>
                <Phone className="size-4" aria-hidden="true" /> Call {enquiry.phone}
              </a>
              <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className={contactLink}>
                <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
              </a>
              <a href={`mailto:${enquiry.email}`} className={contactLink}>
                <Mail className="size-4" aria-hidden="true" /> {enquiry.email}
              </a>
            </div>

            <section aria-label="Message">
              <h3 className="mb-2 font-sans text-sm font-semibold tracking-wide text-muted uppercase">Message</h3>
              <p className="rounded-control bg-cream px-4 py-3 text-sm whitespace-pre-line text-ink">{enquiry.message}</p>
            </section>

            <Field label="Status">
              {({ id }) => (
                <Select id={id} value={status} onChange={(event) => setStatus(event.target.value as EnquiryStatus)}>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED">Closed</option>
                </Select>
              )}
            </Field>

            <Field label="Internal notes" hint="Only admins see these.">
              {({ id, describedBy }) => (
                <Textarea id={id} rows={5} aria-describedby={describedBy} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Called on Monday, will confirm dates by Friday..." />
              )}
            </Field>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          enquiry &&
          remove.mutate(enquiry.id, {
            onSuccess: () => {
              setConfirmDelete(false)
              onClose()
            },
          })
        }
        loading={remove.isPending}
        danger
        title="Delete this enquiry?"
        confirmLabel="Delete enquiry"
      >
        The enquiry from <strong>{enquiry?.name}</strong> will be deleted for good.
      </ConfirmDialog>
    </>
  )
}
