import { useEffect, useState } from 'react';
import type { ActivityProfile } from '../lib/api';

/**
 * Pita aktivitas 24 jam — elemen tanda tangan panel dispatch.
 *
 * Dua puluh empat kolom, satu per jam. Batang padat adalah ride yang dibuat
 * hari ini; batang samar di belakangnya adalah jam yang sama kemarin, jadi
 * bentuk hari ini selalu punya pembanding dan pita tidak pernah kosong melompong
 * di pagi hari. Kolom jam sekarang ditandai kurung amber.
 *
 * Satu-satunya gerak di halaman ini: batang naik dari nol saat panel muncul,
 * bertahap dari jam 00 ke jam 23 (delay 14ms per kolom, total ~840ms). Kursor
 * jam sekarang berkedip HANYA kalau memang ada ride berjalan — kalau tidak, dia
 * diam, supaya kedipan tetap berarti "ada yang hidup". Keduanya mati di bawah
 * prefers-reduced-motion, lihat index.css.
 *
 * Pita ini tidak memegang informasi yang tidak ada di tempat lain: angka
 * hariannya juga tertulis di buku besar di sebelahnya, jadi pembaca screen
 * reader cukup dapat ringkasan lewat aria-label.
 */

const HOUR_LABELS = [0, 6, 12, 18];

export default function ActivityBand({
  activity,
  live,
}: {
  activity: ActivityProfile;
  live: boolean;
}) {
  const [risen, setRisen] = useState(false);

  useEffect(() => {
    // Satu frame jeda supaya transisi height punya nilai awal 0 untuk dianimasikan.
    const frame = requestAnimationFrame(() => setRisen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Backend selalu mengirim 24 elemen, tapi jangan percaya buta: kalau
  // panjangnya lain, tambal dengan nol daripada merender `undefined`.
  const today = normalise(activity.today);
  const yesterday = normalise(activity.yesterday);
  const currentHour = clampHour(activity.current_hour);

  const peak = Math.max(1, ...today, ...yesterday);
  const totalToday = today.reduce((sum, n) => sum + n, 0);
  const peakHour = today.indexOf(Math.max(...today));

  const summary =
    totalToday === 0
      ? 'Belum ada ride dibuat hari ini.'
      : `${totalToday} ride hari ini, terbanyak ${today[peakHour]} pada jam ${pad(peakHour)}.`;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="ops-eyebrow text-[10px] text-dispatch-muted">Rides created per hour</p>
        <p className="ops-figures font-mono text-[11px] text-dispatch-muted">
          today {totalToday} · peak {peak}
        </p>
      </div>

      <div
        className="mt-2 flex h-20 items-end gap-[3px] sm:h-24"
        role="img"
        aria-label={summary}
      >
        {today.map((count, hour) => {
          const isNow = hour === currentHour;
          return (
            <div key={hour} className="relative h-full flex-1">
              {/* Jejak jam yang sama kemarin. */}
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-[2px] bg-dispatch-muted/25"
                style={{ height: `${(yesterday[hour] / peak) * 100}%` }}
                aria-hidden="true"
              />
              {/* Hari ini. */}
              <div
                className={`ops-bar absolute inset-x-0 bottom-0 rounded-t-[2px] ${
                  isNow ? 'bg-amber' : 'bg-dispatch-text/75'
                }`}
                style={{
                  height: risen ? `${(count / peak) * 100}%` : '0%',
                  transitionDelay: `${hour * 14}ms`,
                }}
                aria-hidden="true"
              />
              {/* Penanda jam sekarang — selalu terlihat, berkedip hanya saat ada
                  ride berjalan. */}
              {isNow && (
                <div
                  className={`absolute inset-y-0 -inset-x-px border-x border-amber/50 ${
                    live ? 'ops-live' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 border-t border-dispatch-line pt-1.5">
        <div className="flex" aria-hidden="true">
          {today.map((_, hour) => (
            <div key={hour} className="flex-1 text-center">
              {HOUR_LABELS.includes(hour) && (
                <span className="ops-figures font-mono text-[9px] text-dispatch-muted">
                  {pad(hour)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function normalise(values: number[] | undefined): number[] {
  const out = new Array<number>(24).fill(0);
  if (!Array.isArray(values)) return out;
  for (let i = 0; i < 24; i += 1) {
    const value = values[i];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      out[i] = value;
    }
  }
  return out;
}

function clampHour(hour: number | undefined): number {
  if (typeof hour !== 'number' || !Number.isFinite(hour)) return -1;
  return hour >= 0 && hour <= 23 ? Math.floor(hour) : -1;
}

function pad(hour: number): string {
  return String(hour).padStart(2, '0');
}
