import { prisma } from "@/lib/db";
import { loadTeamPage } from "@/lib/teamPage";
import { bt } from "@/lib/bitacoraText";
import { readDoc } from "@/lib/bitacora";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import { readPeriod } from "@/components/teamlog/TermPicker";
import YearChips from "@/components/teamlog/YearChips";
import GoalsForm from "@/components/teamlog/GoalsForm";

export const dynamic = "force-dynamic";

export default async function GoalsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ year?: string }> }) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const t = bt(lang).goals;
  const { year, currentYear } = readPeriod(await searchParams, today, true);
  const row = await prisma.teamSeasonDoc.findUnique({ where: { teamId_year_kind: { teamId: id, year, kind: "goals" } } });

  return (
    <TeamLogShell team={team} active="goals" code="STA-GRAL" isOwner={isOwner} lang={lang} title={t.title} sub={t.sub}>
      <YearChips basePath={`/teams/${id}/goals`} year={year} currentYear={currentYear} lang={lang} />
      <div className="mt-4">
        <GoalsForm key={year} teamId={id} year={year} lang={lang} initial={readDoc("goals", row?.data)} />
      </div>
    </TeamLogShell>
  );
}
