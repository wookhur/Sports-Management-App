"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

export default function DeleteSessionButton({ id, lang }: { id: string; lang: Lang }) {
  const s = t(lang).journal;
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm(s.deleteConfirm)) return;
    setBusy(true);
    const res = await fetch(`/api/training/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={del}
      disabled={busy}
      aria-label={s.deleteAria}
      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
    >
      ✕
    </button>
  );
}
