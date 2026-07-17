import type { DiagramSpec } from "@/lib/soccerDrills";
import type { Lang } from "@/lib/i18n";

const ARIA_LABEL: Record<Lang, string> = {
  ko: "드릴 다이어그램",
  en: "Drill diagram",
  es: "Diagrama del ejercicio",
};

// Renders a soccer drill as an original SVG pitch diagram. Coordinates are on a
// 100 x 64 field (0,0 = top-left). Arrow types: pass (dashed), run (solid),
// dribble (wavy). Not derived from any third-party artwork.
export default function DrillDiagram({
  spec,
  className = "",
  lang = "ko",
}: {
  spec: DiagramSpec;
  className?: string;
  lang?: Lang;
}) {
  return (
    <svg viewBox="0 0 100 64" className={`w-full rounded-xl ${className}`} role="img" aria-label={ARIA_LABEL[lang]}>
      <defs>
        <marker id="dd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#0f172a" />
        </marker>
        <marker id="dd-arrow-pass" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#2563eb" />
        </marker>
      </defs>

      {/* Pitch */}
      <rect x="0" y="0" width="100" height="64" rx="3" fill="#15803d" />
      <rect x="0" y="0" width="100" height="64" rx="3" fill="url(#dd-stripes)" opacity="0.08" />
      <pattern id="dd-stripes" width="10" height="64" patternUnits="userSpaceOnUse">
        <rect width="5" height="64" fill="#ffffff" />
      </pattern>
      <rect x="2" y="2" width="96" height="60" rx="2" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
      <line x1="50" y1="2" x2="50" y2="62" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
      <circle cx="50" cy="32" r="8" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />

      {/* Goals */}
      {spec.goals?.map((g, i) => (
        <rect
          key={`g${i}`}
          x={g.x - 1}
          y={g.y - 5}
          width="2"
          height="10"
          fill="none"
          stroke="#fef08a"
          strokeWidth="1.2"
        />
      ))}

      {/* Movement arrows */}
      {spec.arrows?.map((a, i) => {
        if (a.type === "dribble") {
          return <DribblePath key={`a${i}`} {...a} />;
        }
        const dashed = a.type === "pass";
        return (
          <line
            key={`a${i}`}
            x1={a.x1}
            y1={a.y1}
            x2={a.x2}
            y2={a.y2}
            stroke={dashed ? "#2563eb" : "#0f172a"}
            strokeWidth="0.9"
            strokeDasharray={dashed ? "2.5 1.8" : undefined}
            markerEnd={`url(#${dashed ? "dd-arrow-pass" : "dd-arrow"})`}
          />
        );
      })}

      {/* Cones */}
      {spec.cones?.map((c, i) => (
        <path
          key={`c${i}`}
          d={`M${c.x} ${c.y - 2.2}L${c.x + 1.8} ${c.y + 1.6}L${c.x - 1.8} ${c.y + 1.6}z`}
          fill="#f97316"
          stroke="#c2410c"
          strokeWidth="0.3"
        />
      ))}

      {/* Ball */}
      {spec.ball && (
        <circle cx={spec.ball.x} cy={spec.ball.y} r="1.7" fill="#ffffff" stroke="#0f172a" strokeWidth="0.4" />
      )}

      {/* Players */}
      {spec.players?.map((p, i) => {
        const fill = p.team === "b" ? "#ef4444" : p.team === "n" ? "#e2e8f0" : "#2563eb";
        const text = p.team === "n" ? "#0f172a" : "#ffffff";
        return (
          <g key={`p${i}`}>
            <circle cx={p.x} cy={p.y} r="2.6" fill={fill} stroke="#ffffff" strokeWidth="0.5" />
            {p.label && (
              <text x={p.x} y={p.y + 1} fontSize="3" fontWeight="700" textAnchor="middle" fill={text}>
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DribblePath({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  // Build a small sine wave along the segment to signify dribbling.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len; // normal
  const ny = dx / len;
  const segs = Math.max(4, Math.round(len / 4));
  const amp = 1.3;
  let d = `M${x1} ${y1}`;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const bx = x1 + dx * t;
    const by = y1 + dy * t;
    const off = i % 2 === 0 ? amp : -amp;
    d += ` Q${bx + nx * off} ${by + ny * off} ${bx} ${by}`;
  }
  return <path d={d} fill="none" stroke="#0f172a" strokeWidth="0.9" markerEnd="url(#dd-arrow)" />;
}
