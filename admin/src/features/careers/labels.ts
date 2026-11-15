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

/** Closing dates are India dates: the listing stays open until the end of that day in IST. */
export const formatClosingDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })

/** Today's date in India as YYYY-MM-DD. */
export const todayInIndia = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10)

/** Suggestions for the department field. Anything can be typed; used departments are added to this list. */
export const departmentSuggestions = [
  'Backend',
  'Frontend',
  'Full Stack',
  'AI / ML',
  'Cybersecurity',
  'DevOps',
  'Mobile',
  'Data',
  'QA',
  'Design',
  'Content',
  'Marketing',
  'Operations',
  'Customer Support',
] as const
