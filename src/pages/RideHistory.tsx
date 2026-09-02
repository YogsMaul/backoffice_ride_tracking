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
    <div className="space-y-5">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="ops-eyebrow text-[10px] text-moss">Archive</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Ride History
        </h1>
        <p className="text-sm text-muted">Past rides with replay and analytics.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex items-center justify-between border-b border-line p-4 sm:p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Past Rides</h2>
          <span className="ops-figures font-mono text-xs text-muted">
            {rides.length} records
          </span>
        </div>

        {isError && (
          <div
            role="alert"
            className="m-4 flex items-start gap-3 rounded-xl border border-warn-line bg-warn-fill p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn-ink" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warn-ink">Cannot load ride history</p>
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
            Loading past rides…
          </p>
        )}

        {!isError && !isLoading && rides.length === 0 && (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-2 h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">No past rides yet</p>
            <p className="mt-1 text-xs text-muted">
              Completed rides will appear here once drivers finish them.
            </p>
          </div>
        )}

        {!isError && !isLoading && rides.length > 0 && (
          <ul className="divide-y divide-line" aria-label="Past rides">
            {rides.map((ride) => (
              <li key={ride.id} className="p-5 transition-colors hover:bg-moss-soft/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-base font-semibold text-ink">
                        {ride.name || `Ride ${ride.id.slice(0, 8)}`}
                      </span>
                      <StatusPill status={ride.status} />
                    </div>
                    {ride.owner && (
                      <p className="ops-figures mt-1 font-mono text-[11px] text-muted">
                        Owner: {ride.owner}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 text-xs text-muted">
                    {ride.memberCount != null && (
                      <span className="inline-flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {ride.memberCount}
                      </span>
                    )}
                    {ride.distance && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {ride.distance}
                      </span>
                    )}
                    {ride.date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {ride.date}
                      </span>
                    )}
                    {ride.duration && (
                      <span className="ops-figures font-mono text-[11px] text-muted">
                        {ride.duration}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: RideRecord['status'] }) {
  const completed = status === 'completed';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        completed ? 'text-moss' : 'text-muted'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-moss' : 'bg-muted'}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}
