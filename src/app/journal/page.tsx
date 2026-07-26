import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import JournalForm from "@/components/JournalForm";
import DeleteSessionButton from "@/components/DeleteSessionButton";
import RoybotAvatar from "@/components/RoybotAvatar";
import { ScoreCard } from "@/components/TrainingScoreCard";
import { journalOverview, VOLUME_TARGET_MIN, type JournalOverview } from "@/lib/trainingScore";
import { formatDuration } from "@/lib/format";
import { SPORT_I18N, metricLabel, t, type Lang } from "@/lib/i18n";
import { getSport } from "@/lib/sports";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const KIND_EMOJI: Record<string, string> = {
  technique: "🎯",
  strength: "💪",
  cardio: "🏃",
  match: "🏆",
  recovery: "🧘",
};

/** Rule-based coach feedback: safety first, then celebration, then tips. */
function feedbackLines(o: JournalOverview, lang: Lang): string[] {
  const s = t(lang).journal;
  const { today, warnings, firstDay } = o;
  const nothingToday = o.sessionsToday.length === 0 && o.recordsToday.length === 0;

  if (firstDay && nothingToday) return [s.fbStart];

  const lines: string[] = [];
  if (today.pbCount > 0) lines.push(s.fbPb(today.pbCount));
  if (warnings.overtraining) lines.push(s.fbOvertrain);
  if (warnings.needRest) lines.push(s.fbRest);
  if (today.total >= 80) lines.push(s.fbGreat);
  else if (today.total >= 55) lines.push(s.fbGood);
  if (today.parts.volume < 20) lines.push(s.fbVolumeLow(VOLUME_TARGET_MIN));
  if (today.avgRpe != null && today.avgRpe < 5 && !warnings.overtraining) lines.push(s.fbIntensityLow);
  if (today.parts.measurement === 0) lines.push(s.fbMeasureTip);
  if (today.parts.consistency === 0 && !firstDay) lines.push(s.fbConsistency);
  return lines.slice(0, 3);
}

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).journal;
  const o = await journalOverview(session.userId);
  const lines = feedbackLines(o, lang);
  const weekAvg = Math.round(o.week.reduce((sum, d) => sum + d.total, 0) / o.week.length);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">📓 {s.title}</h1>
          <p className="mt-1 text-slate-500">{s.subtitle}</p>
        </header>

        <div className="space-y-5">
          <ScoreCard
            lang={lang}
            score={{ total: o.today.total, parts: o.today.parts, minutes: o.today.minutes }}
            yesterdayTotal={o.yesterdayTotal}
            warnings={o.warnings}
          />

          {/* AI coach (Roybot) feedback bubble */}
          {lines.length > 0 && (
            <div className="flex gap-3">
              <RoybotAvatar tier="intermediate" className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                <p className="mb-1 text-xs font-bold text-slate-500">{s.coachName}</p>
                <ul className="space-y-1 text-sm leading-relaxed text-slate-700">
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <JournalForm lang={lang} />

          {/* Today's journal entries */}
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {s.todaySessions}
            </h2>
            {o.sessionsToday.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-500">{s.emptyToday}</div>
            ) : (
              <div className="card divide-y divide-slate-100">
                {o.sessionsToday.map((e) => {
                  const sport = getSport(e.sport);
                  const sportName = SPORT_I18N[e.sport]?.[lang]?.name ?? sport?.name ?? e.sport;
                  return (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg"
                        aria-hidden="true"
                      >
                        {KIND_EMOJI[e.kind]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {sport?.emoji} {sportName} · {s.kinds[e.kind]}
                        </p>
                        <p className="text-xs text-slate-400">
                          {s.minutesVal(e.minutes)} · RPE {e.intensity}
                          {e.notes ? ` · ${e.notes}` : ""}
                        </p>
                      </div>
                      <DeleteSessionButton id={e.id} lang={lang} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Today's timed records (from the existing stopwatch/manual entry) */}
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {s.todayRecords}
            </h2>
            {o.recordsToday.length === 0 ? (
              <div className="card flex items-center justify-between p-5">
                <p className="text-sm text-slate-500">⏱️ {s.fbMeasureTip}</p>
                <Link href="/records" className="shrink-0 text-sm font-semibold text-brand">
                  {s.measureCta}
                </Link>
              </div>
            ) : (
              <div className="card divide-y divide-slate-100">
                {o.recordsToday.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm font-medium">
                      {metricLabel(r.metricKey, r.metricName, lang)}
                      {r.isPb && (
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
                          🏆 {s.pbBadge}
                        </span>
                      )}
                    </p>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatDuration(r.durationMs)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trailing 7-day score strip */}
          <section>
            <h2 className="mb-2 flex items-baseline justify-between text-sm font-semibold uppercase tracking-wide text-slate-400">
              <span>{s.weekTitle}</span>
              <span className="font-normal normal-case text-slate-400">{s.weekAvg(weekAvg)}</span>
            </h2>
            <div className="card flex items-end justify-between gap-2 p-5">
              {o.week.map((d, i) => {
                const isToday = i === o.week.length - 1;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                      {d.total > 0 ? d.total : ""}
                    </span>
                    <div className="flex h-24 w-full max-w-[36px] items-end rounded-lg bg-slate-100">
                      <div
                        className={`w-full rounded-lg transition-all ${isToday ? "bg-brand" : "bg-brand/40"}`}
                        style={{ height: `${Math.max(d.total, d.active ? 4 : 0)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs tabular-nums ${
                        isToday ? "font-bold text-brand" : "text-slate-400"
                      }`}
                    >
                      {d.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
