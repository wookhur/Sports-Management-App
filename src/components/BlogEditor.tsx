"use client";

import { useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { toEditableHtml, isBodyEmpty } from "@/lib/blogBody";
import type { Lang } from "@/lib/i18n";

export interface BlogEditorInitial {
  slug: string;
  title: string;
  excerpt: string;
  emoji: string;
  tag: string;
  coverImage: string;
  body: string;
}

const L: Record<
  Lang,
  {
    iconLabel: string;
    tagLabel: string;
    tagPlaceholder: string;
    titleLabel: string;
    titlePlaceholder: string;
    excerptLabel: string;
    excerptPlaceholder: string;
    coverLabel: string;
    preview: string;
    uploading: string;
    uploadImage: string;
    urlPlaceholder: string;
    bodyLabel: string;
    errUploadFailed: string;
    errUploadNetwork: string;
    errBodyEmpty: string;
    errSaveFailed: string;
    errNetwork: string;
    saving: string;
    saveEdit: string;
    publish: string;
  }
> = {
  ko: {
    iconLabel: "아이콘",
    tagLabel: "태그 (선택)",
    tagPlaceholder: "예: 훈련, 공지",
    titleLabel: "제목",
    titlePlaceholder: "글 제목",
    excerptLabel: "요약",
    excerptPlaceholder: "목록에 보일 한두 줄 요약",
    coverLabel: "커버 이미지 (선택)",
    preview: "미리보기",
    uploading: "업로드 중…",
    uploadImage: "이미지 업로드",
    urlPlaceholder: "또는 이미지 URL 직접 입력",
    bodyLabel: "본문",
    errUploadFailed: "이미지 업로드에 실패했습니다",
    errUploadNetwork: "이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.",
    errBodyEmpty: "본문을 입력하세요",
    errSaveFailed: "저장에 실패했습니다",
    errNetwork: "서버에 연결할 수 없습니다.",
    saving: "저장 중…",
    saveEdit: "수정 저장",
    publish: "게시하기",
  },
  en: {
    iconLabel: "Icon",
    tagLabel: "Tag (optional)",
    tagPlaceholder: "e.g. Training, Notice",
    titleLabel: "Title",
    titlePlaceholder: "Post title",
    excerptLabel: "Summary",
    excerptPlaceholder: "A one- or two-line summary shown in the list",
    coverLabel: "Cover image (optional)",
    preview: "Preview",
    uploading: "Uploading…",
    uploadImage: "Upload image",
    urlPlaceholder: "Or paste an image URL",
    bodyLabel: "Body",
    errUploadFailed: "Image upload failed",
    errUploadNetwork: "Couldn't upload the image. Please try again in a moment.",
    errBodyEmpty: "Please write the body",
    errSaveFailed: "Failed to save",
    errNetwork: "Couldn't reach the server.",
    saving: "Saving…",
    saveEdit: "Save changes",
    publish: "Publish",
  },
  es: {
    iconLabel: "Icono",
    tagLabel: "Etiqueta (opcional)",
    tagPlaceholder: "ej: Entrenamiento, Aviso",
    titleLabel: "Título",
    titlePlaceholder: "Título de la publicación",
    excerptLabel: "Resumen",
    excerptPlaceholder: "Resumen de una o dos líneas para la lista",
    coverLabel: "Imagen de portada (opcional)",
    preview: "Vista previa",
    uploading: "Subiendo…",
    uploadImage: "Subir imagen",
    urlPlaceholder: "O pega una URL de imagen",
    bodyLabel: "Contenido",
    errUploadFailed: "No se pudo subir la imagen",
    errUploadNetwork: "No se pudo subir la imagen. Inténtalo de nuevo en un momento.",
    errBodyEmpty: "Escribe el contenido",
    errSaveFailed: "No se pudo guardar",
    errNetwork: "No se pudo conectar con el servidor.",
    saving: "Guardando…",
    saveEdit: "Guardar cambios",
    publish: "Publicar",
  },
};

export default function BlogEditor({
  initial,
  lang = "ko",
}: {
  initial?: BlogEditorInitial;
  lang?: Lang;
}) {
  const s = L[lang];
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "📝");
  const [tag, setTag] = useState(initial?.tag ?? "");
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
        setError(data?.error ?? s.errUploadFailed);
        return;
      }
      setCoverImage(data.url);
    } catch {
      setError(s.errUploadNetwork);
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
      setError(s.errBodyEmpty);
      return;
    }
    setLoading(true);
    try {
      const endpoint = isEdit ? `/api/blog/${initial!.slug}` : "/api/blog";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, emoji, tag, coverImage, body }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? s.errSaveFailed);
        setLoading(false);
        return;
      }
      window.location.assign(`/blog/${isEdit ? initial!.slug : data.slug}`);
    } catch {
      setError(s.errNetwork);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <label className="label">{s.iconLabel}</label>
          <input className="input text-center text-xl" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
        </div>
        <div>
          <label className="label">{s.tagLabel}</label>
          <input className="input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder={s.tagPlaceholder} maxLength={40} />
        </div>
      </div>
      <div>
        <label className="label">{s.titleLabel}</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={s.titlePlaceholder} required />
      </div>
      <div>
        <label className="label">{s.excerptLabel}</label>
        <input className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={s.excerptPlaceholder} required />
      </div>

      <div>
        <label className="label">{s.coverLabel}</label>
        <div className="flex items-start gap-3">
          {coverImage ? (
            // Cover images can be any origin (uploaded or externally linked),
            // so a plain <img> avoids configuring next/image remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="h-20 w-28 shrink-0 rounded-lg border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
              {s.preview}
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
              {uploading ? s.uploading : s.uploadImage}
            </button>
            <input
              className="input text-xs"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder={s.urlPlaceholder}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">{s.bodyLabel}</label>
        <RichTextEditor content={body} onChange={setBody} lang={lang} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading || uploading} className="btn-primary w-full">
        {loading ? s.saving : isEdit ? s.saveEdit : s.publish}
      </button>
    </form>
  );
}
