"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { copy: string; copied: string; failed: string; aria: string }> = {
  ko: {
    copy: "코드 복사",
    copied: "복사했어요",
    failed: "복사 실패",
    aria: "초대 코드 복사",
  },
  en: {
    copy: "Copy code",
    copied: "Copied",
    failed: "Couldn't copy",
    aria: "Copy the invite code",
  },
  es: {
    copy: "Copiar código",
    copied: "Copiado",
    failed: "No se pudo copiar",
    aria: "Copiar el código de invitación",
  },
};

/** Copies an invite code, so nobody has to read six characters off a screen. */
export default function CopyCodeButton({ code, lang = "en" }: { code: string; lang?: Lang }) {
  const s = L[lang];
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      // Refused outright — an insecure origin, or a permissions policy. The
      // code is still on screen to copy by hand, so say so rather than lie.
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={s.aria}
      className="mt-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/25"
    >
      {state === "copied" ? s.copied : state === "failed" ? s.failed : s.copy}
    </button>
  );
}
