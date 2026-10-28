import Link from "next/link";
import NavBar from "@/components/NavBar";
import type { Lang } from "@/lib/i18n";
import { tl } from "@/lib/teamLogText";
import { bt } from "@/lib/bitacoraText";

export type TeamTab =
  | "overview"
  | "bitacora"
  | "goals"
  | "roster"
  | "attendance"
  | "matches"
  | "evaluations"
  | "plan"
  | "season"
  | "events"
  | "self-eval";

// In the order of the school's workbook, after the team page and the hub.
const OWNER_TABS: TeamTab[] = [
  "overview",
  "bitacora",
  "goals",
  "roster",
  "attendance",
  "matches",
  "evaluations",
  "plan",
  "season",
  "events",
  "self-eval",
];
const MEMBER_TABS: TeamTab[] = ["overview", "plan", "matches"];

/** The workbook sheet each tab stands for. */
const SHEET: Partial<Record<TeamTab, string>> = {
  goals: "STA-GRAL",
  roster: "B1",
  attendance: "B2",
  matches: "B3",
  evaluations: "B4",
  plan: "B5",
  season: "R-FI",
  events: "S-EVE",
  "self-eval": "A-EV",
};

export function tabLabel(tab: TeamTab, lang: Lang): string {
  const s = tl(lang).tabs;
  const h = bt(lang).hub;
  const name =
    tab === "bitacora"
      ? h.tab
      : tab === "goals"
        ? h.sheets.sta.name
        : tab === "events"
          ? h.sheets.seve.name
          : tab === "self-eval"
            ? h.sheets.aev.name
            : tab === "season"
              ? h.sheets.rfi.name
              : s[tab];
  return name;
}

export function TeamTabs({ teamId, active, isOwner, lang }: { teamId: string; active: TeamTab; isOwner: boolean; lang: Lang }) {
  const s = tl(lang).tabs;
  return (
    <nav aria-label={s.overview} className="no-print -mx-1 mt-4 flex gap-1 overflow-x-auto pb-1">
      {(isOwner ? OWNER_TABS : MEMBER_TABS).map((tab) => {
        const href = tab === "overview" ? `/teams/${teamId}` : `/teams/${teamId}/${tab}`;
        const code = isOwner ? SHEET[tab] : undefined;
        const on = tab === active;
        return (
          <Link
            key={tab}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {code && <span className="mr-1 text-[10px] font-bold">{code} </span>}
            {tabLabel(tab, lang)}
          </Link>
        );
      })}
    </nav>
  );
}

/** Frame for the team log pages: nav bar, team name, tabs. */
export default function TeamLogShell({
  team,
  active,
  isOwner,
  lang,
  title,
  sub,
  code,
  actions,
  children,
}: {
  team: { id: string; name: string; category: string | null; branch: string | null };
  active: TeamTab;
  isOwner: boolean;
  lang: Lang;
  title: string;
  sub?: string;
  /** The workbook sheet this page is, shown before the team name. */
  code?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const meta = [team.category, team.branch].filter(Boolean).join(" · ");
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:p-0">
        <Link href={`/teams/${team.id}`} className="no-print text-sm text-slate-500 hover:text-slate-600">
          ← {team.name}
        </Link>
        <TeamTabs teamId={team.id} active={active} isOwner={isOwner} lang={lang} />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {code && <span className="mr-1.5 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">{code}</span>}
              {team.name}
              {meta ? ` · ${meta}` : ""}
            </p>
            <h1 className="mt-0.5 text-2xl font-bold">{title}</h1>
            {sub && <p className="mt-1 max-w-2xl text-sm text-slate-600">{sub}</p>}
          </div>
          {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </>
  );
}
