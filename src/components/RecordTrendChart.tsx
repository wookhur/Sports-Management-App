"use client";

import { useMemo, useState } from "react";
import { formatDuration } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

export interface TrendPoint {
  /** ISO date string */
  date: string;
  ms: number;
}

const L: Record<
  Lang,
  {
    caption: string;
    improved: (delta: string) => string;
    trend: string;
    chartAria: (metricName: string, best: string) => string;
  }
> = {
  ko: {
    caption: "낮을수록 좋아요 · 🏆 최고 기록",
    improved: (delta) => `▼ ${delta} 단축`,
    trend: "기록 추이",
    chartAria: (metricName, best) => `${metricName} 기록 추이, 최고 기록 ${best}`,
  },
  en: {
    caption: "Lower is better · 🏆 best time",
    improved: (delta) => `▼ ${delta} faster`,
    trend: "Trend",
    chartAria: (metricName, best) => `${metricName} time trend, best time ${best}`,
  },
  es: {
    caption: "Cuanto más bajo, mejor · 🏆 mejor marca",
    improved: (delta) => `▼ ${delta} menos`,
    trend: "Tendencia",
    chartAria: (metricName, best) => `Tendencia de ${metricName}, mejor marca ${best}`,
  },
};

const DATE_LOCALE: Record<Lang, string> = { ko: "ko-KR", en: "en-US", es: "es-ES" };

// Single-series line chart of one metric's times (lower = better), brand
// blue on the light surface, recessive grid, hover tooltip, PB highlighted.
export default function RecordTrendChart({
  metricName,
  points,
  lang = "ko",
}: {
  metricName: string;
  points: TrendPoint[];
  lang?: Lang;
}) {
  const s = L[lang];
  const dateLocale = DATE_LOCALE[lang];
  const [hover, setHover] = useState<number | null>(null);

  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 26, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const { xs, ys, ticks, bestIdx } = useMemo(() => {
    const times = points.map((p) => new Date(p.date).getTime());
    const values = points.map((p) => p.ms);
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const vMin = Math.min(...values);
    const vMax = Math.max(...values);
    // Pad the value range so the line never sits on the frame edge.
    const spread = Math.max(vMax - vMin, 1000);
    const lo = Math.max(0, vMin - spread * 0.15);
    const hi = vMax + spread * 0.15;

    const x = (t: number) => (tMax === tMin ? innerW / 2 : ((t - tMin) / (tMax - tMin)) * innerW);
    const y = (v: number) => innerH - ((v - lo) / (hi - lo)) * innerH;

    return {
      xs: times.map(x),
      ys: values.map(y),
      ticks: [lo + (hi - lo) * 0.15, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.85].map((v) => ({
        v,
        y: y(v),
      })),
      bestIdx: values.indexOf(vMin),
    };
  }, [points, innerW, innerH]);

  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W - PAD.left;
    let nearest = 0;
    let bestD = Infinity;
    xs.forEach((x, i) => {
      const d = Math.abs(x - px);
      if (d < bestD) {
        bestD = d;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  const first = points[0];
  const last = points[points.length - 1];
  const improvedMs = first && last ? first.ms - last.ms : 0;

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold text-slate-800">{metricName}</h3>
        <span className={`text-xs font-medium ${improvedMs > 0 ? "text-emerald-600" : "text-slate-400"}`}>
          {improvedMs > 0 ? s.improved(formatDuration(improvedMs)) : s.trend}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-400">{s.caption}</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={s.chartAria(metricName, formatDuration(points[bestIdx].ms))}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Recessive grid + y tick labels (time, tabular) */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={0} x2={innerW} y1={t.y} y2={t.y} stroke="#e2e8f0" strokeWidth={1} />
              <text
                x={-8}
                y={t.y + 3.5}
                textAnchor="end"
                className="fill-slate-400"
                style={{ font: "10px ui-monospace, monospace" }}
              >
                {formatDuration(Math.round(t.v))}
              </text>
            </g>
          ))}

          {/* X labels: first / last date */}
          <text x={0} y={innerH + 18} className="fill-slate-400" style={{ font: "10px sans-serif" }}>
            {new Date(first.date).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
          </text>
          <text
            x={innerW}
            y={innerH + 18}
            textAnchor="end"
            className="fill-slate-400"
            style={{ font: "10px sans-serif" }}
          >
            {new Date(last.date).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
          </text>

          {/* Series line */}
          <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Markers: 8px, PB gets a ring + fill */}
          {xs.map((x, i) => {
            const isBest = i === bestIdx;
            const isHover = i === hover;
            return (
              <g key={i}>
                {(isBest || isHover) && (
                  <circle cx={x} cy={ys[i]} r={7} fill="none" stroke={isBest ? "#2563eb" : "#94a3b8"} strokeWidth={1.5} opacity={0.5} />
                )}
                <circle
                  cx={x}
                  cy={ys[i]}
                  r={4}
                  fill={isBest ? "#2563eb" : "#fff"}
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {/* PB direct label (selective — only the best point) */}
          <text
            x={xs[bestIdx]}
            y={ys[bestIdx] - 12}
            textAnchor="middle"
            className="fill-slate-700"
            style={{ font: "bold 11px ui-monospace, monospace" }}
          >
            🏆 {formatDuration(points[bestIdx].ms)}
          </text>

          {/* Hover crosshair + tooltip */}
          {hover != null && hover !== bestIdx && (
            <g pointerEvents="none">
              <line x1={xs[hover]} x2={xs[hover]} y1={0} y2={innerH} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
              <g transform={`translate(${Math.min(Math.max(xs[hover] - 55, 0), innerW - 110)},${Math.max(ys[hover] - 44, 0)})`}>
                <rect width={110} height={32} rx={6} fill="#0f172a" opacity={0.92} />
                <text x={55} y={13} textAnchor="middle" fill="#cbd5e1" style={{ font: "9px sans-serif" }}>
                  {new Date(points[hover].date).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
                </text>
                <text x={55} y={26} textAnchor="middle" fill="#fff" style={{ font: "bold 11px ui-monospace, monospace" }}>
                  {formatDuration(points[hover].ms)}
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
