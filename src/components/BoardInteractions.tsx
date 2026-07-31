"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelative } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";

export interface BoardCommentView {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

interface Props {
  lang: Lang;
  postId: string;
  initialLiked: boolean;
  initialLikes: number;
  initialComments: BoardCommentView[];
  canDelete: boolean;
}

export default function BoardInteractions({
  lang,
  postId,
  initialLiked,
  initialLikes,
  initialComments,
  canDelete,
}: Props) {
  const s = t(lang).board;
  const router = useRouter();

  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [likePending, setLikePending] = useState(false);
  const [comments, setComments] = useState<BoardCommentView[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleLike() {
    if (likePending) return;
    setLikePending(true);
    // optimistic
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((n) => n + (nextLiked ? 1 : -1));
    try {
      const res = await fetch(`/api/board/${postId}/like`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setLiked(data.liked);
        setLikes(data.count);
      }
    } finally {
      setLikePending(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/board/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "오류가 발생했어요");
      } else {
        setComments((prev) => [...prev, data]);
        setDraft("");
        router.refresh();
      }
    } catch {
      setError("서버에 연결할 수 없어요");
    } finally {
      setSending(false);
    }
  }

  async function del() {
    if (!confirm(s.deleteConfirm)) return;
    const res = await fetch(`/api/board/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/board");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-y border-slate-100 py-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-label={s.likeAria}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            liked ? "bg-red-50 text-red-500" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span className="tabular-nums">{likes}</span>
        </button>
        <span className="text-sm text-slate-400">💬 {comments.length}</span>
        {canDelete && (
          <button
            type="button"
            onClick={del}
            className="ml-auto rounded-full px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            {s.deletePost}
          </button>
        )}
      </div>

      <section className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">{s.commentsHeading(comments.length)}</h2>

        {comments.length === 0 ? (
          <p className="mb-4 text-sm text-slate-400">{s.noComments}</p>
        ) : (
          <ul className="mb-4 space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {c.authorName.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{c.authorName}</span>{" "}
                    {/* Relative time depends on "now", so the server render and
                        the hydration render disagree whenever a minute ticks
                        over between them. The client value is the correct one. */}
                    <span suppressHydrationWarning className="text-xs text-slate-400">
                      {formatRelative(c.createdAt, lang)}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submitComment} className="flex items-end gap-2">
          <input
            className="input flex-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={s.commentPlaceholder}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-50"
          >
            {sending ? s.sending : s.send}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
    </div>
  );
}
