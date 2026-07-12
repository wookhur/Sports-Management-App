"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, type Lang } from "@/lib/i18n";

// Sets a plain (non-httpOnly) "lang" cookie and refreshes so server
// components (which read it via next/headers cookies()) re-render in the
// new language. `dark` switches the palette to match the Roy wizard.
export default function LanguageSwitcher({ lang, dark = false }: { lang: Lang; dark?: boolean }) {
  const router = useRouter();

  function setLang(next: Lang) {
    if (next === lang) return;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  const track = dark ? "bg-white/5" : "bg-slate-100";
  const idleText = dark ? "text-[#9CB3AE] hover:text-[#EAFBF6]" : "text-slate-400 hover:text-slate-700";
  const activePill = dark ? "bg-white/10 text-teal-300" : "bg-white text-brand shadow-sm";

  return (
    <div className={`inline-flex items-center gap-1 rounded-full ${track} p-1 text-xs font-semibold`}>
      <button
        type="button"
        onClick={() => setLang("ko")}
        aria-pressed={lang === "ko"}
        className={`rounded-full px-2.5 py-1 transition ${lang === "ko" ? activePill : idleText}`}
      >
        한국어
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2.5 py-1 transition ${lang === "en" ? activePill : idleText}`}
      >
        EN
      </button>
    </div>
  );
}
