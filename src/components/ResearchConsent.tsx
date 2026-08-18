"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

const L: Record<
  Lang,
  { heading: string; label: string; detail: string; notAsked: string; on: string; off: string }
> = {
  ko: {
    heading: "연구 목적 데이터 활용",
    label: "훈련 기록이 연구 목적으로 사용되는 데 동의합니다",
    detail:
      "훈련·기록 데이터가 개인을 식별할 수 없는 형태로 처리되어 연구와 서비스 개선에 쓰일 수 있습니다. 동의하지 않아도 모든 기능을 그대로 사용할 수 있습니다.",
    notAsked: "아직 선택하지 않으셨어요.",
    on: "동의함",
    off: "동의 안 함",
  },
  en: {
    heading: "Research use of your data",
    label: "I agree that my training data may be used for research",
    detail:
      "Training and performance data may be used in a de-identified form for research and to improve the service. Every feature works the same if you decline.",
    notAsked: "You haven't chosen yet.",
    on: "Agreed",
    off: "Not agreed",
  },
  es: {
    heading: "Uso de tus datos para investigación",
    label: "Acepto que mis datos de entrenamiento se usen para investigación",
    detail:
      "Los datos de entrenamiento y de marcas podrán usarse de forma anonimizada para investigación y para mejorar el servicio. Todas las funciones siguen igual si no aceptas.",
    notAsked: "Todavía no has elegido.",
    on: "Aceptado",
    off: "No aceptado",
  },
};

/**
 * Grant or withdraw research consent.
 *
 * `consent` is tri-state: null means the account predates the question. That
 * case shows no ticked box and no "off" claim — an account nobody ever asked
 * must not be displayed as having refused, any more than as having agreed.
 */
export default function ResearchConsent({ lang, consent }: { lang: Lang; consent: boolean | null }) {
  const s = L[lang];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  // Driven locally so the tick responds to the click, then reconciled with the
  // server on refresh. Reading `consent` directly would pin the box to its
  // saved value until the round-trip lands, which on a slow connection looks
  // like a control that ignores you.
  const [value, setValue] = useState<boolean | null>(consent);
  useEffect(() => setValue(consent), [consent]);

  async function set(next: boolean) {
    setValue(next);
    setSaving(true);
    const res = await fetch("/api/settings/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: next }),
    }).catch(() => null);
    setSaving(false);
    // A failed write must not leave the box claiming a consent decision the
    // server never recorded — put it back and let the refresh confirm.
    if (!res?.ok) setValue(consent);
    startTransition(() => router.refresh());
  }

  return (
    <section className="card mt-6 p-5">
      <h2 className="text-base font-bold">{s.heading}</h2>
      <label htmlFor="researchConsentToggle" className="mt-3 flex cursor-pointer items-start gap-3">
        <input
          id="researchConsentToggle"
          type="checkbox"
          checked={value === true}
          disabled={saving || pending}
          onChange={(e) => set(e.target.checked)}
          aria-describedby="researchConsentToggleDetail"
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand disabled:opacity-50"
        />
        <span className="text-sm font-medium">{s.label}</span>
      </label>
      <p id="researchConsentToggleDetail" className="mt-2 pl-8 text-xs leading-relaxed text-slate-500">
        {s.detail}
      </p>
      <p className="mt-2 pl-8 text-xs font-semibold text-slate-500">
        {value == null ? s.notAsked : value ? `✓ ${s.on}` : s.off}
      </p>
    </section>
  );
}
