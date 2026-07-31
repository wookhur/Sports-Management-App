"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Toggles the weekly digest on or off for the signed-in coach. */
export default function DigestOptOut({
  optedOut,
  onLabel,
  offLabel,
}: {
  optedOut: boolean;
  onLabel: string;
  offLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const on = !optedOut;

  async function toggle() {
    setSaving(true);
    await fetch("/api/settings/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optOut: on }),
    }).catch(() => {});
    setSaving(false);
    // Re-read from the server rather than flipping local state, so the button
    // can never disagree with what the scheduler will actually do.
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving || pending}
      aria-pressed={on}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
        on ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {on ? `✓ ${onLabel}` : offLabel}
    </button>
  );
}
