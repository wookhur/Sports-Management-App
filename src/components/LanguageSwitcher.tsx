"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, type Lang } from "@/lib/i18n";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

// Sets a plain (non-httpOnly) "lang" cookie and refreshes so server
// components (which read it via next/headers cookies()) re-render in the
// new language. `dark` switches the palette to match the Roy wizard.
export default function LanguageSwitcher({ lang, dark = false }: { lang: Lang; dark?: boolean }) {
  const router = useRouter();

  function setLang(next: Lang) {
    if (next === lang) return;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    // Mirror the choice onto the account, fire-and-forget. The cookie above
    // already did the visible work, so a failure here (offline, signed out)
    // must not block the switch — it only costs the weekly digest its
    // language preference until the next time they toggle.
    void fetch("/api/settings/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: next }),
    }).catch(() => {});
    router.refresh();
  }

  const track = dark ? "bg-white/5" : "bg-slate-100";
  const idleText = dark ? "text-[#A2B5A4] hover:text-[#ECF7EC]" : "text-slate-600 hover:text-slate-900";
  const activePill = dark ? "bg-white/10 text-green-300" : "bg-white text-brand shadow-sm";

  return (
    <div className={`inline-flex items-center gap-1 rounded-full ${track} p-1 text-xs font-semibold`}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLang(opt.code)}
          aria-pressed={lang === opt.code}
          // nowrap: "한국어" broke onto two lines in the landing page's tight
          // phone header, which pushed the whole row out of shape.
          className={`whitespace-nowrap rounded-full px-2.5 py-1 transition ${lang === opt.code ? activePill : idleText}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
