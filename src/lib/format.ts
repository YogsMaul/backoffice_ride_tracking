/**
 * Pemformat waktu dan id yang dipakai bersama oleh halaman konsol.
 *
 * Semuanya mengembalikan `null` kalau masukannya kosong atau bukan tanggal yang
 * sah, supaya pemanggilnya menampilkan tanda strip dan bukan "Invalid Date"
 * atau "NaN:NaN" — dua hal yang pernah bikin dashboard ini terlihat rusak.
 */

function parse(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/** Lama berjalan dalam format H:MM:SS, dihitung dari `iso` sampai `now`. */
export function elapsedSince(iso: string | null | undefined, now: number): string | null {
  const start = parse(iso);
  if (start === null) return null;

  const total = Math.max(0, Math.floor((now - start) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Jam dinding lokal, HH:MM:SS. */
export function clockOf(iso: string | null | undefined): string | null {
  const ms = parse(iso);
  if (ms === null) return null;
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Tanggal dan jam ringkas, mis. "2 Sep 14:03". */
export function dateTimeOf(iso: string | null | undefined): string | null {
  const ms = parse(iso);
  if (ms === null) return null;
  return new Date(ms).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Delapan karakter pertama sebuah UUID. Cukup untuk membedakan baris di layar,
 * dan tetap bisa dicocokkan dengan log backend.
 */
export function shortId(id: string): string {
  return id.slice(0, 8);
}
