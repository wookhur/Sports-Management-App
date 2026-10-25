"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { MATCH_KINDS, matchResult, tl, type MatchKindKey } from "@/lib/teamLogText";

export interface MatchRow {
  id: string;
  day: string;
  dayLabel: string;
  opponent: string;
  kind: MatchKindKey;
  competition: string | null;
  goalsFor: number;
  goalsAgainst: number;
  note: string | null;
  players: string[];
}

interface Draft {
  day: string;
  opponent: string;
  kind: MatchKindKey;
  competition: string;
  goalsFor: string;
  goalsAgainst: string;
  note: string;
  players: string[];
}

const RESULT_STYLE = { W: "bg-emerald-600", D: "bg-slate-500", L: "bg-rose-600" } as const;

export function ResultChip({ goalsFor, goalsAgainst, lang }: { goalsFor: number; goalsAgainst: number; lang: Lang }) {
  const r = matchResult(goalsFor, goalsAgainst);
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white ${RESULT_STYLE[r]}`}>
      {tl(lang).matches.result[r]}
    </span>
  );
}

function blank(today: string, roster: { userId: string }[]): Draft {
  return {
    day: today,
    opponent: "",
    kind: "LEAGUE",
    competition: "",
    goalsFor: "0",
    goalsAgainst: "0",
    note: "",
    players: roster.map((r) => r.userId),
  };
}

/**
 * The match log. The coach adds and edits results here; everyone on the team
 * sees the list. "Who played" starts with the whole roster ticked, since on a
 * school team most players play most games and it's quicker to untick.
 */
export default function MatchBoard({
  teamId,
  lang,
  canEdit,
  today,
  roster,
  matches,
}: {
  teamId: string;
  lang: Lang;
  canEdit: boolean;
  today: string;
  roster: { userId: string; name: string; number: number | null }[];
  matches: MatchRow[];
}) {
  const s = tl(lang);
  const m = s.matches;
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => blank(today, roster));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const names = new Map(roster.map((r) => [r.userId, r.name]));

  function open(row?: MatchRow) {
    setError(null);
    if (!row) {
      setDraft(blank(today, roster));
      setEditing("new");
      return;
    }
    setDraft({
      day: row.day,
      opponent: row.opponent,
      kind: row.kind,
      competition: row.competition ?? "",
      goalsFor: String(row.goalsFor),
      goalsAgainst: String(row.goalsAgainst),
      note: row.note ?? "",
      players: row.players,
    });
    setEditing(row.id);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.opponent.trim()) {
      setError(m.errOpponent);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(editing === "new" ? `/api/teams/${teamId}/matches` : `/api/teams/${teamId}/matches/${editing}`, {
      method: editing === "new" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: draft.day,
        opponent: draft.opponent,
        kind: draft.kind,
        competition: draft.competition || undefined,
        goalsFor: Number(draft.goalsFor) || 0,
        goalsAgainst: Number(draft.goalsAgainst) || 0,
        note: draft.note || undefined,
        players: draft.players,
      }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.common.errSave);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(s.common.confirmDelete)) return;
    const res = await fetch(`/api/teams/${teamId}/matches/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const togglePlayer = (id: string) =>
    setDraft((d) => ({ ...d, players: d.players.includes(id) ? d.players.filter((p) => p !== id) : [...d.players, id] }));

  const form = (
    <form onSubmit={save} className="card space-y-3 p-5" aria-label={m.add}>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <label>
          <span className="label">{m.date}</span>
          <input type="date" className="input" value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })} required />
        </label>
        <label className="md:col-span-2">
          <span className="label">{m.opponent}</span>
          <input
            name="opponent"
            className="input"
            value={draft.opponent}
            maxLength={80}
            onChange={(e) => setDraft({ ...draft, opponent: e.target.value })}
            required
          />
        </label>
        <label>
          <span className="label">{m.kind}</span>
          <select className="input" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as MatchKindKey })}>
            {MATCH_KINDS.map((k) => (
              <option key={k} value={k}>
                {m.kinds[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label">
            {m.competition} {s.common.optional}
          </span>
          <input className="input" value={draft.competition} maxLength={80} onChange={(e) => setDraft({ ...draft, competition: e.target.value })} />
        </label>
        <label>
          <span className="label">{m.ourGoals}</span>
          <input
            type="number"
            name="goalsFor"
            min={0}
            max={99}
            className="input"
            value={draft.goalsFor}
            onChange={(e) => setDraft({ ...draft, goalsFor: e.target.value })}
          />
        </label>
        <label>
          <span className="label">{m.theirGoals}</span>
          <input
            type="number"
            name="goalsAgainst"
            min={0}
            max={99}
            className="input"
            value={draft.goalsAgainst}
            onChange={(e) => setDraft({ ...draft, goalsAgainst: e.target.value })}
          />
        </label>
      </div>
      {roster.length > 0 && (
        <fieldset>
          <legend className="label flex w-full items-center justify-between">
            <span>
              {m.played} · {draft.players.length}/{roster.length}
            </span>
            <button type="button" className="text-xs font-semibold text-brand hover:underline" onClick={() => setDraft({ ...draft, players: roster.map((r) => r.userId) })}>
              {m.selectAll}
            </button>
          </legend>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {roster.map((r) => {
              const on = draft.players.includes(r.userId);
              return (
                <label
                  key={r.userId}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    on ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-500"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => togglePlayer(r.userId)} />
                  {r.number != null ? `${r.number} · ` : ""}
                  {r.name}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <label className="block">
        <span className="label">
          {m.note} {s.common.optional}
        </span>
        <input className="input" value={draft.note} maxLength={500} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost text-sm" onClick={() => setEditing(null)}>
          {s.common.cancel}
        </button>
        <button type="submit" className="btn-primary text-sm" disabled={busy}>
          {busy ? s.common.saving : m.saveMatch}
        </button>
      </div>
    </form>
  );

  return (
    <section>
      {canEdit && editing === null && (
        <div className="mb-3 flex justify-end">
          <button type="button" className="btn-primary text-sm" onClick={() => open()}>
            + {m.add}
          </button>
        </div>
      )}
      {editing === "new" && <div className="mb-4">{form}</div>}
      {matches.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-600">{m.noMatches}</div>
      ) : (
        <ul className="card divide-y divide-slate-100">
          {matches.map((row) =>
            editing === row.id ? (
              <li key={row.id} className="p-3">
                {form}
              </li>
            ) : (
              <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <ResultChip goalsFor={row.goalsFor} goalsAgainst={row.goalsAgainst} lang={lang} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    <span className="tabular-nums">
                      {row.goalsFor} – {row.goalsAgainst}
                    </span>{" "}
                    · {row.opponent}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.dayLabel} · {m.kinds[row.kind]}
                    {row.competition ? ` · ${row.competition}` : ""} · {m.played}: {row.players.length}
                  </p>
                  {row.note && <p className="mt-0.5 text-xs text-slate-600">{row.note}</p>}
                  {canEdit && row.players.length > 0 && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {row.players.map((p) => names.get(p)).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => open(row)}>
                      {s.common.edit}
                    </button>
                    <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => remove(row.id)}>
                      {s.common.delete}
                    </button>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
