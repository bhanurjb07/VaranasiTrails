import { Copy, ImagePlus, Pencil, Search, Trash2 } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PreviewNotice } from '@/components/ui/PreviewNotice'
import { toast } from '@/components/ui/toast'
import { compressImage } from '@/lib/imageCompress'
import { formatBytes } from '@/lib/format'
import { newId, useLocalList, type HasId } from '@/lib/localStore'

interface MediaItem extends HasId {
  title: string
  url: string
  alt: string
  tags: string
  bytes: number
  addedOn: string
}

const NO_MEDIA: readonly MediaItem[] = []

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the image'))
    reader.readAsDataURL(blob)
  })

export const MediaPage = () => {
  const media = useLocalList<MediaItem>('media', NO_MEDIA)
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<MediaItem | 'new' | null>(null)
  const [deleting, setDeleting] = useState<MediaItem | null>(null)

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase()
    return media.items.filter((item) => !text || `${item.title} ${item.alt} ${item.tags}`.toLowerCase().includes(text))
  }, [media.items, search])

  const used = media.items.reduce((sum, item) => sum + item.bytes, 0)

  const copy = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  return (
    <>
      <PageHeader
        title="Media library"
        description="Photos you use around the site. Add one here, then copy its link into an offer or a trip."
        actions={
          <Button onClick={() => setEditing('new')}>
            <ImagePlus className="size-4" aria-hidden="true" /> Add photo
          </Button>
        }
      />
      <PreviewNotice />

      {media.items.length === 0 ? (
        <EmptyState icon={ImagePlus} title="No photos yet" text="Upload a photo or add a link to one that is already online." action={<Button onClick={() => setEditing('new')}>Add photo</Button>} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-60 flex-1 sm:max-w-sm">
              <label htmlFor={searchId} className="sr-only">
                Search photos
              </label>
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <Input id={searchId} type="search" placeholder="Search by title or tag" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <p className="text-sm text-muted">
              {media.items.length} photo{media.items.length === 1 ? '' : 's'}, about {formatBytes(used)} stored in this browser
            </p>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon={Search} title="No photos match" text="Try a different word." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => (
                <li key={item.id} className="lift overflow-hidden rounded-lg border border-line bg-paper">
                  <div className="aspect-[4/3] bg-canvas-alt">
                    <img src={item.url} alt={item.alt || item.title} loading="lazy" className="size-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="truncate font-semibold text-ink">{item.title}</p>
                    <p className="truncate text-xs text-muted">{item.tags || 'No tags'}{item.bytes > 0 ? ` · ${formatBytes(item.bytes)}` : ''}</p>
                    <div className="mt-2 flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => void copy(item)}>
                        <Copy className="size-4" aria-hidden="true" /> Copy link
                      </Button>
                      <Button variant="ghost" size="sm" aria-label={`Edit ${item.title}`} onClick={() => setEditing(item)}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" aria-label={`Delete ${item.title}`} onClick={() => setDeleting(item)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {editing !== null && (
        <PhotoModal
          item={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            if (editing === 'new') media.setItems((current) => [{ id: newId(), addedOn: new Date().toISOString().slice(0, 10), ...values }, ...current])
            else media.update(editing.id, values)
            toast.success(editing === 'new' ? 'Photo added' : 'Changes saved')
            setEditing(null)
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) media.remove(deleting.id)
          setDeleting(null)
          toast.success('Photo deleted')
        }}
        danger
        title="Delete this photo?"
        confirmLabel="Delete photo"
      >
        <strong>{deleting?.title}</strong> will be removed from the library. Places that use its link may show a broken picture.
      </ConfirmDialog>
    </>
  )
}

const PhotoModal = ({
  item,
  onClose,
  onSave,
}: {
  item?: MediaItem
  onClose: () => void
  onSave: (values: { title: string; url: string; alt: string; tags: string; bytes: number }) => void
}) => {
  const [title, setTitle] = useState(item?.title ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [alt, setAlt] = useState(item?.alt ?? '')
  const [tags, setTags] = useState(item?.tags ?? '')
  const [bytes, setBytes] = useState(item?.bytes ?? 0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFiles = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      setUrl(await blobToDataUrl(compressed.blob))
      setBytes(compressed.blob.size)
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not use that image')
    } finally {
      setBusy(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return setError('Enter a title')
    if (!url.trim()) return setError('Upload a photo or paste a link')
    onSave({ title: title.trim(), url: url.trim(), alt: alt.trim(), tags: tags.trim(), bytes })
  }

  return (
    <Modal open onClose={onClose} title={item ? 'Edit photo' : 'Add photo'} className="max-w-xl">
      <form noValidate onSubmit={submit} className="space-y-4">
        {!item && <FileDropzone accept="image/*" disabled={busy} onFiles={(files) => void onFiles(files)} title={busy ? 'Preparing the photo...' : 'Choose a photo'} hint="It is resized and kept small, then saved in this browser." />}
        {url && <img src={url} alt="" className="mx-auto max-h-48 rounded-lg border border-line object-contain" />}
        <Field label="Or paste a link to a photo">{({ id }) => <Input id={id} type="url" placeholder="https://" value={url.startsWith('data:') ? '' : url} onChange={(event) => { setUrl(event.target.value); setBytes(0) }} />}</Field>
        <Field label="Title *">{({ id }) => <Input id={id} value={title} onChange={(event) => setTitle(event.target.value)} />}</Field>
        <Field label="Describe the photo" hint="Read aloud for people who cannot see it.">{({ id }) => <Input id={id} value={alt} onChange={(event) => setAlt(event.target.value)} />}</Field>
        <Field label="Tags" hint="Separate with commas, for example ghat, sunrise.">{({ id }) => <Input id={id} value={tags} onChange={(event) => setTags(event.target.value)} />}</Field>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {item ? 'Save changes' : 'Add photo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
