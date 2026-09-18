import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ActivityBand from '../components/ActivityBand';
import StatusChip from '../components/StatusChip';
import { ridesAPI, statsAPI } from '../lib/api';
import type { RideRow, RidesListResponse, StatsOverview } from '../lib/api';
import { clockOf, dateTimeOf, elapsedSince, shortId } from '../lib/format';

export default function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await statsAPI.getOverview()).data as StatsOverview,
    refetchInterval: 30_000,
  });

  const activeQuery = useQuery({
    queryKey: ['admin-rides-active'],
    queryFn: async () => (await ridesAPI.getActive()).data as RidesListResponse | RideRow[],
    refetchInterval: 10_000,
  });

  const recentQuery = useQuery({
    queryKey: ['admin-rides-recent'],
    queryFn: async () => (await ridesAPI.getRecent(6)).data as RidesListResponse | RideRow[],
    refetchInterval: 60_000,
  });

  const stats = statsQuery.data;
  const activeRows = useMemo(() => readRides(activeQuery.data), [activeQuery.data]);
  const recentRows = useMemo(() => readRides(recentQuery.data), [recentQuery.data]);

  const activeCount = stats?.by_status?.active ?? null;
  const live = activeCount !== null ? activeCount > 0 : activeRows.length > 0;
  const truncated = activeCount !== null && activeCount > activeRows.length;
  const contractStale = Boolean(stats) && stats?.by_status === undefined;
  const lastRide = recentRows[0] ?? null;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (activeRows.length === 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeRows.length]);

  const refreshing =
    statsQuery.isFetching || activeQuery.isFetching || recentQuery.isFetching;

  const refreshAll = () => {
    void statsQuery.refetch();
    void activeQuery.refetch();
    void recentQuery.refetch();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ops-eyebrow text-[10px] text-moss">Operasional</p>
          <h1 className="font-display text-4xl leading-none font-semibold tracking-tight text-ink sm:text-5xl">
            Papan Pantau
          </h1>
          <p className="mt-2 text-sm text-muted">
            Perjalanan yang sedang berjalan dan perbandingan aktivitas hari ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="ops-figures font-mono" aria-live="polite">
            {describeFetch(stats, statsQuery.dataUpdatedAt)}
          </span>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-[11px] text-ink transition-colors hover:border-moss hover:text-moss"
          >
            <RefreshCw
              className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Muat ulang
          </button>
        </div>
      </header>

      {statsQuery.isError && (
        <Notice
          title="Tidak dapat terhubung ke server"
          detail="Gagal mengambil data statistik operasional. Periksa koneksi backend Anda."
          onRetry={() => void statsQuery.refetch()}
        />
      )}

      {contractStale && (
        <Notice
          title="Server menggunakan versi lama"
          detail="Backend hanya mengembalikan data dasar. Muat ulang server untuk melihat rincian per jam dan status lengkap."
        />
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Panel perjalanan aktif */}
        <section className="rounded-xl border border-dispatch-line bg-dispatch p-5 text-dispatch-text shadow-[0_24px_60px_-30px_rgba(12,31,26,0.35)] sm:p-7 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className="ops-eyebrow text-[10px] text-dispatch-muted">Sedang di perjalanan</p>
            {stats?.time_zone && (
              <p className="ops-eyebrow text-[10px] text-dispatch-muted">{stats.time_zone}</p>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-2">
            <p
              className="ops-figures font-display text-[64px] leading-[0.82] font-semibold sm:text-[88px]"
              aria-live="polite"
            >
              {statsQuery.isLoading ? '·' : (activeCount ?? '—')}
            </p>
            {live && (
              <span className="mb-2 inline-flex items-center gap-2">
                <span className="ops-live h-2 w-2 rounded-full bg-amber" aria-hidden="true" />
                <span className="ops-eyebrow text-[10px] text-amber-ink">berjalan</span>
              </span>
            )}
          </div>

          {activeRows.length > 0 ? (
            <>
              <ul className="mt-5 divide-y divide-dispatch-line border-t border-dispatch-line">
                {activeRows.map((ride) => {
                  const elapsed = elapsedSince(ride.started_at, now);
                  return (
                    <li
                      key={ride.id}
                      className="flex items-center justify-between gap-4 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {ride.owner_name?.trim() || 'Pengendara tidak diketahui'}
                        </p>
                        <p className="ops-figures font-mono text-[11px] text-dispatch-muted">
                          {shortId(ride.id)}
                          {' · '}
                          {ride.members_count ?? '—'} peserta
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="ops-figures font-mono text-base">{elapsed ?? '—'}</p>
                        <p className="ops-eyebrow text-[9px] text-dispatch-muted">
                          {ride.started_at ? 'durasi' : 'belum mulai'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {truncated && (
                <p className="mt-2.5 text-[11px] text-dispatch-muted">
                  Menampilkan {activeRows.length} dari {activeCount} perjalanan aktif.
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 max-w-md text-sm text-dispatch-muted">
              {activeQuery.isLoading
                ? 'Memuat perjalanan aktif…'
                : activeQuery.isError
                  ? 'Gagal memuat daftar perjalanan aktif.'
                  : lastRide
                    ? `Tidak ada yang sedang di jalan. Perjalanan terakhir dibuat ${dateTimeOf(lastRide.created_at) ?? 'waktu tidak diketahui'} (status: ${lastRide.status}).`
                    : 'Belum ada perjalanan yang sedang berjalan atau dibuat.'}
            </p>
          )}

          <div className="mt-6 border-t border-dispatch-line pt-4">
            {stats?.activity ? (
              <ActivityBand activity={stats.activity} live={live} />
            ) : (
              <p className="ops-eyebrow text-[10px] text-dispatch-muted">
                Profil aktivitas per jam belum tersedia
              </p>
            )}
          </div>
        </section>

        {/* Total statistik */}
        <section className="rounded-xl border border-line bg-card p-5">
          <p className="ops-eyebrow text-[10px] text-muted">Ringkasan Total</p>
          <dl className="mt-2 divide-y divide-line">
            <LedgerRow label="Dibuat hari ini" value={stats?.rides_today} />
            <LedgerRow label="Direncanakan (belum mulai)" value={stats?.by_status?.planned} />
            <LedgerRow label="Selesai" value={stats?.by_status?.completed} />
            <LedgerRow label="Dibatalkan" value={stats?.by_status?.cancelled} />
            <LedgerRow label="Total semua perjalanan" value={stats?.rides} />
            <LedgerRow label="Pengguna terdaftar" value={stats?.users} />
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-[11px] text-muted">
            Batas pergantian hari mengikuti zona waktu {stats?.time_zone ?? 'server'}.
          </p>
        </section>
      </div>

      {/* Log perjalanan terakhir */}
      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <p className="ops-eyebrow text-[10px] text-muted">Perjalanan Terakhir</p>
          <p className="ops-figures font-mono text-[11px] text-muted">
            {recentRows.length} ditampilkan
          </p>
        </header>

        {recentQuery.isError ? (
          <p className="px-5 py-6 text-sm text-muted">
            Tidak dapat memuat daftar perjalanan terakhir.
          </p>
        ) : recentQuery.isLoading ? (
          <p className="px-5 py-6 text-sm text-muted" role="status">
            Memuat perjalanan terakhir…
          </p>
        ) : recentRows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">
            Belum ada perjalanan yang dibuat. Data akan otomatis muncul saat pengguna mulai membuat perjalanan dari aplikasi.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recentRows.map((ride) => (
              <li
                key={ride.id}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-moss-soft/60"
              >
                <span className="ops-figures w-16 shrink-0 font-mono text-[12px] text-muted">
                  {shortId(ride.id)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {ride.owner_name?.trim() || 'Pengendara tidak diketahui'}
                </span>
                <StatusChip status={ride.status} />
                <span className="ops-figures hidden w-16 shrink-0 text-right font-mono text-[12px] text-muted sm:block">
                  {ride.members_count ?? '—'} org
                </span>
                <span className="ops-figures w-28 shrink-0 text-right font-mono text-[12px] text-muted">
                  {dateTimeOf(ride.created_at) ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LedgerRow({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="ops-figures font-mono text-lg font-semibold text-ink">{value ?? '—'}</dd>
    </div>
  );
}

function Notice({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-warn-line bg-warn-fill p-4"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn-ink" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-warn-ink">{title}</p>
        {detail && <p className="mt-1 text-[12px] text-warn-ink/90">{detail}</p>}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-[12px] font-medium text-warn-ink underline hover:no-underline"
          >
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}

function readRides(payload: RidesListResponse | RideRow[] | undefined): RideRow[] {
  if (Array.isArray(payload)) return payload;
  return payload?.rides ?? [];
}

function describeFetch(stats: StatsOverview | undefined, fetchedAt: number): string {
  const serverClock = clockOf(stats?.generated_at);
  if (serverClock) return `Diperbarui pukul ${serverClock} · otomatis tiap 30dtk`;
  if (fetchedAt) {
    const local = clockOf(new Date(fetchedAt).toISOString());
    return local ? `Diperbarui pukul ${local} · otomatis tiap 30dtk` : 'Otomatis tiap 30dtk';
  }
  return 'Belum dimuat';
}
