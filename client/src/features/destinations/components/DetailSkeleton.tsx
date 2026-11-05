import { Container } from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export const DetailSkeleton = () => (
  <Container className="py-8" aria-hidden="true">
    <Skeleton className="mb-6 h-4 w-48" />
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
      <div>
        <Skeleton className="aspect-[16/10] w-full rounded-card" />
        <div className="mt-3 flex gap-3">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20 w-28" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  </Container>
)
