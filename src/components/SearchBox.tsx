"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { placeholder: string; ariaLabel: string }> = {
  ko: { placeholder: "검색", ariaLabel: "통합 검색" },
  en: { placeholder: "Search", ariaLabel: "Search" },
  es: { placeholder: "Buscar", ariaLabel: "Búsqueda" },
};

export default function SearchBox({
  compact = false,
  initial = "",
  lang = "ko",
}: {
  compact?: boolean;
  initial?: string;
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={s.placeholder}
        aria-label={s.ariaLabel}
        className={`rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 ${
          compact ? "w-32 py-1.5 focus:w-44" : "w-full py-2.5"
        }`}
      />
    </form>
  );
}
