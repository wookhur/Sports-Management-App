// The mission-hub pet. An egg that gains cracks as it nears hatching, then a
// cute blue bird that grows through sub-stages. Pure SVG, driven by `growth`.

import { petState, HATCH } from "@/lib/pet";

export default function PetAvatar({ growth, className = "h-32 w-32" }: { growth: number; className?: string }) {
  const st = petState(growth);
  return st.stage === "egg" ? (
    <Egg pct={st.hatchPct} className={className} />
  ) : (
    <Bird sub={st.sub} className={className} />
  );
}

function Egg({ pct, className }: { pct: number; className: string }) {
  const near = pct >= 0.8; // wobble when almost ready
  return (
    <svg viewBox="0 0 120 130" className={`${className} ${near ? "rb-wobble" : ""}`} role="img" aria-label="Egg">
      <defs>
        <linearGradient id="egg-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffef7" />
          <stop offset="100%" stopColor="#f4ead0" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="60" cy="122" rx="26" ry="5" fill="#0f172a" opacity="0.08" />
      {/* egg body */}
      <path
        d="M60 12c22 0 38 30 38 56a38 40 0 0 1-76 0c0-26 16-56 38-56Z"
        fill="url(#egg-g)"
        stroke="#e4d6b3"
        strokeWidth="2"
      />
      {/* speckles */}
      <g fill="#cbb887">
        <circle cx="44" cy="52" r="2.4" />
        <circle cx="74" cy="44" r="1.8" />
        <circle cx="70" cy="72" r="2.6" />
        <circle cx="48" cy="82" r="2" />
        <circle cx="60" cy="96" r="1.6" />
      </g>
      {/* cracks appear progressively */}
      {pct >= 0.4 && (
        <polyline points="34,62 44,58 40,66 52,62" fill="none" stroke="#a8935f" strokeWidth="2" strokeLinejoin="round" />
      )}
      {pct >= 0.6 && (
        <polyline points="70,54 80,58 74,64 86,62" fill="none" stroke="#a8935f" strokeWidth="2" strokeLinejoin="round" />
      )}
      {pct >= 0.85 && (
        <polyline
          points="30,70 46,66 40,74 58,70 52,78 72,74 66,82 88,78"
          fill="none"
          stroke="#8a7748"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      )}
      <style>{`
        @keyframes rb-wobble { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
        .rb-wobble { animation: rb-wobble 1.2s ease-in-out infinite; transform-origin: 60px 110px; }
        @media (prefers-reduced-motion: reduce){ .rb-wobble{animation:none} }
      `}</style>
    </svg>
  );
}

function Bird({ sub, className }: { sub: string; className: string }) {
  const k = sub === "baby" ? 0.82 : sub === "young" ? 0.95 : 1.08;
  return (
    <svg viewBox="0 0 120 130" className={className} role="img" aria-label="Bird">
      {/* shadow */}
      <ellipse cx="60" cy="122" rx="28" ry="5" fill="#0f172a" opacity="0.08" />
      <g transform={`translate(60 70) scale(${k}) translate(-60 -70)`}>
        {/* head tuft */}
        <g fill="#2563eb">
          <path d="M52 30l4-12 4 10Z" />
          <path d="M60 28l4-13 5 11Z" />
          <path d="M68 31l6-10 3 11Z" />
        </g>
        {/* wings */}
        <ellipse cx="26" cy="74" rx="12" ry="20" fill="#2563eb" transform="rotate(20 26 74)" />
        <ellipse cx="94" cy="74" rx="12" ry="20" fill="#2563eb" transform="rotate(-20 94 74)" />
        {/* body */}
        <ellipse cx="60" cy="70" rx="34" ry="37" fill="#3b82f6" stroke="#1e40af" strokeWidth="2.5" />
        {/* belly */}
        <ellipse cx="60" cy="82" rx="22" ry="25" fill="#ffffff" />
        {/* cheeks */}
        <circle cx="42" cy="66" r="5" fill="#fb7185" opacity="0.5" />
        <circle cx="78" cy="66" r="5" fill="#fb7185" opacity="0.5" />
        {/* eyes */}
        <circle cx="50" cy="56" r="5.5" fill="#0f172a" />
        <circle cx="70" cy="56" r="5.5" fill="#0f172a" />
        <circle cx="48.4" cy="54.2" r="1.8" fill="#ffffff" />
        <circle cx="68.4" cy="54.2" r="1.8" fill="#ffffff" />
        {/* beak */}
        <path d="M60 62l7 6-7 5-7-5Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
        {/* 365 on belly */}
        <text x="60" y="90" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#93a2b8">365</text>
        {/* feet */}
        <path d="M50 104l-3 6M52 104l0 7M54 104l3 6" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M66 104l-3 6M68 104l0 7M70 104l3 6" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
