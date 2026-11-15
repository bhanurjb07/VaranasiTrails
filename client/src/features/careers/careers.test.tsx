import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CareersPage } from '@/pages/CareersPage'
import type { Career } from '@/types/api'
import { safeApplyUrl } from './labels'
import { useCareers } from './useCareers'

vi.mock('./useCareers', () => ({ useCareers: vi.fn(), useCareer: vi.fn() }))

const career = (overrides: Partial<Career> = {}): Career => ({
  id: 'c1',
  title: 'Backend Developer',
  department: 'Backend',
  location: 'Varanasi',
  employmentType: 'FULL_TIME',
  workMode: 'HYBRID',
  experience: '2+ years',
  salary: null,
  aboutRole: 'Build the APIs behind the website and admin panel.',
  responsibilities: [],
  requirements: ['Node.js'],
  applyUrl: 'https://forms.example.com/backend',
  closesAt: null,
  publishedAt: '2026-11-10T00:00:00.000Z',
  ...overrides,
})

const state = (data: Career[]) =>
  vi.mocked(useCareers).mockReturnValue({
    data,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useCareers>)

const renderPage = (path = '/careers') =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/careers" element={<CareersPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  )

beforeEach(() => vi.mocked(useCareers).mockReset())

describe('Careers page', () => {
  it('says there are no open positions when nothing is posted', () => {
    state([])
    renderPage()

    expect(screen.getByText('No open positions right now')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Apply' })).toBeNull()
  })

  it('lists positions grouped by department with a link to apply', () => {
    state([
      career(),
      career({ id: 'c2', title: 'AI Engineer', department: 'AI / ML', applyUrl: 'mailto:jobs@example.com' }),
    ])
    renderPage()

    expect(screen.getByRole('heading', { level: 2, name: 'Backend' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'AI / ML' })).toBeTruthy()

    const backend = screen.getByRole('heading', { name: 'Backend Developer' }).closest('div') as HTMLElement
    expect(within(backend).getByText(/Full time, hybrid/)).toBeTruthy()
    expect(within(backend).getByRole('link', { name: 'Apply' }).getAttribute('href')).toBe('https://forms.example.com/backend')
    expect(within(backend).getByRole('link', { name: /view details/i }).getAttribute('href')).toBe('/careers/c1')
  })

  it('filters by department', async () => {
    state([career(), career({ id: 'c2', title: 'AI Engineer', department: 'AI / ML' })])
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'AI / ML' }))

    expect(screen.queryByText('Backend Developer')).toBeNull()
    expect(screen.getByText('AI Engineer')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Backend Developer')).toBeTruthy()
  })

  it('does not show an apply button for an unsafe link', () => {
    state([career({ applyUrl: 'javascript:alert(1)' })])
    renderPage()

    expect(screen.queryByRole('link', { name: 'Apply' })).toBeNull()
  })
})

describe('safeApplyUrl', () => {
  it('allows web and mailto links only', () => {
    expect(safeApplyUrl('https://example.com/apply')).toBe('https://example.com/apply')
    expect(safeApplyUrl('http://example.com/apply')).toBe('http://example.com/apply')
    expect(safeApplyUrl('mailto:jobs@example.com')).toBe('mailto:jobs@example.com')

    for (const bad of ['javascript:alert(1)', 'data:text/html,hi', 'ftp://example.com', 'jobs@example.com', '', 'not a link']) {
      expect(safeApplyUrl(bad)).toBeNull()
    }
  })
})
