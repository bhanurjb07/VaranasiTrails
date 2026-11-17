import { TicketPercent } from 'lucide-react'

import { CrudPage, type ColumnDef, type FieldDef } from '@/components/crud/CrudPage'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { formatDate, formatPrice } from '@/lib/format'
import type { HasId } from '@/lib/localStore'

interface Coupon extends HasId {
  code: string
  description: string
  kind: 'percent' | 'flat'
  value: number | null
  minOrder: number | null
  maxUses: number | null
  used: number | null
  validFrom: string
  validTo: string
  active: boolean
}

const NO_COUPONS: readonly Coupon[] = []

const status = (coupon: Coupon) => {
  const today = new Date().toISOString().slice(0, 10)
  if (!coupon.active) return <Badge variant="draft">Off</Badge>
  if (coupon.validFrom && coupon.validFrom > today) return <Badge variant="info">Scheduled</Badge>
  if (coupon.validTo && coupon.validTo < today) return <Badge variant="archived">Expired</Badge>
  if (coupon.maxUses !== null && (coupon.used ?? 0) >= coupon.maxUses) return <Badge variant="archived">Used up</Badge>
  return <Badge variant="published">Live</Badge>
}

const fields: readonly FieldDef<Coupon>[] = [
  { name: 'code', label: 'Code', required: true, placeholder: 'WEEKEND10', hint: 'Letters and numbers. Shown in capitals.' },
  { name: 'description', label: 'What it is for', placeholder: '10% off weekend boat rides' },
  { name: 'kind', label: 'Type', type: 'select', options: [{ value: 'percent', label: 'Percentage off' }, { value: 'flat', label: 'Flat amount off (INR)' }] },
  { name: 'value', label: 'Amount', type: 'number', required: true, hint: 'A percentage, or rupees for a flat discount.' },
  { name: 'minOrder', label: 'Minimum order (INR)', type: 'number', hint: 'Leave empty for no minimum.' },
  { name: 'maxUses', label: 'Total uses allowed', type: 'number', hint: 'Leave empty for unlimited.' },
  { name: 'used', label: 'Times used so far', type: 'number' },
  { name: 'validFrom', label: 'Valid from', type: 'date' },
  { name: 'validTo', label: 'Valid until', type: 'date' },
  { name: 'active', label: 'Active', type: 'switch', hint: 'Switch off to pause the code without deleting it.' },
]

const columns: readonly ColumnDef<Coupon>[] = [
  {
    header: 'Code',
    cell: (row) => (
      <>
        <span className="block font-mono text-sm font-bold tracking-wide text-ink">{row.code.toUpperCase()}</span>
        <span className="block text-xs text-muted">{row.description || 'No description'}</span>
      </>
    ),
  },
  { header: 'Discount', className: 'whitespace-nowrap', cell: (row) => (row.kind === 'percent' ? `${row.value ?? 0}% off` : `${formatPrice(row.value ?? 0)} off`) },
  { header: 'Minimum', className: 'whitespace-nowrap', cell: (row) => <span className="text-muted">{row.minOrder ? formatPrice(row.minOrder) : 'None'}</span> },
  { header: 'Used', className: 'whitespace-nowrap', cell: (row) => `${row.used ?? 0}${row.maxUses !== null ? ` of ${row.maxUses}` : ''}` },
  { header: 'Valid', className: 'whitespace-nowrap', cell: (row) => <span className="text-muted">{row.validFrom || row.validTo ? `${row.validFrom ? formatDate(row.validFrom) : 'Now'} to ${row.validTo ? formatDate(row.validTo) : 'no end'}` : 'Always'}</span> },
  { header: 'Status', cell: status },
  { header: 'On', cell: (row, ctl) => <Switch label={`Turn ${row.code} ${row.active ? 'off' : 'on'}`} checked={row.active} onChange={(active) => ctl.update({ active })} /> },
]

export const CouponsPage = () => (
  <CrudPage<Coupon>
    storeKey="coupons"
    seed={NO_COUPONS}
    title="Coupons"
    description="Discount codes you can give to travellers. Share the code on WhatsApp and apply it when you confirm the price."
    noun="coupon"
    icon={TicketPercent}
    emptyText="Create a code such as WEEKEND10 and set how much it takes off, when it is valid and how many times it can be used."
    blank={{ code: '', description: '', kind: 'percent', value: 10, minOrder: null, maxUses: null, used: 0, validFrom: '', validTo: '', active: true }}
    fields={fields}
    columns={columns}
    searchText={(row) => `${row.code} ${row.description}`}
    exportName="coupons"
    validate={(values) => {
      if (values.kind === 'percent' && (values.value ?? 0) > 100) return 'A percentage cannot be more than 100.'
      if (values.validFrom && values.validTo && values.validTo < values.validFrom) return 'The end date must be after the start date.'
      return null
    }}
  />
)
