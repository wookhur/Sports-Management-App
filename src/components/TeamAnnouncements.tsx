"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CloseIcon } from "./navIcons";
import { formatRelative } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

export interface AnnouncementRow {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

const L: Record<
  Lang,
  {
    heading: string;
    emptyCoach: string;
    emptyMember: string;
    placeholder: string;
    post: string;
    posting: string;
    posted: (n: number) => string;
    deleteAria: string;
    confirmDelete: string;
    errPost: string;
    errDelete: string;
  }
> = {
  ko: {
    heading: "팀 공지",
    emptyCoach: "아직 공지가 없어요. 훈련 시간 변경, 준비물, 이번 주 목표 — 여기에 올리면 팀 전원에게 알림이 갑니다.",
    emptyMember: "아직 공지가 없어요.",
    placeholder: "팀 전원에게 보낼 공지…",
    post: "공지 올리기",
    posting: "올리는 중…",
    posted: (n) => `${n}명에게 알림을 보냈어요`,
    deleteAria: "공지 삭제",
    confirmDelete: "이 공지를 삭제할까요?",
    errPost: "공지를 올리지 못했습니다",
    errDelete: "공지를 삭제하지 못했습니다",
  },
  en: {
    heading: "Announcements",
    emptyCoach: "Nothing posted yet. A time change, what to bring, this week's focus — post it here and every member is notified.",
    emptyMember: "Nothing posted yet.",
    placeholder: "A note for the whole team…",
    post: "Post",
    posting: "Posting…",
    posted: (n) => `Notified ${n} member${n === 1 ? "" : "s"}`,
    deleteAria: "Delete announcement",
    confirmDelete: "Delete this announcement?",
    errPost: "Couldn't post the announcement",
    errDelete: "Couldn't delete the announcement",
  },
  es: {
    heading: "Avisos",
    emptyCoach: "Todavía no hay avisos. Un cambio de horario, qué traer, el objetivo de la semana: publícalo aquí y todos los miembros reciben una notificación.",
    emptyMember: "Todavía no hay avisos.",
    placeholder: "Un aviso para todo el equipo…",
    post: "Publicar",
    posting: "Publicando…",
    posted: (n) => `Se notificó a ${n} miembro${n === 1 ? "" : "s"}`,
    deleteAria: "Eliminar aviso",
    confirmDelete: "¿Eliminar este aviso?",
    errPost: "No se pudo publicar el aviso",
    errDelete: "No se pudo eliminar el aviso",
  },
};

/** Coach-to-squad notes. Everyone on the team reads; the coach writes. */
export default function TeamAnnouncements({
  teamId,
  announcements,
  canPost,
  lang = "en",
}: {
  teamId: string;
  announcements: AnnouncementRow[];
  canPost: boolean;
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setBusy(true);
    const res = await fetch(`/api/teams/${teamId}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errPost);
      return;
    }
    setBody("");
    setDone(s.posted(data?.notified ?? 0));
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(s.confirmDelete)) return;
    setError(null);
    const res = await fetch(`/api/teams/${teamId}/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? s.errDelete);
      return;
    }
    router.refresh();
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{s.heading}</h2>
      <div className="card p-5">
        {canPost && (
          <form onSubmit={post} className="mb-4 border-b border-slate-100 pb-4">
            <textarea
              className="input min-h-[72px] resize-y"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={s.placeholder}
              aria-label={s.placeholder}
              maxLength={1000}
              required
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500" role="status">
                {done ?? ""}
              </span>
              <button type="submit" disabled={busy} className="btn-primary text-sm">
                {busy ? s.posting : s.post}
              </button>
            </div>
          </form>
        )}

        {announcements.length === 0 ? (
          <p className="text-sm leading-relaxed text-slate-600">
            {canPost ? s.emptyCoach : s.emptyMember}
          </p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{a.body}</p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {a.authorName} · {formatRelative(a.createdAt, lang)}
                  </p>
                </div>
                {canPost && (
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    aria-label={s.deleteAria}
                    className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
