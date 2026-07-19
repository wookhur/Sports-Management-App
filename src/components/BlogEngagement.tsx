"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

const L: Record<
  Lang,
  {
    like: string;
    commentsHeading: string;
    commentPlaceholder: string;
    submit: string;
    submitting: string;
    deleteConfirm: string;
    deleteAria: string;
    coachBadge: string;
    errCommentSave: string;
  }
> = {
  ko: {
    like: "좋아요",
    commentsHeading: "댓글",
    commentPlaceholder: "댓글을 남겨보세요",
    submit: "등록",
    submitting: "등록 중…",
    deleteConfirm: "이 댓글을 삭제할까요?",
    deleteAria: "댓글 삭제",
    coachBadge: "코치",
    errCommentSave: "댓글을 저장하지 못했습니다",
  },
  en: {
    like: "Like",
    commentsHeading: "Comments",
    commentPlaceholder: "Leave a comment",
    submit: "Post",
    submitting: "Posting…",
    deleteConfirm: "Delete this comment?",
    deleteAria: "Delete comment",
    coachBadge: "Coach",
    errCommentSave: "Couldn't save the comment",
  },
  es: {
    like: "Me gusta",
    commentsHeading: "Comentarios",
    commentPlaceholder: "Deja un comentario",
    submit: "Publicar",
    submitting: "Publicando…",
    deleteConfirm: "¿Eliminar este comentario?",
    deleteAria: "Eliminar comentario",
    coachBadge: "Entrenador",
    errCommentSave: "No se pudo guardar el comentario",
  },
};

export interface BlogCommentView {
  id: string;
  body: string;
  authorName: string;
  authorRole: "ATHLETE" | "COACH";
  mine: boolean;
  createdAt: string;
}

export default function BlogEngagement({
  slug,
  initialLiked,
  initialLikeCount,
  comments,
  canModerate,
  lang = "ko",
}: {
  slug: string;
  initialLiked: boolean;
  initialLikeCount: number;
  comments: BlogCommentView[];
  canModerate: boolean;
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleLike() {
    // Optimistic flip, reconciled with the server response.
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    const res = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
    const data = await res.json().catch(() => null);
    if (res.ok && data) {
      setLiked(data.liked);
      setLikeCount(data.count);
    } else {
      setLiked(liked);
      setLikeCount(likeCount);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/blog/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errCommentSave);
      return;
    }
    setBody("");
    router.refresh();
  }

  async function removeComment(id: string) {
    if (!confirm(s.deleteConfirm)) return;
    const res = await fetch(`/api/blog/comments/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          liked
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-500"
        }`}
      >
        {liked ? "❤️" : "🤍"} {s.like} {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
      </button>

      <h2 className="mt-8 font-bold">{s.commentsHeading} {comments.length > 0 && <span className="text-slate-400">{comments.length}</span>}</h2>

      <form onSubmit={submitComment} className="mt-3 flex gap-2">
        <input
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={s.commentPlaceholder}
          maxLength={1000}
          required
        />
        <button type="submit" disabled={busy} className="btn-primary shrink-0 text-sm">
          {busy ? s.submitting : s.submit}
        </button>
      </form>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <ul className="mt-4 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-600">
                {c.authorName}
                {c.authorRole === "COACH" && <span className="badge ml-1.5 bg-brand/10 text-brand">{s.coachBadge}</span>}
                <span className="ml-2 font-normal text-slate-400">{formatDate(c.createdAt, lang)}</span>
              </p>
              {(c.mine || canModerate) && (
                <button
                  type="button"
                  onClick={() => removeComment(c.id)}
                  aria-label={s.deleteAria}
                  className="text-xs text-slate-300 transition-colors hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-700">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
