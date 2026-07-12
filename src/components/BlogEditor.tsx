"use client";

import { useState } from "react";

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [tag, setTag] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, emoji, tag, coverImage, body }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "저장에 실패했습니다");
        setLoading(false);
        return;
      }
      window.location.assign(`/blog/${data.slug}`);
    } catch {
      setError("서버에 연결할 수 없습니다.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <label className="label">아이콘</label>
          <input className="input text-center text-xl" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
        </div>
        <div>
          <label className="label">태그 (선택)</label>
          <input className="input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="예: 훈련, 공지" maxLength={20} />
        </div>
      </div>
      <div>
        <label className="label">제목</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="글 제목" required />
      </div>
      <div>
        <label className="label">요약</label>
        <input className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="목록에 보일 한두 줄 요약" required />
      </div>
      <div>
        <label className="label">커버 이미지 URL (선택)</label>
        <input
          className="input"
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://... (없으면 아이콘이 대신 표시돼요)"
        />
      </div>
      <div>
        <label className="label">본문</label>
        <textarea
          className="input min-h-[240px] resize-y leading-relaxed"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="본문을 입력하세요. 빈 줄로 문단을 나눌 수 있어요."
          required
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "게시 중…" : "게시하기"}
      </button>
    </form>
  );
}
