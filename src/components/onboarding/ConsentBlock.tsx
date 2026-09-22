"use client";

import type { SignupDict } from "@/lib/i18n";

export interface ConsentState {
  termsAccepted: boolean;
  /** The person's own answer to "are you under 18?", asked only without a birth date. */
  minorAnswer: boolean | null;
  guardianName: string;
  guardianEmail: string;
  guardianConsent: boolean;
}

export const EMPTY_CONSENT: ConsentState = {
  termsAccepted: false,
  minorAnswer: null,
  guardianName: "",
  guardianEmail: "",
  guardianConsent: false,
};

/** Whether the block has everything sign-up needs, given who this person is. */
export function consentComplete(c: ConsentState, minorFromDob: boolean | null): boolean {
  if (!c.termsAccepted) return false;
  const minor = minorFromDob ?? c.minorAnswer;
  if (minor === null) return false;
  if (!minor) return true;
  return c.guardianName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.guardianEmail) && c.guardianConsent;
}

const INPUT =
  "w-full rounded-xl border border-white/[0.08] bg-[#111C15] px-4 py-3 text-base text-[#ECF7EC] outline-none placeholder:text-[#66766A] transition focus-visible:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400";
const CHECK =
  "mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-white/30 bg-transparent accent-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400";

/**
 * The agreements on the last sign-up step.
 *
 * Terms are required for everyone. Under 18 — by birth date when one was
 * given, otherwise by asking — a parent or guardian block appears and is
 * required too. The block is part of the account step rather than a step of
 * its own so the person sees, on one screen, exactly what creating the
 * account commits them to.
 */
export default function ConsentBlock({
  s,
  value,
  minorFromDob,
  onChange,
}: {
  s: SignupDict;
  value: ConsentState;
  minorFromDob: boolean | null;
  onChange: (next: ConsentState) => void;
}) {
  const c = s.consent;
  const minor = minorFromDob ?? value.minorAnswer;
  const set = (patch: Partial<ConsentState>) => onChange({ ...value, ...patch });

  return (
    <fieldset className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <legend className="px-1 text-sm font-semibold text-[#ECF7EC]">{c.heading}</legend>

      <label htmlFor="termsAccepted" className="flex cursor-pointer items-start gap-3">
        <input
          id="termsAccepted"
          type="checkbox"
          checked={value.termsAccepted}
          onChange={(e) => set({ termsAccepted: e.target.checked })}
          className={CHECK}
          required
        />
        <span className="text-sm text-[#ECF7EC]">
          {c.termsLabelPrefix}
          <a href="/terms" target="_blank" rel="noopener" className="font-semibold text-green-300 underline">
            {c.termsLink}
          </a>
          {c.termsAnd}
          <a href="/privacy" target="_blank" rel="noopener" className="font-semibold text-green-300 underline">
            {c.privacyLink}
          </a>
          {c.termsLabelSuffix}
        </span>
      </label>

      {minorFromDob === null ? (
        <div className="mt-4" role="radiogroup" aria-label={c.ageQuestion}>
          <p className="text-sm font-medium text-[#ECF7EC]">{c.ageQuestion}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { v: true, label: c.ageUnder, id: "ageUnder" },
              { v: false, label: c.ageOver, id: "ageOver" },
            ].map((o) => (
              <button
                key={o.id}
                id={o.id}
                type="button"
                role="radio"
                aria-checked={value.minorAnswer === o.v}
                onClick={() => set({ minorAnswer: o.v })}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  value.minorAnswer === o.v
                    ? "border-green-400 bg-green-400/10 text-[#ECF7EC]"
                    : "border-white/10 text-[#A2B5A4] hover:border-white/25"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : minorFromDob ? (
        <p className="mt-4 text-sm text-[#A2B5A4]">{c.minorFromDob}</p>
      ) : null}

      {minor && (
        <div className="mt-4 rounded-xl border border-green-400/30 bg-green-400/5 p-4" data-testid="guardian-block">
          <h3 className="text-sm font-semibold text-[#ECF7EC]">{c.guardianHeading}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#A2B5A4]">{c.guardianIntro}</p>
          <label htmlFor="guardianName" className="mt-3 block text-xs font-medium text-[#A2B5A4]">
            {c.guardianName}
          </label>
          <input
            id="guardianName"
            className={`${INPUT} mt-1`}
            value={value.guardianName}
            onChange={(e) => set({ guardianName: e.target.value })}
            placeholder={c.guardianNamePlaceholder}
            autoComplete="off"
            maxLength={100}
          />
          <label htmlFor="guardianEmail" className="mt-3 block text-xs font-medium text-[#A2B5A4]">
            {c.guardianEmail}
          </label>
          <input
            id="guardianEmail"
            type="email"
            className={`${INPUT} mt-1`}
            value={value.guardianEmail}
            onChange={(e) => set({ guardianEmail: e.target.value })}
            placeholder={c.guardianEmailPlaceholder}
            autoComplete="off"
          />
          <label htmlFor="guardianConsent" className="mt-3 flex cursor-pointer items-start gap-3">
            <input
              id="guardianConsent"
              type="checkbox"
              checked={value.guardianConsent}
              onChange={(e) => set({ guardianConsent: e.target.checked })}
              className={CHECK}
            />
            <span className="text-xs leading-relaxed text-[#ECF7EC]">{c.guardianConsent}</span>
          </label>
          <p className="mt-2 pl-8 text-[11px] text-[#A2B5A4]">{c.guardianNotice}</p>
        </div>
      )}
    </fieldset>
  );
}
