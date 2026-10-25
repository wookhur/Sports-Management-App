import Link from "next/link";
import { prisma } from "@/lib/db";
import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { tl } from "@/lib/teamLogText";
import { monthLabel, monthsOfYear, termRange, yearRange } from "@/lib/season";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import TermPicker, { readPeriod } from "@/components/teamlog/TermPicker";

export const dynamic = "force-dynamic";

/**
 * Attendance month by month, the way a school register is kept: for each
 * player, how many sessions they attended each month, and over the period the
 * totals of attended, absent and excused, with a rate.
 */
export default async function AttendanceHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; term?: string }>;
}) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const s = tl(lang);
  const { year, term, currentYear } = readPeriod(await searchParams, today, false);
  const [from, to] = term ? termRange(term) : yearRange(year);
  const months = monthsOfYear(year).filter((m) => m >= from.slice(0, 7) && m <= to.slice(0, 7) && m <= today.slice(0, 7));

  const [roster, rows] = await Promise.all([
    rosterOf(id),
    prisma.attendance.findMany({
      where: { teamId: id, day: { gte: from, lte: to } },
      select: { userId: true, day: true, present: true, excused: true },
    }),
  ]);
  const sessions = new Set(rows.map((r) => r.day)).size;
  const tally = new Map<string, { months: Map<string, number>; present: number; absent: number; excused: number }>();
  for (const r of rows) {
    const t = tally.get(r.userId) ?? { months: new Map(), present: 0, absent: 0, excused: 0 };
    if (r.present) {
      t.present += 1;
      const m = r.day.slice(0, 7);
      t.months.set(m, (t.months.get(m) ?? 0) + 1);
    } else if (r.excused) t.excused += 1;
    else t.absent += 1;
    tally.set(r.userId, t);
  }

  return (
    <TeamLogShell
      team={team}
      active="attendance"
      isOwner={isOwner}
      lang={lang}
      title={s.attendance.history}
      sub={s.attendance.historySub}
      actions={
        <Link href={`/teams/${id}#attendance`} className="btn-primary text-sm">
          {s.attendance.takeRegister}
        </Link>
      }
    >
      <TermPicker basePath={`/teams/${id}/attendance`} year={year} term={term} currentYear={currentYear} lang={lang} />
      <p className="mt-3 text-sm text-slate-600">{s.attendance.sessions(sessions)}</p>

      {roster.length === 0 ? (
        <div className="card mt-4 p-6 text-center text-sm text-slate-600">{s.common.noMembers}</div>
      ) : rows.length === 0 ? (
        <div className="card mt-4 p-6 text-center text-sm text-slate-600">{s.attendance.noData}</div>
      ) : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="px-4 py-2 text-left font-semibold">{s.common.player}</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-2 text-center font-semibold">
                    {monthLabel(m, lang, "short")}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-semibold text-emerald-700">{s.attendance.present}</th>
                <th className="px-2 py-2 text-center font-semibold">{s.attendance.absent}</th>
                <th className="px-2 py-2 text-center font-semibold text-amber-700">{s.attendance.excused}</th>
                <th className="px-3 py-2 text-right font-semibold">{s.attendance.rate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.map((m) => {
                const t = tally.get(m.userId);
                const marked = t ? t.present + t.absent + t.excused : 0;
                const rate = marked ? Math.round(((t?.present ?? 0) / marked) * 100) : null;
                return (
                  <tr key={m.userId}>
                    <td className="px-4 py-2 font-medium">
                      {m.number != null && <span className="mr-1.5 tabular-nums text-slate-500">{m.number}</span>}
                      {m.user.name}
                    </td>
                    {months.map((mo) => (
                      <td key={mo} className="px-2 py-2 text-center tabular-nums text-slate-600">
                        {t?.months.get(mo) ?? "·"}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-semibold tabular-nums text-emerald-700">{t?.present ?? 0}</td>
                    <td className="px-2 py-2 text-center tabular-nums">{t?.absent ?? 0}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-amber-700">{t?.excused ?? 0}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{rate == null ? "–" : `${rate}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TeamLogShell>
  );
}
