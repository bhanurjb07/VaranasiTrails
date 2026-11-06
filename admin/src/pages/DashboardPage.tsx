import { FilePen, MapPinned, MessageSquareText, Users } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { LatestEnquiries, NeedsAttention, TopWishlisted } from '@/features/dashboard/DashboardLists'
import { EnquiriesChart } from '@/features/dashboard/EnquiriesChart'
import { StatCard } from '@/features/dashboard/StatCard'
import { useDashboard } from '@/features/dashboard/useDashboard'
import { useAuth } from '@/features/auth/useAuth'

export const DashboardPage = () => {
  const { user } = useAuth()
  const { data, isPending, isError, error, refetch } = useDashboard()

  return (
    <>
      <PageHeader title={`Welcome back, ${user?.name.split(' ')[0] ?? 'admin'}`} description="Here is what is happening on VaranasiTrails." />

      {isError ? (
        <ErrorState error={error} title="Could not load the dashboard" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-6" aria-hidden="true">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-24 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-card" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Published trips" value={data.destinations.published} hint={`${data.destinations.archived} archived`} icon={MapPinned} tone="success" to="/destinations?status=published" />
            <StatCard label="Drafts" value={data.destinations.draft} hint="Not visible to the public" icon={FilePen} tone="indigo" to="/destinations?status=draft" />
            <StatCard label="New enquiries" value={data.enquiries.NEW} hint={`${data.enquiries.total} in total`} icon={MessageSquareText} tone="saffron" to="/enquiries" />
            <StatCard label="Users" value={data.users.total} hint={`${data.users.newLast30Days} new in 30 days`} icon={Users} tone="info" to="/users" />
          </div>

          <EnquiriesChart data={data.enquiriesPerDay} />

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <LatestEnquiries items={data.latestEnquiries} />
            <TopWishlisted items={data.topWishlisted} />
            <div className="lg:col-span-2 xl:col-span-1">
              <NeedsAttention items={data.needsAttention} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
