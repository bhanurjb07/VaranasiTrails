import { UserPlus, Users } from 'lucide-react'
import { useMemo } from 'react'

import { CrudPage, type ColumnDef, type FieldDef } from '@/components/crud/CrudPage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatTiles } from '@/components/ui/StatTiles'
import { toast } from '@/components/ui/toast'
import { BOOKINGS_KEY, NO_BOOKINGS, sourceOptions, type Booking } from '@/features/bookings/model'
import { formatPrice } from '@/lib/format'
import { useLocalList, type HasId } from '@/lib/localStore'

interface Customer extends HasId {
  name: string
  phone: string
  email: string
  city: string
  tags: string
  source: string
  notes: string
  createdOn: string
}

const NO_CUSTOMERS: readonly Customer[] = []

const digits = (value: string) => value.replace(/\D/g, '').slice(-10)

const fields: readonly FieldDef<Customer>[] = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'phone', label: 'Phone or WhatsApp', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'city', label: 'City or country' },
  { name: 'tags', label: 'Tags', hint: 'Separate with commas, for example family, vegetarian, repeat.' },
  { name: 'source', label: 'How they found you', type: 'select', options: sourceOptions },
  { name: 'notes', label: 'Notes', type: 'textarea', hint: 'Preferences, special needs, anything worth remembering for next time.' },
]

export const CustomersPage = () => {
  const bookings = useLocalList<Booking>(BOOKINGS_KEY, NO_BOOKINGS).items
  const customers = useLocalList<Customer>('customers', NO_CUSTOMERS)

  // Bookings and spend are matched on the last 10 digits of the phone number.
  const byPhone = useMemo(() => {
    const map = new Map<string, { count: number; spent: number }>()
    for (const booking of bookings) {
      if (booking.status === 'cancelled' || booking.status === 'enquiry') continue
      const key = digits(booking.phone)
      const current = map.get(key) ?? { count: 0, spent: 0 }
      map.set(key, { count: current.count + 1, spent: current.spent + (booking.total ?? 0) })
    }
    return map
  }, [bookings])

  const missing = useMemo(() => {
    const known = new Set(customers.items.map((customer) => digits(customer.phone)))
    const seen = new Set<string>()
    return bookings.filter((booking) => {
      const key = digits(booking.phone)
      if (!key || known.has(key) || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [bookings, customers.items])

  const importFromBookings = () => {
    customers.setItems((current) => [
      ...missing.map(
        (booking): Customer => ({
          id: crypto.randomUUID(),
          name: booking.customer,
          phone: booking.phone,
          email: booking.email,
          city: '',
          tags: '',
          source: booking.source,
          notes: '',
          createdOn: new Date().toISOString().slice(0, 10),
        }),
      ),
      ...current,
    ])
    toast.success(`${missing.length} customer${missing.length === 1 ? '' : 's'} added from bookings`)
  }

  const columns: readonly ColumnDef<Customer>[] = [
    {
      header: 'Customer',
      cell: (row) => (
        <>
          <span className="block font-semibold text-ink">{row.name}</span>
          <span className="block text-xs text-muted">{[row.phone, row.email].filter(Boolean).join(' · ')}</span>
        </>
      ),
    },
    { header: 'City', cell: (row) => <span className="text-muted">{row.city || '-'}</span> },
    {
      header: 'Tags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
            .map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
              </Badge>
            ))}
        </div>
      ),
    },
    { header: 'Trips', cell: (row) => byPhone.get(digits(row.phone))?.count ?? 0, className: 'whitespace-nowrap' },
    { header: 'Spent', cell: (row) => formatPrice(byPhone.get(digits(row.phone))?.spent ?? 0), className: 'whitespace-nowrap' },
    { header: 'Notes', cell: (row) => <span className="line-clamp-2 max-w-xs text-muted">{row.notes || '-'}</span> },
  ]

  return (
    <CrudPage<Customer>
      storeKey="customers"
      seed={NO_CUSTOMERS}
      title="Customers"
      description="Everyone who has enquired or booked, with notes to remember for next time."
      noun="customer"
      icon={Users}
      emptyText="Add customers one by one, or pull them in from your bookings."
      blank={{ name: '', phone: '', email: '', city: '', tags: '', source: 'whatsapp', notes: '', createdOn: new Date().toISOString().slice(0, 10) }}
      fields={fields}
      columns={columns}
      searchText={(row) => `${row.name} ${row.phone} ${row.email} ${row.city} ${row.tags} ${row.notes}`}
      exportName="customers"
      summary={(rows) => {
        const repeat = rows.filter((row) => (byPhone.get(digits(row.phone))?.count ?? 0) > 1).length
        const spent = rows.reduce((sum, row) => sum + (byPhone.get(digits(row.phone))?.spent ?? 0), 0)
        return (
          <StatTiles
            tiles={[
              { label: 'Customers', value: rows.length },
              { label: 'Repeat customers', value: repeat, hint: 'More than one trip' },
              { label: 'Total spent', value: formatPrice(spent), hint: 'Confirmed and completed bookings' },
              { label: 'Not saved yet', value: missing.length, hint: 'People in bookings without a customer record' },
            ]}
          />
        )
      }}
      actions={
        <Button variant="outline" onClick={importFromBookings} disabled={missing.length === 0}>
          <UserPlus className="size-4" aria-hidden="true" /> Add from bookings{missing.length > 0 ? ` (${missing.length})` : ''}
        </Button>
      }
    />
  )
}
