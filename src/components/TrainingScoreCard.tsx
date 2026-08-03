// Presentational score card for the daily training score — styled after a
// diet app's meal-score card (big number + delta, macro-style part chips, a
// stacked percent bar, and warning chips that sit grayed-out until active).
// Server-renderable: pure props, no hooks.

import Link from "next/link";
import { PART_MAX } from "@/lib/trainingScore";
import { t, type Lang } from "@/lib/i18n";

export interface ScoreView {
  total: number;
  parts: { volume: number; intensity: number; measurement: number; consistency: number };
  minutes: number;
}

export function tierEmoji(total: number): string {
  if (total >= 80) return "🏆";
  if (total >= 60) return "💪";
  if (total >= 30) return "🙂";
  if (total > 0) return "🌱";
  return "📝";
}

const PART_COLORS = {
  volume: "#7c3aed", // violet — like the 탄 chip
  intensity: "#2563eb", // blue — 단
  measurement: "#0f766e", // teal — 지 (dark enough to carry white text)
  consistency: "#b45309", // amber
} as const;

function Delta({ diff }: { diff: number }) {
  if (diff === 0) return null;
  const up = diff > 0;
  return (
    <span className={`text-base font-bold ${up ? "text-blue-600" : "text-red-600"}`}>
      {up ? "▲" : "▼"}
      {Math.abs(diff)}
    </span>
  );
}

export function ScoreCard({
  lang,
  score,
  yesterdayTotal,
  warnings,
}: {
  lang: Lang;
  score: ScoreView;
  yesterdayTotal: number;
  warnings: { overtraining: boolean; needRest: boolean };
}) {
  const s = t(lang).journal;
  const parts = [
    { key: "volume", label: s.partVolume, val: score.parts.volume, max: PART_MAX.volume },
    { key: "intensity", label: s.partIntensity, val: score.parts.intensity, max: PART_MAX.intensity },
    { key: "measurement", label: s.partMeasure, val: score.parts.measurement, max: PART_MAX.measurement },
    { key: "consistency", label: s.partConsistency, val: score.parts.consistency, max: PART_MAX.consistency },
  ] as const;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{s.scoreTitle}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums">{s.pts(score.total)}</span>
            <Delta diff={score.total - yesterdayTotal} />
          </p>
        </div>
        <span className="text-5xl leading-none" aria-hidden="true">
          {tierEmoji(score.total)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">{s.minutesLabel}</span>
        <span className="font-bold tabular-nums">{s.minutesVal(score.minutes)}</span>
      </div>

      {/* Macro-style part chips */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {parts.map((p) => (
          <span key={p.key} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: PART_COLORS[p.key] }}
            />
            <span className="text-slate-500">{p.label}</span>
            <span className="font-bold tabular-nums">
              {p.val}
              <span className="font-normal text-slate-500">/{p.max}</span>
            </span>
          </span>
        ))}
      </div>

      {/* Stacked percent bar (out of 100) */}
      <div className="mt-2 flex h-6 overflow-hidden rounded-lg bg-slate-100">
        {parts.map(
          (p) =>
            p.val > 0 && (
              <div
                key={p.key}
                className="flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${p.val}%`, backgroundColor: PART_COLORS[p.key] }}
              >
                {p.val >= 10 ? `${p.val}` : ""}
              </div>
            ),
        )}
      </div>

      {/* Warning chips — grayed until they fire, like the diet card */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            warnings.overtraining ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-500"
          }`}
        >
          ⚠️ {s.warnOver}
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            warnings.needRest ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-500"
          }`}
        >
          😴 {s.warnRest}
        </span>
      </div>
    </div>
  );
}

/** Compact variant for the home dashboard. */
export function HomeScoreCard({
  lang,
  total,
  yesterdayTotal,
  minutes,
}: {
  lang: Lang;
  total: number;
  yesterdayTotal: number;
  minutes: number;
}) {
  const s = t(lang).journal;
  return (
    <Link
      href="/journal"
      className="card flex items-center justify-between gap-4 p-5 transition hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl leading-none" aria-hidden="true">
          {tierEmoji(total)}
        </span>
        <div>
          <p className="text-sm text-slate-500">{s.scoreTitle}</p>
          {total > 0 || minutes > 0 ? (
            <p className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tabular-nums">{s.pts(total)}</span>
              <Delta diff={total - yesterdayTotal} />
              <span className="text-xs text-slate-500">{s.minutesVal(minutes)}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-600">{s.homeEmpty}</p>
          )}
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold text-brand">{s.homeCta}</span>
    </Link>
  );
}
