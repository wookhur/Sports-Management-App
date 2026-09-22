"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { AGE_LEVELS } from "@/lib/soccerDrills";
import { L as loc } from "@/lib/localized";
import { PdfImageError, prepareDrillImage, type ShrunkImage } from "@/lib/pdfImage";

const DRAW_URL = "https://soccerdrive.com/draw";

const L: Record<
  Lang,
  {
    open: string;
    close: string;
    heading: string;
    how1: string;
    how2: string;
    how3: string;
    drawLink: string;
    fileLabel: string;
    fileHint: string;
    reading: string;
    ready: (w: number, h: number, kb: number) => string;
    titleLabel: string;
    titlePlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    agesLabel: string;
    durationLabel: string;
    submit: string;
    submitting: string;
    errNoImage: string;
    errUnsupported: string;
    errCorrupt: string;
    errType: string;
    errSave: string;
    replace: string;
  }
> = {
  ko: {
    open: "내 드릴 올리기",
    close: "닫기",
    heading: "직접 그린 드릴 올리기",
    how1: "SoccerDrive에서 드릴을 그립니다.",
    how2: "Download PDF 또는 Download PNG로 저장합니다.",
    how3: "그 파일을 여기에 올리면 팀 전원이 볼 수 있어요.",
    drawLink: "soccerdrive.com/draw 열기",
    fileLabel: "드릴 파일",
    fileHint: "PDF, PNG, JPG",
    reading: "파일을 읽는 중…",
    ready: (w, h, kb) => `준비됨 · ${w}×${h} · ${kb} KB`,
    titleLabel: "드릴 이름",
    titlePlaceholder: "예: 4v2 론도",
    descLabel: "설명 (선택)",
    descPlaceholder: "진행 방법, 코칭 포인트…",
    agesLabel: "연령대",
    durationLabel: "소요 시간 (분, 선택)",
    submit: "올리기",
    submitting: "올리는 중…",
    errNoImage: "이 PDF 안에서 그림을 찾지 못했어요. SoccerDrive에서 Download PNG로 저장해서 올려주세요.",
    errUnsupported: "이 PDF 형식은 읽을 수 없어요. SoccerDrive에서 Download PNG로 저장해서 올려주세요.",
    errCorrupt: "파일을 읽을 수 없어요. 다시 내려받아 올려주세요.",
    errType: "PDF, PNG, JPG 파일만 올릴 수 있어요.",
    errSave: "드릴을 저장하지 못했습니다",
    replace: "다른 파일 선택",
  },
  en: {
    open: "Upload your own drill",
    close: "Close",
    heading: "Upload a drill you drew",
    how1: "Draw the drill on SoccerDrive.",
    how2: "Save it with Download PDF or Download PNG.",
    how3: "Upload that file here and your whole team can see it.",
    drawLink: "Open soccerdrive.com/draw",
    fileLabel: "Drill file",
    fileHint: "PDF, PNG or JPG",
    reading: "Reading the file…",
    ready: (w, h, kb) => `Ready · ${w}×${h} · ${kb} KB`,
    titleLabel: "Drill name",
    titlePlaceholder: "e.g. 4v2 rondo",
    descLabel: "Description (optional)",
    descPlaceholder: "How to run it, coaching points…",
    agesLabel: "Age groups",
    durationLabel: "Duration (minutes, optional)",
    submit: "Upload",
    submitting: "Uploading…",
    errNoImage: "Couldn't find a drawing in that PDF. On SoccerDrive, use Download PNG and upload that instead.",
    errUnsupported: "That PDF is in a format this page can't read. On SoccerDrive, use Download PNG and upload that instead.",
    errCorrupt: "That file couldn't be read. Download it again and retry.",
    errType: "Only PDF, PNG or JPG files can be uploaded.",
    errSave: "Couldn't save the drill",
    replace: "Choose a different file",
  },
  es: {
    open: "Subir mi propio ejercicio",
    close: "Cerrar",
    heading: "Sube un ejercicio que dibujaste",
    how1: "Dibuja el ejercicio en SoccerDrive.",
    how2: "Guárdalo con Download PDF o Download PNG.",
    how3: "Sube ese archivo aquí y todo tu equipo podrá verlo.",
    drawLink: "Abrir soccerdrive.com/draw",
    fileLabel: "Archivo del ejercicio",
    fileHint: "PDF, PNG o JPG",
    reading: "Leyendo el archivo…",
    ready: (w, h, kb) => `Listo · ${w}×${h} · ${kb} KB`,
    titleLabel: "Nombre del ejercicio",
    titlePlaceholder: "p. ej. Rondo 4c2",
    descLabel: "Descripción (opcional)",
    descPlaceholder: "Cómo se realiza, puntos de entrenamiento…",
    agesLabel: "Grupos de edad",
    durationLabel: "Duración (minutos, opcional)",
    submit: "Subir",
    submitting: "Subiendo…",
    errNoImage: "No se encontró ningún dibujo en ese PDF. En SoccerDrive usa Download PNG y sube ese archivo.",
    errUnsupported: "Ese PDF tiene un formato que esta página no puede leer. En SoccerDrive usa Download PNG y sube ese archivo.",
    errCorrupt: "No se pudo leer ese archivo. Descárgalo de nuevo e inténtalo otra vez.",
    errType: "Solo se pueden subir archivos PDF, PNG o JPG.",
    errSave: "No se pudo guardar el ejercicio",
    replace: "Elegir otro archivo",
  },
};

/**
 * Bring a drill in from SoccerDrive (or anywhere that exports an image).
 *
 * The file is decoded and shrunk in the browser before anything is sent, so
 * a 10 MB PDF export becomes a few hundred kilobytes of PNG and the request
 * stays well inside what the server accepts. The preview is that same PNG,
 * so what you see is exactly what gets stored.
 */
export default function DrillUpload({ sportId, lang = "en" }: { sportId: string; lang?: Lang }) {
  const s = L[lang];
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<ShrunkImage | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ages, setAges] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function pick(file: File | undefined) {
    reset();
    setError(null);
    if (!file) return;
    const okType = /^(application\/pdf|image\/(png|jpeg|webp))$/.test(file.type) || /\.(pdf|png|jpe?g|webp)$/i.test(file.name);
    if (!okType) {
      setError(s.errType);
      return;
    }
    setReading(true);
    try {
      const shrunk = await prepareDrillImage(file);
      setImage(shrunk);
      setPreview(URL.createObjectURL(shrunk.blob));
      if (!title) setTitle(file.name.replace(/\.(pdf|png|jpe?g|webp)$/i, ""));
    } catch (e) {
      const code = e instanceof PdfImageError ? e.code : "corrupt";
      setError(code === "no-image" ? s.errNoImage : code === "unsupported" ? s.errUnsupported : s.errCorrupt);
    } finally {
      setReading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) return;
    setError(null);
    setBusy(true);
    const body = new FormData();
    body.append("file", image.blob, image.blob.type === "image/jpeg" ? "drill.jpg" : "drill.png");
    body.append("title", title.trim());
    body.append("description", description.trim());
    body.append("sport", sportId);
    for (const a of ages) body.append("ageLevels", a);
    if (duration) body.append("durationMin", duration);
    const res = await fetch("/api/drills", { method: "POST", body });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errSave);
      return;
    }
    router.push(`/sports/${sportId}/drills/${data.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm">
        {s.open}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5" aria-labelledby="drill-upload-heading">
      <div className="flex items-start justify-between gap-3">
        <h2 id="drill-upload-heading" className="text-lg font-bold">
          {s.heading}
        </h2>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-xs">
          {s.close}
        </button>
      </div>

      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
        <li>
          {s.how1}{" "}
          <a href={DRAW_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-dark underline">
            {s.drawLink}
          </a>
        </li>
        <li>{s.how2}</li>
        <li>{s.how3}</li>
      </ol>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor="drill-file" className="block text-sm font-medium">
            {s.fileLabel} <span className="font-normal text-slate-500">· {s.fileHint}</span>
          </label>
          <input
            ref={fileInput}
            id="drill-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => pick(e.target.files?.[0])}
            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <p className="mt-1 min-h-[1.25rem] text-xs text-slate-500" role="status">
            {reading ? s.reading : image ? s.ready(image.width, image.height, Math.round(image.blob.size / 1024)) : ""}
          </p>
          {preview && (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* A blob URL from this page; next/image has nothing to optimise here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="block max-h-64 w-full object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="drill-title" className="block text-sm font-medium">
              {s.titleLabel}
            </label>
            <input
              id="drill-title"
              className="input mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={s.titlePlaceholder}
              maxLength={120}
              required
            />
          </div>
          <div>
            <label htmlFor="drill-desc" className="block text-sm font-medium">
              {s.descLabel}
            </label>
            <textarea
              id="drill-desc"
              className="input mt-1 min-h-[72px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={s.descPlaceholder}
              maxLength={2000}
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">{s.agesLabel}</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {AGE_LEVELS.map((a) => {
                const on = ages.includes(a.key);
                return (
                  <label
                    key={a.key}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                      on ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setAges((v) => (on ? v.filter((k) => k !== a.key) : [...v, a.key]))}
                    />
                    {loc(a.label, lang)}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="drill-duration" className="block text-sm font-medium">
              {s.durationLabel}
            </label>
            <input
              id="drill-duration"
              type="number"
              min={1}
              max={240}
              className="input mt-1 w-32"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center justify-end gap-3">
        {image && (
          <button type="button" onClick={reset} className="btn-ghost text-xs">
            {s.replace}
          </button>
        )}
        <button type="submit" disabled={busy || reading || !image || !title.trim()} className="btn-primary text-sm">
          {busy ? s.submitting : s.submit}
        </button>
      </div>
    </form>
  );
}
