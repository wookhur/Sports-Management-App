import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export interface TeamAssignmentGroup {
  /** Title + the moment it was given — one fan-out is one group. */
  key: string;
  title: string;
  linkHref: string | null;
  givenAt: string;
  total: number;
  done: number;
  /** Who hasn't finished, so the coach knows who to nudge. */
  outstanding: string[];
}

const L: Record<
  Lang,
  {
    heading: string;
    empty: string;
    progress: (done: number, total: number) => string;
    allDone: string;
    outstanding: (names: string) => string;
    andMore: (n: number) => string;
  }
> = {
  ko: {
    heading: "팀 과제",
    empty: "아직 이 팀에 낸 과제가 없어요. 위에서 보내면 여기서 누가 끝냈는지 볼 수 있어요.",
    progress: (done, total) => `${total}명 중 ${done}명 완료`,
    allDone: "전원 완료",
    outstanding: (names) => `아직: ${names}`,
    andMore: (n) => ` 외 ${n}명`,
  },
  en: {
    heading: "Team assignments",
    empty: "Nothing assigned to this team yet. Send one above and you'll see who has finished it here.",
    progress: (done, total) => `${done} of ${total} done`,
    allDone: "Everyone's done",
    outstanding: (names) => `Still to do: ${names}`,
    andMore: (n) => ` and ${n} more`,
  },
  es: {
    heading: "Tareas del equipo",
    empty: "Todavía no hay tareas para este equipo. Envía una arriba y aquí verás quién la ha terminado.",
    progress: (done, total) => `${done} de ${total} completadas`,
    allDone: "Todos la han terminado",
    outstanding: (names) => `Pendientes: ${names}`,
    andMore: (n) => ` y ${n} más`,
  },
};

const MAX_NAMES = 4;

/**
 * What the team has been set, and how much of it is done.
 *
 * An assignment given to a team is one row per athlete underneath — completion
 * is personal — so the coach dashboard shows it nine times. Here the nine rows
 * are one line: the assignment, how many have finished, and who hasn't.
 */
export default function TeamAssignments({
  groups,
  lang = "en",
  children,
}: {
  groups: TeamAssignmentGroup[];
  lang?: Lang;
  /** The way to add one (the team page's form), shown above the list. */
  children?: React.ReactNode;
}) {
  const s = L[lang];
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{s.heading}</h2>
      {children && <div className="mb-4">{children}</div>}
      {groups.length === 0 ? (
        <div className="card p-6 text-sm leading-relaxed text-slate-600">{s.empty}</div>
      ) : (
        <ul className="card divide-y divide-slate-100">
          {groups.map((g) => {
            const complete = g.done === g.total;
            const shown = g.outstanding.slice(0, MAX_NAMES);
            const rest = g.outstanding.length - shown.length;
            return (
              <li key={g.key} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0">
                    {g.linkHref ? (
                      <Link href={g.linkHref} className="font-semibold text-slate-800 hover:text-brand">
                        {g.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-slate-800">{g.title}</p>
                    )}
                    <p className="text-xs text-slate-500">{formatDate(g.givenAt, lang)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      complete ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {complete ? s.allDone : s.progress(g.done, g.total)}
                  </span>
                </div>
                {/* Proportion bar: read at a glance, exact figure in the chip. */}
                <div aria-hidden="true" className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${complete ? "bg-emerald-500" : "bg-brand"}`}
                    style={{ width: `${g.total ? (g.done / g.total) * 100 : 0}%` }}
                  />
                </div>
                {!complete && (
                  <p className="mt-2 text-xs text-slate-600">
                    {s.outstanding(shown.join(", "))}
                    {rest > 0 && s.andMore(rest)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
