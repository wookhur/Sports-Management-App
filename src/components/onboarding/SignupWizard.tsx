"use client";

import Link from "next/link";
import { useMemo, useState, type ReactElement } from "react";
import { SPORT_LIST } from "@/lib/sports";
import { EXPERIENCE_LEVELS, GRADE_OPTIONS } from "@/lib/onboarding";
import { t, SPORT_I18N, EXPERIENCE_I18N, GRADE_I18N_EN, GRADE_I18N_ES, type Lang, type SignupDict } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RoybotAvatar from "../RoybotAvatar";
import BrandMark from "../BrandMark";
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
// Loaded via a runtime <link> (not next/font/google) so `next build` never
// depends on reaching Google's servers; the browser fetches it, with a system
// font fallback while it loads (font-display: swap).
const BODY_FONT = "'Barlow', ui-sans-serif, system-ui, sans-serif";
const HEADING_FONT = "'Barlow Condensed', ui-sans-serif, system-ui, sans-serif";

function RoyFontLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap"
      />
    </>
  );
}

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

export default function SignupWizard({ lang }: { lang: Lang }) {
  const s = t(lang).signup;
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
        setError(data?.error ?? s.account.errGeneric);
        setLoading(false);
        return;
      }
      window.location.assign("/");
    } catch {
      setError(s.account.errNetwork);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0B1412] text-[#EAFBF6]" style={{ fontFamily: BODY_FONT }}>
      <RoyFontLink />

      {/* Left brand panel — desktop only, gives the flow a wide PC layout */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex xl:w-3/5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-2">
          <BrandMark className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: HEADING_FONT }}>
            Sideline365
          </span>
        </div>
        <div className="relative flex flex-col items-center">
          <RoybotAvatar
            tier="beginner"
            className="h-72 w-72 drop-shadow-[0_0_50px_rgba(45,212,191,0.4)]"
          />
          <p className="mt-8 max-w-sm text-center text-xl font-medium text-[#EAFBF6]/90">
            {t(lang).login.tagline}
          </p>
        </div>
        <p className="relative text-sm text-[#8FA8A2]">Sideline365 · Student Sports</p>
      </aside>

      {/* Right column: the wizard flow */}
      <div className="flex min-h-screen w-full flex-col lg:w-1/2 xl:w-2/5">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6 lg:py-10">
        {/* Top bar: back + skip + language */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            {step > 0 && (
              <button
                onClick={goBack}
                aria-label={s.common.back}
                className="rounded-full p-1.5 text-[#9CB3AE] transition hover:bg-white/5 hover:text-[#EAFBF6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && step <= 5 && (
              <button
                onClick={goNext}
                className="rounded px-1 text-sm font-medium text-[#9CB3AE] transition hover:text-[#EAFBF6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {s.common.skip}
              </button>
            )}
            <LanguageSwitcher lang={lang} dark />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step content */}
        <div key={step} className="roy-step-in mt-8 flex flex-1 flex-col">
          {step === 0 && <IntroStep s={s} onOkay={goNext} />}
          {step === 1 && (
            <UsernameStep
              s={s}
              username={username}
              onChange={setUsername}
              onSuggest={() => setUsername(suggestUsername())}
              onNext={goNext}
            />
          )}
          {step === 2 && <SchoolStep s={s} school={school} onChange={setSchool} onNext={goNext} />}
          {step === 3 && (
            <SportInterestsStep s={s} lang={lang} selected={sportInterests} onToggle={toggleSport} onNext={goNext} />
          )}
          {step === 4 && (
            <ExperienceStep s={s} lang={lang} value={experienceLevel} onChange={setExperienceLevel} onNext={goNext} />
          )}
          {step === 5 && (
            <DobGradeStep
              s={s}
              lang={lang}
              dob={dob}
              onDobChange={setDob}
              grade={grade}
              onGradeChange={setGrade}
              onNext={goNext}
            />
          )}
          {step === 6 && <RoleStep s={s} value={role} onChange={setRole} onNext={goNext} />}
          {step === 7 && (
            <AccountStep
              s={s}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function IntroStep({ s, onOkay }: { s: SignupDict; onOkay: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-bold leading-tight tracking-tight" style={{ fontFamily: HEADING_FONT }}>
        {s.intro.greetingPrefix}
        <span className="text-teal-400">Roybot</span>
        {s.intro.greetingSuffix}
      </h1>
      <p className="mt-3 text-lg text-[#9CB3AE]">{s.intro.sub}</p>
      {/* On desktop the left brand panel shows Roybot, so hide this one there. */}
      <div className="flex flex-1 items-center justify-center lg:hidden">
        <RoybotAvatar tier="beginner" className="h-44 w-44 drop-shadow-[0_0_24px_rgba(45,212,191,0.35)]" />
      </div>
      <div className="hidden flex-1 lg:block" aria-hidden="true" />
      <div className="mt-auto space-y-4">
        <button
          onClick={onOkay}
          className="w-full rounded-full bg-teal-400 py-4 text-base font-bold text-[#052e28] transition hover:bg-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1412]"
        >
          {s.intro.okay}
        </button>
        <p className="text-center text-sm text-[#9CB3AE]">
          <Link
            href="/login"
            className="rounded font-semibold text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {s.intro.haveAccount}
          </Link>
        </p>
      </div>
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold leading-tight tracking-tight" style={{ fontFamily: HEADING_FONT }}>
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-[#9CB3AE]">{subtitle}</p>}
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  label,
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
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
  s,
  username,
  onChange,
  onSuggest,
  onNext,
}: {
  s: SignupDict;
  username: string;
  onChange: (v: string) => void;
  onSuggest: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title={s.username.title} subtitle={s.username.subtitle} />
      <label htmlFor="username" className="sr-only">
        {s.username.title}
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
        {s.username.suggest}
      </button>
      <NextButton onClick={onNext} disabled={username.trim().length < 3} label={s.common.next} />
    </div>
  );
}

function SchoolStep({
  s,
  school,
  onChange,
  onNext,
}: {
  s: SignupDict;
  school: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title={s.school.title} subtitle={s.school.subtitle} />
      <label htmlFor="school" className="sr-only">
        {s.school.title}
      </label>
      <input
        id="school"
        className={INPUT_CLASS}
        value={school}
        onChange={(e) => onChange(e.target.value)}
        placeholder={s.school.placeholder}
        maxLength={100}
      />
      <NextButton onClick={onNext} label={s.common.next} />
    </div>
  );
}

function SportInterestsStep({
  s,
  lang,
  selected,
  onToggle,
  onNext,
}: {
  s: SignupDict;
  lang: Lang;
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title={s.sportInterests.title} subtitle={s.sportInterests.subtitle} />
      <div className="space-y-3">
        {SPORT_LIST.map((sport) => {
          const isSelected = selected.includes(sport.id);
          const Icon = SPORT_ICONS[sport.id];
          const label = SPORT_I18N[sport.id]?.[lang] ?? { name: sport.name, tagline: sport.tagline };
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
                <span className="block font-semibold">{label.name}</span>
                <span className="block text-sm text-[#9CB3AE]">{label.tagline}</span>
              </span>
              {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} label={s.common.next} />
    </div>
  );
}

function ExperienceStep({
  s,
  lang,
  value,
  onChange,
  onNext,
}: {
  s: SignupDict;
  lang: Lang;
  value: ExperienceLevel | null;
  onChange: (v: ExperienceLevel) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title={s.experience.title} />
      <div className="space-y-3">
        {EXPERIENCE_LEVELS.map((lvl) => {
          const isSelected = value === lvl.value;
          const label = EXPERIENCE_I18N[lvl.value]?.[lang] ?? lvl;
          return (
            <button
              key={lvl.value}
              onClick={() => onChange(lvl.value)}
              aria-pressed={isSelected}
              className={`${SURFACE_BASE} flex items-center justify-between ${isSelected ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
            >
              <span>
                <span className="block font-semibold">{label.label}</span>
                <span className="block text-sm text-[#9CB3AE]">{label.detail}</span>
              </span>
              {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} label={s.common.next} />
    </div>
  );
}

function DobGradeStep({
  s,
  lang,
  dob,
  onDobChange,
  grade,
  onGradeChange,
  onNext,
}: {
  s: SignupDict;
  lang: Lang;
  dob: string;
  onDobChange: (v: string) => void;
  grade: string | null;
  onGradeChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title={s.dobGrade.title} subtitle={s.dobGrade.subtitle} />
      <label htmlFor="dob" className={LABEL_CLASS}>
        {s.dobGrade.dobLabel}
      </label>
      <input
        id="dob"
        type="date"
        className={`${INPUT_CLASS} [color-scheme:dark]`}
        value={dob}
        onChange={(e) => onDobChange(e.target.value)}
      />
      <span className={`${LABEL_CLASS} mt-5`}>{s.dobGrade.gradeLabel}</span>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={s.dobGrade.gradeGroupAria}>
        {/* Options are stored as the Korean canonical string regardless of
            display language, matching the value persisted on User.grade. */}
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
            {lang === "en" ? GRADE_I18N_EN[g] ?? g : lang === "es" ? GRADE_I18N_ES[g] ?? g : g}
          </button>
        ))}
      </div>
      <NextButton onClick={onNext} label={s.common.next} />
    </div>
  );
}

function RoleStep({
  s,
  value,
  onChange,
  onNext,
}: {
  s: SignupDict;
  value: Role | null;
  onChange: (v: Role) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHeading title={s.role.title} subtitle={s.role.subtitle} />
      <div className="space-y-3">
        <button
          onClick={() => onChange("ATHLETE")}
          aria-pressed={value === "ATHLETE"}
          className={`${SURFACE_BASE} flex items-center gap-4 ${value === "ATHLETE" ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${value === "ATHLETE" ? "bg-teal-400/20 text-teal-300" : "bg-white/5 text-[#9CB3AE]"}`}
          >
            <RunnerIcon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{s.role.athleteName}</span>
            <span className="block text-sm text-[#9CB3AE]">{s.role.athleteDesc}</span>
          </span>
          {value === "ATHLETE" && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
        </button>
        <button
          onClick={() => onChange("COACH")}
          aria-pressed={value === "COACH"}
          className={`${SURFACE_BASE} flex items-center gap-4 ${value === "COACH" ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${value === "COACH" ? "bg-teal-400/20 text-teal-300" : "bg-white/5 text-[#9CB3AE]"}`}
          >
            <ClipboardIcon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{s.role.coachName}</span>
            <span className="block text-sm text-[#9CB3AE]">{s.role.coachDesc}</span>
          </span>
          {value === "COACH" && <CheckIcon className="h-5 w-5 shrink-0 text-teal-400" />}
        </button>
      </div>
      <NextButton onClick={onNext} disabled={!value} label={s.common.next} />
    </div>
  );
}

function AccountStep({
  s,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  error,
}: {
  s: SignupDict;
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
      <StepHeading title={s.account.title} subtitle={s.account.subtitle} />
      <label htmlFor="email" className={LABEL_CLASS}>
        {s.account.emailLabel}
      </label>
      <input
        id="email"
        type="email"
        className={INPUT_CLASS}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder={s.account.emailPlaceholder}
        autoComplete="email"
      />
      <label htmlFor="password" className={`${LABEL_CLASS} mt-4`}>
        {s.account.passwordLabel}
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          className={`${INPUT_CLASS} pr-14`}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={s.account.passwordPlaceholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? s.account.hidePassword : s.account.showPassword}
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
        label={loading ? s.account.starting : s.account.start}
        icon={!loading && <ArrowRightIcon className="h-5 w-5" />}
      />
    </div>
  );
}
