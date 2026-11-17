import { Download, Pencil, Plus, Search, Trash2, type LucideIcon } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { NumberInput } from '@/components/ui/NumberInput'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { downloadFile, toCsv } from '@/lib/csv'
import { useLocalList, type HasId } from '@/lib/localStore'

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'switch' | 'url' | 'email' | 'tel'

export interface FieldDef<T> {
  name: keyof T & string
  label: string
  type?: FieldType
  options?: readonly { value: string; label: string }[]
  required?: boolean
  hint?: string
  placeholder?: string
  /** Spans both columns of the form. */
  full?: boolean
}

export interface ColumnDef<T> {
  header: string
  cell: (row: T, ctl: { update: (patch: Partial<T>) => void }) => ReactNode
  className?: string
}

export interface TabDef<T> {
  value: string
  label: string
  test: (row: T) => boolean
}

interface CrudPageProps<T extends HasId> {
  storeKey: string
  seed: readonly T[]
  /** Offered from the empty state, so the screen can be tried without typing records. */
  sample?: readonly Omit<T, 'id'>[]
  title: string
  description?: string
  /** Singular name used in buttons and messages, for example "booking". */
  noun: string
  icon: LucideIcon
  emptyText: string
  blank: Omit<T, 'id'>
  fields: readonly FieldDef<T>[]
  columns: readonly ColumnDef<T>[]
  searchText: (row: T) => string
  tabs?: readonly TabDef<T>[]
  summary?: (rows: readonly T[]) => ReactNode
  exportName?: string
  /** Extra checks on top of the required fields. Return a message to block saving. */
  validate?: (values: Omit<T, 'id'>) => string | null
  /** Hide the page title and the browser-only notice (used inside another page). */
  embedded?: boolean
  actions?: ReactNode
}

type Values = Record<string, unknown>

const isEmpty = (value: unknown) => value === '' || value === null || value === undefined

/**
 * A complete list screen for browser-stored records: search, tabs, table, add/edit form
 * generated from `fields`, delete confirmation and CSV export. Used by most of the new screens.
 */
export const CrudPage = <T extends HasId>({
  storeKey,
  seed,
  sample,
  title,
  description,
  noun,
  icon,
  emptyText,
  blank,
  fields,
  columns,
  searchText,
  tabs,
  summary,
  exportName,
  validate,
  embedded = false,
  actions,
}: CrudPageProps<T>) => {
  const { items, setItems, add, update, remove } = useLocalList<T>(storeKey, seed)
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase()
    const active = tabs?.find((candidate) => candidate.value === tab)
    return items.filter((row) => (!active || active.test(row)) && (!text || searchText(row).toLowerCase().includes(text)))
  }, [items, search, tab, tabs, searchText])

  const exportCsv = () => {
    const headers = fields.map((field) => field.label)
    const rows = visible.map((row) => fields.map((field) => (row as Values)[field.name]))
    downloadFile(toCsv(headers, rows), `${exportName ?? storeKey}-${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success(`Exported ${rows.length} ${noun}${rows.length === 1 ? '' : 's'}`)
  }

  const loadSample = () => {
    if (!sample) return
    setItems(sample.map((record) => ({ ...record, id: crypto.randomUUID() }) as T))
    toast.success('Sample records added')
  }

  return (
    <>
      {!embedded && (
        <>
          <PageHeader
            title={title}
            description={description}
            actions={
              <>
                {actions}
                <Button variant="outline" onClick={exportCsv} disabled={visible.length === 0}>
                  <Download className="size-4" aria-hidden="true" /> Export CSV
                </Button>
                <Button onClick={() => setEditing('new')}>
                  <Plus className="size-4" aria-hidden="true" /> New {noun}
                </Button>
              </>
            }
          />
          <PreviewNotice />
        </>
      )}

      {embedded && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{description}</p>
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" /> New {noun}
          </Button>
        </div>
      )}

      {summary && items.length > 0 && <div className="mb-5">{summary(items)}</div>}

      {items.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {tabs && (
            <Tabs
              label={`Filter ${noun}s`}
              value={tab}
              onChange={setTab}
              options={[
                { value: 'all', label: 'All', count: items.length },
                ...tabs.map((candidate) => ({ value: candidate.value, label: candidate.label, count: items.filter(candidate.test).length })),
              ]}
            />
          )}
          <div className="relative min-w-60 flex-1 sm:max-w-sm">
            <label htmlFor={searchId} className="sr-only">
              Search {noun}s
            </label>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input id={searchId} type="search" placeholder={`Search ${noun}s`} value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={icon}
          title={`No ${noun}s yet`}
          text={emptyText}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => setEditing('new')}>New {noun}</Button>
              {sample && (
                <Button variant="outline" onClick={loadSample}>
                  Load sample data
                </Button>
              )}
            </div>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={icon} title={`No ${noun}s match`} text="Try a different search or filter." />
      ) : (
        <Table>
          <THead>
            <tr>
              {columns.map((column) => (
                <Th key={column.header} className={column.className}>
                  {column.header}
                </Th>
              ))}
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {visible.map((row) => (
              <Tr key={row.id}>
                {columns.map((column) => (
                  <Td key={column.header} className={column.className}>
                    {column.cell(row, { update: (patch) => update(row.id, patch) })}
                  </Td>
                ))}
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" aria-label={`Edit ${noun}`} onClick={() => setEditing(row)}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={`Delete ${noun}`} onClick={() => setDeleting(row)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      {items.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          {visible.length} of {items.length} {noun}
          {items.length === 1 ? '' : 's'}
        </p>
      )}

      {editing !== null && (
        <RecordModal<T>
          noun={noun}
          fields={fields}
          initial={editing === 'new' ? (blank as Values) : (editing as unknown as Values)}
          isNew={editing === 'new'}
          validate={validate}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            if (editing === 'new') {
              add(values as Omit<T, 'id'>)
              toast.success(`${noun[0]?.toUpperCase()}${noun.slice(1)} added`)
            } else {
              update(editing.id, values as Partial<T>)
              toast.success('Changes saved')
            }
            setEditing(null)
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove(deleting.id)
          setDeleting(null)
          toast.success(`${noun[0]?.toUpperCase()}${noun.slice(1)} deleted`)
        }}
        danger
        title={`Delete this ${noun}?`}
        confirmLabel={`Delete ${noun}`}
      >
        This cannot be undone.
      </ConfirmDialog>
    </>
  )
}

interface RecordModalProps<T> {
  noun: string
  fields: readonly FieldDef<T>[]
  initial: Values
  isNew: boolean
  validate?: (values: Omit<T & HasId, 'id'>) => string | null
  onClose: () => void
  onSave: (values: Values) => void
}

const RecordModal = <T,>({ noun, fields, initial, isNew, validate, onClose, onSave }: RecordModalProps<T>) => {
  const [values, setValues] = useState<Values>(() => {
    const { id: _id, ...rest } = initial
    return rest
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const set = (name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!(name in current)) return current
      const { [name]: _removed, ...rest } = current
      return rest
    })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found: Record<string, string> = {}
    for (const field of fields) {
      if (field.required && isEmpty(values[field.name])) found[field.name] = `Enter ${field.label.toLowerCase()}`
    }
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setFormError(null)
      return
    }
    const message = validate?.(values as Omit<T & HasId, 'id'>) ?? null
    setFormError(message)
    if (!message) onSave(values)
  }

  return (
    <Modal open onClose={onClose} title={isNew ? `New ${noun}` : `Edit ${noun}`} className="max-w-2xl">
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const value = values[field.name]
            const type = field.type ?? 'text'
            if (type === 'switch') {
              return (
                <div key={field.name} className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 sm:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{field.label}</p>
                    {field.hint && <p className="text-xs text-muted">{field.hint}</p>}
                  </div>
                  <Switch label={field.label} checked={Boolean(value)} onChange={(checked) => set(field.name, checked)} />
                </div>
              )
            }
            return (
              <Field
                key={field.name}
                label={field.required ? `${field.label} *` : field.label}
                hint={field.hint}
                error={errors[field.name]}
                className={field.full || type === 'textarea' ? 'sm:col-span-2' : undefined}
              >
                {({ id, describedBy, invalid }) =>
                  type === 'textarea' ? (
                    <Textarea id={id} aria-describedby={describedBy} invalid={invalid} placeholder={field.placeholder} value={String(value ?? '')} onChange={(event) => set(field.name, event.target.value)} />
                  ) : type === 'number' ? (
                    <NumberInput id={id} aria-describedby={describedBy} invalid={invalid} placeholder={field.placeholder} value={typeof value === 'number' ? value : null} onChange={(next) => set(field.name, next)} />
                  ) : type === 'select' ? (
                    <Select id={id} aria-describedby={describedBy} invalid={invalid} value={String(value ?? '')} onChange={(event) => set(field.name, event.target.value)}>
                      {(field.options ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input id={id} type={type} aria-describedby={describedBy} invalid={invalid} placeholder={field.placeholder} value={String(value ?? '')} onChange={(event) => set(field.name, event.target.value)} />
                  )
                }
              </Field>
            )
          })}
        </div>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isNew ? `Add ${noun}` : 'Save changes'}</Button>
        </div>
      </form>
    </Modal>
  )
}
