import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BrandMark from "@/components/BrandMark";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export default async function LoginPage() {
  if (await getSession()) redirect("/");

  const lang = await getLang();
  const s = t(lang).login;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher lang={lang} />
        </div>
        <div className="mb-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-3xl font-bold">
            <BrandMark className="h-9 w-9" />
            Sideline365
          </Link>
          <p className="mt-2 text-sm text-slate-500">{s.tagline}</p>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="mb-6 text-xl font-bold">{s.heading}</h1>
          <AuthForm lang={lang} />
        </div>
        <div className="mt-4 rounded-xl bg-slate-800/90 p-4 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">{s.demoTitle}</p>
          <p className="mt-1">{s.demoAthlete}</p>
          <p>{s.demoCoach}</p>
        </div>
      </div>
    </main>
  );
}
