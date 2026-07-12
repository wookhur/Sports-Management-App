import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignupWizard from "@/components/onboarding/SignupWizard";
import { resolveLang, LANG_COOKIE } from "@/lib/i18n";

export default async function SignupPage() {
  if (await getSession()) redirect("/");
  const cookieStore = await cookies();
  const lang = resolveLang(cookieStore.get(LANG_COOKIE)?.value);
  return <SignupWizard lang={lang} />;
}
