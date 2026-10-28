"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Start a blank event request and open it. */
export default function NewEventButton({ teamId, label, error }: { teamId: string; label: string; error: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="btn-primary w-full text-sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          const res = await fetch(`/api/teams/${teamId}/events`, { method: "POST" }).catch(() => null);
          const data = await res?.json().catch(() => null);
          setBusy(false);
          if (!res?.ok || !data?.id) {
            setFailed(true);
            return;
          }
          router.push(`/teams/${teamId}/events?e=${data.id}`);
          router.refresh();
        }}
      >
        {label}
      </button>
      {failed && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
