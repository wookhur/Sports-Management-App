// Roybot — the Sideline365 mascot / AI coach. A friendly robot head with a
// glowing face screen, antenna, and side ear-pieces, tinted by coaching tier:
//   beginner → blue, intermediate → green, pro → purple.
// Self-contained SVG (no image asset), crisp at any size.

export type RoybotTier = "beginner" | "intermediate" | "pro";

const TIER_COLOR: Record<RoybotTier, string> = {
  beginner: "#3b82f6",
  intermediate: "#22c55e",
  pro: "#a855f7",
};

export default function RoybotAvatar({
  tier = "intermediate",
  className = "h-12 w-12",
}: {
  tier?: RoybotTier;
  className?: string;
}) {
  const c = TIER_COLOR[tier];
  const glowId = `rb-glow-${tier}`;

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Roybot">
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="60" y1="24" x2="60" y2="10" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="8" r="5" fill={c} />

      {/* Shoulders / bust */}
      <path d="M28 108v-6a32 32 0 0 1 64 0v6Z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="60" cy="104" r="8" fill="#0b1220" />
      <circle cx="60" cy="104" r="8" fill="none" stroke={c} strokeWidth="2" />

      {/* Ear pieces */}
      <circle cx="28" cy="56" r="8" fill={c} />
      <circle cx="92" cy="56" r="8" fill={c} />

      {/* Head */}
      <rect x="30" y="26" width="60" height="58" rx="22" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

      {/* Face screen */}
      <rect x="38" y="34" width="44" height="40" rx="16" fill="#0b1220" />

      {/* Glowing happy eyes + smile */}
      <g stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" filter={`url(#${glowId})`}>
        <path d="M45 52 Q51 45 57 52" />
        <path d="M63 52 Q69 45 75 52" />
      </g>
      <g stroke={c} strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M45 52 Q51 45 57 52" />
        <path d="M63 52 Q69 45 75 52" />
        <path d="M52 62 Q60 68 68 62" strokeWidth="3" />
      </g>
    </svg>
  );
}
