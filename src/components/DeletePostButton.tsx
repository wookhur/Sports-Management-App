"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({
  slug,
  redirectTo,
  className,
  endpointBase = "/api/blog",
}: {
  slug: string;
  /** Where to navigate after a successful delete. Omit to just refresh in place. */
  redirectTo?: string;
  className?: string;
  /** API base to DELETE {endpointBase}/{slug} against. Defaults to blog posts. */
  endpointBase?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) return;
    setBusy(true);
    const res = await fetch(`${endpointBase}/${slug}`, { method: "DELETE" });
    if (res.ok) {
      if (redirectTo) window.location.assign(redirectTo);
      else router.refresh();
    } else {
      setBusy(false);
      alert("삭제에 실패했습니다.");
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className={className ?? "text-xs font-medium text-red-500 hover:text-red-600"}
    >
      {busy ? "삭제 중…" : "삭제"}
    </button>
  );
}
