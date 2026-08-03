import type { Triage, TriageItem, Flag } from "@/lib/triage";
import { t, type Lang } from "@/lib/i18n";

const FLAG_STYLE: Record<Flag, { dot: string; chip: string; edge: string }> = {
  injuryRisk: { dot: "🔴", chip: "bg-red-50 text-red-700", edge: "border-l-red-400" },
  disengaged: { dot: "🟠", chip: "bg-orange-50 text-orange-700", edge: "border-l-orange-400" },
  plateau: { dot: "🟡", chip: "bg-amber-50 text-amber-700", edge: "border-l-amber-300" },
  breakthrough: { dot: "🟢", chip: "bg-emerald-50 text-emerald-700", edge: "border-l-emerald-400" },
};

/** The one-line explanation of why this athlete is in the list. */
function reasonFor(item: TriageItem, s: ReturnType<typeof t>["triage"]): string {
  switch (item.flag) {
    case "injuryRisk":
      return s.reason.injuryRisk(item.value);
    case "disengaged":
      return s.reason.disengaged(item.value);
    case "plateau":
      return s.reason.plateau(item.value ?? 0, item.sessions14);
    case "breakthrough":
      return s.reason.breakthrough(item.value ?? 0);
  }
}

export default function AttentionList({ lang, triage }: { lang: Lang; triage: Triage }) {
  const s = t(lang).triage;
  const good = triage.counts.breakthrough;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold">🎯 {s.title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{s.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {triage.actionable > 0 && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {s.actionable(triage.actionable)}
            </span>
          )}
          {good > 0 && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {s.goodNews(good)}
            </span>
          )}
        </div>
      </div>

      {triage.items.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-600">{s.clear}</p>
          <p className="mt-1 text-xs text-slate-500">{s.clearHint}</p>
        </div>
      ) : (
        <ul className="grid gap-3 p-5 sm:grid-cols-2">
          {triage.items.map((item) => {
            const style = FLAG_STYLE[item.flag];
            return (
              <li
                key={item.athleteId}
                className={`rounded-xl border border-slate-100 border-l-4 bg-white p-4 ${style.edge}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${style.chip}`}>
                    {style.dot} {s.label[item.flag]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{reasonFor(item, s)}</p>
                <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                  → {s.action[item.flag]}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <p className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500">ⓘ {s.disclaimer}</p>
    </section>
  );
}
