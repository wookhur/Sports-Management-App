import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ResetRequestForm from "@/components/ResetRequestForm";

export const dynamic = "force-dynamic";

export default async function ForgotPage() {
  if (await getSession()) redirect("/");
  const lang = await getLang();

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
          <ResetRequestForm lang={lang} />
        </div>
      </div>
    </main>
  );
}
