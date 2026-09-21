"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { label: string; busy: string; confirm: string; failed: string }> = {
  ko: {
    label: "새 코드 발급",
    busy: "발급 중…",
    confirm:
      "새 초대 코드를 발급할까요? 지금 코드는 더 이상 쓸 수 없게 됩니다. 이미 들어온 멤버는 그대로예요.",
    failed: "새 코드를 발급하지 못했습니다",
  },
  en: {
    label: "New code",
    busy: "Issuing…",
    confirm:
      "Issue a new invite code? The current one will stop working. Everyone already on the team stays.",
    failed: "Couldn't issue a new code",
  },
  es: {
    label: "Nuevo código",
    busy: "Generando…",
    confirm:
      "¿Generar un nuevo código de invitación? El actual dejará de funcionar. Quienes ya están en el equipo se quedan.",
    failed: "No se pudo generar un nuevo código",
  },
};

/** Retire a leaked invite code. Owner only — the server checks. */
export default function RegenerateCodeButton({ teamId, lang = "en" }: { teamId: string; lang?: Lang }) {
  const s = L[lang];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    if (!confirm(s.confirm)) return;
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/teams/${teamId}/code`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? s.failed);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={regenerate}
        disabled={busy}
        className="mt-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        {busy ? s.busy : s.label}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </>
  );
}
