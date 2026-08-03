"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

export interface MyAssignment {
  id: string;
  title: string;
  note: string | null;
  linkHref: string | null;
  coachName: string;
  completedAt: string | null;
}

const L: Record<
  Lang,
  {
    title: string;
    remaining: (n: number) => string;
    empty: string;
    coachAttr: (name: string) => string;
    viewMaterial: string;
    ariaComplete: (title: string) => string;
    ariaUncomplete: (title: string) => string;
  }
> = {
  ko: {
    title: "📋 내 훈련 과제",
    remaining: (n) => `${n}개 남음`,
    empty: "코치가 과제를 배정하면 여기에 표시돼요.",
    coachAttr: (name) => `${name} 코치`,
    viewMaterial: "훈련 자료 보기 →",
    ariaComplete: (title) => `${title} 완료`,
    ariaUncomplete: (title) => `${title} 완료 취소`,
  },
  en: {
    title: "📋 My training tasks",
    remaining: (n) => `${n} left`,
    empty: "Tasks assigned by your coach will show up here.",
    coachAttr: (name) => `Coach ${name}`,
    viewMaterial: "View training material →",
    ariaComplete: (title) => `Mark "${title}" complete`,
    ariaUncomplete: (title) => `Mark "${title}" incomplete`,
  },
  es: {
    title: "📋 Mis tareas de entrenamiento",
    remaining: (n) => (n === 1 ? "1 pendiente" : `${n} pendientes`),
    empty: "Las tareas que te asigne tu entrenador aparecerán aquí.",
    coachAttr: (name) => `Entrenador ${name}`,
    viewMaterial: "Ver material de entrenamiento →",
    ariaComplete: (title) => `Marcar "${title}" como completada`,
    ariaUncomplete: (title) => `Desmarcar "${title}" como completada`,
  },
};

// Athlete side: homework list with a completion checkbox.
export default function AssignmentCard({
  assignments,
  lang = "ko",
}: {
  assignments: MyAssignment[];
  lang?: Lang;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const s = L[lang];

  async function toggle(a: MyAssignment) {
    setBusyId(a.id);
    const res = await fetch(`/api/assignments/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !a.completedAt }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  const pending = assignments.filter((a) => !a.completedAt);
  const done = assignments.filter((a) => a.completedAt);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{s.title}</h2>
        <span className="badge bg-brand/10 text-brand-dark">{s.remaining(pending.length)}</span>
      </div>

      {assignments.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{s.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {[...pending, ...done].map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-xl border border-slate-200 px-3.5 py-3">
              <button
                type="button"
                onClick={() => toggle(a)}
                disabled={busyId === a.id}
                aria-label={a.completedAt ? s.ariaUncomplete(a.title) : s.ariaComplete(a.title)}
                aria-pressed={Boolean(a.completedAt)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
                  a.completedAt
                    ? "border-emerald-500 bg-emerald-700 text-white"
                    : "border-slate-300 bg-white text-transparent hover:border-brand"
                }`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${a.completedAt ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  {a.title}
                </p>
                {a.note && <p className="mt-0.5 text-xs text-slate-500">{a.note}</p>}
                <p className="mt-0.5 text-xs text-slate-500">
                  {s.coachAttr(a.coachName)}
                  {a.linkHref && (
                    <>
                      {" · "}
                      <Link href={a.linkHref} className="font-medium text-brand hover:underline">
                        {s.viewMaterial}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
