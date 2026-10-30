import Link from "next/link";
import { prisma } from "@/lib/db";
import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { tl } from "@/lib/teamLogText";
import { bt } from "@/lib/bitacoraText";
import { monthLabel, monthsOfYear, schoolYearLabel, yearRange } from "@/lib/season";
import { sheetSemesters, type AttendanceStatusKey } from "@/lib/bitacora";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import { readPeriod } from "@/components/teamlog/TermPicker";
import AttendanceGrid from "@/components/teamlog/AttendanceGrid";

export const dynamic = "force-dynamic";

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * B2, the register as the school keeps it: one month at a time, a column per
 * training day, the five marks in the cells, and the year's totals and
 * per-term rates at the end of each row.
 */
export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const s = tl(lang);
  const g = bt(lang).grid;
  const q = await searchParams;
  const { year, currentYear } = readPeriod(q, today, true);
  const [from, to] = yearRange(year);
  const months = monthsOfYear(year).filter((m) => m <= today.slice(0, 7));

  const [roster, rows] = await Promise.all([
    rosterOf(id),
    prisma.attendance.findMany({
      where: { teamId: id, day: { gte: from, lte: to } },
      select: { userId: true, day: true, status: true },
    }),
  ]);

  const withData = new Set(rows.map((r) => r.day.slice(0, 7)));
  const month =
    q.month && months.includes(q.month)
      ? q.month
      : months.includes(today.slice(0, 7))
        ? today.slice(0, 7)
        : ([...months].reverse().find((m) => withData.has(m)) ?? months[0] ?? `${year}-08`);

  const marks: Record<string, Record<string, AttendanceStatusKey>> = {};
  for (const r of rows) (marks[r.userId] ??= {})[r.day] = r.status;
  const days = [...new Set(rows.filter((r) => r.day.startsWith(month)).map((r) => r.day))].sort();
  const perMonth = new Map<string, number>();
  for (const d of new Set(rows.map((r) => r.day))) perMonth.set(d.slice(0, 7), (perMonth.get(d.slice(0, 7)) ?? 0) + 1);
  const terms = sheetSemesters(year);

  const chip = (href: string, on: boolean, label: React.ReactNode, key: string) => (
    <Link
      key={key}
      href={href}
      aria-current={on ? "true" : undefined}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${on ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );

  return (
    <TeamLogShell
      team={team}
      active="attendance"
      isOwner={isOwner}
      lang={lang}
      code="B2"
      title={s.tabs.attendance}
      sub={g.sub}
      actions={
        <Link href={`/teams/${id}#attendance`} className="btn-primary text-sm">
          {g.takeToday}
        </Link>
      }
    >
      <div className="no-print flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">{s.common.year}</span>
        {[currentYear, currentYear - 1, currentYear - 2].map((y) =>
          chip(`/teams/${id}/attendance?year=${y}`, y === year, schoolYearLabel(y), `y${y}`),
        )}
      </div>
      <nav aria-label={g.month} className="no-print mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">{g.month}</span>
        {months.map((m) =>
          chip(
            `/teams/${id}/attendance?year=${year}&month=${m}`,
            m === month,
            <>
              {cap(monthLabel(m, lang, "short"))}
              {perMonth.get(m) ? <span className="ml-1 opacity-70">{perMonth.get(m)}</span> : null}
            </>,
            m,
          ),
        )}
      </nav>

      {roster.length === 0 ? (
        <div className="card mt-4 p-6 text-center text-sm text-slate-600">{s.common.noMembers}</div>
      ) : (
        <div className="mt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">{cap(monthLabel(month, lang))}</h2>
          <AttendanceGrid
            key={`${year}-${month}`}
            teamId={id}
            lang={lang}
            roster={roster.map((r) => ({ userId: r.userId, name: r.user.name, number: r.number }))}
            month={month}
            today={today}
            days={days}
            marks={marks}
            terms={terms}
          />
        </div>
      )}
    </TeamLogShell>
  );
}
