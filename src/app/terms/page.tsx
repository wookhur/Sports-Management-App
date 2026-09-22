import LegalPage from "@/components/LegalPage";
import { privacyContact } from "@/lib/consent";
import { getLang } from "@/lib/getLang";
import { termsOfUse } from "@/lib/legal";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const lang = await getLang();
  return <LegalPage doc={termsOfUse(lang, privacyContact())} lang={lang} current="terms" />;
}
