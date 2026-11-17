import { CalendarCheck } from 'lucide-react'

import { CrudPage, type ColumnDef, type FieldDef } from '@/components/crud/CrudPage'
import { Badge } from '@/components/ui/Badge'
import { StatTiles } from '@/components/ui/StatTiles'
import {
  BOOKINGS_KEY,
  NO_BOOKINGS,
  blankBooking,
  sampleBookings,
  sourceLabel,
  sourceOptions,
  statusLabel,
  statusOptions,
  statusVariant,
  type Booking,
} from '@/features/bookings/model'
import { formatDate, formatPrice } from '@/lib/format'

const fields: readonly FieldDef<Booking>[] = [
  { name: 'customer', label: 'Customer name', required: true },
  { name: 'phone', label: 'Phone or WhatsApp', type: 'tel', required: true, placeholder: '+91...' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'trip', label: 'Trip', required: true, placeholder: 'Name of the trip' },
  { name: 'tripDate', label: 'Trip date', type: 'date', required: true },
  { name: 'travellers', label: 'Number of travellers', type: 'number', required: true },
  { name: 'total', label: 'Total price (INR)', type: 'number', required: true },
  { name: 'paid', label: 'Amount received (INR)', type: 'number', hint: 'Advance or full payment received so far.' },
  { name: 'status', label: 'Status', type: 'select', options: statusOptions },
  { name: 'source', label: 'How they booked', type: 'select', options: sourceOptions },
  { name: 'notes', label: 'Notes', type: 'textarea', hint: 'Pickup point, food needs, anything to remember.' },
]

const columns: readonly ColumnDef<Booking>[] = [
  {
    header: 'Customer',
    cell: (row) => (
      <>
        <span className="block font-semibold text-ink">{row.customer}</span>
        <span className="block text-xs text-muted">{row.phone}</span>
      </>
    ),
  },
  {
    header: 'Trip',
    cell: (row) => (
      <>
        <span className="block text-ink">{row.trip}</span>
        <span className="block text-xs text-muted">{row.tripDate ? formatDate(row.tripDate) : 'No date'}</span>
      </>
    ),
  },
  { header: 'People', cell: (row) => row.travellers ?? '-', className: 'whitespace-nowrap' },
  {
    header: 'Total / received',
    className: 'whitespace-nowrap',
    cell: (row) => (
      <>
        <span className="block font-medium text-ink">{formatPrice(row.total ?? 0)}</span>
        <span className="block text-xs text-muted">
          {formatPrice(row.paid ?? 0)} received
          {(row.total ?? 0) > (row.paid ?? 0) && row.status !== 'cancelled' ? `, ${formatPrice((row.total ?? 0) - (row.paid ?? 0))} due` : ''}
        </span>
      </>
    ),
  },
  { header: 'Status', cell: (row) => <Badge variant={statusVariant[row.status]}>{statusLabel(row.status)}</Badge> },
  { header: 'Source', cell: (row) => <span className="text-muted">{sourceLabel(row.source)}</span>, className: 'whitespace-nowrap' },
]

const summary = (rows: readonly Booking[]) => {
  const live = rows.filter((row) => row.status === 'confirmed' || row.status === 'completed')
  const value = live.reduce((sum, row) => sum + (row.total ?? 0), 0)
  const due = rows
    .filter((row) => row.status === 'confirmed')
    .reduce((sum, row) => sum + Math.max(0, (row.total ?? 0) - (row.paid ?? 0)), 0)
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = rows.filter((row) => row.status === 'confirmed' && row.tripDate >= today).length
  return (
    <StatTiles
      tiles={[
        { label: 'All bookings', value: rows.length },
        { label: 'Confirmed value', value: formatPrice(value), hint: 'Confirmed and completed trips' },
        { label: 'Still to receive', value: formatPrice(due), hint: 'On confirmed trips' },
        { label: 'Upcoming trips', value: upcoming },
      ]}
    />
  )
}

export const BookingsPage = () => (
  <CrudPage<Booking>
    storeKey={BOOKINGS_KEY}
    seed={NO_BOOKINGS}
    sample={sampleBookings()}
    title="Bookings"
    description="Keep a record of every booking made over WhatsApp, phone or the website, and what has been paid."
    noun="booking"
    icon={CalendarCheck}
    emptyText="Add a booking when a traveller confirms on WhatsApp. Track the date, the price and what has been received."
    blank={blankBooking}
    fields={fields}
    columns={columns}
    searchText={(row) => `${row.customer} ${row.phone} ${row.email} ${row.trip}`}
    tabs={statusOptions.map((option) => ({ value: option.value, label: option.label, test: (row: Booking) => row.status === option.value }))}
    summary={summary}
    exportName="bookings"
    validate={(values) => ((values.paid ?? 0) > (values.total ?? 0) ? 'The amount received cannot be more than the total price.' : null)}
  />
)
