import type { InputHTMLAttributes } from 'react'

import { Input } from './Input'

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | null | undefined
  /** null when the box is empty. */
  onChange: (value: number | null) => void
  invalid?: boolean
}

/** Number box that reports null when empty (never NaN). */
export const NumberInput = ({ value, onChange, invalid, ...props }: NumberInputProps) => (
  <Input
    type="number"
    inputMode="numeric"
    invalid={invalid}
    value={value ?? ''}
    onChange={(event) => {
      const text = event.target.value
      onChange(text === '' ? null : Number(text))
    }}
    {...props}
  />
)
