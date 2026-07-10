"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORT_LIST } from "@/lib/sports";
import {
  FOCUSES,
  GOALS,
  type Onboarding,
  saveOnboarding,
} from "@/lib/onboarding";

// Steps that show the progress bar (welcome is step 0, shown as a thin sliver).
const TOTAL = 3;

export default function OnboardingFlow({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [sports, setSports] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const [focuses, setFocuses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const progress = useMemo(() => Math.max(step, 0.4) / TOTAL, [step]);

  function next() {
    setStep((s) => s + 1);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function finish() {
    setSaving(true);
    const data: Partial<Onboarding> = {
      sports,
      goal: goal ?? undefined,
      focuses,
    };
    saveOnboarding(data);
    // Full navigation so the home dashboard reloads with the fresh session.
    window.location.assign("/");
  }

  // Whether the primary CTA is enabled for the current step.
  const canContinue =
    (step === 1 && sports.length > 0) || (step === 2 && goal) || step === 3;

  // ---------------------------------------------------------------- welcome --
  if (step === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-300/70">
          <div className="h-full w-[6%] rounded-full bg-brand" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-6xl">
            🏅
          </div>
          <h1 className="max-w-md text-3xl font-bold leading-snug text-slate-900">
            반가워요, {name}님! 저는 sideline365 AI 코치예요.
            <br />몇 가지만 여쭤보고 홈 화면을 맞춰 드릴게요.
          </h1>
          <p className="mt-4 max-w-sm text-slate-500">
            30초면 끝나요. 관심 종목과 목표를 알려주시면 딱 맞는 훈련을 추천해 드립니다.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <button onClick={next} className="btn-primary w-full py-3.5 text-base">
            좋아요, 시작할게요!
          </button>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------- steps ---
  return (
    <main className="flex min-h-screen flex-col bg-white p-6">
      {/* Top bar: back + skip + progress */}
      <div className="flex items-center justify-between">
        <button onClick={back} aria-label="이전" className="text-2xl text-slate-500 hover:text-slate-800">
          ‹
        </button>
        <button onClick={finish} className="text-sm font-semibold text-slate-400 hover:text-slate-600">
          건너뛰기
        </button>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-md flex-1 flex-col">
        {/* ------------------------------------------------------ sports --- */}
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-slate-900">어떤 종목에 관심 있으세요?</h1>
            <p className="mt-2 text-slate-500">여러 개를 골라도 좋아요.</p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SPORT_LIST.map((s) => {
                const on = sports.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(sports, setSports, s.id)}
                    className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
                      on ? "border-brand" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-3xl">{s.emoji}</div>
                    <div className="mt-2 text-lg font-bold text-slate-900">{s.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{s.tagline}</div>
                    {on && (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-sm text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* -------------------------------------------------------- goal --- */}
        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-slate-900">가장 큰 목표는 무엇인가요?</h1>
            <p className="mt-2 text-slate-500">추천에만 사용해요. 비공개로 유지됩니다.</p>
            <div className="mt-8 space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                    goal === g.id ? "border-brand bg-brand/5" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span>
                    <span className="block text-base font-bold text-slate-900">{g.title}</span>
                    <span className="block text-sm text-slate-500">{g.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------- focus --- */}
        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold text-slate-900">집중하고 싶은 것을 골라주세요</h1>
            <p className="mt-2 text-slate-500">우선순위 순서로 여러 개 선택할 수 있어요.</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {FOCUSES.map((f) => {
                const idx = focuses.indexOf(f);
                const on = idx !== -1;
                return (
                  <button
                    key={f}
                    onClick={() => toggle(focuses, setFocuses, f)}
                    className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2.5 text-sm font-medium transition ${
                      on ? "border-brand bg-brand/5 text-brand" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {on && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                    )}
                    {f}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ---------------------------------------------------------- CTA --- */}
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={step === 3 ? finish : next}
          disabled={!canContinue || saving}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-40"
        >
          {step === 3 ? (saving ? "준비 중…" : "시작하기") : "다음"}
        </button>
      </div>
    </main>
  );
}
