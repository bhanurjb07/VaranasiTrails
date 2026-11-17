import { ArrowRight, Banknote, Briefcase, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import type { Career } from '@/types/api'
import { employmentLabels, safeApplyUrl, workModeLabels } from '../labels'

export const CareerMeta = ({ career }: { career: Career }) => (
  <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
    <li className="flex items-center gap-1.5">
      <MapPin className="size-4" aria-hidden="true" />
      {career.location}
    </li>
    <li className="flex items-center gap-1.5">
      <Clock className="size-4" aria-hidden="true" />
      {employmentLabels[career.employmentType]}, {workModeLabels[career.workMode].toLowerCase()}
    </li>
    {career.experience && (
      <li className="flex items-center gap-1.5">
        <Briefcase className="size-4" aria-hidden="true" />
        {career.experience}
      </li>
    )}
    {career.salary && (
      <li className="flex items-center gap-1.5">
        <Banknote className="size-4" aria-hidden="true" />
        {career.salary}
      </li>
    )}
  </ul>
)

export const CareerCard = ({ career }: { career: Career }) => {
  const applyUrl = safeApplyUrl(career.applyUrl)

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="text-xl sm:text-2xl">
        <Link to={`/careers/${career.id}`} className="hover:text-brand-text">
          {career.title}
        </Link>
      </h3>
      <div className="mt-2">
        <CareerMeta career={career} />
      </div>
      <p className="mt-3 line-clamp-2 text-muted">{career.aboutRole}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ButtonLink to={`/careers/${career.id}`} variant="outline" size="sm">
          View details <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
        {applyUrl && (
          <ButtonLink href={applyUrl} size="sm">
            Apply
          </ButtonLink>
        )}
      </div>
    </Card>
  )
}
