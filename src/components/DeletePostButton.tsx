"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const L: Record<
  Lang,
  { confirm: string; failed: string; label: string; busy: string }
> = {
  ko: {
    confirm: "이 글을 삭제할까요? 되돌릴 수 없어요.",
    failed: "삭제에 실패했습니다.",
    label: "삭제",
    busy: "삭제 중…",
  },
  en: {
    confirm: "Delete this post? This can't be undone.",
    failed: "Couldn't delete the post.",
    label: "Delete",
    busy: "Deleting…",
  },
  es: {
    confirm: "¿Eliminar esta publicación? No se puede deshacer.",
    failed: "No se pudo eliminar la publicación.",
    label: "Eliminar",
    busy: "Eliminando…",
  },
};

export default function DeletePostButton({
  slug,
  redirectTo,
  className,
  endpointBase = "/api/blog",
  lang = "en",
}: {
  slug: string;
  /** Where to navigate after a successful delete. Omit to just refresh in place. */
  redirectTo?: string;
  className?: string;
  /** API base to DELETE {endpointBase}/{slug} against. Defaults to blog posts. */
  endpointBase?: string;
  lang?: Lang;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const t = L[lang];

  async function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t.confirm)) return;
    setBusy(true);
    const res = await fetch(`${endpointBase}/${slug}`, { method: "DELETE" });
    if (res.ok) {
      if (redirectTo) window.location.assign(redirectTo);
      else router.refresh();
    } else {
      setBusy(false);
      alert(t.failed);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className={className ?? "text-xs font-medium text-red-600 hover:text-red-700"}
    >
      {busy ? t.busy : t.label}
    </button>
  );
}
