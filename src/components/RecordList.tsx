"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPORTS } from "@/lib/sports";
import { formatDate, formatDuration, formatPace } from "@/lib/format";
import type { RecordView } from "@/lib/types";
import { metricLabel, type Lang } from "@/lib/i18n";

const L: Record<
  Lang,
  {
    emptyCoach: string;
    emptyOwner: string;
    deleteConfirm: string;
    sharedWithCoach: string;
    privateLabel: string;
    deleteBtn: string;
    coachPlaceholder: string;
    ownerPlaceholder: string;
    submit: string;
  }
> = {
  ko: {
    emptyCoach: "공유된 기록이 아직 없습니다.",
    emptyOwner: "기록이 없습니다.",
    deleteConfirm: "이 기록을 삭제할까요?",
    sharedWithCoach: "코치에게 공유됨",
    privateLabel: "비공개",
    deleteBtn: "삭제",
    coachPlaceholder: "피드백 남기기…",
    ownerPlaceholder: "답글 남기기…",
    submit: "등록",
  },
  en: {
    emptyCoach: "No shared records yet.",
    emptyOwner: "No records yet.",
    deleteConfirm: "Delete this record?",
    sharedWithCoach: "Shared with coach",
    privateLabel: "Private",
    deleteBtn: "Delete",
    coachPlaceholder: "Leave feedback…",
    ownerPlaceholder: "Write a reply…",
    submit: "Post",
  },
  es: {
    emptyCoach: "Aún no hay marcas compartidas.",
    emptyOwner: "Aún no hay marcas.",
    deleteConfirm: "¿Eliminar esta marca?",
    sharedWithCoach: "Compartida con el entrenador",
    privateLabel: "Privada",
    deleteBtn: "Eliminar",
    coachPlaceholder: "Deja tu feedback…",
    ownerPlaceholder: "Escribe una respuesta…",
    submit: "Publicar",
  },
};

export default function RecordList({
  records,
  mode,
  lang = "ko",
}: {
  records: RecordView[];
  /** "owner": athlete managing own records. "coach": read + comment. */
  mode: "owner" | "coach";
  lang?: Lang;
}) {
  const s = L[lang];
  if (records.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500">
        {mode === "coach" ? s.emptyCoach : s.emptyOwner}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {records.map((r) => (
        <RecordItem key={r.id} record={r} mode={mode} lang={lang} />
      ))}
    </div>
  );
}

function RecordItem({
  record,
  mode,
  lang = "ko",
}: {
  record: RecordView;
  mode: "owner" | "coach";
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const sport = SPORTS[record.sport];
  const [shared, setShared] = useState(record.shared);
  const [busy, setBusy] = useState(false);
  const [comments, setComments] = useState(record.comments);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function toggleShare() {
    setBusy(true);
    const next = !shared;
    const res = await fetch(`/api/records/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared: next }),
    });
    setBusy(false);
    if (res.ok) setShared(next);
  }

  async function remove() {
    if (!confirm(s.deleteConfirm)) return;
    setBusy(true);
    const res = await fetch(`/api/records/${record.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setBusy(false);
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/records/${record.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody }),
    });
    const data = await res.json();
    setPosting(false);
    if (res.ok) {
      setComments((prev) => [
        ...prev,
        {
          id: data.id,
          body: data.body,
          authorName: data.author.name,
          authorRole: data.author.role,
          createdAt: data.createdAt,
        },
      ]);
      setCommentBody("");
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <span>{sport?.emoji}</span>
            {metricLabel(record.metricKey, record.metricName, lang)}
            {mode === "coach" && record.ownerName && (
              <span className="badge bg-slate-100 text-slate-600">{record.ownerName}</span>
            )}
          </p>
          <p className="text-xs text-slate-500">{formatDate(record.createdAt, lang)}</p>
          {record.notes && <p className="mt-2 text-sm text-slate-600">“{record.notes}”</p>}
        </div>
        <div className="text-right">
          {record.durationMs != null && (
            <p className="font-mono text-xl font-semibold tabular-nums">
              {formatDuration(record.durationMs)}
            </p>
          )}
          {record.distanceM && record.durationMs != null && (
            <p className="text-xs text-slate-500">{formatPace(record.distanceM, record.durationMs)}</p>
          )}
        </div>
      </div>

      {/* Owner controls */}
      {mode === "owner" && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            onClick={toggleShare}
            disabled={busy}
            className={`flex items-center gap-2 text-sm font-medium ${
              shared ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            <span
              className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                shared ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full bg-white transition ${shared ? "translate-x-4" : ""}`}
              />
            </span>
            {shared ? s.sharedWithCoach : s.privateLabel}
          </button>
          <button onClick={remove} disabled={busy} className="text-xs text-slate-500 hover:text-red-500">
            {s.deleteBtn}
          </button>
        </div>
      )}

      {/* Comments */}
      {(comments.length > 0 || mode === "coach" || shared) && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-slate-50 px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className={c.authorRole === "COACH" ? "text-brand" : ""}>
                  {c.authorRole === "COACH" ? "📋" : "🏃"} {c.authorName}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{formatDate(c.createdAt, lang)}</span>
              </p>
              <p className="mt-1 text-sm text-slate-700">{c.body}</p>
            </div>
          ))}
          {(mode === "coach" || (mode === "owner" && comments.length > 0)) && (
            <form onSubmit={addComment} className="flex gap-2">
              <input
                className="input py-2 text-sm"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={mode === "coach" ? s.coachPlaceholder : s.ownerPlaceholder}
              />
              <button className="btn-primary shrink-0 px-3 py-2 text-sm" disabled={posting}>
                {s.submit}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
