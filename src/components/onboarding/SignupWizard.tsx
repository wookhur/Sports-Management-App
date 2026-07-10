"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SPORT_LIST } from "@/lib/sports";
import { EXPERIENCE_LEVELS, GRADE_OPTIONS } from "@/lib/onboarding";
import RoyAvatar from "./RoyAvatar";

const ADJ = ["Swift", "Mighty", "Brave", "Clever", "Bold", "Quick", "Fierce", "Steady"];
const NOUN = ["Falcon", "Tiger", "Wave", "Comet", "Blaze", "Storm", "Panther", "Ranger"];
function suggestUsername() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}${n}${Math.floor(Math.random() * 100)}`;
}

type Role = "ATHLETE" | "COACH";
type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["value"];

// Step 0 is the Roy intro; steps 1-7 are the questions below.
const TOTAL_STEPS = 8;

export default function SignupWizard() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(suggestUsername);
  const [school, setSchool] = useState("");
  const [sportInterests, setSportInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [dob, setDob] = useState("");
  const [grade, setGrade] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progressPct = useMemo(() => Math.max(((step + 1) / TOTAL_STEPS) * 100, 6), [step]);

  function goNext() {
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }
  function toggleSport(id: string) {
    setSportInterests((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function submit() {
    if (!role) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          school: school || undefined,
          sportInterests,
          experienceLevel: experienceLevel ?? undefined,
          dob: dob || undefined,
          grade: grade ?? undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "가입에 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      window.location.assign("/");
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
        {/* Top bar: back + skip */}
        {step > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={goBack}
              aria-label="이전"
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              ‹
            </button>
            {step <= 5 && (
              <button
                onClick={goNext}
                className="text-sm font-medium text-neutral-400 hover:text-white"
              >
                건너뛰기
              </button>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-teal-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step content */}
        <div className="mt-8 flex flex-1 flex-col">
          {step === 0 && (
            <IntroStep onOkay={goNext} />
          )}
          {step === 1 && (
            <UsernameStep
              username={username}
              onChange={setUsername}
              onSuggest={() => setUsername(suggestUsername())}
              onNext={goNext}
            />
          )}
          {step === 2 && <SchoolStep school={school} onChange={setSchool} onNext={goNext} />}
          {step === 3 && (
            <SportInterestsStep selected={sportInterests} onToggle={toggleSport} onNext={goNext} />
          )}
          {step === 4 && (
            <ExperienceStep
              value={experienceLevel}
              onChange={setExperienceLevel}
              onNext={goNext}
            />
          )}
          {step === 5 && (
            <DobGradeStep
              dob={dob}
              onDobChange={setDob}
              grade={grade}
              onGradeChange={setGrade}
              onNext={goNext}
            />
          )}
          {step === 6 && <RoleStep value={role} onChange={setRole} onNext={goNext} />}
          {step === 7 && (
            <AccountStep
              email={email}
              password={password}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={submit}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function IntroStep({ onOkay }: { onOkay: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-bold leading-tight">
        안녕하세요! 저는 여러분의 AI 코치 <span className="text-teal-400">Roy</span>예요.
      </h1>
      <p className="mt-3 text-lg text-neutral-300">
        딱 맞는 코칭을 추천해드리기 위해 몇 가지 질문을 드릴게요.
      </p>
      <div className="flex flex-1 items-center justify-center">
        <RoyAvatar />
      </div>
      <div className="mt-auto space-y-4">
        <button onClick={onOkay} className="w-full rounded-full bg-teal-400 py-4 text-base font-bold text-neutral-900 hover:bg-teal-300">
          좋아요!
        </button>
        <p className="text-center text-sm text-neutral-400">
          <Link href="/login" className="font-semibold text-teal-400 hover:underline">
            이미 계정이 있어요
          </Link>
        </p>
      </div>
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold leading-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-neutral-400">{subtitle}</p>}
    </div>
  );
}

function NextButton({ onClick, disabled, label = "다음" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-auto w-full rounded-full bg-teal-400 py-4 text-base font-bold text-neutral-900 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function UsernameStep({
  username,
  onChange,
  onSuggest,
  onNext,
}: {
  username: string;
  onChange: (v: string) => void;
  onSuggest: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="아이디를 만들어주세요" subtitle="추천 아이디를 쓰거나 직접 입력하세요. 나중에 바꿀 수 있어요." />
      <input
        className="w-full rounded-2xl bg-neutral-800 px-5 py-4 text-lg text-white outline-none focus:ring-2 focus:ring-teal-400"
        value={username}
        onChange={(e) => onChange(e.target.value)}
        maxLength={20}
      />
      <button onClick={onSuggest} className="mt-3 self-start text-sm font-medium text-teal-400 hover:underline">
        🔀 다른 아이디 추천받기
      </button>
      <NextButton onClick={onNext} disabled={username.trim().length < 3} />
    </div>
  );
}

function SchoolStep({ school, onChange, onNext }: { school: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="어느 학교에 다니세요?" subtitle="코칭 추천에만 활용돼요. (선택)" />
      <input
        className="w-full rounded-2xl bg-neutral-800 px-5 py-4 text-lg text-white outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-teal-400"
        value={school}
        onChange={(e) => onChange(e.target.value)}
        placeholder="예: 한국고등학교"
        maxLength={100}
      />
      <NextButton onClick={onNext} />
    </div>
  );
}

function SportInterestsStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="관심 있는 종목을 모두 골라주세요" subtitle="여러 개를 선택할 수 있어요." />
      <div className="space-y-3">
        {SPORT_LIST.map((sport) => {
          const isSelected = selected.includes(sport.id);
          return (
            <button
              key={sport.id}
              onClick={() => onToggle(sport.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                isSelected ? "border-teal-400 bg-teal-400/10" : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <span className="text-3xl">{sport.emoji}</span>
              <span className="flex-1">
                <span className="block font-bold">{sport.name}</span>
                <span className="block text-sm text-neutral-400">{sport.tagline}</span>
              </span>
              {isSelected && <span className="text-teal-400">✓</span>}
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} />
    </div>
  );
}

function ExperienceStep({
  value,
  onChange,
  onNext,
}: {
  value: ExperienceLevel | null;
  onChange: (v: ExperienceLevel) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="운동 경험이 얼마나 되세요?" />
      <div className="space-y-3">
        {EXPERIENCE_LEVELS.map((lvl) => {
          const isSelected = value === lvl.value;
          return (
            <button
              key={lvl.value}
              onClick={() => onChange(lvl.value)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                isSelected ? "border-teal-400 bg-teal-400/10" : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <span className="block font-bold">{lvl.label}</span>
              <span className="block text-sm text-neutral-400">{lvl.detail}</span>
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} />
    </div>
  );
}

function DobGradeStep({
  dob,
  onDobChange,
  grade,
  onGradeChange,
  onNext,
}: {
  dob: string;
  onDobChange: (v: string) => void;
  grade: string | null;
  onGradeChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="생년월일과 학년을 알려주세요" subtitle="코칭 추천에만 활용돼요. (선택)" />
      <label className="mb-1.5 block text-sm font-medium text-neutral-400">생년월일</label>
      <input
        type="date"
        className="w-full rounded-2xl bg-neutral-800 px-5 py-4 text-lg text-white outline-none focus:ring-2 focus:ring-teal-400 [color-scheme:dark]"
        value={dob}
        onChange={(e) => onDobChange(e.target.value)}
      />
      <label className="mb-1.5 mt-5 block text-sm font-medium text-neutral-400">학년</label>
      <div className="grid grid-cols-2 gap-2">
        {GRADE_OPTIONS.map((g) => (
          <button
            key={g}
            onClick={() => onGradeChange(g)}
            className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
              grade === g ? "border-teal-400 bg-teal-400/10" : "border-neutral-800 bg-neutral-900 text-neutral-300"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <NextButton onClick={onNext} />
    </div>
  );
}

function RoleStep({ value, onChange, onNext }: { value: Role | null; onChange: (v: Role) => void; onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="선수인가요, 코치인가요?" subtitle="역할에 따라 화면이 달라져요." />
      <div className="space-y-3">
        <button
          onClick={() => onChange("ATHLETE")}
          className={`w-full rounded-2xl border p-4 text-left transition ${
            value === "ATHLETE" ? "border-teal-400 bg-teal-400/10" : "border-neutral-800 bg-neutral-900"
          }`}
        >
          <span className="block font-bold">🏃 선수</span>
          <span className="block text-sm text-neutral-400">기록을 측정하고 코치에게 공유해요</span>
        </button>
        <button
          onClick={() => onChange("COACH")}
          className={`w-full rounded-2xl border p-4 text-left transition ${
            value === "COACH" ? "border-teal-400 bg-teal-400/10" : "border-neutral-800 bg-neutral-900"
          }`}
        >
          <span className="block font-bold">📋 코치</span>
          <span className="block text-sm text-neutral-400">선수 기록을 확인하고 피드백을 남겨요</span>
        </button>
      </div>
      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

function AccountStep({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  password: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="계정을 만들어주세요" subtitle="거의 다 왔어요! 마지막 단계예요." />
      <label className="mb-1.5 block text-sm font-medium text-neutral-400">이메일</label>
      <input
        type="email"
        className="w-full rounded-2xl bg-neutral-800 px-5 py-4 text-lg text-white outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-teal-400"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="you@example.com"
      />
      <label className="mb-1.5 mt-4 block text-sm font-medium text-neutral-400">비밀번호</label>
      <input
        type="password"
        className="w-full rounded-2xl bg-neutral-800 px-5 py-4 text-lg text-white outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-teal-400"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder="6자 이상"
      />
      {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
      <NextButton
        onClick={onSubmit}
        disabled={loading || email.trim().length < 3 || password.length < 6}
        label={loading ? "가입 중…" : "시작하기 🚀"}
      />
    </div>
  );
}
