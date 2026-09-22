import type { Lang } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

const L: Record<
  Lang,
  {
    heading: string;
    terms: (when: string) => string;
    termsNone: string;
    adult: string;
    minor: string;
    guardian: (name: string, email: string, when: string) => string;
    guardianNone: string;
    rights: (contact: string) => string;
  }
> = {
  ko: {
    heading: "가입 시 동의 내역",
    terms: (when) => `이용약관과 개인정보 처리방침에 ${when}에 동의했어요.`,
    termsNone: "이 계정은 약관 동의 절차가 생기기 전에 만들어졌어요.",
    adult: "가입 당시 만 18세 이상으로 기록되었습니다.",
    minor: "가입 당시 만 18세 미만으로 기록되었습니다.",
    guardian: (name, email, when) => `보호자 ${name} (${email})이 ${when}에 동의했어요.`,
    guardianNone: "보호자 동의가 기록되어 있지 않아요.",
    rights: (contact) => `열람·정정·삭제 요청이나 동의 철회: ${contact}`,
  },
  en: {
    heading: "Sign-up agreements",
    terms: (when) => `You accepted the Terms of Use and Privacy Notice on ${when}.`,
    termsNone: "This account was created before the agreements were introduced.",
    adult: "Recorded as 18 or older at sign-up.",
    minor: "Recorded as under 18 at sign-up.",
    guardian: (name, email, when) => `${name} (${email}) consented as parent or guardian on ${when}.`,
    guardianNone: "No parent or guardian consent is on record.",
    rights: (contact) => `To see, correct or delete your information, or withdraw consent: ${contact}`,
  },
  es: {
    heading: "Acuerdos del registro",
    terms: (when) => `Aceptaste los Términos de uso y el Aviso de privacidad el ${when}.`,
    termsNone: "Esta cuenta se creó antes de que existieran los acuerdos.",
    adult: "Registrado como mayor de 18 años al registrarse.",
    minor: "Registrado como menor de 18 años al registrarse.",
    guardian: (name, email, when) => `${name} (${email}) dio su consentimiento como padre, madre o tutor el ${when}.`,
    guardianNone: "No hay consentimiento de padre, madre o tutor registrado.",
    rights: (contact) => `Para ver, corregir o eliminar tu información, o retirar el consentimiento: ${contact}`,
  },
};

/**
 * What this account agreed to at sign-up, as a matter of record.
 *
 * Read-only: these are facts about the past, not settings. Withdrawing is a
 * request to the operator (it deletes the account), so the contact is here
 * rather than a switch.
 */
export default function ConsentSummary({
  lang,
  contact,
  termsAcceptedAt,
  isMinor,
  guardianName,
  guardianEmail,
  guardianConsentAt,
}: {
  lang: Lang;
  contact: string;
  termsAcceptedAt: Date | null;
  isMinor: boolean | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianConsentAt: Date | null;
}) {
  const s = L[lang];
  return (
    <section className="mt-6" aria-labelledby="consent-summary-heading">
      <h2 id="consent-summary-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {s.heading}
      </h2>
      <div className="card space-y-2 p-5 text-sm text-slate-700">
        <p>{termsAcceptedAt ? s.terms(formatDate(termsAcceptedAt, lang)) : s.termsNone}</p>
        {isMinor !== null && <p>{isMinor ? s.minor : s.adult}</p>}
        {isMinor && (
          <p>
            {guardianName && guardianEmail && guardianConsentAt
              ? s.guardian(guardianName, guardianEmail, formatDate(guardianConsentAt, lang))
              : s.guardianNone}
          </p>
        )}
        <p className="text-xs text-slate-500">{s.rights(contact)}</p>
      </div>
    </section>
  );
}
