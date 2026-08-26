"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";
import { actorName, type NotificationView } from "@/lib/notify";
import { formatRelative } from "@/lib/format";
import { BellIcon } from "./navIcons";

export default function NotificationBell({ lang, initialUnread }: { lang: Lang; initialUnread: number }) {
  const s = t(lang).notifications;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotificationView[] | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — a dropdown that won't dismiss is
  // worse than no dropdown.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;

    const res = await fetch("/api/notifications").catch(() => null);
    const data = res && res.ok ? await res.json().catch(() => null) : null;
    setItems((data?.items as NotificationView[]) ?? []);

    // Opening the panel is the read receipt. Clear the badge immediately so it
    // doesn't sit there looking unread while the request is in flight.
    if (unread > 0) {
      setUnread(0);
      await fetch("/api/notifications", { method: "POST" }).catch(() => {});
      router.refresh();
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label={s.ariaLabel}
        aria-expanded={open}
        className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold">{s.title}</p>
          </div>

          {items === null ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">…</p>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-500">{s.empty}</p>
              <p className="mt-1 text-xs text-slate-500">{s.emptyHint}</p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {items.map((n) => {
                const render = s.line[n.kind];
                // An unknown kind (older row, newer client) is skipped rather
                // than rendered as a blank line.
                if (!render) return null;
                const body = (
                  <>
                    <p className={`text-sm ${n.read ? "text-slate-500" : "font-semibold text-slate-800"}`}>
                      {render(actorName(n.data))}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatRelative(n.createdAt, lang)}</p>
                  </>
                );
                return (
                  <li key={n.id} className={n.read ? "" : "bg-brand/5"}>
                    {n.href ? (
                      <Link href={n.href} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-slate-50">
                        {body}
                      </Link>
                    ) : (
                      <div className="px-4 py-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
