import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '@/components/ui/Card'

interface EnquiriesChartProps {
  data: { date: string; count: number }[]
}

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Enquiries received per day for the last 30 days. */
export const EnquiriesChart = ({ data }: EnquiriesChartProps) => {
  const total = data.reduce((sum, point) => sum + point.count, 0)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-xl">Enquiries, last 30 days</h2>
        <p className="text-sm text-muted">{total} total</p>
      </div>

      <div className="h-64" role="img" aria-label={`Area chart of enquiries per day, ${total} in the last 30 days`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="enquiryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8751A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#E8751A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E4DAC6" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 12, fill: '#6B6459' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6459' }} tickLine={false} axisLine={false} />
            <Tooltip
              labelFormatter={(label) => shortDate(String(label))}
              formatter={(value) => [value, 'Enquiries']}
              contentStyle={{ borderRadius: 10, border: '1px solid #E4DAC6', fontSize: 13 }}
            />
            <Area type="monotone" dataKey="count" stroke="#E8751A" strokeWidth={2.5} fill="url(#enquiryFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
