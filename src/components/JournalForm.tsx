"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPORT_LIST } from "@/lib/sports";
import { SPORT_I18N, t, type Lang } from "@/lib/i18n";

const KIND_EMOJI: Record<string, string> = {
  technique: "🎯",
  strength: "💪",
  cardio: "🏃",
  match: "🏆",
  recovery: "🧘",
};
const KINDS = Object.keys(KIND_EMOJI);

export default function JournalForm({ lang }: { lang: Lang }) {
  const s = t(lang).journal;
  const router = useRouter();

  const [sport, setSport] = useState("swimming");
  const [kind, setKind] = useState("technique");
  const [minutes, setMinutes] = useState(60);
  const [intensity, setIntensity] = useState(6);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cheer, setCheer] = useState<{ emoji: string; text: string } | null>(null);

  const rpeHint = intensity <= 4 ? s.rpeHintLow : intensity <= 8 ? s.rpeHintMid : s.rpeHintHigh;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCheer(null);
    setSaving(true);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, kind, minutes, intensity, notes: notes.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? s.errSave);
      } else {
        setNotes("");
        if (data?.cheer) setCheer(data.cheer);
        router.refresh();
      }
    } catch {
      setError(s.errSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="text-base font-bold">{s.addTitle}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="journal-sport">{s.sportLabel}</label>
          <select id="journal-sport" className="input" value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORT_LIST.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {SPORT_I18N[sp.id]?.[lang]?.name ?? sp.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="journal-minutes">{s.minutesInput}</label>
          <input
            id="journal-minutes"
            className="input"
            type="number"
            min={5}
            max={360}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="label">{s.kindLabel}</label>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                kind === k
                  ? "bg-brand text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {KIND_EMOJI[k]} {s.kinds[k]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">
          {s.intensityLabel} · <span className="font-bold text-brand">{intensity}</span>{" "}
          <span className="text-xs font-normal text-slate-500">({rpeHint})</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-[var(--brand,#4f46e5)]"
          aria-label={s.intensityLabel}
        />
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>1 · {s.rpeHintLow}</span>
          <span>10 · {s.rpeHintHigh}</span>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="journal-notes">{s.notesLabel}</label>
        <input
          id="journal-notes"
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={s.notesPlaceholder}
          maxLength={300}
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {cheer && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <span aria-hidden="true">{cheer.emoji}</span>
          {cheer.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || minutes < 5}
        className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
      >
        {saving ? s.saving : s.save}
      </button>
    </form>
  );
}
