import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

import { cn } from '@/lib/cn'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  /** Called once all digits are filled. */
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  label?: string
}

const digitsOnly = (text: string) => text.replace(/\D/g, '')

/** N single-digit boxes with auto-advance, backspace, arrow keys and paste. */
export const OtpInput = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  autoFocus = false,
  label = 'One-time code',
}: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const focusAt = (index: number) => refs.current[Math.min(Math.max(index, 0), length - 1)]?.focus()

  const commit = (next: string) => {
    const clean = digitsOnly(next).slice(0, length)
    onChange(clean)
    if (clean.length === length) onComplete?.(clean)
  }

  const handleInput = (index: number, raw: string) => {
    const digits = digitsOnly(raw)
    if (!digits) return

    // Typing (or autofill) of several digits fills forward from this box.
    const next = (value.slice(0, index) + digits + value.slice(index + digits.length)).slice(0, length)
    commit(next)
    focusAt(index + digits.length)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1))
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index))
        focusAt(index - 1)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = digitsOnly(event.clipboardData.getData('text'))
    if (!pasted) return
    event.preventDefault()
    commit(pasted)
    focusAt(pasted.length >= length ? length - 1 : pasted.length)
  }

  return (
    <div role="group" aria-label={label} className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={value[index] ?? ''}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            'size-12 rounded-control border bg-white text-center font-heading text-2xl font-semibold text-indigo sm:size-14',
            'transition-colors focus:border-indigo focus:ring-2 focus:ring-indigo/20 focus:outline-none',
            invalid ? 'border-danger' : value[index] ? 'border-indigo/50' : 'border-line',
            disabled && 'opacity-60',
          )}
        />
      ))}
    </div>
  )
}
