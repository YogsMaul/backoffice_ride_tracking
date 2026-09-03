// Ilustrasi SVG ringan untuk halaman auth (Login/Forgot/Verify/Reset).
// Tema: papan konsol dengan peta rute + pin + mobil yang lagi bergerak.
// Semua warna pakai token dispatch (currentColor + CSS variables) supaya
// konsisten dengan light/dark mode.

interface DispatchIllustrationProps {
  className?: string;
}

export default function DispatchIllustration({ className = '' }: DispatchIllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="Ilustrasi papan dispatch: peta rute, pin, dan mobil yang sedang bergerak"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Papan / frame */}
      <rect
        x="20"
        y="20"
        width="360"
        height="260"
        rx="14"
        className="fill-card stroke-line"
        strokeWidth="1.5"
      />

      {/* Header bar: title strip + indicator live */}
      <rect x="20" y="20" width="360" height="36" rx="14" className="fill-dispatch" />
      <rect x="20" y="42" width="360" height="14" className="fill-dispatch" />
      <circle cx="40" cy="38" r="4" className="fill-amber ops-pulse" />
      <rect x="52" y="34" width="60" height="8" rx="2" className="fill-dispatch-muted" opacity="0.6" />
      <rect x="120" y="34" width="40" height="8" rx="2" className="fill-dispatch-muted" opacity="0.4" />

      {/* Garis grid peta (hairline) */}
      <g className="stroke-line" strokeWidth="0.8" opacity="0.5">
        <line x1="60" y1="80" x2="340" y2="80" />
        <line x1="60" y1="120" x2="340" y2="120" />
        <line x1="60" y1="160" x2="340" y2="160" />
        <line x1="60" y1="200" x2="340" y2="200" />
        <line x1="60" y1="240" x2="340" y2="240" />
        <line x1="100" y1="60" x2="100" y2="260" />
        <line x1="160" y1="60" x2="160" y2="260" />
        <line x1="220" y1="60" x2="220" y2="260" />
        <line x1="280" y1="60" x2="280" y2="260" />
        <line x1="320" y1="60" x2="320" y2="260" />
      </g>

      {/* Rute: dari pojok kiri bawah ke kanan atas, dengan tikungan */}
      <path
        d="M 70 240 Q 110 240 130 220 T 200 180 T 280 120 T 330 80"
        className="stroke-moss"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="0"
      />

      {/* Shadow / trail di belakang mobil */}
      <path
        d="M 70 240 Q 110 240 130 220 T 200 180 T 280 120"
        className="stroke-moss"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.18"
      />

      {/* Pin start (abu) */}
      <g transform="translate(70, 240)">
        <circle r="8" className="fill-card stroke-muted" strokeWidth="2" />
        <circle r="3" className="fill-muted" />
      </g>

      {/* Pin waypoint */}
      <g transform="translate(200, 180)">
        <circle r="6" className="fill-card stroke-line" strokeWidth="2" />
        <circle r="2" className="fill-moss" />
      </g>

      {/* Pin end (moss, lebih besar) */}
      <g transform="translate(330, 80)">
        <circle r="10" className="fill-card stroke-moss" strokeWidth="2.5" />
        <path
          d="M 0 -4 L 3 0 L 0 4 L -3 0 Z"
          className="fill-moss"
        />
      </g>

      {/* Mobil: bergerak di sepanjang rute, looping */}
      <g className="ops-ride">
        <circle r="11" className="fill-dispatch" />
        <circle r="11" className="fill-amber ops-pulse-fast" opacity="0.5" />
        <circle r="4" className="fill-amber-on-dispatch" />
      </g>

      {/* Stat card kecil di pojok kanan bawah */}
      <g transform="translate(248, 232)">
        <rect width="112" height="36" rx="6" className="fill-card stroke-line" strokeWidth="1" />
        <rect x="8" y="8" width="24" height="3" rx="1.5" className="fill-moss-soft" />
        <rect x="8" y="16" width="40" height="8" rx="2" className="fill-ink" opacity="0.85" />
        <rect x="8" y="28" width="60" height="3" rx="1.5" className="fill-muted" opacity="0.4" />
        <circle cx="98" cy="18" r="6" className="fill-moss" />
        <path
          d="M 95 18 L 97.5 20.5 L 101 16.5"
          className="stroke-card"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Tick / chevron di pojok kiri atas seperti indicator board */}
      <g transform="translate(40, 80)">
        <rect width="44" height="18" rx="3" className="fill-moss-soft" />
        <text
          x="22"
          y="12"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          fontWeight="600"
          className="fill-moss"
        >
          R-13
        </text>
      </g>
    </svg>
  );
}
