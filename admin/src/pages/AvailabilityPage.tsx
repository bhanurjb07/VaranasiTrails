import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { NumberInput } from '@/components/ui/NumberInput'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { Select } from '@/components/ui/Select'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { toast } from '@/components/ui/toast'
import { BOOKINGS_KEY, NO_BOOKINGS, type Booking } from '@/features/bookings/model'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { newId, useLocalList, type HasId } from '@/lib/localStore'

type SlotStatus = 'open' | 'limited' | 'full' | 'closed'

interface Slot extends HasId {
  date: string
  status: SlotStatus
  spots: number | null
  note: string
}

const NO_SLOTS: readonly Slot[] = []

const statusMeta: Record<SlotStatus, { label: string; cell: string; badge: 'published' | 'warning' | 'archived' | 'draft' }> = {
  open: { label: 'Open', cell: 'bg-success-soft text-success', badge: 'published' },
  limited: { label: 'Limited spots', cell: 'bg-gold/30 text-navy-deep', badge: 'warning' },
  full: { label: 'Full', cell: 'bg-danger-soft text-danger', badge: 'archived' },
  closed: { label: 'Closed', cell: 'bg-canvas-alt text-muted', badge: 'draft' },
}

const pad = (value: number) => String(value).padStart(2, '0')
const iso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const AvailabilityPage = () => {
  const slots = useLocalList<Slot>('availability', NO_SLOTS)
  const bookings = useLocalList<Booking>(BOOKINGS_KEY, NO_BOOKINGS).items
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [editing, setEditing] = useState<string | null>(null)

  const slotByDate = useMemo(() => new Map(slots.items.map((slot) => [slot.date, slot])), [slots.items])
  const bookedByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const booking of bookings) {
      if (booking.status !== 'confirmed' || !booking.tripDate) continue
      map.set(booking.tripDate, (map.get(booking.tripDate) ?? 0) + (booking.travellers ?? 0))
    }
    return map
  }, [bookings])

  const first = new Date(cursor.year, cursor.month, 1)
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthName = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const monthPrefix = `${cursor.year}-${pad(cursor.month + 1)}`
  const monthSlots = slots.items.filter((slot) => slot.date.startsWith(monthPrefix)).sort((a, b) => a.date.localeCompare(b.date))
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate())

  const shift = (delta: number) =>
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })

  return (
    <>
      <PageHeader title="Availability" description="Mark the dates that are open, nearly full, full or closed. Confirmed bookings show up on their dates." />
      <PreviewNotice />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <h2 className="min-w-40 text-center text-xl">{monthName}</h2>
          <Button variant="outline" size="icon" aria-label="Next month" onClick={() => shift(1)}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })}>
            Today
          </Button>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs" aria-label="Legend">
          {(Object.keys(statusMeta) as SlotStatus[]).map((status) => (
            <li key={status} className={cn('rounded-lg px-2.5 py-1 font-medium', statusMeta[status].cell)}>
              {statusMeta[status].label}
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-paper">
        <div className="grid grid-cols-7 border-b border-line bg-canvas-alt text-center text-sm font-bold text-ink">
          {weekdays.map((day) => (
            <div key={day} className="px-1 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            if (day === null) return <div key={index} className="min-h-20 border-r border-b border-line bg-canvas-alt/40 last:border-r-0" />
            const date = iso(cursor.year, cursor.month, day)
            const slot = slotByDate.get(date)
            const booked = bookedByDate.get(date)
            return (
              <button
                key={index}
                type="button"
                onClick={() => setEditing(date)}
                aria-label={`${formatDate(date)}${slot ? `, ${statusMeta[slot.status].label}` : ', no setting'}`}
                className={cn(
                  'flex min-h-20 flex-col items-start gap-1 border-r border-b border-line p-2 text-left text-sm transition-colors hover:bg-brand/5 sm:min-h-24',
                  date === todayIso && 'bg-brand/5',
                )}
              >
                <span className={cn('flex size-6 items-center justify-center rounded-full text-xs font-bold', date === todayIso ? 'bg-brand text-ivory' : 'text-ink')}>{day}</span>
                {slot && (
                  <span className={cn('w-full truncate rounded px-1.5 py-0.5 text-xs font-medium', statusMeta[slot.status].cell)}>
                    {slot.status === 'limited' && slot.spots !== null ? `${slot.spots} left` : statusMeta[slot.status].label}
                  </span>
                )}
                {booked ? <span className="text-xs text-muted">{booked} booked</span> : null}
              </button>
            )
          })}
        </div>
      </div>

      <section aria-labelledby="slots-title" className="mt-6">
        <h2 id="slots-title" className="mb-3 text-xl">
          Settings for {monthName}
        </h2>
        {monthSlots.length === 0 ? (
          <p className="text-sm text-muted">No dates are marked this month. Click a date in the calendar to set it.</p>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Spots left</Th>
                <Th>Note</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {monthSlots.map((slot) => (
                <Tr key={slot.id}>
                  <Td className="font-medium text-ink">{formatDate(slot.date)}</Td>
                  <Td>
                    <Badge variant={statusMeta[slot.status].badge}>{statusMeta[slot.status].label}</Badge>
                  </Td>
                  <Td>{slot.status === 'limited' ? (slot.spots ?? '-') : '-'}</Td>
                  <Td className="text-muted">{slot.note || '-'}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(slot.date)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          slots.remove(slot.id)
                          toast.success('Date cleared')
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      {editing && (
        <DateModal
          date={editing}
          slot={slotByDate.get(editing)}
          booked={bookedByDate.get(editing) ?? 0}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            const existing = slotByDate.get(editing)
            if (existing) slots.update(existing.id, values)
            else slots.setItems((current) => [{ id: newId(), date: editing, ...values }, ...current])
            toast.success('Availability saved')
            setEditing(null)
          }}
          onClear={() => {
            const existing = slotByDate.get(editing)
            if (existing) slots.remove(existing.id)
            setEditing(null)
          }}
        />
      )}
    </>
  )
}

const DateModal = ({
  date,
  slot,
  booked,
  onClose,
  onSave,
  onClear,
}: {
  date: string
  slot?: Slot
  booked: number
  onClose: () => void
  onSave: (values: { status: SlotStatus; spots: number | null; note: string }) => void
  onClear: () => void
}) => {
  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? 'open')
  const [spots, setSpots] = useState<number | null>(slot?.spots ?? null)
  const [note, setNote] = useState(slot?.note ?? '')

  return (
    <Modal open onClose={onClose} title={formatDate(date)} description={booked > 0 ? `${booked} traveller${booked === 1 ? '' : 's'} confirmed on this date.` : 'No confirmed bookings on this date yet.'} className="max-w-md">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          onSave({ status, spots: status === 'limited' ? spots : null, note: note.trim() })
        }}
      >
        <Field label="Status">
          {({ id }) => (
            <Select id={id} value={status} onChange={(event) => setStatus(event.target.value as SlotStatus)}>
              {(Object.keys(statusMeta) as SlotStatus[]).map((value) => (
                <option key={value} value={value}>
                  {statusMeta[value].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {status === 'limited' && (
          <Field label="Spots left">{({ id }) => <NumberInput id={id} value={spots} onChange={setSpots} min={0} />}</Field>
        )}
        <Field label="Note" hint="For you only, for example 'Festival day, boats fully booked'.">
          {({ id }) => <Input id={id} value={note} onChange={(event) => setNote(event.target.value)} />}
        </Field>
        <div className="flex justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onClear} disabled={!slot}>
            Clear date
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
