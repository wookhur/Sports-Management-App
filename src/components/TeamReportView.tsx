import Link from "next/link";
import type { TeamReport } from "@/lib/report";
import { REPORT_WEEK_OPTIONS } from "@/lib/report";
import { t, metricLabel, type Lang } from "@/lib/i18n";
import { formatDayKey, formatDuration } from "@/lib/format";
import PrintButton from "./PrintButton";

function hours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function TeamReportView({
  lang,
  report,
  coachName,
  weeks,
}: {
  lang: Lang;
  report: TeamReport;
  coachName: string;
  weeks: number;
}) {
  const s = t(lang).report;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      {/* Controls — screen only. */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/coach" className="text-sm font-semibold text-brand hover:underline">
          ← {s.back}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">{s.periodLabel}</span>
          {REPORT_WEEK_OPTIONS.map((w) => (
            <Link
              key={w}
              href={`/coach/report?weeks=${w}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                w === weeks ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.periodOption(w)}
            </Link>
          ))}
          <PrintButton label={s.print} />
        </div>
      </div>

      {report.squadSize === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">{s.empty}</div>
      ) : (
        <article className="card p-8 print:border-0 print:p-0">
          {/* Letterhead */}
          <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{s.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{s.subtitle(coachName)}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-700">
                {formatDayKey(report.period.from, lang)} – {formatDayKey(report.period.to, lang)}
              </p>
              <p>{s.generated(formatDayKey(report.period.to, lang))}</p>
              <p className="mt-1 font-bold tracking-tight text-slate-900">Sideline365</p>
            </div>
          </header>

          {/* Headline numbers */}
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label={s.statSquad}
              value={String(report.squadSize)}
              hint={s.statActive(report.totals.activeAthletes)}
            />
            <Stat label={s.statSessions} value={String(report.totals.sessions)} />
            <Stat label={s.statHours} value={s.unitHours(hours(report.totals.minutes))} />
            <Stat label={s.statAttendance} value={pct(report.totals.attendance)} />
            <Stat label={s.statPbs} value={String(report.totals.pbs)} />
          </section>

          {/* Participation table */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">{s.participation}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{s.participationHint}</p>
            <div className="mt-3 overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-y border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3 font-semibold">{s.colAthlete}</th>
                    <th className="py-2 pr-3 text-right font-semibold">{s.colSessions}</th>
                    <th className="py-2 pr-3 text-right font-semibold">{s.colHours}</th>
                    <th className="py-2 pr-3 text-right font-semibold">{s.colDays}</th>
                    <th className="py-2 pr-3 text-right font-semibold">{s.colAttendance}</th>
                    <th className="py-2 pr-3 text-right font-semibold">{s.colRpe}</th>
                    <th className="py-2 text-right font-semibold">{s.colPbs}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr key={r.athleteId} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium">
                        {r.name}
                        {r.sessions === 0 && (
                          <span className="ml-2 text-[11px] font-normal text-slate-400">{s.noSessions}</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{r.sessions}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{hours(r.minutes)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {r.activeDays}/{report.period.days}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{pct(r.attendance)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{r.avgRpe ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">{r.pbs || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* The good news — what parents actually want to read. */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">🏅 {s.highlights}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{s.highlightsHint}</p>
            {report.highlights.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">{s.noHighlights}</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {report.highlights.map((h, i) => (
                  <li key={`${h.athleteId}-${h.metricKey}-${i}`} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-sm">
                      <span className="font-semibold">{h.name}</span>
                      <span className="ml-2 text-slate-500">{metricLabel(h.metricKey, h.metricName, lang)}</span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">
                      <span className="font-bold">{formatDuration(h.durationMs)}</span>
                      <span className="ml-2 text-xs text-slate-400">{formatDayKey(h.day, lang)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Observations — deliberately non-diagnostic; see src/lib/report.ts. */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">{s.watch}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{s.watchHint}</p>
            {report.watch.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">{s.noWatch}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {report.watch.map((w) => (
                  <li key={`${w.athleteId}-${w.kind}`} className="rounded-lg border border-slate-200 px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{w.name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {s.watchKind[w.kind]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {w.kind === "loadJump"
                        ? s.watchReason.loadJump(w.value ?? 0)
                        : s.watchReason.inactive(w.value)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="mt-8 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-400">
            {s.footer}
          </footer>
        </article>
      )}
    </div>
  );
}
