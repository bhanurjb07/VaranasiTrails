import { BarChart3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { Select } from '@/components/ui/Select'
import { StatTiles } from '@/components/ui/StatTiles'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { toast } from '@/components/ui/toast'
import { BOOKINGS_KEY, NO_BOOKINGS, sampleBookings, sourceLabel, statusLabel, statusOptions, type Booking } from '@/features/bookings/model'
import { formatPrice } from '@/lib/format'
import { useLocalList } from '@/lib/localStore'

const monthKey = (iso: string) => iso.slice(0, 7)
const monthLabel = (key: string) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' })

const lastMonths = (count: number) => {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - index), 1))
    return date.toISOString().slice(0, 7)
  })
}

const tooltipStyle = { borderRadius: 8, border: '1px solid var(--color-line)', background: 'var(--color-paper)', color: 'var(--color-ink)', fontSize: 13 }

/** Simple reports computed from the Bookings screen. */
export const ReportsPage = () => {
  const { items, setItems } = useLocalList<Booking>(BOOKINGS_KEY, NO_BOOKINGS)
  const [range, setRange] = useState('6')

  const data = useMemo(() => {
    const months = lastMonths(Number(range))
    const inRange = items.filter((booking) => months.includes(monthKey(booking.tripDate || booking.createdOn)))
    const real = inRange.filter((booking) => booking.status === 'confirmed' || booking.status === 'completed')
    const revenue = real.reduce((sum, booking) => sum + (booking.total ?? 0), 0)
    const received = real.reduce((sum, booking) => sum + (booking.paid ?? 0), 0)
    const people = real.reduce((sum, booking) => sum + (booking.travellers ?? 0), 0)
    const asked = inRange.filter((booking) => booking.status !== 'cancelled').length
    const conversion = asked === 0 ? 0 : Math.round((real.length / asked) * 100)

    const byMonth = months.map((key) => {
      const rows = real.filter((booking) => monthKey(booking.tripDate || booking.createdOn) === key)
      return { month: monthLabel(key), bookings: rows.length, revenue: rows.reduce((sum, booking) => sum + (booking.total ?? 0), 0) }
    })

    const trips = new Map<string, { count: number; revenue: number; people: number }>()
    for (const booking of real) {
      const current = trips.get(booking.trip) ?? { count: 0, revenue: 0, people: 0 }
      trips.set(booking.trip, { count: current.count + 1, revenue: current.revenue + (booking.total ?? 0), people: current.people + (booking.travellers ?? 0) })
    }
    const topTrips = [...trips.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8)

    const sources = new Map<string, number>()
    for (const booking of inRange) sources.set(booking.source, (sources.get(booking.source) ?? 0) + 1)

    const statuses = statusOptions.map((option) => ({ status: option.value, count: inRange.filter((booking) => booking.status === option.value).length }))

    return { inRange, real, revenue, received, people, conversion, byMonth, topTrips, sources: [...sources.entries()].sort((a, b) => b[1] - a[1]), statuses }
  }, [items, range])

  const loadSample = () => {
    setItems(sampleBookings().map((record) => ({ ...record, id: crypto.randomUUID() })))
    toast.success('Sample bookings added')
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="How your bookings and revenue are doing. Numbers come from the Bookings screen."
        actions={
          <div className="w-44">
            <Select aria-label="Time range" value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </Select>
          </div>
        }
      />
      <PreviewNotice />

      {items.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No bookings to report on yet"
          text="Add bookings first, and the charts and tables fill in. You can also try the screen with sample data."
          action={<Button variant="outline" onClick={loadSample}>Load sample data</Button>}
        />
      ) : (
        <div className="space-y-6">
          <StatTiles
            tiles={[
              { label: 'Revenue', value: formatPrice(data.revenue), hint: `${formatPrice(data.received)} received` },
              { label: 'Confirmed bookings', value: data.real.length, hint: `${data.people} travellers` },
              { label: 'Average booking', value: formatPrice(data.real.length ? Math.round(data.revenue / data.real.length) : 0) },
              { label: 'Enquiry to booking', value: `${data.conversion}%`, hint: 'Share of enquiries that were confirmed' },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 text-xl">Revenue by month</h2>
              <div className="h-64" role="img" aria-label="Bar chart of revenue per month">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))} />
                    <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Revenue']} contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-canvas-alt)' }} />
                    <Bar dataKey="revenue" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-xl">Bookings by month</h2>
              <div className="h-64" role="img" aria-label="Bar chart of confirmed bookings per month">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byMonth} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [value, 'Bookings']} contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-canvas-alt)' }} />
                    <Bar dataKey="bookings" fill="var(--color-navy)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="mb-3 text-xl">Top trips by revenue</h2>
              {data.topTrips.length === 0 ? (
                <p className="text-sm text-muted">No confirmed bookings in this range.</p>
              ) : (
                <Table>
                  <THead>
                    <tr>
                      <Th>Trip</Th>
                      <Th>Bookings</Th>
                      <Th>Travellers</Th>
                      <Th className="text-right">Revenue</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {data.topTrips.map(([trip, stats]) => (
                      <Tr key={trip}>
                        <Td className="font-medium text-ink">{trip}</Td>
                        <Td>{stats.count}</Td>
                        <Td>{stats.people}</Td>
                        <Td className="text-right font-medium">{formatPrice(stats.revenue)}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-5">
                <h2 className="mb-3 text-xl">Where bookings come from</h2>
                <ul className="space-y-3">
                  {data.sources.map(([source, count]) => (
                    <li key={source}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-ink">{sourceLabel(source)}</span>
                        <span className="text-muted">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-canvas-alt">
                        <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.round((count / Math.max(1, data.inRange.length)) * 100)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h2 className="mb-3 text-xl">By status</h2>
                <dl className="space-y-2 text-sm">
                  {data.statuses.map((row) => (
                    <div key={row.status} className="flex justify-between">
                      <dt className="text-muted">{statusLabel(row.status)}</dt>
                      <dd className="font-medium text-ink">{row.count}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
