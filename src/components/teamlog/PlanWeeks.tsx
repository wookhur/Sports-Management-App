"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { tl } from "@/lib/teamLogText";

export interface PlanWeekRow {
  weekStart: string;
  range: string;
  unit: string;
  objective: string;
  note: string | null;
}

interface Draft {
  weekStart: string;
  unit: string;
  objective: string;
  note: string;
}

function WeekForm({
  draft,
  setDraft,
  lang,
  onSave,
  onCancel,
  busy,
  editingDate,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  lang: Lang;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
  editingDate: boolean;
}) {
  const s = tl(lang);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-[160px_1fr]"
    >
      {editingDate && (
        <label className="md:col-span-2">
          <span className="label">{s.plan.weekOf}</span>
          <input
            type="date"
            className="input"
            value={draft.weekStart}
            onChange={(e) => setDraft({ ...draft, weekStart: e.target.value })}
            required
          />
        </label>
      )}
      <label>
        <span className="label">{s.plan.unit}</span>
        <input className="input" value={draft.unit} maxLength={80} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} required />
      </label>
      <label>
        <span className="label">{s.plan.objective}</span>
        <input
          className="input"
          value={draft.objective}
          maxLength={300}
          onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
          required
        />
      </label>
      <label className="md:col-span-2">
        <span className="label">
          {s.plan.note} {s.common.optional}
        </span>
        <input className="input" value={draft.note} maxLength={300} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
      </label>
      <div className="flex justify-end gap-2 md:col-span-2">
        <button type="button" className="btn-ghost text-sm" onClick={onCancel}>
          {s.common.cancel}
        </button>
        <button type="submit" className="btn-primary text-sm" disabled={busy}>
          {busy ? s.common.saving : s.common.save}
        </button>
      </div>
    </form>
  );
}

/**
 * The season plan, month by month. The coach can load the ready-made plan,
 * edit any week in place, add a week, or remove one; members only read it.
 * The current week is highlighted so the plan doubles as "where are we".
 */
export default function PlanWeeks({
  teamId,
  lang,
  canEdit,
  thisMonday,
  months,
}: {
  teamId: string;
  lang: Lang;
  canEdit: boolean;
  thisMonday: string;
  months: { key: string; label: string; weeks: PlanWeekRow[] }[];
}) {
  const s = tl(lang);
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ weekStart: thisMonday, unit: "", objective: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const empty = months.length === 0;

  async function call(method: string, body?: unknown, qs = "") {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/teams/${teamId}/plan${qs}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.common.errSave);
      return null;
    }
    return data;
  }

  async function loadTemplate() {
    const data = await call("POST", { template: "soccer-season" });
    if (data) {
      setStatus(s.plan.loaded(data.added));
      router.refresh();
    }
  }

  async function save() {
    const data = await call("PUT", { ...draft, note: draft.note || undefined });
    if (data) {
      setEditing(null);
      router.refresh();
    }
  }

  async function remove(weekStart: string) {
    if (!window.confirm(s.common.confirmDelete)) return;
    if (await call("DELETE", undefined, `?weekStart=${weekStart}`)) router.refresh();
  }

  function startEdit(w: PlanWeekRow) {
    setDraft({ weekStart: w.weekStart, unit: w.unit, objective: w.objective, note: w.note ?? "" });
    setEditing(w.weekStart);
  }

  return (
    <section className="mt-6" aria-labelledby="plan-weeks">
      <h2 id="plan-weeks" className="sr-only">
        {s.plan.title}
      </h2>

      {empty && (
        <div className="card p-6 text-center">
          <p className="text-sm text-slate-600">{canEdit ? s.plan.emptyOwner : s.plan.emptyMember}</p>
          {canEdit && (
            <button type="button" className="btn-primary mt-4 text-sm" onClick={loadTemplate} disabled={busy}>
              {s.plan.load}
            </button>
          )}
        </div>
      )}

      {(status || error) && (
        <p role={error ? "alert" : "status"} className={`mb-3 text-sm ${error ? "text-red-700" : "text-emerald-700"}`}>
          {error ?? status}
        </p>
      )}

      {canEdit && !empty && (
        <div className="mb-3 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-ghost text-sm" onClick={loadTemplate} disabled={busy}>
            {s.plan.loadMore}
          </button>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => {
              setDraft({ weekStart: thisMonday, unit: "", objective: "", note: "" });
              setEditing("new");
            }}
          >
            + {s.plan.addWeek}
          </button>
        </div>
      )}

      {editing === "new" && (
        <div className="mb-4">
          <WeekForm draft={draft} setDraft={setDraft} lang={lang} onSave={save} onCancel={() => setEditing(null)} busy={busy} editingDate />
        </div>
      )}

      <div className="space-y-5">
        {months.map((m) => (
          <div key={m.key}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{m.label}</h3>
            <ul className="card divide-y divide-slate-100">
              {m.weeks.map((w) => {
                const current = w.weekStart === thisMonday;
                return (
                  <li
                    key={w.weekStart}
                    data-current={current || undefined}
                    className={`px-4 py-3 ${current ? "bg-emerald-50" : ""}`}
                    aria-current={current ? "date" : undefined}
                  >
                    {editing === w.weekStart ? (
                      <WeekForm draft={draft} setDraft={setDraft} lang={lang} onSave={save} onCancel={() => setEditing(null)} busy={busy} editingDate={false} />
                    ) : (
                      <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                        <div className="w-28 shrink-0">
                          <p className="text-xs font-semibold tabular-nums text-slate-500">{w.range}</p>
                          {current && <p className="text-[11px] font-bold uppercase text-emerald-700">{s.plan.thisWeek}</p>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-emerald-800">{w.unit}</p>
                          <p className="text-sm">{w.objective}</p>
                          {w.note && <p className="mt-0.5 text-xs font-medium text-amber-700">★ {w.note}</p>}
                        </div>
                        {canEdit && (
                          <div className="flex gap-1 text-xs">
                            <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => startEdit(w)}>
                              {s.common.edit}
                            </button>
                            <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => remove(w.weekStart)}>
                              {s.common.delete}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
