import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertCircle, Inbox } from 'lucide-react';
import { usersAPI } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  ridesCount?: number;
  status?: 'active' | 'suspended' | 'pending';
}

export default function Users() {
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersAPI.getAll()).data as User[] | { users: User[] },
  });

  const users: User[] = Array.isArray(data) ? data : data?.users ?? [];
  const filtered = q.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q.toLowerCase()) ||
          u.email.toLowerCase().includes(q.toLowerCase()),
      )
    : users;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="ops-eyebrow text-[10px] text-moss">People</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          User Management
        </h1>
        <p className="text-sm text-muted">Browse registered riders and their ride activity.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users by name or email"
              aria-label="Search users by name or email"
              className="w-full rounded-lg border border-line bg-paper py-2 pl-10 pr-4 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
          <span className="ops-figures font-mono text-xs text-muted">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {isError && (
          <div
            role="alert"
            className="m-4 flex items-start gap-3 rounded-xl border border-warn-line bg-warn-fill p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn-ink" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warn-ink">Cannot load users</p>
              <p className="mt-1 text-xs text-warn-ink/90">
                {error instanceof Error ? error.message : 'Network error'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs font-medium text-warn-ink underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-moss rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isError && isLoading && (
          <p className="p-8 text-center text-sm text-muted" role="status">
            Loading users…
          </p>
        )}

        {!isError && !isLoading && users.length === 0 && (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-2 h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">No users yet</p>
            <p className="mt-1 text-xs text-muted">
              Once someone signs up, they will appear here.
            </p>
          </div>
        )}

        {!isError && !isLoading && users.length > 0 && filtered.length === 0 && (
          <div className="p-8 text-center">
            <Search className="mx-auto mb-2 h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">No users match &ldquo;{q}&rdquo;</p>
            <button
              type="button"
              onClick={() => setQ('')}
              className="mt-2 text-xs font-medium text-moss underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-moss rounded"
            >
              Clear search
            </button>
          </div>
        )}

        {!isError && !isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">User</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Email</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Joined</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Rides</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-moss-soft/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-moss-soft text-sm font-semibold text-moss ring-1 ring-line"
                          aria-hidden="true"
                        >
                          {user.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                        <span className="font-medium text-ink">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink">{user.email}</td>
                    <td className="ops-figures px-6 py-4 font-mono text-xs text-muted">
                      {user.createdAt ?? '—'}
                    </td>
                    <td className="ops-figures px-6 py-4 text-right font-mono text-sm font-semibold text-ink">
                      {user.ridesCount ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status?: User['status'] }) {
  if (status === 'suspended') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" aria-hidden="true" />
        Suspended
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-ink">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-moss">
      <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
      Active
    </span>
  );
}
