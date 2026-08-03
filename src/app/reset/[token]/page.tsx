import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ResetConfirmForm from "@/components/ResetConfirmForm";
import { checkResetToken } from "@/lib/passwordResetServer";

export const dynamic = "force-dynamic";

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  if (await getSession()) redirect("/");

  const lang = await getLang();
  const s = t(lang).reset;
  const { token } = await params;

  // Checked server-side before rendering the form, so a dead link says so
  // immediately rather than after someone types a new password twice.
  const state = await checkResetToken(token);

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
        </div>
        <div className="card p-6 sm:p-8">
          {state === "valid" ? (
            <ResetConfirmForm lang={lang} token={token} />
          ) : (
            <div className="text-center">
              <p className="text-4xl">⏳</p>
              <p className="mt-3 text-sm text-slate-600">
                {state === "expired" ? s.errExpired : state === "used" ? s.errUsed : s.errUnknown}
              </p>
              <Link href="/forgot" className="btn-primary mt-6 w-full">{s.submit}</Link>
              <Link href="/login" className="mt-4 block text-sm text-slate-500 hover:text-slate-600">
                {s.backToLogin}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
