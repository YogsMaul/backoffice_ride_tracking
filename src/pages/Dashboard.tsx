import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ActivityBand from '../components/ActivityBand';
import StatusChip from '../components/StatusChip';
import { ridesAPI, statsAPI } from '../lib/api';
import type { RideRow, RidesListResponse, StatsOverview } from '../lib/api';
import { clockOf, dateTimeOf, elapsedSince, shortId } from '../lib/format';

/**
 * Papan dispatch.
 *
 * Halaman ini sebelumnya membaca field yang tidak pernah dikirim backend
 * (`activeRides`, `todayRides`, `totalUsers`, `totalDistanceKm`), lalu
 * menampilkan `0` dan tiga strip sebagai kalau-kalau itu fakta, ditemani pil
 * hijau "Live backend connected" yang di-hardcode. Sekarang:
 *
 *   - Nama field mengikuti /api/v1/admin/stats apa adanya.
 *   - Setiap angka yang tidak dikirim tampil sebagai strip, bukan nol.
 *   - Baris sumber di kanan atas menyebut endpoint, zona waktu, dan jam
 *     penghitungan yang benar-benar datang dari server.
 *   - Jarak tempuh tidak ditampilkan sama sekali: tabel ride_stats ada di
 *     schema.sql tapi tidak ada satu pun kode Go yang menulisinya, jadi angkanya
 *     akan selalu nol. Lebih baik tidak ada daripada nol yang menyesatkan.
 */
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

  /**
   * Jumlah sesi berjalan diambil dari statistik, bukan dari panjang daftar:
   * daftarnya dibatasi 20 baris oleh backend, jadi kalau ride aktif lebih banyak
   * dari itu, panjang daftar akan diam-diam salah. Daftarnya tetap dipakai untuk
   * isi barisnya.
   */
  const activeCount = stats?.by_status?.active ?? null;
  const live = activeCount !== null ? activeCount > 0 : activeRows.length > 0;
  const truncated = activeCount !== null && activeCount > activeRows.length;

  /**
   * Binary backend yang masih versi lama hanya mengirim {users, rides}. Ketimbang
   * merender strip di mana-mana tanpa penjelasan, katakan penyebabnya.
   */
  const contractStale = Boolean(stats) && stats?.by_status === undefined;

  const lastRide = recentRows[0] ?? null;

  // Timer hanya berdetak kalau ada yang perlu dihitung. Tanpa penjaga ini
  // halaman ini merender ulang tiap detik seumur tab dibuka.
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
          <p className="ops-eyebrow text-[10px] text-moss">Operations</p>
          <h1 className="font-display text-4xl leading-none font-semibold tracking-tight text-ink sm:text-5xl">
            Dispatch Board
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sessions on the road right now, and how today compares with yesterday.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="ops-figures font-mono">GET /api/v1/admin/stats</span>
          <span aria-hidden="true" className="text-line">
            /
          </span>
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
            Refresh
          </button>
        </div>
      </header>

      {statsQuery.isError && (
        <Notice
          title="Cannot reach /api/v1/admin/stats"
          detail={errorText(statsQuery.error)}
          onRetry={() => void statsQuery.refetch()}
        />
      )}

      {contractStale && (
        <Notice
          title="Backend is running an older build"
          detail="It only returns users and rides. Restart it (go run ./cmd/server) to get today's counts, the status breakdown, and the hourly profile."
        />
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ---- Panel dispatch: satu-satunya permukaan gelap di halaman ---- */}
        <section className="rounded-xl bg-dispatch p-5 text-dispatch-text shadow-[0_24px_60px_-42px_rgba(12,31,26,0.85)] sm:p-7 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className="ops-eyebrow text-[10px] text-dispatch-muted">Sessions on the road</p>
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
                <span className="ops-eyebrow text-[10px] text-amber">moving</span>
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
                          {ride.owner_name?.trim() || 'Owner unknown'}
                        </p>
                        <p className="ops-figures font-mono text-[11px] text-dispatch-muted">
                          {shortId(ride.id)}
                          {' · '}
                          {ride.members_count ?? '—'} riders
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="ops-figures font-mono text-base">{elapsed ?? '—'}</p>
                        <p className="ops-eyebrow text-[9px] text-dispatch-muted">
                          {ride.started_at ? 'elapsed' : 'no start time'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {truncated && (
                <p className="mt-2.5 text-[11px] text-dispatch-muted">
                  Showing {activeRows.length} of {activeCount}. The list endpoint caps at 20
                  rows per request.
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 max-w-md text-sm text-dispatch-muted">
              {activeQuery.isLoading
                ? 'Reading active sessions…'
                : activeQuery.isError
                  ? `Active session list unavailable: ${errorText(activeQuery.error)}`
                  : lastRide
                    ? `Nothing on the road. Last ride ${dateTimeOf(lastRide.created_at) ?? 'at an unknown time'}, status ${lastRide.status}.`
                    : 'Nothing on the road, and no ride has been created yet.'}
            </p>
          )}

          <div className="mt-6 border-t border-dispatch-line pt-4">
            {stats?.activity ? (
              <ActivityBand activity={stats.activity} live={live} />
            ) : (
              <p className="ops-eyebrow text-[10px] text-dispatch-muted">
                Hourly profile not sent by this backend build
              </p>
            )}
          </div>
        </section>

        {/* ---- Buku besar: angka pendukung, baris berhairline, bukan kartu ---- */}
        <section className="rounded-xl border border-line bg-card p-5">
          <p className="ops-eyebrow text-[10px] text-muted">Totals</p>
          <dl className="mt-2 divide-y divide-line">
            <LedgerRow label="Rides created today" value={stats?.rides_today} />
            <LedgerRow label="Planned, not started" value={stats?.by_status?.planned} />
            <LedgerRow label="Completed" value={stats?.by_status?.completed} />
            <LedgerRow label="Cancelled" value={stats?.by_status?.cancelled} />
            <LedgerRow label="Rides all time" value={stats?.rides} />
            <LedgerRow label="Registered users" value={stats?.users} />
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-[11px] text-muted">
            Day boundary follows {stats?.time_zone ?? 'the server time zone'}, not the browser.
          </p>
        </section>
      </div>

      {/* ---- Log ride terakhir ---- */}
      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <p className="ops-eyebrow text-[10px] text-muted">Latest rides</p>
          <p className="ops-figures font-mono text-[11px] text-muted">
            {recentRows.length} shown
          </p>
        </header>

        {recentQuery.isError ? (
          <p className="px-5 py-6 text-sm text-muted">
            Cannot load recent rides: {errorText(recentQuery.error)}
          </p>
        ) : recentQuery.isLoading ? (
          <p className="px-5 py-6 text-sm text-muted" role="status">
            Reading recent rides…
          </p>
        ) : recentRows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">
            No ride has been created yet. Rows appear here as soon as someone opens one from the
            app.
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
                  {ride.owner_name?.trim() || 'Owner unknown'}
                </span>
                <StatusChip status={ride.status} />
                <span className="ops-figures hidden w-16 shrink-0 text-right font-mono text-[12px] text-muted sm:block">
                  {ride.members_count ?? '—'} rdr
                </span>
                <span className="ops-figures w-24 shrink-0 text-right font-mono text-[12px] text-muted">
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
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/** Backend bisa membalas array polos atau objek {rides}. Terima keduanya. */
function readRides(payload: RidesListResponse | RideRow[] | undefined): RideRow[] {
  if (Array.isArray(payload)) return payload;
  return payload?.rides ?? [];
}

/**
 * Menjelaskan kapan angka di layar dihitung. `generated_at` datang dari jam
 * server dan itu yang paling jujur; kalau tidak ada, pakai waktu fetch di sisi
 * browser dan sebut apa adanya.
 */
function describeFetch(stats: StatsOverview | undefined, fetchedAt: number): string {
  const serverClock = clockOf(stats?.generated_at);
  if (serverClock) return `counted ${serverClock} · reloads every 30s`;
  if (fetchedAt) {
    const local = clockOf(new Date(fetchedAt).toISOString());
    return local ? `fetched ${local} (browser clock) · reloads every 30s` : 'reloads every 30s';
  }
  return 'not fetched yet';
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Network error';
}
