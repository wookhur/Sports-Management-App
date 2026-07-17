"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

export interface AssignmentRow {
  id: string;
  athleteName: string;
  title: string;
  linkHref: string | null;
  dueDate: string | null;
  completedAt: string | null;
}

const L: Record<
  Lang,
  {
    heading: string;
    sub: string;
    noAthletes: string;
    athleteSelectAria: string;
    titlePlaceholder: string;
    linkPlaceholder: string;
    notePlaceholder: string;
    submit: string;
    submitting: string;
    done: string;
    inProgress: string;
    deleteAria: (title: string) => string;
    confirmDelete: string;
    errSave: string;
  }
> = {
  ko: {
    heading: "📋 훈련 과제",
    sub: "선수에게 이번 주 과제를 배정하세요.",
    noAthletes: "연결된 선수가 있어야 과제를 배정할 수 있어요.",
    athleteSelectAria: "선수 선택",
    titlePlaceholder: "과제 이름 (예: 자유형 인터벌 8×50m)",
    linkPlaceholder: "앱 내 링크 (선택, 예: /sports/swimming/workouts)",
    notePlaceholder: "메모 (선택)",
    submit: "과제 배정",
    submitting: "배정 중…",
    done: "완료 ✅",
    inProgress: "진행 중",
    deleteAria: (title) => `${title} 과제 삭제`,
    confirmDelete: "이 과제를 삭제할까요?",
    errSave: "과제를 저장하지 못했습니다",
  },
  en: {
    heading: "📋 Training assignments",
    sub: "Assign this week's homework to your athletes.",
    noAthletes: "You need a connected athlete before you can assign homework.",
    athleteSelectAria: "Select athlete",
    titlePlaceholder: "Assignment name (e.g. freestyle intervals 8×50m)",
    linkPlaceholder: "In-app link (optional, e.g. /sports/swimming/workouts)",
    notePlaceholder: "Note (optional)",
    submit: "Assign",
    submitting: "Assigning…",
    done: "Done ✅",
    inProgress: "In progress",
    deleteAria: (title) => `Delete assignment ${title}`,
    confirmDelete: "Delete this assignment?",
    errSave: "Couldn't save the assignment",
  },
  es: {
    heading: "📋 Tareas de entrenamiento",
    sub: "Asigna las tareas de esta semana a tus atletas.",
    noAthletes: "Necesitas un atleta conectado para poder asignar tareas.",
    athleteSelectAria: "Seleccionar atleta",
    titlePlaceholder: "Nombre de la tarea (ej. intervalos de libre 8×50m)",
    linkPlaceholder: "Enlace de la app (opcional, ej. /sports/swimming/workouts)",
    notePlaceholder: "Nota (opcional)",
    submit: "Asignar",
    submitting: "Asignando…",
    done: "Completada ✅",
    inProgress: "En curso",
    deleteAria: (title) => `Eliminar la tarea ${title}`,
    confirmDelete: "¿Eliminar esta tarea?",
    errSave: "No se pudo guardar la tarea",
  },
};

// Coach side: assign training homework to a linked athlete and track status.
export default function AssignmentPanel({
  athletes,
  assignments,
  lang = "ko",
}: {
  athletes: { id: string; name: string }[];
  assignments: AssignmentRow[];
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [athleteId, setAthleteId] = useState(athletes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [linkHref, setLinkHref] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId, title, note, linkHref }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errSave);
      return;
    }
    setTitle("");
    setLinkHref("");
    setNote("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(s.confirmDelete)) return;
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">{s.heading}</h2>
      <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>

      {athletes.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {s.noAthletes}
        </p>
      ) : (
        <form onSubmit={create} className="mt-4 space-y-2">
          <select className="input" value={athleteId} onChange={(e) => setAthleteId(e.target.value)} aria-label={s.athleteSelectAria}>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={s.titlePlaceholder}
            required
          />
          <input
            className="input text-xs"
            value={linkHref}
            onChange={(e) => setLinkHref(e.target.value)}
            placeholder={s.linkPlaceholder}
          />
          <input
            className="input text-xs"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={s.notePlaceholder}
            maxLength={500}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full text-sm">
            {busy ? s.submitting : s.submit}
          </button>
        </form>
      )}

      {assignments.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${a.completedAt ? "text-slate-400 line-through" : "text-slate-800"}`}>
                  {a.title}
                </p>
                <p className="text-xs text-slate-400">
                  {a.athleteName} · {a.completedAt ? s.done : s.inProgress}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(a.id)}
                aria-label={s.deleteAria(a.title)}
                className="shrink-0 text-xs text-slate-300 transition-colors hover:text-red-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
