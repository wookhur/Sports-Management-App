"use client";

import Link from "next/link";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { useMemo, useState, type ReactElement } from "react";
import { SPORT_LIST } from "@/lib/sports";
import { EXPERIENCE_LEVELS, GRADE_OPTIONS } from "@/lib/onboarding";
import RoyAvatar from "./RoyAvatar";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  LacrosseIcon,
  RunnerIcon,
  ShuffleIcon,
  SoccerBallIcon,
  SwimIcon,
} from "./icons";

// Scoped to this wizard only — the rest of the app keeps the system font stack.
const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"] });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"] });

const SPORT_ICONS: Record<string, (props: { className?: string }) => ReactElement> = {
  lacrosse: LacrosseIcon,
  soccer: SoccerBallIcon,
  swimming: SwimIcon,
};

const ADJ = ["Swift", "Mighty", "Brave", "Clever", "Bold", "Quick", "Fierce", "Steady"];
const NOUN = ["Falcon", "Tiger", "Wave", "Comet", "Blaze", "Storm", "Panther", "Ranger"];
function suggestUsername() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}${n}${Math.floor(Math.random() * 100)}`;
}

// Shared style tokens — dark/teal, scoped to this wizard.
const SURFACE_BASE =
  "w-full rounded-2xl border border-white/[0.08] bg-[#121D1A] p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1412]";
const SURFACE_SELECTED = "border-teal-400 bg-teal-400/10";
const SURFACE_UNSELECTED = "hover:border-white/20";
const INPUT_CLASS =
  "w-full rounded-2xl border border-white/[0.08] bg-[#121D1A] px-5 py-4 text-lg text-[#EAFBF6] outline-none placeholder:text-[#5C716C] transition focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400";
const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-[#9CB3AE]";

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
    <div className={`${barlow.className} flex min-h-screen flex-col bg-[#0B1412] text-[#EAFBF6]`}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
        {/* Top bar: back + skip */}
        {step > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={goBack}
              aria-label="이전 단계"
              className="rounded-full p-1.5 text-[#9CB3AE] transition hover:bg-white/5 hover:text-[#EAFBF6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {step <= 5 && (
              <button
                onClick={goNext}
                className="rounded px-1 text-sm font-medium text-[#9CB3AE] transition hover:text-[#EAFBF6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                건너뛰기
              </button>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step content */}
        <div key={step} className="roy-step-in mt-8 flex flex-1 flex-col">
          {step === 0 && <IntroStep onOkay={goNext} />}
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
            <ExperienceStep value={experienceLevel} onChange={setExperienceLevel} onNext={goNext} />
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
      <h1 className={`${barlowCondensed.className} text-3xl font-bold leading-tight tracking-tight`}>
        안녕하세요! 저는 여러분의 AI 코치 <span className="text-teal-400">Roy</span>예요.
      </h1>
      <p className="mt-3 text-lg text-[#9CB3AE]">
        딱 맞는 코칭을 추천해드리기 위해 몇 가지 질문을 드릴게요.
      </p>
      <div className="flex flex-1 items-center justify-center">
        <RoyAvatar />
      </div>
      <div className="mt-auto space-y-4">
        <button onClick={onOkay} className="w-full rounded-full bg-teal-400 py-4 text-base font-bold text-[#052e28] transition hover:bg-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1412]">
          좋아요!
        </button>
        <p className="text-center text-sm text-[#9CB3AE]">
          <Link href="/login" className="rounded font-semibold text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
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
      <h2 className={`${barlowCondensed.className} text-2xl font-bold leading-tight tracking-tight`}>{title}</h2>
      {subtitle && <p className="mt-2 text-[#9CB3AE]">{subtitle}</p>}
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  label = "다음",
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-teal-400 py-4 text-base font-bold text-[#052e28] transition hover:bg-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1412] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
      {icon}
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
      <label htmlFor="username" className="sr-only">
        아이디
      </label>
      <input
        id="username"
        className={INPUT_CLASS}
        value={username}
        onChange={(e) => onChange(e.target.value)}
        maxLength={20}
        autoComplete="username"
      />
      <button
        onClick={onSuggest}
        className="mt-3 flex items-center gap-1.5 self-start rounded text-sm font-medium text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <ShuffleIcon className="h-4 w-4" />
        다른 아이디 추천받기
      </button>
      <NextButton onClick={onNext} disabled={username.trim().length < 3} />
    </div>
  );
}

function SchoolStep({ school, onChange, onNext }: { school: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="어느 학교에 다니세요?" subtitle="코칭 추천에만 활용돼요. (선택)" />
      <label htmlFor="school" className="sr-only">
        학교
      </label>
      <input
        id="school"
        className={INPUT_CLASS}
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
          const Icon = SPORT_ICONS[sport.id];
          return (
            <button
              key={sport.id}
              onClick={() => onToggle(sport.id)}
              aria-pressed={isSelected}
              className={`${SURFACE_BASE} flex items-center gap-4 ${isSelected ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isSelected ? "bg-teal-400/20 text-teal-300" : "bg-white/5 text-[#9CB3AE]"
                }`}
              >
                {Icon && <Icon className="h-6 w-6" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{sport.name}</span>
                <span className="block text-sm text-[#9CB3AE]">{sport.tagline}</span>
              </span>
              {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
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
              aria-pressed={isSelected}
              className={`${SURFACE_BASE} flex items-center justify-between ${isSelected ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
            >
              <span>
                <span className="block font-semibold">{lvl.label}</span>
                <span className="block text-sm text-[#9CB3AE]">{lvl.detail}</span>
              </span>
              {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
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
      <label htmlFor="dob" className={LABEL_CLASS}>
        생년월일
      </label>
      <input
        id="dob"
        type="date"
        className={`${INPUT_CLASS} [color-scheme:dark]`}
        value={dob}
        onChange={(e) => onDobChange(e.target.value)}
      />
      <span className={`${LABEL_CLASS} mt-5`}>학년</span>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="학년 선택">
        {GRADE_OPTIONS.map((g) => (
          <button
            key={g}
            onClick={() => onGradeChange(g)}
            aria-pressed={grade === g}
            className={`rounded-2xl border px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1412] ${
              grade === g
                ? "border-teal-400 bg-teal-400/10 text-[#EAFBF6]"
                : "border-white/[0.08] bg-[#121D1A] text-[#9CB3AE] hover:border-white/20"
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
          aria-pressed={value === "ATHLETE"}
          className={`${SURFACE_BASE} flex items-center gap-4 ${value === "ATHLETE" ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${value === "ATHLETE" ? "bg-teal-400/20 text-teal-300" : "bg-white/5 text-[#9CB3AE]"}`}>
            <RunnerIcon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">선수</span>
            <span className="block text-sm text-[#9CB3AE]">기록을 측정하고 코치에게 공유해요</span>
          </span>
          {value === "ATHLETE" && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
        </button>
        <button
          onClick={() => onChange("COACH")}
          aria-pressed={value === "COACH"}
          className={`${SURFACE_BASE} flex items-center gap-4 ${value === "COACH" ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${value === "COACH" ? "bg-teal-400/20 text-teal-300" : "bg-white/5 text-[#9CB3AE]"}`}>
            <ClipboardIcon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">코치</span>
            <span className="block text-sm text-[#9CB3AE]">선수 기록을 확인하고 피드백을 남겨요</span>
          </span>
          {value === "COACH" && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
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
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title="계정을 만들어주세요" subtitle="거의 다 왔어요! 마지막 단계예요." />
      <label htmlFor="email" className={LABEL_CLASS}>
        이메일
      </label>
      <input
        id="email"
        type="email"
        className={INPUT_CLASS}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <label htmlFor="password" className={`${LABEL_CLASS} mt-4`}>
        비밀번호
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          className={`${INPUT_CLASS} pr-14`}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="6자 이상"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#9CB3AE] hover:text-[#EAFBF6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <NextButton
        onClick={onSubmit}
        disabled={loading || email.trim().length < 3 || password.length < 6}
        label={loading ? "가입 중…" : "시작하기"}
        icon={!loading && <ArrowRightIcon className="h-5 w-5" />}
      />
    </div>
  );
}
