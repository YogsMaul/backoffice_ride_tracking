import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { ridesAPI } from '../lib/api';

interface ActiveRideItem {
  id: string;
  name?: string;
  members_count?: number;
  owner_id?: string;
  status?: string;
  started_at?: string;
}

export default function ActiveRides() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ['active-rides'],
    queryFn: async () => {
      const res = await ridesAPI.getActive();
      return res.data as { rides?: ActiveRideItem[] } | ActiveRideItem[];
    },
    refetchInterval: 5000,
  });

  const rides: ActiveRideItem[] = Array.isArray(data)
    ? data
    : data?.rides ?? [];
  const selected = rides.find((r) => r.id === selectedId) ?? null;

  const lastUpdatedAgoSec = dataUpdatedAt ? Math.floor((Date.now() - dataUpdatedAt) / 1000) : null;
  const justUpdated = lastUpdatedAgoSec !== null && lastUpdatedAgoSec < 3;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start sm:items-end gap-4 flex-col sm:flex-row">
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Live telemetry</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Active Rides Monitoring</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Real-time location and fleet tracking</p>
        </div>
        <div className="flex items-center gap-2" aria-live="polite">
          <span className="inline-flex items-center text-xs text-gray-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-gray-200 dark:border-slate-700">
            <span
              className={`w-2 h-2 mr-1.5 rounded-full bg-green-600 dark:bg-green-400 ${justUpdated ? 'animate-pulse' : ''}`}
              aria-hidden="true"
            />
            Live updates
          </span>
        </div>
      </div>

      {isError && (
        <div role="alert" className="glass-surface rounded-xl border border-yellow-200 dark:border-yellow-700/50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Cannot reach backend at /api/v1/admin/rides</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400/80 mt-1">{error instanceof Error ? error.message : 'Network error'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-surface rounded-2xl shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)] dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] p-4 space-y-4 card-lift">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">Ongoing Sessions</h2>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 rounded-full px-2.5 py-1">{rides.length} active</span>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-600 dark:text-slate-400 py-8 text-center" role="status">Loading rides…</p>
          ) : rides.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-slate-400 py-8 text-center">
              <Navigation className="w-8 h-8 mx-auto text-gray-400 dark:text-slate-500 mb-2" aria-hidden="true" />
              <p className="text-gray-800 dark:text-slate-200 font-medium">No active rides right now</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">This list updates as soon as a driver starts a ride.</p>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Active rides">
              {rides.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    aria-pressed={selectedId === r.id}
                    className={`w-full text-left p-3 border rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 transition-colors ${
                      selectedId === r.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-sm'
                        : 'border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-900 dark:text-white">{r.name || `Ride ${r.id.slice(0, 8)}`}</span>
                      <span className="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-medium rounded-full">
                        {r.members_count ?? 0} riders
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mt-2">
                      <span className="inline-flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                        {r.status || 'active'}
                      </span>
                      {r.started_at && <span>Started {new Date(r.started_at).toLocaleTimeString()}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 glass-surface rounded-2xl shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)] dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] p-6 flex flex-col items-center justify-center min-h-[400px] text-gray-700 dark:text-slate-300 card-lift">
          {selected ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-3 shadow-lg">
                <MapPin className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{selected.name || `Ride ${selected.id.slice(0, 8)}`}</p>
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">
                {selected.members_count ?? 0} riders · {selected.status || 'active'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-4 text-center max-w-xs">
                Map tiles and real-time telemetry will render here. Select a ride to scope the view.
              </p>
            </>
          ) : (
            <>
              <MapPin className="w-12 h-12 mb-2 text-gray-400 dark:text-slate-500" aria-hidden="true" />
              <p className="font-medium text-gray-700 dark:text-slate-200">Live Spatial Map View</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-center max-w-xs">
                Select a ride from the list to scope the map. Wire Leaflet/OpenStreetMap to the
                <code className="mx-1 px-1 bg-gray-100 dark:bg-slate-800 rounded text-[11px]">/api/v1/admin/rides/&lt;id&gt;/telemetry</code>
                stream.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
