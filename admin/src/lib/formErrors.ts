import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/lib/apiClient'

/** Message to show for any thrown value. */
export const errorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    if (error.code === 'RATE_LIMITED') return 'Too many requests. Please wait a moment and try again.'
    return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

/**
 * Maps a server VALIDATION_ERROR / NOT_READY (errors[].field) onto form fields.
 * Returns true when at least one field error was applied.
 */
export const applyServerErrors = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean => {
  if (!isApiError(error) || !error.errors) return false

  let applied = false
  for (const issue of error.errors) {
    if (fields.includes(issue.field)) {
      setError(issue.field as Path<T>, { type: 'server', message: issue.message })
      applied = true
    }
  }
  return applied
}
