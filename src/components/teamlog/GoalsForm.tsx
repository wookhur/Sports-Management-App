"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { GoalsDoc } from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";
import { putJson, SaveBadge, useAutosave } from "./useAutosave";

/** STA-GRAL: the season's objectives and goals, saved as the coach types. */
export default function GoalsForm({ teamId, year, lang, initial }: { teamId: string; year: number; lang: Lang; initial: GoalsDoc }) {
  const t = bt(lang).goals;
  const [objectives, setObjectives] = useState(initial.objectives.join("\n"));
  const [doc, setDoc] = useState({ general: initial.general, specific: initial.specific, teacher: initial.teacher });
  const lines = objectives
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 18);
  const state = useAutosave({ ...doc, objectives: lines }, (data) => putJson(`/api/teams/${teamId}/docs/goals`, { year, data }));

  const area = (k: keyof typeof doc, label: string, rows = 5) => (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <textarea
        name={k}
        rows={rows}
        maxLength={4000}
        className="input mt-1.5 text-sm"
        value={doc[k]}
        onChange={(e) => setDoc({ ...doc, [k]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <SaveBadge state={state} lang={lang} />
      </div>
      <section className="card p-5">
        <label className="block">
          <span className="text-sm font-bold">{t.objectives}</span>
          <span className="ml-2 text-xs text-slate-600">{t.objectivesHint}</span>
          <textarea
            name="objectives"
            rows={8}
            className="input mt-1.5 text-sm"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </label>
        {lines.length > 0 && (
          <ol className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 shrink-0 text-right font-bold tabular-nums text-slate-500">{i + 1}</span>
                <span className="min-w-0">{l}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <section className="card space-y-5 p-5">
        {area("general", t.general)}
        {area("specific", t.specific)}
        {area("teacher", t.teacher, 4)}
      </section>
    </div>
  );
}
