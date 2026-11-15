import type { EmploymentType, WorkMode } from '@/types/api'

export const employmentLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full time',
  PART_TIME: 'Part time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
}

export const workModeLabels: Record<WorkMode, string> = {
  ONSITE: 'On site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
}

/** Closing dates are India dates: applications stay open until the end of that day in IST. */
export const formatClosingDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })

/** Only web and email links are used for applying. Anything else is dropped. */
export const safeApplyUrl = (value: string): string | null => {
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}
