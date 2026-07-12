import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignupWizard from "@/components/onboarding/SignupWizard";
import { getLang } from "@/lib/getLang";

export default async function SignupPage() {
  if (await getSession()) redirect("/");
  const lang = await getLang();
  return <SignupWizard lang={lang} />;
}
