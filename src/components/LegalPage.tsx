import Link from "next/link";
import BrandMark from "./BrandMark";
import LanguageSwitcher from "./LanguageSwitcher";
import type { LegalDoc } from "@/lib/legal";
import type { Lang } from "@/lib/i18n";

const NAV: Record<Lang, { privacy: string; terms: string; back: string }> = {
  ko: { privacy: "개인정보 처리방침", terms: "이용약관", back: "← 로그인" },
  en: { privacy: "Privacy Notice", terms: "Terms of Use", back: "← Sign in" },
  es: { privacy: "Aviso de privacidad", terms: "Términos de uso", back: "← Iniciar sesión" },
};

/** A public legal document: readable signed out, in the visitor's language. */
export default function LegalPage({ doc, lang, current }: { doc: LegalDoc; lang: Lang; current: "privacy" | "terms" }) {
  const n = NAV[lang];
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/login" className="inline-flex items-center gap-2 text-lg font-bold">
          <BrandMark className="h-6 w-6" />
          Sideline365
        </Link>
        <LanguageSwitcher lang={lang} />
      </div>
      <nav aria-label="Legal" className="mt-6 flex gap-2 text-sm">
        {(["privacy", "terms"] as const).map((k) => (
          <Link
            key={k}
            href={`/${k}`}
            aria-current={current === k ? "page" : undefined}
            className={`rounded-full border px-3.5 py-1.5 font-medium ${
              current === k ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {n[k]}
          </Link>
        ))}
      </nav>
      <article className="card mt-4 p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{doc.updated}</p>
        <p className="mt-4 leading-relaxed text-slate-700">{doc.intro}</p>
        {doc.sections.map((sec) => {
          const items = sec.body.filter((b) => b.startsWith("- "));
          const paras = sec.body.filter((b) => !b.startsWith("- "));
          return (
            <section key={sec.heading} className="mt-6">
              <h2 className="text-lg font-bold">{sec.heading}</h2>
              {items.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                  {items.map((b) => (
                    <li key={b}>{b.slice(2)}</li>
                  ))}
                </ul>
              )}
              {paras.map((b) => (
                <p key={b} className="mt-2 leading-relaxed text-slate-700">
                  {b}
                </p>
              ))}
            </section>
          );
        })}
      </article>
      <p className="mt-6 text-sm">
        <Link href="/login" className="text-slate-500 hover:text-slate-600">
          {n.back}
        </Link>
      </p>
    </main>
  );
}
