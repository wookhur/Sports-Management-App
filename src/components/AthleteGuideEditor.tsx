"use client";

import { useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { toEditableHtml, isBodyEmpty } from "@/lib/blogBody";
import type { Lang } from "@/lib/i18n";

export interface AthleteGuideEditorInitial {
  slug: string;
  athleteName: string;
  title: string;
  excerpt: string;
  coverImage: string;
  body: string;
}

const L: Record<
  Lang,
  {
    sport: string;
    athleteName: string;
    athleteNamePlaceholder: string;
    title: string;
    titlePlaceholder: string;
    excerpt: string;
    excerptPlaceholder: string;
    coverImage: string;
    preview: string;
    upload: string;
    uploading: string;
    coverUrlPlaceholder: string;
    body: string;
    errUpload: string;
    errUploadNetwork: string;
    errBodyEmpty: string;
    errSave: string;
    errNetwork: string;
    saving: string;
    saveEdit: string;
    publish: string;
  }
> = {
  ko: {
    sport: "종목",
    athleteName: "선수 이름",
    athleteNamePlaceholder: "예: 마이클 펠프스",
    title: "제목",
    titlePlaceholder: "예: 인터벌 훈련으로 지구력 끌어올리기",
    excerpt: "요약",
    excerptPlaceholder: "목록에 보일 한두 줄 요약",
    coverImage: "커버 이미지 (선택)",
    preview: "미리보기",
    upload: "이미지 업로드",
    uploading: "업로드 중…",
    coverUrlPlaceholder: "또는 이미지 URL 직접 입력",
    body: "본문",
    errUpload: "이미지 업로드에 실패했습니다",
    errUploadNetwork: "이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.",
    errBodyEmpty: "본문을 입력하세요",
    errSave: "저장에 실패했습니다",
    errNetwork: "서버에 연결할 수 없습니다.",
    saving: "저장 중…",
    saveEdit: "수정 저장",
    publish: "게시하기",
  },
  en: {
    sport: "Sport",
    athleteName: "Athlete name",
    athleteNamePlaceholder: "e.g. Michael Phelps",
    title: "Title",
    titlePlaceholder: "e.g. Building endurance with interval training",
    excerpt: "Summary",
    excerptPlaceholder: "A one- or two-line summary shown in the list",
    coverImage: "Cover image (optional)",
    preview: "Preview",
    upload: "Upload image",
    uploading: "Uploading…",
    coverUrlPlaceholder: "Or paste an image URL",
    body: "Body",
    errUpload: "Image upload failed",
    errUploadNetwork: "Couldn't upload the image. Please try again in a moment.",
    errBodyEmpty: "Please write the body",
    errSave: "Couldn't save the post",
    errNetwork: "Couldn't reach the server.",
    saving: "Saving…",
    saveEdit: "Save changes",
    publish: "Publish",
  },
  es: {
    sport: "Deporte",
    athleteName: "Nombre del atleta",
    athleteNamePlaceholder: "ej. Michael Phelps",
    title: "Título",
    titlePlaceholder: "ej. Mejorar la resistencia con entrenamiento por intervalos",
    excerpt: "Resumen",
    excerptPlaceholder: "Un resumen de una o dos líneas para la lista",
    coverImage: "Imagen de portada (opcional)",
    preview: "Vista previa",
    upload: "Subir imagen",
    uploading: "Subiendo…",
    coverUrlPlaceholder: "O pega la URL de una imagen",
    body: "Contenido",
    errUpload: "No se pudo subir la imagen",
    errUploadNetwork: "No se pudo subir la imagen. Inténtalo de nuevo en un momento.",
    errBodyEmpty: "Escribe el contenido",
    errSave: "No se pudo guardar la publicación",
    errNetwork: "No se pudo conectar con el servidor.",
    saving: "Guardando…",
    saveEdit: "Guardar cambios",
    publish: "Publicar",
  },
};

export default function AthleteGuideEditor({
  sport,
  sportName,
  initial,
  lang = "en",
}: {
  sport: string;
  sportName: string;
  initial?: AthleteGuideEditorInitial;
  lang?: Lang;
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
  const t = L[lang];

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/blog/images", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? t.errUpload);
        return;
      }
      setCoverImage(data.url);
    } catch {
      setError(t.errUploadNetwork);
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
      setError(t.errBodyEmpty);
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
        setError(data?.error ?? t.errSave);
        setLoading(false);
        return;
      }
      window.location.assign(`/sports/${sport}/athletes/${isEdit ? initial!.slug : data.slug}`);
    } catch {
      setError(t.errNetwork);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="label">{t.sport}</label>
        <div className="input flex items-center bg-slate-50 text-slate-500">{sportName}</div>
      </div>
      <div>
        <label className="label">{t.athleteName}</label>
        <input
          className="input"
          value={athleteName}
          onChange={(e) => setAthleteName(e.target.value)}
          placeholder={t.athleteNamePlaceholder}
          maxLength={80}
          required
        />
      </div>
      <div>
        <label className="label">{t.title}</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} required />
      </div>
      <div>
        <label className="label">{t.excerpt}</label>
        <input className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={t.excerptPlaceholder} required />
      </div>

      <div>
        <label className="label">{t.coverImage}</label>
        <div className="flex items-start gap-3">
          {coverImage ? (
            // Cover images can be any origin (uploaded or externally linked),
            // so a plain <img> avoids configuring next/image remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="h-20 w-28 shrink-0 rounded-lg border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
              {t.preview}
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
              {uploading ? t.uploading : t.upload}
            </button>
            <input
              className="input text-xs"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder={t.coverUrlPlaceholder}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">{t.body}</label>
        <RichTextEditor content={body} onChange={setBody} lang={lang} />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={loading || uploading} className="btn-primary w-full">
        {loading ? t.saving : isEdit ? t.saveEdit : t.publish}
      </button>
    </form>
  );
}
