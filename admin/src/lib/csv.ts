// CSV helpers that are safe to open in spreadsheet apps (same rules as the server).

/**
 * Cells starting with = + - @ (or tab / carriage return) get a leading apostrophe so a
 * spreadsheet cannot run them as formulas ("CSV injection"). Cells containing a comma,
 * quote or newline are quoted.
 */
export const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  let text = value instanceof Date ? value.toISOString() : String(value)

  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`
  return text
}

export const toCsv = (headers: readonly string[], rows: readonly (readonly unknown[])[]): string =>
  [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n') + '\r\n'

/** Triggers a browser download of `content` (or an existing Blob). */
export const downloadFile = (content: string | Blob, filename: string, type = 'text/csv;charset=utf-8') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Query string for an export link: skips empty values. */
export const exportQuery = (filters: Record<string, string | number | boolean | undefined | null>) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}
