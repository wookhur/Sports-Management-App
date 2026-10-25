"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { EVAL_SCALE, evaluationPercent, tl } from "@/lib/teamLogText";

export interface EvalPlayer {
  userId: string;
  name: string;
  number: number | null;
  scores: number[];
  note: string | null;
}

const CODES = ["A1", "A2", "A3", "A4", "A5", "R1", "R2", "R3", "R4", "R5"];

function PlayerRow({ teamId, period, lang, player }: { teamId: string; period: string; lang: Lang; player: EvalPlayer }) {
  const s = tl(lang);
  const e = s.evaluations;
  const [scores, setScores] = useState<number[]>(player.scores.length === 10 ? player.scores : Array(10).fill(0));
  const [note, setNote] = useState(player.note ?? "");
  const [saved, setSaved] = useState({ scores: scores.join(","), note });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = saved.scores !== scores.join(",") || saved.note !== note;
  const pct = evaluationPercent(scores);

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/teams/${teamId}/evaluations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId: player.userId, period, scores, note: note || undefined }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: data?.error ?? s.common.errSave });
      return;
    }
    setSaved({ scores: scores.join(","), note });
    setMsg({ ok: true, text: s.common.saved });
  }

  return (
    <li className="px-4 py-3" data-player={player.name}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {player.number != null && <span className="mr-1.5 tabular-nums text-slate-500">{player.number}</span>}
          {player.name}
        </p>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold tabular-nums ${pct == null ? "text-slate-500" : "text-slate-900"}`} data-testid="eval-pct">
            {pct == null ? e.notRated : `${pct}%`}
          </span>
          <span className="text-xs text-slate-500" role="status">
            {msg?.ok ? msg.text : ""}
          </span>
          <button type="button" className="btn-primary px-3 py-1 text-xs" onClick={save} disabled={busy || !dirty}>
            {busy ? s.common.saving : e.savePlayer}
          </button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {CODES.map((code, i) => (
          <label key={code} className={`rounded-lg border px-1.5 py-1 ${i < 5 ? "border-sky-200 bg-sky-50/50" : "border-emerald-200 bg-emerald-50/50"}`}>
            <span className="block text-[10px] font-bold text-slate-500" title={e.criteria[i]}>
              {code}
            </span>
            <select
              aria-label={`${player.name} · ${e.criteria[i]}`}
              value={scores[i]}
              onChange={(ev) => setScores((sc) => sc.map((v, j) => (j === i ? Number(ev.target.value) : v)))}
              className="w-full bg-transparent text-sm font-semibold tabular-nums outline-none"
            >
              <option value={0}>–</option>
              {EVAL_SCALE.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <input
        className="input mt-2 text-sm"
        placeholder={`${e.noteLabel} ${s.common.optional}`}
        aria-label={`${player.name} · ${e.noteLabel}`}
        value={note}
        maxLength={1000}
        onChange={(ev) => setNote(ev.target.value)}
      />
      {msg && !msg.ok && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {msg.text}
        </p>
      )}
    </li>
  );
}

/** One row per player: ten 1-5 scores, a comment, and the resulting percentage. */
export default function EvaluationGrid({
  teamId,
  period,
  lang,
  players,
}: {
  teamId: string;
  period: string;
  lang: Lang;
  players: EvalPlayer[];
}) {
  return (
    <ul className="card divide-y divide-slate-100">
      {players.map((p) => (
        <PlayerRow key={`${period}-${p.userId}`} teamId={teamId} period={period} lang={lang} player={p} />
      ))}
    </ul>
  );
}
