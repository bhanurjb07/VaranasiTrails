import { Archive, ArchiveRestore, Copy, Eye, EyeOff, ExternalLink, Save } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Menu, type MenuItem } from '@/components/ui/Menu'
import { env } from '@/lib/env'
import type { AdminDestination } from '@/types/api'
import { StatusBadge } from '../StatusBadge'

interface EditorHeaderProps {
  destination: AdminDestination | undefined
  title: string
  dirty: boolean
  saving: boolean
  publishing: boolean
  ready: boolean
  onSave: () => void
  onPublish: () => void
  onUnpublish: () => void
  onDuplicate: () => void
  onArchive: () => void
  onRestore: () => void
}

/** Sticky bar: status, Save draft and Publish. */
export const EditorHeader = ({
  destination,
  title,
  dirty,
  saving,
  publishing,
  ready,
  onSave,
  onPublish,
  onUnpublish,
  onDuplicate,
  onArchive,
  onRestore,
}: EditorHeaderProps) => {
  const status = destination?.status
  const isNew = !destination
  const live = status === 'published'
  const archived = status === 'archived'

  const items: MenuItem[] = [
    { label: 'View on public site', icon: ExternalLink, onSelect: () => window.open(`${env.publicSiteUrl}/destinations/${destination?.slug}`, '_blank', 'noopener'), hidden: !live },
    { label: 'Duplicate', icon: Copy, onSelect: onDuplicate, hidden: isNew },
    { label: 'Archive', icon: Archive, onSelect: onArchive, hidden: isNew || archived },
  ]

  return (
    <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/destinations" className="text-sm font-semibold text-saffron-dark hover:underline">
            Destinations
          </Link>
          <span className="text-muted" aria-hidden="true">/</span>
          <h1 className="max-w-[18rem] truncate font-sans text-lg font-semibold sm:max-w-md">{title || (isNew ? 'New destination' : 'Untitled')}</h1>
          {status && <StatusBadge status={status} />}
          {dirty && (
            <span className="rounded-full bg-saffron-soft px-2.5 py-0.5 text-xs font-semibold text-saffron-dark" role="status">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {archived ? (
            <Button variant="primary" onClick={onRestore}>
              <ArchiveRestore className="size-4" aria-hidden="true" /> Restore as draft
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onSave} loading={saving && !publishing} disabled={(!dirty && !isNew) || publishing}>
                <Save className="size-4" aria-hidden="true" /> {live ? 'Save changes' : 'Save draft'}
              </Button>
              {live ? (
                <Button variant="outline" onClick={onUnpublish} disabled={dirty || saving}>
                  <EyeOff className="size-4" aria-hidden="true" /> Unpublish
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={onPublish}
                  loading={publishing}
                  disabled={!ready || saving}
                  title={ready ? undefined : 'Complete the checklist first'}
                >
                  <Eye className="size-4" aria-hidden="true" /> Publish
                </Button>
              )}
            </>
          )}
          {!isNew && <Menu label="More actions" items={items} />}
        </div>
      </div>
    </div>
  )
}
