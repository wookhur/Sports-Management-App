import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { nextStep, type FirstRunState } from "@/lib/firstRun";

/**
 * Shown until the account has actually done something. Derived from real data,
 * so ticking a step off requires doing it — and the card removes itself once
 * everything is done rather than lingering as another thing to dismiss.
 */
export default function FirstRunCard({ lang, state }: { lang: Lang; state: FirstRunState }) {
  if (!state.show) return null;

  const s = t(lang).firstRun;
  const next = nextStep(state);
  const total = state.items.length;

  return (
    <section className="card overflow-hidden border-brand/20">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 bg-brand/5 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold">🚀 {s.title}</h2>
          <p className="mt-0.5 text-sm text-slate-600">{s.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">
          {s.progress(state.doneCount, total)}
        </span>
      </div>

      <ol className="divide-y divide-slate-100">
        {state.items.map((item) => {
          const copy = s.step[item.step];
          const isNext = next?.step === item.step;
          return (
            <li key={item.step} className="flex items-center gap-3 px-5 py-3">
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.done ? "✓" : ""}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${item.done ? "text-slate-500 line-through" : ""}`}>
                  {copy.title}
                </p>
                {!item.done && <p className="text-xs text-slate-500">{copy.body}</p>}
              </div>
              {!item.done && (
                <Link
                  href={item.href}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    isNext ? "bg-brand text-white hover:bg-brand-dark" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.go}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
