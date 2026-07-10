import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import OnboardingFlow from "./OnboardingFlow";

// Shown right after signup: a logged-in visitor personalizes their experience
// (interests + goal) before landing on the home dashboard.
export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <OnboardingFlow name={session.name} />;
}
