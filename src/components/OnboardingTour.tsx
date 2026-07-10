"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getOnboardingSteps } from "@/lib/onboarding";

export default function OnboardingTour({
  role,
  initialOpen,
}: {
  role: "ATHLETE" | "COACH";
  initialOpen: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);
  const steps = getOnboardingSteps(role);
  const isLast = step === steps.length - 1;

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
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            건너뛰기 ✕
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
            이전
          </button>
          <button onClick={next} className="btn-primary">
            {isLast ? "시작하기 🚀" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
