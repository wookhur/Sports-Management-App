import Link from "next/link";
import { prisma } from "@/lib/db";
import { loadTeamPage } from "@/lib/teamPage";
import { bt } from "@/lib/bitacoraText";
import { readDoc } from "@/lib/bitacora";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import { readPeriod } from "@/components/teamlog/TermPicker";
import YearChips from "@/components/teamlog/YearChips";
import SelfEvalForm from "@/components/teamlog/SelfEvalForm";

export const dynamic = "force-dynamic";

export default async function SelfEvalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; kind?: string }>;
}) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const t = bt(lang).self;
  const q = await searchParams;
  const { year, currentYear } = readPeriod(q, today, true);
  // Mid-year until January, the final one after.
  const kind = q.kind === "final" || (q.kind !== "term" && today > `${year + 1}-01-15`) ? "selfEvalFinal" : "selfEvalTerm";
  const row = await prisma.teamSeasonDoc.findUnique({ where: { teamId_year_kind: { teamId: id, year, kind } } });

  const tab = (k: "term" | "final", label: string, on: boolean) => (
    <Link
      href={`/teams/${id}/self-eval?year=${year}&kind=${k}`}
      aria-current={on ? "true" : undefined}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );

  return (
    <TeamLogShell
      team={team}
      active="self-eval"
      code="A-EV"
      isOwner={isOwner}
      lang={lang}
      title={t.title}
      sub={t.sub}
      actions={
        <a href={`/api/teams/${id}/export?year=${year}&aev=${kind === "selfEvalFinal" ? "final" : "term"}`} className="btn-ghost text-sm" download>
          {t.download}
        </a>
      }
    >
      <YearChips basePath={`/teams/${id}/self-eval`} year={year} currentYear={currentYear} lang={lang} />
      <div className="no-print mt-2 flex flex-wrap gap-2">
        {tab("term", t.term(year), kind === "selfEvalTerm")}
        {tab("final", t.final(year + 1), kind === "selfEvalFinal")}
      </div>
      <div className="mt-4">
        <SelfEvalForm key={`${year}-${kind}`} teamId={id} year={year} kind={kind} lang={lang} initial={readDoc(kind, row?.data)} />
      </div>
    </TeamLogShell>
  );
}
