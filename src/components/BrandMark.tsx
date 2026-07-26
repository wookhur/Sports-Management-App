// The Sideline365 logo mark: a dark disc with five green "sideline" stripes
// (brightest in the middle) and "365" set across the lower half. Self-contained
// SVG so it stays crisp at any size and needs no image asset.
export default function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  // Five stripes: outer→center get taller and brighter.
  const stripes = [
    { x: 16, h: 26, color: "#15803d" },
    { x: 24, h: 32, color: "#16a34a" },
    { x: 32, h: 38, color: "#22c55e" },
    { x: 40, h: 32, color: "#16a34a" },
    { x: 48, h: 26, color: "#15803d" },
  ];
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Sideline365">
      <circle cx="32" cy="32" r="32" fill="#111827" />
      {stripes.map((s) => (
        <rect
          key={s.x}
          x={s.x - 2}
          y={32 - s.h / 2}
          width="4"
          height={s.h}
          rx="2"
          fill={s.color}
        />
      ))}
      <text
        x="32"
        y="45"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        365
      </text>
    </svg>
  );
}
