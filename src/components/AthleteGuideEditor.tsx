"use client";

import { useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { toEditableHtml, isBodyEmpty } from "@/lib/blogBody";

export interface AthleteGuideEditorInitial {
  slug: string;
  athleteName: string;
  title: string;
  excerpt: string;
  coverImage: string;
  body: string;
}

export default function AthleteGuideEditor({
  sport,
  sportName,
  initial,
}: {
  sport: string;
  sportName: string;
  initial?: AthleteGuideEditorInitial;
}) {
  const isEdit = Boolean(initial);
  const [athleteName, setAthleteName] = useState(initial?.athleteName ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [body, setBody] = useState(() => (initial ? toEditableHtml(initial.body) : ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/blog/images", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "이미지 업로드에 실패했습니다");
        return;
      }
      setCoverImage(data.url);
    } catch {
      setError("이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isBodyEmpty(body)) {
      setError("본문을 입력하세요");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isEdit ? `/api/athlete-guides/${initial!.slug}` : "/api/athlete-guides";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, athleteName, title, excerpt, coverImage, body }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "저장에 실패했습니다");
        setLoading(false);
        return;
      }
      window.location.assign(`/sports/${sport}/athletes/${isEdit ? initial!.slug : data.slug}`);
    } catch {
      setError("서버에 연결할 수 없습니다.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="label">종목</label>
        <div className="input flex items-center bg-slate-50 text-slate-500">{sportName}</div>
      </div>
      <div>
        <label className="label">선수 이름</label>
        <input
          className="input"
          value={athleteName}
          onChange={(e) => setAthleteName(e.target.value)}
          placeholder="예: 마이클 펠프스"
          maxLength={80}
          required
        />
      </div>
      <div>
        <label className="label">제목</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 인터벌 훈련으로 지구력 끌어올리기" required />
      </div>
      <div>
        <label className="label">요약</label>
        <input className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="목록에 보일 한두 줄 요약" required />
      </div>

      <div>
        <label className="label">커버 이미지 (선택)</label>
        <div className="flex items-start gap-3">
          {coverImage ? (
            // Cover images can be any origin (uploaded or externally linked),
            // so a plain <img> avoids configuring next/image remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="h-20 w-28 shrink-0 rounded-lg border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
              미리보기
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-ghost text-sm"
            >
              {uploading ? "업로드 중…" : "이미지 업로드"}
            </button>
            <input
              className="input text-xs"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="또는 이미지 URL 직접 입력"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">본문</label>
        <RichTextEditor content={body} onChange={setBody} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading || uploading} className="btn-primary w-full">
        {loading ? "저장 중…" : isEdit ? "수정 저장" : "게시하기"}
      </button>
    </form>
  );
}
