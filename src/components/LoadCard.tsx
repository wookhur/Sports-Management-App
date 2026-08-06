import { CHRONIC_DAYS, type LoadSummary } from "@/lib/load";
import { t, type Lang } from "@/lib/i18n";

const ZONE_STYLE: Record<string, { chip: string; bar: string }> = {
  detraining: { chip: "bg-sky-50 text-sky-700", bar: "bg-sky-400" },
  optimal: { chip: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  caution: { chip: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
  high: { chip: "bg-red-50 text-red-700", bar: "bg-red-500" },
  unknown: { chip: "bg-slate-100 text-slate-600", bar: "bg-slate-300" },
};

/** Athlete-facing view of the training-load engine. */
export default function LoadCard({ lang, summary }: { lang: Lang; summary: LoadSummary }) {
  const s = t(lang).load;
  const style = ZONE_STYLE[summary.zone] ?? ZONE_STYLE.unknown;
  const peak = Math.max(1, ...summary.daily.map((d) => d.load));

  const trend =
    summary.prevWeekTotal > 0
      ? Math.round(((summary.weekTotal - summary.prevWeekTotal) / summary.prevWeekTotal) * 100)
      : null;

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{s.title}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums">{Math.round(summary.weekTotal)}</span>
            <span className="text-xs text-slate-500">{s.weekLoad}</span>
            {/* sky-700, not sky-500: the lighter blue is 3.0:1 on white and
                fails AA. Both arrows carry the same weight as text. */}
            {trend != null && trend !== 0 && (
              <span className={`text-sm font-bold ${trend > 0 ? "text-amber-700" : "text-sky-700"}`}>
                {trend > 0 ? "▲" : "▼"}
                {Math.abs(trend)}%
              </span>
            )}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.chip}`}>
          {summary.acwr == null ? s.building : `${s.zone[summary.zone]} · ${summary.acwr.toFixed(2)}`}
        </span>
      </div>

      {/* 28-day daily load sparkline */}
      <div className="mt-4 flex h-14 items-end gap-[3px]" aria-hidden="true">
        {summary.daily.map((d) => (
          <div key={d.day} className="flex-1 rounded-sm bg-slate-100" style={{ height: "100%" }}>
            <div
              className={`w-full rounded-sm ${style.bar}`}
              style={{ height: `${Math.round((d.load / peak) * 100)}%`, marginTop: `${100 - Math.round((d.load / peak) * 100)}%` }}
            />
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {s.activeDays(summary.activeDays, CHRONIC_DAYS)}
      </p>

      <p className="mt-3 text-sm text-slate-600">
        {summary.acwr == null ? s.buildingHint : s.zoneHint[summary.zone]}
      </p>

      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
        ⓘ {s.disclaimer}
      </p>
    </section>
  );
}
