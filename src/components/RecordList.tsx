"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPORTS } from "@/lib/sports";
import { formatDate, formatDuration, formatPace } from "@/lib/format";
import type { RecordView } from "@/lib/types";

export default function RecordList({
  records,
  mode,
}: {
  records: RecordView[];
  /** "owner": athlete managing own records. "coach": read + comment. */
  mode: "owner" | "coach";
}) {
  if (records.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500">
        {mode === "coach" ? "공유된 기록이 아직 없습니다." : "기록이 없습니다."}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {records.map((r) => (
        <RecordItem key={r.id} record={r} mode={mode} />
      ))}
    </div>
  );
}

function RecordItem({ record, mode }: { record: RecordView; mode: "owner" | "coach" }) {
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
    if (!confirm("이 기록을 삭제할까요?")) return;
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
            {record.metricName}
            {mode === "coach" && record.ownerName && (
              <span className="badge bg-slate-100 text-slate-500">{record.ownerName}</span>
            )}
          </p>
          <p className="text-xs text-slate-400">{formatDate(record.createdAt)}</p>
          {record.notes && <p className="mt-2 text-sm text-slate-600">“{record.notes}”</p>}
        </div>
        <div className="text-right">
          {record.durationMs != null && (
            <p className="font-mono text-xl font-semibold tabular-nums">
              {formatDuration(record.durationMs)}
            </p>
          )}
          {record.distanceM && record.durationMs != null && (
            <p className="text-xs text-slate-400">{formatPace(record.distanceM, record.durationMs)}</p>
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
              shared ? "text-emerald-600" : "text-slate-400"
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
            {shared ? "코치에게 공유됨" : "비공개"}
          </button>
          <button onClick={remove} disabled={busy} className="text-xs text-slate-400 hover:text-red-500">
            삭제
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
                <span className="text-slate-400">{formatDate(c.createdAt)}</span>
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
                placeholder={mode === "coach" ? "피드백 남기기…" : "답글 남기기…"}
              />
              <button className="btn-primary shrink-0 px-3 py-2 text-sm" disabled={posting}>
                등록
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
