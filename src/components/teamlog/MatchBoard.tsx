"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { MATCH_KINDS, matchResult, tl, type MatchKindKey } from "@/lib/teamLogText";
import { MATCH_PLAYER_LABEL, MATCH_PLAYER_STATUSES, MATCH_PLAYER_STYLE, type MatchPlayerStatusKey } from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";

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
  penaltiesFor: number | null;
  penaltiesAgainst: number | null;
  eventId: string | null;
  /** Who played ("Asistió"). */
  players: string[];
  /** Every player's status for the match; coach only. */
  status: Record<string, MatchPlayerStatusKey>;
}

interface Draft {
  day: string;
  opponent: string;
  kind: MatchKindKey;
  competition: string;
  goalsFor: string;
  goalsAgainst: string;
  note: string;
  penaltiesFor: string;
  penaltiesAgainst: string;
  eventId: string;
  status: Record<string, MatchPlayerStatusKey>;
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
    penaltiesFor: "",
    penaltiesAgainst: "",
    eventId: "",
    status: Object.fromEntries(roster.map((r) => [r.userId, "ASISTIO" as const])),
  };
}

/**
 * The match log. The coach adds and edits results here; everyone on the team
 * sees the list. Every player starts as "Asistió", since on a school team most
 * players play most games; a tap on a name steps through the sheet's other
 * statuses (no-show, excused, not selected).
 */
export default function MatchBoard({
  teamId,
  lang,
  canEdit,
  today,
  roster,
  matches,
  events = [],
}: {
  teamId: string;
  lang: Lang;
  canEdit: boolean;
  today: string;
  roster: { userId: string; name: string; number: number | null }[];
  matches: MatchRow[];
  /** S-EVE requests a match can belong to. */
  events?: { id: string; name: string }[];
}) {
  const s = tl(lang);
  const m = s.matches;
  const b = bt(lang).match;
  const statusLabel = MATCH_PLAYER_LABEL[lang];
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
      penaltiesFor: row.penaltiesFor == null ? "" : String(row.penaltiesFor),
      penaltiesAgainst: row.penaltiesAgainst == null ? "" : String(row.penaltiesAgainst),
      eventId: row.eventId ?? "",
      status: row.status,
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
        penaltiesFor: draft.penaltiesFor === "" ? null : Number(draft.penaltiesFor) || 0,
        penaltiesAgainst: draft.penaltiesAgainst === "" ? null : Number(draft.penaltiesAgainst) || 0,
        eventId: draft.eventId || null,
        players: Object.entries(draft.status).map(([userId, status]) => ({ userId, status })),
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

  const cyclePlayer = (id: string) =>
    setDraft((d) => {
      const cur = d.status[id];
      const i = cur ? MATCH_PLAYER_STATUSES.indexOf(cur) : -1;
      const status = { ...d.status };
      if (i === MATCH_PLAYER_STATUSES.length - 1) delete status[id];
      else status[id] = MATCH_PLAYER_STATUSES[i + 1];
      return { ...d, status };
    });
  const playedCount = Object.values(draft.status).filter((x) => x === "ASISTIO").length;

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
        <label>
          <span className="label">
            {b.penaltiesFor} {s.common.optional}
          </span>
          <input
            type="number"
            name="penaltiesFor"
            min={0}
            max={99}
            className="input"
            value={draft.penaltiesFor}
            onChange={(e) => setDraft({ ...draft, penaltiesFor: e.target.value })}
          />
        </label>
        <label>
          <span className="label">
            {b.penaltiesAgainst} {s.common.optional}
          </span>
          <input
            type="number"
            name="penaltiesAgainst"
            min={0}
            max={99}
            className="input"
            value={draft.penaltiesAgainst}
            onChange={(e) => setDraft({ ...draft, penaltiesAgainst: e.target.value })}
          />
        </label>
        {events.length > 0 && (
          <label className="md:col-span-2">
            <span className="label">{b.event}</span>
            <select className="input" value={draft.eventId} onChange={(e) => setDraft({ ...draft, eventId: e.target.value })}>
              <option value="">{b.noEvent}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {roster.length > 0 && (
        <fieldset>
          <legend className="label flex w-full items-center justify-between">
            <span>
              {m.played} · {b.playedCount(playedCount, roster.length)}
            </span>
            <button
              type="button"
              className="text-xs font-semibold text-brand hover:underline"
              onClick={() => setDraft({ ...draft, status: Object.fromEntries(roster.map((r) => [r.userId, "ASISTIO" as const])) })}
            >
              {b.allPlayed}
            </button>
          </legend>
          <p className="text-xs text-slate-600">{b.statusHint}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {roster.map((r) => {
              const st = draft.status[r.userId];
              return (
                <button
                  key={r.userId}
                  type="button"
                  onClick={() => cyclePlayer(r.userId)}
                  aria-label={`${r.name}: ${st ? statusLabel[st] : bt(lang).grid.unmarked}`}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    st ? MATCH_PLAYER_STYLE[st] : "border border-dashed border-slate-300 text-slate-500"
                  }`}
                >
                  {r.number != null ? `${r.number} · ` : ""}
                  {r.name}
                  {st && st !== "ASISTIO" && <span className="ml-1 opacity-80">· {statusLabel[st]}</span>}
                </button>
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
    <section className="min-w-0">
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
                    {row.competition ? ` · ${row.competition}` : ""}
                    {row.penaltiesFor != null && row.penaltiesAgainst != null ? ` · ${b.pens} ${row.penaltiesFor}–${row.penaltiesAgainst}` : ""} ·{" "}
                    {m.played}: {row.players.length}
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
