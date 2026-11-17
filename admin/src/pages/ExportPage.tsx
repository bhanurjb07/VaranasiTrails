import { DatabaseBackup, Download, FileJson, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { toast } from '@/components/ui/toast'
import { downloadFile, toCsv } from '@/lib/csv'
import { readLocal, storeKeys, useLocalValue, writeLocal } from '@/lib/localStore'

type Row = Record<string, unknown>

const NONE: readonly Row[] = []

const lists = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'customers', label: 'Customers' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'availability', label: 'Availability dates' },
  { key: 'media', label: 'Media library (links only)' },
  { key: 'offers', label: 'Offers' },
  { key: 'why-cards', label: 'Why VaranasiTrails cards' },
  { key: 'faq', label: 'FAQ' },
  { key: 'founders', label: 'Founders' },
] as const

const singles = [
  { key: 'settings', label: 'Business details' },
  { key: 'about', label: 'About page text' },
  { key: 'legal', label: 'Legal pages' },
] as const

const flat = (value: unknown) => (typeof value === 'object' && value !== null ? JSON.stringify(value) : value)

const csvFor = (rows: readonly Row[], key: string) => {
  // Photos stored in the browser are very long; leave them out of the spreadsheet.
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((header) => header !== 'id' && !(key === 'media' && header === 'url'))
  return toCsv(headers, rows.map((row) => headers.map((header) => flat(row[header]))))
}

const stamp = () => new Date().toISOString().slice(0, 10)

const ListRow = ({ storeKey, label }: { storeKey: string; label: string }) => {
  const [rows] = useLocalValue<readonly Row[]>(storeKey, NONE)
  const count = Array.isArray(rows) ? rows.length : 0
  return (
    <Tr>
      <Td className="font-medium text-ink">{label}</Td>
      <Td>{count}</Td>
      <Td>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={count === 0}
            onClick={() => {
              downloadFile(csvFor(rows, storeKey), `${storeKey}-${stamp()}.csv`)
              toast.success(`${label} exported`)
            }}
          >
            <Download className="size-4" aria-hidden="true" /> Download CSV
          </Button>
        </div>
      </Td>
    </Tr>
  )
}

const buildBackup = () => {
  const data: Record<string, unknown> = {}
  for (const key of storeKeys) {
    const value = readLocal<unknown>(key, null)
    if (value !== null) data[key] = value
  }
  return { app: 'varanasitrails-admin', version: 1, exportedAt: new Date().toISOString(), data }
}

export const ExportPage = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Record<string, unknown> | null>(null)

  const download = () => {
    downloadFile(JSON.stringify(buildBackup(), null, 2), `varanasitrails-backup-${stamp()}.json`, 'application/json')
    toast.success('Backup downloaded')
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as { app?: string; data?: Record<string, unknown> }
      if (parsed.app !== 'varanasitrails-admin' || typeof parsed.data !== 'object' || parsed.data === null) throw new Error('not a backup')
      const known = Object.fromEntries(Object.entries(parsed.data).filter(([key]) => (storeKeys as readonly string[]).includes(key)))
      if (Object.keys(known).length === 0) throw new Error('empty')
      setPending(known)
    } catch {
      toast.error('That file is not a VaranasiTrails backup')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <PageHeader title="Export and backup" description="Download your records as spreadsheets, or save and restore everything in one file." />
      <PreviewNotice />

      <section aria-labelledby="csv-title" className="mb-8">
        <h2 id="csv-title" className="mb-3 text-xl">
          Spreadsheets (CSV)
        </h2>
        <Table>
          <THead>
            <tr>
              <Th>Records</Th>
              <Th>Rows</Th>
              <Th className="text-right">Download</Th>
            </tr>
          </THead>
          <TBody>
            {lists.map((list) => (
              <ListRow key={list.key} storeKey={list.key} label={list.label} />
            ))}
          </TBody>
        </Table>
        <p className="mt-2 text-sm text-muted">Business details, the About text and the legal pages are single documents. They are included in the full backup below.</p>
      </section>

      <section aria-labelledby="backup-title" className="rounded-lg border border-line bg-paper p-5 sm:p-6">
        <h2 id="backup-title" className="flex items-center gap-2 text-xl">
          <DatabaseBackup className="size-5 text-brand" aria-hidden="true" /> Full backup
        </h2>
        <p className="mt-1 text-sm text-muted">
          One file with everything entered on these screens: {lists.map((list) => list.label.toLowerCase()).join(', ')} and {singles.map((single) => single.label.toLowerCase()).join(', ')}. Use it to move to another computer, or to keep a copy.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={download}>
            <FileJson className="size-4" aria-hidden="true" /> Download backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" /> Restore from a backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose a backup file" onChange={(event) => void onFile(event.target.files?.[0])} />
        </div>
      </section>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) for (const [key, value] of Object.entries(pending)) writeLocal(key, value)
          setPending(null)
          toast.success('Backup restored')
        }}
        danger
        title="Restore this backup?"
        confirmLabel="Restore"
      >
        This replaces what is on these screens now with the contents of the file: {pending ? Object.keys(pending).length : 0} sections. This cannot be undone.
      </ConfirmDialog>
    </>
  )
}
