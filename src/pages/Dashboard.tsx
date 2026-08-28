import { useQuery } from '@tanstack/react-query';
import { Users, Radio, Calendar, Activity, AlertCircle, Inbox } from 'lucide-react';
import { statsAPI } from '../lib/api';

type Overview = {
  totalUsers?: number;
  activeRides?: number;
  todayRides?: number;
  totalDistanceKm?: number;
};

export default function Dashboard() {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: async () => (await statsAPI.getOverview()).data as Overview,
    refetchInterval: 30_000,
  });

  // M-1: the focal metric for an ops admin is "active rides right now".
  // Demote the rest to one row. The "Today / Users / Distance" trio is
  // supporting context, not equal peers.
  const focal = data?.activeRides;
  const supporting = data
    ? [
        { label: 'Today', value: data.todayRides, Icon: Calendar },
        { label: 'Users', value: data.totalUsers, Icon: Users },
        { label: 'Distance', value: data.totalDistanceKm != null ? `${data.totalDistanceKm.toLocaleString()} km` : undefined, Icon: Activity },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Operations console</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">System summary and live operations overview</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-700 dark:bg-green-500" aria-hidden="true" />
          Live backend connected
        </span>
      </div>

      {/* M-2: page-level shadow-sm only on the topmost container, not on every card. */}
      <div className="glass-surface-strong rounded-2xl shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)] dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] p-6 md:p-8 relative overflow-hidden card-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-violet-50/40 dark:from-blue-500/10 dark:via-transparent dark:to-violet-500/10 pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Active Rides Right Now</p>
            {isLoading ? (
              <p className="text-5xl font-bold text-gray-300 dark:text-slate-600 mt-1" aria-live="polite">…</p>
            ) : isError ? (
              <p className="text-5xl font-bold text-gray-300 dark:text-slate-600 mt-1">—</p>
            ) : (
              <p className="text-5xl font-bold text-gray-900 dark:text-white mt-1" aria-live="polite">{focal ?? 0}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-700 dark:text-green-500" />
              <span>Auto-refreshes every 30 seconds</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg" aria-hidden="true">
            <Radio className="w-8 h-8" />
          </div>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {supporting.map(({ label, value, Icon }) => (
            <div key={label} className="bg-white/80 dark:bg-slate-800 rounded-xl border border-white/70 dark:border-slate-700 shadow-sm p-5 card-lift">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <Icon className="w-4 h-4 text-blue-700 dark:text-blue-400" aria-hidden="true" />
                <span>{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div role="alert" className="glass-surface rounded-xl border border-yellow-200 dark:border-yellow-700/50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Cannot load dashboard from /api/v1/admin/stats</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400/80 mt-1">{error instanceof Error ? error.message : 'Backend unreachable'}</p>
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

      {!isLoading && !isError && data && supporting.length === 0 && (
        <div className="glass-surface rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <Inbox className="w-10 h-10 mx-auto text-gray-400 dark:text-slate-500 mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">No data yet</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Once users start rides, the totals will appear here.</p>
        </div>
      )}
    </div>
  );
}
