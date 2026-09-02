/**
 * Label status ride. Bentuknya kecil dan berbingkai supaya bisa dipakai di
 * dalam baris tabel tanpa mendominasi, dan warnanya dibedakan dengan aturan
 * yang sama di semua halaman:
 *
 *   active    → amber, satu-satunya keadaan "sedang berjalan"
 *   completed → moss
 *   cancelled → merah tua
 *   lain      → netral (termasuk `planned` dan status baru yang belum dikenal)
 *
 * Amber tidak pernah dipakai sebagai teks di atas permukaan terang secara
 * langsung — kontrasnya cuma 2,4:1. Yang dipakai `--t-amber-ink`.
 */
export default function StatusChip({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'text-amber-ink border-amber/60 bg-amber/10'
      : status === 'completed'
        ? 'text-moss border-moss/40 bg-moss-soft'
        : status === 'cancelled'
          ? 'text-danger-ink border-danger-ink/35 bg-danger-ink/8'
          : 'text-muted border-line bg-transparent';

  return (
    <span
      className={`ops-eyebrow inline-flex shrink-0 items-center rounded border px-1.5 py-[3px] text-[10px] leading-none ${tone}`}
    >
      {status || 'unknown'}
    </span>
  );
}
