"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRightIcon, UsersIcon } from "./navIcons";
import type { Lang } from "@/lib/i18n";

export interface TeamRow {
  id: string;
  name: string;
  code: string;
  memberCount: number;
}

const L: Record<
  Lang,
  {
    heading: string;
    sub: string;
    emptyTitle: string;
    emptyBody: string;
    memberCount: (n: number) => string;
    noMembersYet: string;
    inviteCode: string;
    copy: string;
    copied: string;
    copyFailed: string;
    copyAria: (team: string) => string;
    rename: string;
    renameAria: (team: string) => string;
    renamePrompt: string;
    deleteLabel: string;
    deleteAria: (team: string) => string;
    confirmDelete: (team: string, n: number) => string;
    open: string;
    namePlaceholder: string;
    create: string;
    creating: string;
    errCreate: string;
    errRename: string;
    errDelete: string;
  }
> = {
  ko: {
    heading: "팀",
    sub: "팀을 만들고 초대 코드를 선수에게 알려주세요.",
    emptyTitle: "아직 팀이 없어요",
    emptyBody:
      "팀을 만들면 초대 코드 하나로 선수들이 들어오고, 과제를 팀 전체에 한 번에 배정할 수 있어요.",
    memberCount: (n) => `${n}명`,
    noMembersYet: "아직 들어온 선수가 없어요",
    inviteCode: "초대 코드",
    copy: "코드 복사",
    copied: "복사했어요",
    copyFailed: "복사하지 못했어요 — 코드를 직접 선택해 주세요",
    copyAria: (team) => `${team} 초대 코드 복사`,
    rename: "이름 변경",
    renameAria: (team) => `${team} 이름 변경`,
    renamePrompt: "새 팀 이름",
    deleteLabel: "삭제",
    deleteAria: (team) => `${team} 삭제`,
    confirmDelete: (team, n) =>
      n > 0
        ? `'${team}' 팀을 삭제할까요? 선수 ${n}명이 팀에서 나가게 됩니다. 선수 계정과 이미 배정한 과제는 그대로 남아요.`
        : `'${team}' 팀을 삭제할까요?`,
    open: "팀 열기",
    namePlaceholder: "새 팀 이름",
    create: "만들기",
    creating: "생성 중…",
    errCreate: "팀을 만들지 못했습니다",
    errRename: "이름을 바꾸지 못했습니다",
    errDelete: "팀을 삭제하지 못했습니다",
  },
  en: {
    heading: "Teams",
    sub: "Create a team and share the invite code with your athletes.",
    emptyTitle: "No teams yet",
    emptyBody:
      "A team gives your squad one invite code to join with, and lets you set an assignment for everyone at once.",
    memberCount: (n) => `${n} member${n === 1 ? "" : "s"}`,
    noMembersYet: "Nobody has joined yet",
    inviteCode: "Invite code",
    copy: "Copy code",
    copied: "Copied",
    copyFailed: "Couldn't copy — select the code and copy it yourself",
    copyAria: (team) => `Copy the invite code for ${team}`,
    rename: "Rename",
    renameAria: (team) => `Rename ${team}`,
    renamePrompt: "New team name",
    deleteLabel: "Delete",
    deleteAria: (team) => `Delete ${team}`,
    confirmDelete: (team, n) =>
      n > 0
        ? `Delete “${team}”? ${n} athlete${n === 1 ? "" : "s"} will be taken off the team. Their accounts and any assignments you've already given them are kept.`
        : `Delete “${team}”?`,
    open: "Open team",
    namePlaceholder: "New team name",
    create: "Create",
    creating: "Creating…",
    errCreate: "Couldn't create the team",
    errRename: "Couldn't rename the team",
    errDelete: "Couldn't delete the team",
  },
  es: {
    heading: "Equipos",
    sub: "Crea un equipo y comparte el código de invitación con tus atletas.",
    emptyTitle: "Aún no hay equipos",
    emptyBody:
      "Un equipo da a tu plantilla un único código para unirse y te permite asignar una tarea a todos a la vez.",
    memberCount: (n) => `${n} miembro${n === 1 ? "" : "s"}`,
    noMembersYet: "Todavía no se ha unido nadie",
    inviteCode: "Código de invitación",
    copy: "Copiar código",
    copied: "Copiado",
    copyFailed: "No se pudo copiar — selecciona el código y cópialo tú",
    copyAria: (team) => `Copiar el código de invitación de ${team}`,
    rename: "Renombrar",
    renameAria: (team) => `Renombrar ${team}`,
    renamePrompt: "Nuevo nombre del equipo",
    deleteLabel: "Eliminar",
    deleteAria: (team) => `Eliminar ${team}`,
    confirmDelete: (team, n) =>
      n > 0
        ? `¿Eliminar «${team}»? ${n} atleta${n === 1 ? "" : "s"} saldrá${n === 1 ? "" : "n"} del equipo. Sus cuentas y las tareas que ya les diste se conservan.`
        : `¿Eliminar «${team}»?`,
    open: "Abrir equipo",
    namePlaceholder: "Nombre del nuevo equipo",
    create: "Crear",
    creating: "Creando…",
    errCreate: "No se pudo crear el equipo",
    errRename: "No se pudo renombrar el equipo",
    errDelete: "No se pudo eliminar el equipo",
  },
};

// Coach side: create teams, share the invite code, and keep the list tidy.
export default function TeamPanel({
  teams,
  lang = "en",
  standalone = false,
}: {
  teams: TeamRow[];
  lang?: Lang;
  /** True when the page already carries the heading, so the card doesn't repeat it. */
  standalone?: boolean;
}) {
  const s = L[lang];
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Which team's code was just copied, so the feedback lands on that row.
  const [copied, setCopied] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errCreate);
      return;
    }
    setName("");
    router.refresh();
  }

  async function copyCode(team: TeamRow) {
    setError(null);
    try {
      await navigator.clipboard.writeText(team.code);
      setCopied(team.id);
      window.setTimeout(() => setCopied((c) => (c === team.id ? null : c)), 2000);
    } catch {
      // Clipboard access can be refused outright (an insecure origin, a
      // permission policy). Say so rather than showing a "Copied" that lied.
      setError(s.copyFailed);
    }
  }

  async function rename(team: TeamRow) {
    const next = prompt(s.renamePrompt, team.name);
    if (next == null || next.trim() === team.name) return;
    setError(null);
    const res = await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next.trim() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? s.errRename);
      return;
    }
    router.refresh();
  }

  async function remove(team: TeamRow) {
    if (!confirm(s.confirmDelete(team.name, team.memberCount))) return;
    setError(null);
    const res = await fetch(`/api/teams/${team.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? s.errDelete);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card p-5">
      {!standalone && (
        <>
          <h2 className="font-bold">{s.heading}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{s.sub}</p>
        </>
      )}

      {teams.length === 0 ? (
        // The panel used to be an empty white box with a text field floating in
        // it, which told a coach nothing about why they would want a team.
        <div className={`${standalone ? "" : "mt-4"} rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center`}>
          <UsersIcon className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">{s.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-600">
            {s.emptyBody}
          </p>
        </div>
      ) : (
        <ul className={`${standalone ? "" : "mt-4"} space-y-3`}>
          {teams.map((team) => (
            <li key={team.id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/teams/${team.id}`} className="group min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-brand">
                    {team.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {team.memberCount === 0 ? s.noMembersYet : s.memberCount(team.memberCount)}
                  </p>
                </Link>
                <Link
                  href={`/teams/${team.id}`}
                  aria-label={s.open}
                  className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* The invite code is the whole point of a team, and reading six
                  characters off a screen to retype them into a chat app is the
                  one job this panel exists to save the coach. */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {s.inviteCode}
                </span>
                <code className="select-all rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-bold tracking-widest text-slate-700">
                  {team.code}
                </code>
                <button
                  type="button"
                  onClick={() => copyCode(team)}
                  aria-label={s.copyAria(team.name)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
                >
                  {copied === team.id ? s.copied : s.copy}
                </button>
                <span className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => rename(team)}
                    aria-label={s.renameAria(team.name)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    {s.rename}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(team)}
                    aria-label={s.deleteAria(team.name)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    {s.deleteLabel}
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={create} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={s.namePlaceholder}
          aria-label={s.namePlaceholder}
          maxLength={40}
          required
        />
        <button type="submit" disabled={busy} className="btn-primary shrink-0 text-sm">
          {busy ? s.creating : s.create}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
