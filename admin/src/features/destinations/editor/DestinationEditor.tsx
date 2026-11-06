import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Archive } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useBlocker, useNavigate } from 'react-router'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/toast'
import { useCategories } from '@/features/categories/useCategories'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import type { AdminDestination, AdminImage } from '@/types/api'
import { destinationsApi } from '../api'
import { destinationKeys, useDestinationAction, useRefreshDestinations } from '../useDestinations'
import { BasicsSection } from './BasicsSection'
import { EditorHeader } from './EditorHeader'
import { editorSchema, emptyForm, serverFields, toFormValues, toPayload, type EditorValues } from './formSchema'
import { HighlightsSection, InclusionsSection } from './ListSections'
import { ItinerarySection } from './ItinerarySection'
import { MediaSection } from './MediaSection'
import { PreviewTab } from './PreviewTab'
import { PricingSection } from './PricingSection'
import { computeReadiness, isReady } from './readiness'
import { ReadinessChecklist } from './ReadinessChecklist'
import { SeoSection } from './SeoSection'

type View = 'edit' | 'preview'

const NO_IMAGES: AdminImage[] = []

interface DestinationEditorProps {
  /** Undefined when creating a new destination. */
  destination?: AdminDestination
}

export const DestinationEditor = ({ destination }: DestinationEditorProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const refresh = useRefreshDestinations()
  const categories = useCategories()
  const [view, setView] = useState<View>('edit')
  const [confirmArchive, setConfirmArchive] = useState(false)
  // Set right before we navigate away ourselves (after creating a draft), so the
  // unsaved-changes guard does not block our own redirect.
  const allowLeave = useRef(false)

  const form = useForm<EditorValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: destination ? toFormValues(destination) : emptyForm(),
    mode: 'onTouched',
  })
  const { control, handleSubmit, reset, setError, formState } = form
  const dirty = formState.isDirty
  const archived = destination?.status === 'archived'

  // --- Saving ----------------------------------------------------------------

  const save = useMutation({
    mutationFn: async (values: EditorValues) => {
      const payload = toPayload(editorSchema.parse(values))
      return destination
        ? (await destinationsApi.update(destination.id, payload)).destination
        : (await destinationsApi.create(payload)).destination
    },
    onSuccess: async (saved) => {
      queryClient.setQueryData(destinationKeys.detail(saved.id), saved)
      reset(toFormValues(saved))
      await refresh()
      if (!destination) {
        toast.success('Draft saved. You can add photos now.')
        allowLeave.current = true
        navigate(`/destinations/${saved.id}`, { replace: true })
      } else {
        toast.success('Changes saved')
      }
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'SLUG_TAKEN') {
        setError('slug', { message: error.message })
      } else if (applyServerErrors(error, setError, serverFields)) {
        toast.error('Please fix the highlighted fields.')
      } else if (isApiError(error) && error.code === 'NOT_READY') {
        toast.error(`This live trip would no longer be publishable: ${error.errors?.map((issue) => issue.message).slice(0, 2).join('; ')}`)
      } else {
        toast.error(errorMessage(error))
      }
    },
  })

  const action = useDestinationAction((done, result) => {
    if (done === 'duplicate' && result) navigate(`/destinations/${result.id}`)
    else if (result) queryClient.setQueryData(destinationKeys.detail(result.id), result)
  })

  const submit = () => handleSubmit((values) => save.mutate(values), () => toast.error('Please fix the highlighted fields.'))()

  /** Save any edits first, then publish, so what is live matches what is on screen. */
  const publish = handleSubmit(
    async (values) => {
      try {
        const saved = dirty || !destination ? await save.mutateAsync(values) : destination
        await action.mutateAsync({ id: saved.id, action: 'publish' })
      } catch {
        // Both mutations already report their own errors.
      }
    },
    () => toast.error('Please fix the highlighted fields.'),
  )

  // --- Leaving with unsaved changes -------------------------------------------

  const blocker = useBlocker(({ currentLocation, nextLocation }) => !allowLeave.current && dirty && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // --- Derived ---------------------------------------------------------------

  const watched = useWatch({ control })
  const images = destination?.images ?? NO_IMAGES
  const readiness = useMemo(
    () => computeReadiness({ values: { ...emptyForm(), ...(watched as EditorValues) }, imageCount: images.length, hasCover: images.some((image) => image.isCover) }),
    [watched, images],
  )
  const categoryId = useWatch({ control, name: 'categoryId' })
  const categoryName = categories.data?.find((category) => category.id === categoryId)?.name ?? ''
  const title = useWatch({ control, name: 'title' })

  return (
    <>
      <EditorHeader
        destination={destination}
        title={title}
        dirty={dirty}
        saving={save.isPending}
        publishing={action.isPending && action.variables?.action === 'publish'}
        ready={isReady(readiness)}
        onSave={() => void submit()}
        onPublish={() => void publish()}
        onUnpublish={() => destination && action.mutate({ id: destination.id, action: 'unpublish' })}
        onDuplicate={() => destination && action.mutate({ id: destination.id, action: 'duplicate' })}
        onArchive={() => setConfirmArchive(true)}
        onRestore={() => destination && action.mutate({ id: destination.id, action: 'restore' })}
      />

      {archived && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-control bg-status-archived-bg px-4 py-3 text-sm text-status-archived">
          <Archive className="size-4" aria-hidden="true" /> This trip is archived and hidden from the public site. Restore it to edit.
        </p>
      )}

      <Tabs label="Editor view" value={view} onChange={setView} options={[{ value: 'edit', label: 'Edit' }, { value: 'preview', label: 'Preview' }]} className="mb-6" />

      {view === 'preview' ? (
        <PreviewTab control={control} destination={destination} categoryName={categoryName} />
      ) : (
        <form noValidate onSubmit={(event) => { event.preventDefault(); void submit() }} className="grid items-start gap-6 xl:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-6">
            <BasicsSection form={form} isNew={!destination} disabled={archived} />
            <PricingSection form={form} disabled={archived} />
            <MediaSection destination={destination} disabled={archived} />
            <HighlightsSection form={form} disabled={archived} />
            <ItinerarySection form={form} disabled={archived} />
            <InclusionsSection form={form} disabled={archived} />
            <SeoSection form={form} disabled={archived} />
          </div>
          <aside className="xl:sticky xl:top-40" aria-label="Publish checklist">
            <ReadinessChecklist items={readiness} />
          </aside>
        </form>
      )}

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={() => {
          if (destination) action.mutate({ id: destination.id, action: 'archive' })
          setConfirmArchive(false)
        }}
        danger
        title="Archive this trip?"
        confirmLabel="Archive"
      >
        It will be hidden from the public site. You can restore it later.
      </ConfirmDialog>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
        danger
        title="Leave without saving?"
        confirmLabel="Discard changes"
      >
        You have unsaved changes. If you leave now they will be lost.
      </ConfirmDialog>
    </>
  )
}
