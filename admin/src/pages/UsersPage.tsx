import { Search, Users } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { UserDrawer } from '@/features/users/UserDrawer'
import { useUserList } from '@/features/users/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlParams } from '@/hooks/useUrlParams'
import { formatDate, timeAgo } from '@/lib/format'
import type { AdminUser } from '@/types/api'

const triState = (value: string) => (value === 'true' ? true : value === 'false' ? false : undefined)

export const UsersPage = () => {
  const { get, page, update } = useUrlParams()
  const searchId = useId()
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const [search, setSearch] = useState(get('q'))
  const debounced = useDebounce(search, 350)
  const synced = useRef(get('q'))
  useEffect(() => {
    const text = debounced.trim()
    if (text !== synced.current) {
      synced.current = text
      update({ q: text || undefined })
    }
  }, [debounced, update])

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useUserList({
    q: get('q') || undefined,
    verified: triState(get('verified')),
    blocked: triState(get('blocked')),
    page,
    limit: 20,
  })

  return (
    <>
      <PageHeader title="Users" description="Everyone who has created an account." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            Search users
          </label>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input id={searchId} type="search" placeholder="Search name, email or phone" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
        <div className="w-44">
          <Select aria-label="Email verification" value={get('verified')} onChange={(event) => update({ verified: event.target.value || undefined })}>
            <option value="">Verified or not</option>
            <option value="true">Verified only</option>
            <option value="false">Not verified</option>
          </Select>
        </div>
        <div className="w-44">
          <Select aria-label="Blocked status" value={get('blocked')} onChange={(event) => update({ blocked: event.target.value || undefined })}>
            <option value="">Blocked or not</option>
            <option value="true">Blocked only</option>
            <option value="false">Not blocked</option>
          </Select>
        </div>
      </div>

      {isError ? (
        <ErrorState error={error} title="Could not load users" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-14 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState icon={Users} title="No users found" text="Try clearing a filter." />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <Table>
            <THead>
              <tr>
                <Th>User</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Last login</Th>
                <Th className="text-right">Reviews / Saves</Th>
              </tr>
            </THead>
            <TBody>
              {data.data.map((user) => (
                <Tr key={user.id} className="cursor-pointer" onClick={() => setSelected(user)}>
                  <Td>
                    <button type="button" onClick={() => setSelected(user)} className="text-left">
                      <span className="block font-semibold text-indigo hover:underline">{user.name}</span>
                      <span className="block text-xs text-muted">{user.email}</span>
                    </button>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1.5">
                      {user.role === 'ADMIN' && <Badge variant="info">Admin</Badge>}
                      <Badge variant={user.emailVerified ? 'success' : 'warning'}>{user.emailVerified ? 'Verified' : 'Pending'}</Badge>
                      {user.isBlocked && <Badge variant="danger">Blocked</Badge>}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{formatDate(user.createdAt)}</Td>
                  <Td className="whitespace-nowrap text-muted">{user.lastLoginAt ? timeAgo(user.lastLoginAt) : 'Never'}</Td>
                  <Td className="text-right text-muted tabular-nums">
                    {user.reviewCount} / {user.wishlistCount}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{data.meta.total} user{data.meta.total === 1 ? '' : 's'}</p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(next) => update({ page: String(next) })} />
          </div>
        </div>
      )}

      <UserDrawer user={selected ? (data?.data.find((row) => row.id === selected.id) ?? selected) : null} onClose={() => setSelected(null)} />
    </>
  )
}
