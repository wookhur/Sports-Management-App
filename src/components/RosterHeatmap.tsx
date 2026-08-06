import type { Roster } from "@/lib/roster";
import { t, type Lang } from "@/lib/i18n";

// GitHub-contribution-style shading: empty → busiest day in the squad.
const LEVEL_BG = [
  "bg-slate-100",
  "bg-brand/20",
  "bg-brand/45",
  "bg-brand/70",
  "bg-brand",
] as const;

const ZONE_CHIP: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  caution: "bg-amber-50 text-amber-700",
  optimal: "bg-emerald-50 text-emerald-700",
  detraining: "bg-sky-50 text-sky-700",
  unknown: "bg-slate-100 text-slate-600",
};

export default function RosterHeatmap({ lang, roster }: { lang: Lang; roster: Roster }) {
  const s = t(lang).roster;
  const load = t(lang).load;

  if (roster.rows.length === 0) {
    return (
      <section className="card p-8 text-center">
        <h2 className="text-lg font-bold">📊 {s.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{s.empty}</p>
        <p className="mt-1 text-xs text-slate-500">{s.emptyHint}</p>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      {/* No "needs attention" count here — the triage list above owns that
          judgement, and two counts on one screen would eventually disagree. */}
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold">📊 {s.title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{s.subtitle}</p>
      </div>

      {/* Column headings */}
      <div className="hidden items-center gap-3 px-5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:flex">
        <span className="w-32 shrink-0">{s.athlete}</span>
        <span className="flex-1">{s.last14}</span>
        <span className="w-24 shrink-0 text-right">{s.weekLoad}</span>
        <span className="w-24 shrink-0 text-right">{s.status}</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {roster.rows.map((r) => (
          <li key={r.athleteId} className="flex flex-wrap items-center gap-3 px-5 py-3">
            {/* Name + recency */}
            <div className="w-32 shrink-0">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <p className="text-[11px] text-slate-500">
                {r.daysSinceActive == null
                  ? s.neverLogged
                  : r.daysSinceActive === 0
                    ? s.activeToday
                    : s.daysAgo(r.daysSinceActive)}
              </p>
            </div>

            {/* 14-day heatmap */}
            <div className="flex min-w-[140px] flex-1 gap-[3px]">
              {r.cells.map((c, i) => (
                <span
                  key={c.day}
                  title={`${c.day} · ${Math.round(c.load)}`}
                  className={`h-6 flex-1 rounded-sm ${LEVEL_BG[c.level]} ${
                    i === r.cells.length - 1 ? "ring-1 ring-slate-300" : ""
                  }`}
                />
              ))}
            </div>

            {/* Weekly load */}
            <div className="w-24 shrink-0 text-right">
              <p className="text-sm font-bold tabular-nums">{r.weekLoad}</p>
              <p className="text-[11px] text-slate-500">{s.sessionsIn14(r.sessions14)}</p>
            </div>

            {/* Zone */}
            <div className="w-24 shrink-0 text-right">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ZONE_CHIP[r.zone]}`}>
                {r.acwr == null ? load.building : `${load.zone[r.zone]} ${r.acwr.toFixed(2)}`}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Legend + honest framing */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>{s.legendLess}</span>
          {LEVEL_BG.map((bg, i) => (
            <span key={i} className={`h-3 w-3 rounded-sm ${bg}`} />
          ))}
          <span>{s.legendMore}</span>
        </div>
        <p className="text-[11px] text-slate-500">ⓘ {s.disclaimer}</p>
      </div>
    </section>
  );
}
