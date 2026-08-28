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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">People</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">User Management</h1>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Browse registered riders and their ride activity</p>
      </div>

      <div className="glass-surface rounded-2xl shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)] dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden card-lift">
        <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users by name or email"
              aria-label="Search users by name or email"
              className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-slate-800 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-slate-400">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {isError && (
          <div role="alert" className="p-4 m-4 glass-surface rounded-xl border border-yellow-200 dark:border-yellow-700/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Cannot load users</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400/80 mt-1">{error instanceof Error ? error.message : 'Network error'}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs font-medium text-yellow-800 dark:text-yellow-300 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isError && isLoading && (
          <p className="p-8 text-center text-sm text-gray-600 dark:text-slate-400" role="status">Loading users…</p>
        )}

        {!isError && !isLoading && users.length === 0 && (
          <div className="p-8 text-center">
            <Inbox className="w-10 h-10 mx-auto text-gray-500 dark:text-slate-500 mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">No users yet</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Once someone signs up, they will appear here.</p>
          </div>
        )}

        {!isError && !isLoading && users.length > 0 && filtered.length === 0 && (
          <div className="p-8 text-center">
            <Search className="w-10 h-10 mx-auto text-gray-500 dark:text-slate-500 mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">No users match “{q}”</p>
            <button
              type="button"
              onClick={() => setQ('')}
              className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-400 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Clear search
            </button>
          </div>
        )}

        {!isError && !isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-700/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase" scope="col">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase" scope="col">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase" scope="col">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase" scope="col">Rides</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase" scope="col">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/70 dark:divide-slate-700/60">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/50 dark:to-violet-900/50 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm ring-1 ring-white dark:ring-slate-700" aria-hidden="true">
                          {user.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">{user.createdAt ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">{user.ridesCount ?? 0}</td>
                    <td className="px-6 py-4">
                      {user.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-slate-400" aria-hidden="true" />
                          Suspended
                        </span>
                      ) : user.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400" aria-hidden="true" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-700 dark:bg-green-400" aria-hidden="true" />
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
