"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

export default function BoardComposer({ lang }: { lang: Lang }) {
  const s = t(lang).board;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<"general" | "tips" | "gameplay">("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CATS: { key: "general" | "tips" | "gameplay"; label: string }[] = [
    { key: "general", label: s.catGeneral },
    { key: "tips", label: s.catTips },
    { key: "gameplay", label: s.catGameplay },
  ];

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of files.slice(0, 6 - images.length)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/board/images", { method: "POST", body: form });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error ?? s.errSave);
          break;
        }
        setImages((prev) => [...prev, data.url]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      setError(s.errBody);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          body,
          images,
          category,
          videoUrl: videoUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? s.errSave);
        setSaving(false);
        return;
      }
      router.push(`/board/${data.id}`);
      router.refresh();
    } catch {
      setError(s.errSave);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">{s.categoryLabel}</label>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              aria-pressed={category === c.key}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                category === c.key ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {category === "gameplay" && (
        <div>
          <label className="label">{s.videoLabel}</label>
          <input
            className="input"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={s.videoPlaceholder}
          />
          <p className="mt-1 text-xs text-slate-500">{s.videoHint}</p>
        </div>
      )}

      <div>
        <label className="label">{s.titleLabel}</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={s.titlePlaceholder}
          maxLength={120}
        />
      </div>

      <div>
        <label className="label">{s.bodyLabel}</label>
        <textarea
          className="input min-h-[160px] resize-y"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={s.bodyPlaceholder}
          maxLength={5000}
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-24 w-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white"
                aria-label="remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || images.length >= 6}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? "…" : `📷 ${s.addImages}`}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/board" className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">
            {s.cancel}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
          >
            {saving ? s.publishing : s.publish}
          </button>
        </div>
      </div>
    </form>
  );
}
