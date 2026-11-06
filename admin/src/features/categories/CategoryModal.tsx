import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { destinationsApi } from '@/features/destinations/api'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { compressImage } from '@/lib/imageCompress'
import { uploadToUrl } from '@/lib/upload'
import type { AdminCategory } from '@/types/api'
import { categoriesApi } from './api'
import { categoriesKey } from './useCategories'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Keep the name under 60 characters'),
  description: z.string().trim().max(300, 'Keep the description under 300 characters'),
  isActive: z.boolean(),
})

type Values = z.input<typeof schema>

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  /** The category being edited, or undefined to create one. */
  category?: AdminCategory
}

export const CategoryModal = ({ open, onClose, category }: CategoryModalProps) => {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    // The page mounts this dialog fresh for each open, so these are always current.
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '', isActive: category?.isActive ?? true },
  })

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const shownImage = removeImage ? null : (preview ?? category?.imageUrl ?? null)

  const save = useMutation({
    mutationFn: async (values: Values) => {
      const base = { name: values.name.trim(), description: values.description.trim() || null, isActive: values.isActive }

      // Create first (an image upload needs the category to exist), then upload, then attach.
      let saved = category ?? (await categoriesApi.create(base)).category
      let imageKey: string | null | undefined = removeImage ? null : undefined

      if (file) {
        const compressed = await compressImage(file)
        const presigned = await destinationsApi.presignCategory(saved.id, {
          filename: file.name,
          contentType: compressed.contentType,
          sizeBytes: compressed.blob.size,
        })
        await uploadToUrl(presigned.uploadUrl, compressed.blob, compressed.contentType)
        imageKey = presigned.key
      }

      if (category || imageKey !== undefined) {
        saved = (await categoriesApi.update(saved.id, { ...(category ? base : {}), ...(imageKey !== undefined ? { imageKey } : {}) })).category
      }
      return saved
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKey })
      toast.success(category ? 'Category saved' : 'Category created')
      onClose()
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError, ['name', 'description'])) toast.error(errorMessage(error))
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Edit category' : 'New category'} className="max-w-xl">
      <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-5">
        <Field label="Name" error={errors.name?.message}>
          {({ id, describedBy, invalid }) => <Input id={id} invalid={invalid} aria-describedby={describedBy} placeholder="Honeymoon" {...register('name')} />}
        </Field>

        <Field label="Description" error={errors.description?.message} hint="Optional. One sentence about this kind of trip.">
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={3} invalid={invalid} aria-describedby={describedBy} {...register('description')} />}
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-indigo">Image</span>
          <div className="flex items-start gap-4">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-card bg-cream-deep">
              {shownImage ? <img src={shownImage} alt="" className="size-full object-cover" /> : <ImageOff className="size-6 text-muted" aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <FileDropzone
                accept="image/*"
                onFiles={(files) => {
                  setFile(files[0] ?? null)
                  setRemoveImage(false)
                }}
                title={shownImage ? 'Replace the image' : 'Choose an image'}
                hint="Resized to WebP in your browser."
              />
              {shownImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setRemoveImage(true)
                  }}
                >
                  Remove image
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-control border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-indigo">Active</p>
            <p className="text-xs text-muted">Inactive categories are hidden from the public filters. Their trips stay visible.</p>
          </div>
          <Controller control={control} name="isActive" render={({ field }) => <Switch label="Active" checked={field.value} onChange={field.onChange} />} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {category ? 'Save changes' : 'Create category'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
