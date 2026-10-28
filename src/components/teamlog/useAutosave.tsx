"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { bt } from "@/lib/bitacoraText";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Save a form a moment after the coach stops typing, the way a spreadsheet
 * keeps what you write. `send` returns whether the save worked; a failed save
 * is retried on the next change. Leaving the page with unsaved changes asks
 * first.
 */
export function useAutosave<T>(value: T, send: (v: T) => Promise<boolean>, delay = 900): SaveState {
  const json = JSON.stringify(value);
  const saved = useRef(json);
  const sendRef = useRef(send);
  sendRef.current = send;
  const [state, setState] = useState<SaveState>("idle");

  useEffect(() => {
    if (json === saved.current) return;
    const timer = setTimeout(async () => {
      setState("saving");
      const ok = await sendRef.current(JSON.parse(json) as T).catch(() => false);
      if (ok) saved.current = json;
      setState(ok ? "saved" : "error");
    }, delay);
    return () => clearTimeout(timer);
  }, [json, delay]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (json !== saved.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [json]);

  return json !== saved.current && state !== "error" ? (state === "saving" ? "saving" : "idle") : state;
}

export function SaveBadge({ state, lang }: { state: SaveState; lang: Lang }) {
  const t = bt(lang).autosave;
  const text = state === "saving" ? t.saving : state === "saved" ? t.saved : state === "error" ? t.error : "";
  return (
    <span role="status" className={`text-xs ${state === "error" ? "font-semibold text-red-700" : "text-slate-600"}`} data-testid="save-state">
      {text}
    </span>
  );
}

export async function putJson(url: string, body: unknown): Promise<boolean> {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  return !!res?.ok;
}
