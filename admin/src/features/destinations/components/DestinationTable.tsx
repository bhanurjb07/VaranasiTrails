import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table'
import { Archive, ArchiveRestore, Copy, Eye, EyeOff, ExternalLink, Star, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { Checkbox } from '@/components/ui/Checkbox'
import { Menu } from '@/components/ui/Menu'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import { env } from '@/lib/env'
import { formatPrice, timeAgo } from '@/lib/format'
import type { DestinationRow } from '@/types/api'
import { StatusBadge } from '../StatusBadge'
import type { RowAction } from '../useDestinations'

const column = createColumnHelper<DestinationRow>()

interface DestinationTableProps {
  rows: DestinationRow[]
  selection: RowSelectionState
  onSelectionChange: (selection: RowSelectionState) => void
  onAction: (row: DestinationRow, action: RowAction) => void
}

export const DestinationTable = ({ rows, selection, onSelectionChange, onAction }: DestinationTableProps) => {
  const columns = useMemo(
    () => [
      column.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            label="Select all on this page"
            checked={table.getIsAllRowsSelected()}
            ref={(node) => {
              if (node) node.indeterminate = table.getIsSomeRowsSelected()
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => <Checkbox label={`Select ${row.original.title}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
      }),
      column.accessor('title', {
        header: 'Trip',
        cell: ({ row }) => {
          const trip = row.original
          return (
            <div className="flex items-center gap-3">
              <span className="size-12 shrink-0 overflow-hidden rounded-control bg-cream-deep">
                {trip.coverImage ? (
                  <img src={trip.coverImage} alt="" loading="lazy" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-[0.65rem] text-muted">No photo</span>
                )}
              </span>
              <span className="min-w-0">
                <Link to={`/destinations/${trip.id}`} className="block max-w-72 truncate font-semibold text-indigo hover:underline">
                  {trip.title}
                </Link>
                <span className="block truncate text-xs text-muted">{trip.city} &middot; /{trip.slug}</span>
              </span>
            </div>
          )
        },
      }),
      column.accessor((row) => row.category.name, { id: 'category', header: 'Category', cell: (info) => <span className="text-muted">{info.getValue()}</span> }),
      column.accessor('priceInr', {
        header: 'Price',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            <span className="font-medium text-indigo">{formatPrice(row.original.priceInr)}</span>
            {row.original.originalPriceInr && <span className="ml-1.5 text-xs text-muted line-through">{formatPrice(row.original.originalPriceInr)}</span>}
          </span>
        ),
      }),
      column.accessor('status', { header: 'Status', cell: (info) => <StatusBadge status={info.getValue()} /> }),
      column.accessor('isFeatured', {
        header: 'Featured',
        cell: ({ row }) => (
          <button
            type="button"
            disabled={row.original.status === 'archived'}
            onClick={() => onAction(row.original, row.original.isFeatured ? 'unfeature' : 'feature')}
            aria-label={row.original.isFeatured ? `Remove ${row.original.title} from featured` : `Feature ${row.original.title}`}
            aria-pressed={row.original.isFeatured}
            className="rounded-control p-1.5 hover:bg-cream-deep disabled:opacity-40"
          >
            <Star className={cn('size-5', row.original.isFeatured ? 'fill-gold text-gold' : 'text-line')} aria-hidden="true" />
          </button>
        ),
      }),
      column.display({
        id: 'engagement',
        header: 'Enquiries / Saves',
        cell: ({ row }) => (
          <span className="text-muted tabular-nums">
            {row.original.enquiryCount} / {row.original.wishlistCount}
          </span>
        ),
      }),
      column.accessor('updatedAt', { header: 'Updated', cell: (info) => <span className="whitespace-nowrap text-muted">{timeAgo(info.getValue())}</span> }),
      column.display({
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const trip = row.original
          return (
            <Menu
              label={`Actions for ${trip.title}`}
              items={[
                { label: 'View on public site', icon: ExternalLink, onSelect: () => window.open(`${env.publicSiteUrl}/destinations/${trip.slug}`, '_blank', 'noopener'), hidden: trip.status !== 'published' },
                { label: 'Duplicate', icon: Copy, onSelect: () => onAction(trip, 'duplicate') },
                { label: 'Publish', icon: Eye, onSelect: () => onAction(trip, 'publish'), hidden: trip.status !== 'draft' },
                { label: 'Unpublish', icon: EyeOff, onSelect: () => onAction(trip, 'unpublish'), hidden: trip.status !== 'published' },
                { label: 'Archive', icon: Archive, onSelect: () => onAction(trip, 'archive'), hidden: trip.status === 'archived' },
                { label: 'Restore as draft', icon: ArchiveRestore, onSelect: () => onAction(trip, 'restore'), hidden: trip.status !== 'archived' },
                { label: 'Delete permanently', icon: Trash2, danger: true, onSelect: () => onAction(trip, 'delete'), hidden: trip.status !== 'archived' },
              ]}
            />
          )
        },
      }),
    ],
    [onAction],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection: selection },
    onRowSelectionChange: (updater) => onSelectionChange(typeof updater === 'function' ? updater(selection) : updater),
    enableRowSelection: true,
  })

  return (
    <Table>
      <THead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <Th key={header.id} className={header.id === 'select' ? 'w-10' : undefined}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </Th>
            ))}
          </tr>
        ))}
      </THead>
      <TBody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id} className={row.getIsSelected() ? 'bg-saffron-soft/40' : undefined}>
            {row.getVisibleCells().map((cell) => (
              <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
  )
}
