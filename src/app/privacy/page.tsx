import LegalPage from "@/components/LegalPage";
import { privacyContact } from "@/lib/consent";
import { getLang } from "@/lib/getLang";
import { privacyNotice } from "@/lib/legal";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const lang = await getLang();
  return <LegalPage doc={privacyNotice(lang, privacyContact())} lang={lang} current="privacy" />;
}
