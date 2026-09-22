"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { del: string; deleting: string; confirm: string; err: string }> = {
  ko: { del: "드릴 삭제", deleting: "삭제 중…", confirm: "이 드릴을 삭제할까요? 팀 전원에게서 사라집니다.", err: "드릴을 삭제하지 못했습니다" },
  en: { del: "Delete drill", deleting: "Deleting…", confirm: "Delete this drill? It disappears for the whole team.", err: "Couldn't delete the drill" },
  es: { del: "Eliminar ejercicio", deleting: "Eliminando…", confirm: "¿Eliminar este ejercicio? Desaparecerá para todo el equipo.", err: "No se pudo eliminar el ejercicio" },
};

/** The owner's delete control on a custom drill page. */
export default function DeleteDrillButton({ id, sportId, lang = "en" }: { id: string; sportId: string; lang?: Lang }) {
  const s = L[lang];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!confirm(s.confirm)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/drills/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? s.err);
      setBusy(false);
      return;
    }
    router.push(`/sports/${sportId}/drills`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
      <button type="button" onClick={remove} disabled={busy} className="btn-danger text-xs">
        {busy ? s.deleting : s.del}
      </button>
    </div>
  );
}
