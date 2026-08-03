"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

/** Per-user toggles for which home-dashboard sections show. Persists on each
 *  change (optimistic) so there's no separate save button. */
export default function HomeSettings({
  lang,
  widgets,
  initialHidden,
}: {
  lang: Lang;
  widgets: string[];
  initialHidden: string[];
}) {
  const s = t(lang).settings;
  const router = useRouter();
  const [hidden, setHidden] = useState<Set<string>>(new Set(initialHidden));
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function toggle(key: string) {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHidden(next);
    setStatus("idle");
    try {
      const res = await fetch("/api/settings/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: [...next] }),
      });
      if (res.ok) {
        setStatus("saved");
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="card p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-bold">⚙️ {s.homeTitle}</h2>
        {status === "saved" && <span className="text-xs font-medium text-emerald-700">✓ {s.saved}</span>}
        {status === "error" && <span className="text-xs font-medium text-red-500">{s.saveErr}</span>}
      </div>
      <p className="mb-3 text-sm text-slate-500">{s.homeSub}</p>
      <ul className="divide-y divide-slate-100">
        {widgets.map((key) => {
          const on = !hidden.has(key);
          return (
            <li key={key} className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium">{s.widgets[key] ?? key}</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={s.widgets[key] ?? key}
                onClick={() => toggle(key)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    on ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
