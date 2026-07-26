// Roybot — the Sideline365 mascot / AI coach, drawn to match the character
// sheet: a friendly white robot with a big glossy black face screen, glowing
// happy eyes, round ear-pods, an antenna, and the green "365" chest badge.
// Tinted by coaching tier: beginner → blue, intermediate → green, pro → purple.
// Self-contained SVG (no image asset), crisp at any size.

export type RoybotTier = "beginner" | "intermediate" | "pro";

const TIERS: Record<RoybotTier, { glow: string; solid: string; deep: string }> = {
  beginner: { glow: "#38bdf8", solid: "#2563eb", deep: "#1d4ed8" },
  intermediate: { glow: "#4ade80", solid: "#16a34a", deep: "#15803d" },
  pro: { glow: "#c084fc", solid: "#7c3aed", deep: "#6d28d9" },
};

export default function RoybotAvatar({
  tier = "intermediate",
  className = "h-12 w-12",
}: {
  tier?: RoybotTier;
  className?: string;
}) {
  const c = TIERS[tier];
  const uid = `rb-${tier}`;

  return (
    <svg viewBox="0 0 128 140" className={className} role="img" aria-label="Roybot">
      <defs>
        <linearGradient id={`${uid}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8edf3" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbfcfe" />
          <stop offset="100%" stopColor="#dfe5ec" />
        </linearGradient>
        <radialGradient id={`${uid}-pod`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={c.glow} />
          <stop offset="70%" stopColor={c.solid} />
          <stop offset="100%" stopColor={c.deep} />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="64" y1="26" x2="64" y2="12" stroke="#c3cdda" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="64" cy="9" r="5.5" fill={c.solid} />
      <circle cx="62" cy="7.4" r="1.7" fill="#ffffff" opacity="0.85" />

      {/* Shoulders / body */}
      <path
        d="M22 140v-7a42 42 0 0 1 84 0v7Z"
        fill={`url(#${uid}-body)`}
        stroke="#dbe2ea"
        strokeWidth="1.5"
      />
      {/* shoulder accents */}
      <path d="M22 133a42 42 0 0 1 14-30v37H22Z" fill={c.solid} opacity="0.18" />
      <path d="M106 133a42 42 0 0 0-14-30v37h14Z" fill={c.solid} opacity="0.18" />

      {/* 365 chest badge */}
      <rect x="49" y="106" width="30" height="24" rx="7" fill="#0b1220" />
      <rect x="55" y="111" width="2.4" height="12" rx="1.2" fill="#15803d" />
      <rect x="59.5" y="109.5" width="2.4" height="15" rx="1.2" fill="#16a34a" />
      <rect x="63.8" y="108.5" width="2.4" height="17" rx="1.2" fill="#22c55e" />
      <rect x="68.1" y="109.5" width="2.4" height="15" rx="1.2" fill="#16a34a" />
      <rect x="72.6" y="111" width="2.4" height="12" rx="1.2" fill="#15803d" />
      <text x="64" y="123.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#ffffff" letterSpacing="-0.4">365</text>

      {/* Ear-pods (behind head) */}
      <circle cx="27" cy="60" r="13" fill={`url(#${uid}-pod)`} stroke="#cdd5df" strokeWidth="1" />
      <circle cx="27" cy="60" r="6" fill={c.deep} />
      <circle cx="101" cy="60" r="13" fill={`url(#${uid}-pod)`} stroke="#cdd5df" strokeWidth="1" />
      <circle cx="101" cy="60" r="6" fill={c.deep} />

      {/* Head */}
      <rect x="30" y="26" width="68" height="66" rx="30" fill={`url(#${uid}-head)`} stroke="#dbe2ea" strokeWidth="1.5" />

      {/* Face screen */}
      <rect x="40" y="35" width="48" height="46" rx="22" fill="#0a0f1a" />
      <ellipse cx="56" cy="46" rx="14" ry="8" fill="#ffffff" opacity="0.06" />

      {/* Glowing happy eyes + smile */}
      <g stroke={c.glow} fill="none" strokeLinecap="round" filter={`url(#${uid}-glow)`}>
        <path d="M48 60 Q54.5 50 61 60" strokeWidth="5" />
        <path d="M67 60 Q73.5 50 80 60" strokeWidth="5" />
      </g>
      <g stroke={c.glow} fill="none" strokeLinecap="round">
        <path d="M48 60 Q54.5 50 61 60" strokeWidth="4.2" />
        <path d="M67 60 Q73.5 50 80 60" strokeWidth="4.2" />
        <path d="M56 69 Q64 76 72 69" strokeWidth="3.4" />
      </g>
    </svg>
  );
}
