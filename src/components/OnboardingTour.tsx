"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getOnboardingSteps, type OnboardingStep } from "@/lib/onboarding";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { skip: string; prev: string; next: string; start: string }> = {
  ko: { skip: "건너뛰기 ✕", prev: "이전", next: "다음", start: "시작하기 🚀" },
  en: { skip: "Skip ✕", prev: "Back", next: "Next", start: "Get started 🚀" },
  es: { skip: "Omitir ✕", prev: "Atrás", next: "Siguiente", start: "Comenzar 🚀" },
};

// Translated tour steps. Korean (the source of truth) lives in
// src/lib/onboarding.ts and is used as-is for "ko".
const ATHLETE_STEPS_EN: OnboardingStep[] = [
  {
    emoji: "🏅",
    title: "Welcome to Sideline365!",
    body: "Track your records and share them with your coach to get better results. The tour takes just a minute.",
  },
  {
    emoji: "🥍",
    title: "Pick a sport",
    body: "Tap a sport card on the home screen. Lacrosse and soccer offer step-by-step training guides, and swimming lets you time your records.",
  },
  {
    emoji: "⏱️",
    title: "Time your records",
    body: "On the swimming screen, time yourself with the stopwatch — or type a time directly in the 'Manual entry' tab.",
  },
  {
    emoji: "🤝",
    title: "Share with your coach",
    body: "Turn on the share switch on any record so your connected coach can see it and leave feedback.",
  },
  {
    emoji: "📮",
    title: "Connect with your coach",
    body: "Register your coach's email on the 'My records' page to link up. Ready to get started?",
  },
];

const COACH_STEPS_EN: OnboardingStep[] = [
  {
    emoji: "🏅",
    title: "Welcome to Sideline365!",
    body: "A coach dashboard for reviewing your athletes' records and leaving feedback. The tour takes just a minute.",
  },
  {
    emoji: "📋",
    title: "Add athletes to your roster",
    body: "Enter an athlete's email on the coach dashboard to add them to your roster and see the records they share.",
  },
  {
    emoji: "📈",
    title: "Review shared records",
    body: "Records your athletes share are gathered on the dashboard — see personal bests and trends at a glance.",
  },
  {
    emoji: "💬",
    title: "Leave feedback",
    body: "Leave coaching points as comments under a record and your athlete will see them right away. Ready to get started?",
  },
];

const ATHLETE_STEPS_ES: OnboardingStep[] = [
  {
    emoji: "🏅",
    title: "¡Bienvenido a Sideline365!",
    body: "Registra tus marcas y compártelas con tu entrenador para mejorar tus resultados. El recorrido toma solo un minuto.",
  },
  {
    emoji: "🥍",
    title: "Elige un deporte",
    body: "Toca una tarjeta de deporte en la pantalla de inicio. Lacrosse y fútbol tienen guías de entrenamiento paso a paso, y natación te permite cronometrar tus marcas.",
  },
  {
    emoji: "⏱️",
    title: "Cronometra tus marcas",
    body: "En la pantalla de natación, mide tu tiempo con el cronómetro o escríbelo directamente en la pestaña de 'Entrada manual'.",
  },
  {
    emoji: "🤝",
    title: "Comparte con tu entrenador",
    body: "Activa el interruptor de compartir en cualquier marca para que tu entrenador conectado la vea y deje comentarios.",
  },
  {
    emoji: "📮",
    title: "Conecta con tu entrenador",
    body: "Registra el correo de tu entrenador en la página 'Mis marcas' para conectarse. ¿Empezamos?",
  },
];

const COACH_STEPS_ES: OnboardingStep[] = [
  {
    emoji: "🏅",
    title: "¡Bienvenido a Sideline365!",
    body: "Un panel para entrenadores donde revisas las marcas de tus atletas y dejas comentarios. El recorrido toma solo un minuto.",
  },
  {
    emoji: "📋",
    title: "Agrega atletas a tu plantilla",
    body: "Escribe el correo de un atleta en el panel del entrenador para agregarlo a tu plantilla y ver las marcas que comparta.",
  },
  {
    emoji: "📈",
    title: "Revisa las marcas compartidas",
    body: "Las marcas que comparten tus atletas se reúnen en el panel: verás mejores marcas y tendencias de un vistazo.",
  },
  {
    emoji: "💬",
    title: "Deja comentarios",
    body: "Deja puntos de coaching como comentarios bajo una marca y tu atleta los verá al instante. ¿Empezamos?",
  },
];

function stepsFor(role: "ATHLETE" | "COACH", lang: Lang): OnboardingStep[] {
  if (lang === "en") return role === "COACH" ? COACH_STEPS_EN : ATHLETE_STEPS_EN;
  if (lang === "es") return role === "COACH" ? COACH_STEPS_ES : ATHLETE_STEPS_ES;
  return getOnboardingSteps(role);
}

export default function OnboardingTour({
  role,
  initialOpen,
  lang = "ko",
}: {
  role: "ATHLETE" | "COACH";
  initialOpen: boolean;
  lang?: Lang;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);
  const steps = stepsFor(role, lang);
  const isLast = step === steps.length - 1;
  const s = L[lang];

  async function close() {
    setOpen(false);
    // Clean up ?tutorial=1 if present, and refresh so the server knows
    // onboarding is done.
    router.replace("/");
    await fetch("/api/onboarding/complete", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  function next() {
    if (isLast) {
      close();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (!open) return null;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-7">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="text-xs font-medium text-slate-500 hover:text-slate-600"
          >
            {s.skip}
          </button>
        </div>

        <div className="text-center">
          <div className="text-5xl">{current.emoji}</div>
          <h2 className="mt-4 text-lg font-bold">{current.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{current.body}</p>
        </div>

        {/* Progress dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-brand" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[auto_1fr] gap-2">
          <button onClick={prev} disabled={step === 0} className="btn-ghost">
            {s.prev}
          </button>
          <button onClick={next} className="btn-primary">
            {isLast ? s.start : s.next}
          </button>
        </div>
      </div>
    </div>
  );
}
