import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignupWizard from "@/components/onboarding/SignupWizard";

export default async function SignupPage() {
  if (await getSession()) redirect("/");
  return <SignupWizard />;
}
