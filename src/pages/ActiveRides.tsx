import { useQuery } from '@tanstack/react-query';
import { useState, lazy, Suspense } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { ridesAPI } from '../lib/api';

const RideLiveMap = lazy(() => import('../components/RideLiveMap'));

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

  const rides: ActiveRideItem[] = Array.isArray(data) ? data : data?.rides ?? [];
  const selected = rides.find((r) => r.id === selectedId) ?? null;

  const lastUpdatedAgoSec = dataUpdatedAt ? Math.floor((Date.now() - dataUpdatedAt) / 1000) : null;
  const justUpdated = lastUpdatedAgoSec !== null && lastUpdatedAgoSec < 3;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ops-eyebrow text-[10px] text-moss">Telemetri Langsung</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Perjalanan Aktif
          </h1>
          <p className="mt-2 text-sm text-muted">
            Pemantauan posisi dan status perjalanan secara real-time.
          </p>
        </div>
        <span
          aria-live="polite"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-ink"
        >
          <span
            className={`h-2 w-2 rounded-full bg-moss ${justUpdated ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
          Live update
        </span>
      </header>

      {isError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-warn-line bg-warn-fill p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn-ink" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-warn-ink">
              Gagal memuat data perjalanan aktif
            </p>
            <p className="mt-1 text-xs text-warn-ink/90">
              {error instanceof Error ? error.message : 'Gangguan koneksi'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-card p-4 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Sesi Berjalan</h2>
            <span className="ops-eyebrow rounded-full bg-moss-soft px-2.5 py-1 text-[10px] text-moss">
              {rides.length} aktif
            </span>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted" role="status">
              Memuat data perjalanan…
            </p>
          ) : rides.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              <Navigation className="mx-auto mb-2 h-8 w-8 text-muted" aria-hidden="true" />
              <p className="font-medium text-ink">Tidak ada perjalanan aktif</p>
              <p className="mt-1 text-xs text-muted">
                Daftar akan terisi otomatis begitu pengendara memulai perjalanan.
              </p>
            </div>
          ) : (
            <ul className="space-y-2" aria-label="Perjalanan aktif">
              {rides.map((r) => {
                const isSelected = selectedId === r.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      aria-pressed={isSelected}
                      className={`w-full rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss ${
                        isSelected
                          ? 'border-moss bg-moss-soft'
                          : 'border-line bg-paper hover:border-moss hover:bg-moss-soft/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-ink">
                          {r.name || `Perjalanan ${r.id.slice(0, 8)}`}
                        </span>
                        <span className="ops-eyebrow rounded-full bg-dispatch px-2 py-0.5 text-[10px] text-dispatch-text">
                          {r.members_count ?? 0} pengendara
                        </span>
                      </div>
                      <div className="ops-figures mt-2 flex items-center gap-3 font-mono text-[11px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                          {r.status === 'active' ? 'berjalan' : r.status || 'aktif'}
                        </span>
                        {r.started_at && <span>Mulai {new Date(r.started_at).toLocaleTimeString('id-ID')}</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          {selected ? (
            <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center rounded-xl border border-line bg-card"><div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div></div>}>
              <RideLiveMap rideId={selected.id} rideName={selected.name} />
            </Suspense>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-6 text-muted">
              <MapPin className="mb-2 h-12 w-12 text-muted" aria-hidden="true" />
              <p className="font-medium text-ink">Tampilan Peta Interaktif</p>
              <p className="mt-1 max-w-xs text-center text-xs text-muted">
                Pilih salah satu perjalanan dari daftar di samping untuk memantau posisi pengendara di peta.
              </p>
              <p className="mt-2 text-[11px] text-muted">
                Peta muncul setelah ride dipilih — koordinat ditarik tiap 3 detik dari server.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
