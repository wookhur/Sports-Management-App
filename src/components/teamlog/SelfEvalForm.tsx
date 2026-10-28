"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import {
  SELF_EVAL,
  SELF_EVAL_LEVEL_LABEL,
  SELF_EVAL_LEVELS,
  effectiveness,
  sectionAverage,
  type SelfEvalDoc,
} from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";
import { putJson, SaveBadge, useAutosave } from "./useAutosave";

/**
 * A-EV: the coach's half of the department's evaluation. One choice per
 * point in the "Maestro" column with the STA standard for each level a tap
 * away, a note, and the section averages and range the workbook computes.
 */
export default function SelfEvalForm({
  teamId,
  year,
  kind,
  lang,
  initial,
}: {
  teamId: string;
  year: number;
  kind: "selfEvalTerm" | "selfEvalFinal";
  lang: Lang;
  initial: SelfEvalDoc;
}) {
  const t = bt(lang).self;
  const levels = SELF_EVAL_LEVEL_LABEL[lang];
  const [doc, setDoc] = useState<SelfEvalDoc>(initial);
  const state = useAutosave(doc, (data) => putJson(`/api/teams/${teamId}/docs/${kind}`, { year, data }));
  const averages = SELF_EVAL.map((sec) => sectionAverage(sec, doc.scores));
  const total = averages.every((a) => a != null) ? Math.round(averages.reduce((a, b) => a! + b!, 0)! * 100) / 100 : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{t.date}</span>
          <input type="date" name="date" className="input py-1 text-sm" value={doc.date} onChange={(e) => setDoc({ ...doc, date: e.target.value })} />
        </label>
        <SaveBadge state={state} lang={lang} />
      </div>

      {SELF_EVAL.map((sec, si) => (
        <section key={sec.key} className="card overflow-hidden">
          <h2 className="bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-900">
            {sec.title[lang]} · {sec.items.length}
          </h2>
          <ul className="divide-y divide-slate-100">
            {sec.items.map((item, i) => (
              <li key={item.key} className="px-4 py-3">
                {sec.subheads?.[i] && <p className="mb-2 text-xs font-bold uppercase text-slate-600">{sec.subheads[i][lang]}</p>}
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)] md:items-start">
                  <div className="text-sm">
                    <p className="font-medium">{item[lang]}</p>
                    <details className="mt-1 text-xs text-slate-600">
                      <summary className="cursor-pointer font-semibold text-brand">{t.standards}</summary>
                      <ul className="mt-1 space-y-0.5 pl-3">
                        {SELF_EVAL_LEVELS.map((lv, k) =>
                          item.sta[k] ? (
                            <li key={lv}>
                              <strong>{levels[lv]}:</strong> {item.sta[k]}
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </details>
                  </div>
                  <select
                    aria-label={`${item[lang]} · ${t.teacher}`}
                    className="input py-1.5 text-sm"
                    value={doc.scores[item.key] ?? ""}
                    onChange={(e) => {
                      const scores = { ...doc.scores };
                      if (e.target.value) scores[item.key] = Number(e.target.value);
                      else delete scores[item.key];
                      setDoc({ ...doc, scores });
                    }}
                  >
                    <option value="">{t.choose}</option>
                    {SELF_EVAL_LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv} · {levels[lv]}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input py-1.5 text-sm"
                    aria-label={`${item[lang]} · ${t.notes}`}
                    placeholder={t.notes}
                    maxLength={500}
                    value={doc.notes[item.key] ?? ""}
                    onChange={(e) => setDoc({ ...doc, notes: { ...doc.notes, [item.key]: e.target.value } })}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t border-slate-200 px-4 py-2 text-sm font-bold">
            <span>{t.average}</span>
            <span className="tabular-nums" data-testid={`avg-${sec.key}`}>
              {averages[si] ?? "–"}
            </span>
          </p>
        </section>
      ))}

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-600">{t.overall}</p>
          {total == null ? (
            <p className="mt-1 text-sm text-slate-600">{t.pending}</p>
          ) : (
            <p className="mt-1 text-3xl font-extrabold tabular-nums" data-testid="self-total">
              {total} <span className="text-base text-emerald-800">{t.ranges[effectiveness(total)]}</span>
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600">{t.rangeTitle}</p>
          <ul className="mt-1 text-xs leading-relaxed text-slate-700">
            {t.rangeLines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
