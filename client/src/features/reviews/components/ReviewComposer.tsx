import { Link, useLocation } from 'react-router'

import { Card } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/useAuth'
import { ReviewForm } from './ReviewForm'

/** Review form for verified users; a clear prompt for everyone else. */
export const ReviewComposer = ({ slug }: { slug: string }) => {
  const { status, user } = useAuth()
  const location = useLocation()
  const from = `${location.pathname}${location.search}`

  let body
  if (status === 'loading') {
    body = null
  } else if (status === 'anonymous' || !user) {
    body = (
      <p className="text-muted">
        <Link to="/login" state={{ from }} className="font-semibold text-saffron-dark hover:underline">
          Log in
        </Link>{' '}
        or{' '}
        <Link to="/signup" className="font-semibold text-saffron-dark hover:underline">
          create an account
        </Link>{' '}
        to share your experience.
      </p>
    )
  } else if (!user.emailVerified) {
    body = (
      <p className="text-muted">
        Verify your email to leave a review.{' '}
        <Link
          to={`/verify-email?email=${encodeURIComponent(user.email)}`}
          state={{ from }}
          className="font-semibold text-saffron-dark hover:underline"
        >
          Verify now
        </Link>
      </p>
    )
  } else {
    body = <ReviewForm slug={slug} />
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-xl">Write a review</h3>
      {body}
    </Card>
  )
}
