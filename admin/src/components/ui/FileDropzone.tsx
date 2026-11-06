import { UploadCloud } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'

import { cn } from '@/lib/cn'

interface FileDropzoneProps {
  onFiles: (files: File[]) => void
  accept: string
  multiple?: boolean
  disabled?: boolean
  title: string
  hint: string
}

/** Drag-and-drop area that is also a keyboard-accessible "choose files" button. */
export const FileDropzone = ({ onFiles, accept, multiple = false, disabled = false, title, hint }: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const hintId = useId()

  const take = (list: FileList | null) => {
    if (!list || list.length === 0) return
    onFiles(Array.from(list))
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setOver(false)
    if (!disabled) take(event.dataTransfer.files)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        'rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors',
        over ? 'border-saffron bg-saffron-soft/60' : 'border-line bg-cream/40',
        disabled && 'opacity-50',
      )}
    >
      <UploadCloud className="mx-auto size-8 text-saffron-dark" aria-hidden="true" />
      <button
        type="button"
        disabled={disabled}
        aria-describedby={hintId}
        onClick={() => inputRef.current?.click()}
        className="mt-2 font-semibold text-indigo hover:underline disabled:no-underline"
      >
        {title}
      </button>
      <p id={hintId} className="mt-1 text-xs text-muted">
        {hint}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          take(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
