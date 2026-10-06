"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

export interface LinkOption {
  href: string;
  label: string;
}

export interface LinkGroup {
  label: string;
  options: LinkOption[];
}

const L: Record<
  Lang,
  {
    heading: string;
    sub: (n: number) => string;
    titleLabel: string;
    titlePlaceholder: string;
    linkLabel: string;
    noLink: string;
    noteLabel: string;
    notePlaceholder: string;
    submit: (n: number) => string;
    sending: string;
    sent: (n: number) => string;
    noMembers: string;
    errGeneric: string;
  }
> = {
  ko: {
    heading: "팀 전체에 과제 내기",
    sub: (n) => `한 번 보내면 팀원 ${n}명 모두에게 같은 과제가 가고, 각자 알림을 받아요.`,
    titleLabel: "과제 이름",
    titlePlaceholder: "예: 리프팅 50개 · 패스 앤 무브 20분",
    linkLabel: "연결할 훈련 (선택)",
    noLink: "연결 안 함",
    noteLabel: "메모 (선택)",
    notePlaceholder: "목표, 횟수, 주의할 점…",
    submit: (n) => `팀원 ${n}명 모두에게 보내기`,
    sending: "보내는 중…",
    sent: (n) => `${n}명에게 보냈어요. 아래에서 누가 끝냈는지 볼 수 있어요.`,
    noMembers: "아직 팀원이 없어요. 초대 코드를 공유하면 바로 과제를 낼 수 있어요.",
    errGeneric: "과제를 보내지 못했습니다",
  },
  en: {
    heading: "Assign to the whole team",
    sub: (n) => `Send it once and all ${n} members get the same assignment, each with a notification.`,
    titleLabel: "Assignment",
    titlePlaceholder: "e.g. 50 keep-ups · 20 min pass and move",
    linkLabel: "Link a session (optional)",
    noLink: "No link",
    noteLabel: "Note (optional)",
    notePlaceholder: "Target, reps, what to focus on…",
    submit: (n) => `Send to all ${n} members`,
    sending: "Sending…",
    sent: (n) => `Sent to ${n} members. You can see who has finished below.`,
    noMembers: "Nobody has joined yet. Share the invite code and you can assign straight away.",
    errGeneric: "Couldn't send the assignment",
  },
  es: {
    heading: "Asignar a todo el equipo",
    sub: (n) => `Lo envías una vez y los ${n} miembros reciben la misma tarea, cada uno con su notificación.`,
    titleLabel: "Tarea",
    titlePlaceholder: "p. ej. 50 toques · 20 min de pase y movimiento",
    linkLabel: "Vincular un entrenamiento (opcional)",
    noLink: "Sin vínculo",
    noteLabel: "Nota (opcional)",
    notePlaceholder: "Objetivo, repeticiones, en qué fijarse…",
    submit: (n) => `Enviar a los ${n} miembros`,
    sending: "Enviando…",
    sent: (n) => `Enviada a ${n} miembros. Abajo ves quién la ha terminado.`,
    noMembers: "Todavía no se ha unido nadie. Comparte el código de invitación y podrás asignar enseguida.",
    errGeneric: "No se pudo enviar la tarea",
  },
};

/**
 * One assignment, every member, one send.
 *
 * It posts the same request the dashboard form does with a team picked, so
 * each athlete still gets their own row (completion is personal) and the
 * team's progress list underneath picks the new one up on refresh. The
 * member count is on the button so a coach can see who it will reach before
 * sending it.
 */
export default function TeamAssignForm({
  teamId,
  memberCount,
  linkGroups,
  lang = "en",
}: {
  teamId: string;
  memberCount: number;
  linkGroups: LinkGroup[];
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [linkHref, setLinkHref] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Picking a drill names the assignment after it, unless the coach has
  // already typed a name of their own.
  function pickLink(href: string) {
    setLinkHref(href);
    if (title.trim()) return;
    const opt = linkGroups.flatMap((g) => g.options).find((o) => o.href === href);
    if (opt) setTitle(opt.label);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setBusy(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        title: title.trim(),
        note: note.trim() || undefined,
        linkHref: linkHref || undefined,
      }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errGeneric);
      return;
    }
    setTitle("");
    setNote("");
    setLinkHref("");
    setDone(s.sent(data?.count ?? memberCount));
    router.refresh();
  }

  return (
    <form id="team-assign" onSubmit={submit} className="card scroll-mt-24 p-5" aria-labelledby="team-assign-heading">
      <h3 id="team-assign-heading" className="text-base font-bold">
        {s.heading}
      </h3>
      {memberCount === 0 ? (
        <p className="mt-1 text-sm text-slate-600">{s.noMembers}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-600">{s.sub(memberCount)}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="team-assign-title" className="label">
                {s.titleLabel}
              </label>
              <input
                id="team-assign-title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={s.titlePlaceholder}
                minLength={2}
                maxLength={120}
                required
              />
            </div>
            <div>
              <label htmlFor="team-assign-link" className="label">
                {s.linkLabel}
              </label>
              <select
                id="team-assign-link"
                className="input"
                value={linkHref}
                onChange={(e) => pickLink(e.target.value)}
              >
                <option value="">{s.noLink}</option>
                {linkGroups
                  .filter((g) => g.options.length > 0)
                  .map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.options.map((o) => (
                        <option key={o.href} value={o.href}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="team-assign-note" className="label">
                {s.noteLabel}
              </label>
              <input
                id="team-assign-note"
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={s.notePlaceholder}
                maxLength={500}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-emerald-700" role="status">
              {done ?? ""}
            </p>
            <button type="submit" disabled={busy || title.trim().length < 2} className="btn-primary">
              {busy ? s.sending : s.submit(memberCount)}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
