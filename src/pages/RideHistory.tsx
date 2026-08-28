import { useQuery } from '@tanstack/react-query';
import { Calendar, Users as UsersIcon, MapPin, AlertCircle, Inbox } from 'lucide-react';
import { ridesAPI } from '../lib/api';

interface RideRecord {
  id: string;
  name?: string;
  owner?: string;
  memberCount?: number;
  distance?: string;
  duration?: string;
  date?: string;
  status: 'completed' | 'cancelled';
}

export default function RideHistory() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ride-history'],
    queryFn: async () => {
      const res = await ridesAPI.getHistory();
      return res.data as RideRecord[] | { rides: RideRecord[] };
    },
  });

  const rides: RideRecord[] = Array.isArray(data) ? data : data?.rides ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Archive</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ride History</h1>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Past rides with replay and analytics</p>
      </div>

      <div className="glass-surface rounded-2xl shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)] dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden card-lift">
        <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Past Rides</h2>
          <span className="text-sm text-gray-600 dark:text-slate-400">{rides.length} records</span>
        </div>

        {isError && (
          <div role="alert" className="m-4 p-4 glass-surface rounded-xl border border-yellow-200 dark:border-yellow-700/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Cannot load ride history</p>
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
          <p className="p-8 text-center text-sm text-gray-600 dark:text-slate-400" role="status">Loading past rides…</p>
        )}

        {!isError && !isLoading && rides.length === 0 && (
          <div className="p-8 text-center">
            <Inbox className="w-10 h-10 mx-auto text-gray-500 dark:text-slate-500 mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">No past rides yet</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Completed rides will appear here once drivers finish them.</p>
          </div>
        )}

        {!isError && !isLoading && rides.length > 0 && (
          <ul className="divide-y divide-gray-200/70 dark:divide-slate-700/60" aria-label="Past rides">
            {rides.map((ride) => (
              <li key={ride.id} className="p-5 hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">{ride.name || `Ride ${ride.id.slice(0, 8)}`}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${ride.status === 'completed' ? 'bg-green-700 dark:bg-green-400' : 'bg-gray-500 dark:bg-slate-400'}`}
                          aria-hidden="true"
                        />
                        {ride.status}
                      </span>
                    </div>
                    {ride.owner && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Owner: {ride.owner}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-1 text-sm text-gray-700 dark:text-slate-300">
                    {ride.memberCount != null && (
                      <span className="inline-flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" aria-hidden="true" />
                        {ride.memberCount}
                      </span>
                    )}
                    {ride.distance && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {ride.distance}
                      </span>
                    )}
                    {ride.date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        {ride.date}
                      </span>
                    )}
                    {ride.duration && <span className="text-xs text-gray-500 dark:text-slate-400">{ride.duration}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
