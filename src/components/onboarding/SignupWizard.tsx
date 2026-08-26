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

// Barlow is the app's typeface now, loaded once in the root layout without
// blocking render. These names stay because the wizard sets them inline; the
// wizard used to fetch the same two families a second time, from its own
// render-blocking <link>, which is exactly what was costing a page load.
const BODY_FONT = "'Barlow', ui-sans-serif, system-ui, sans-serif";
const HEADING_FONT = "'Barlow Condensed', ui-sans-serif, system-ui, sans-serif";

const SPORT_ICONS: Record<string, (props: { className?: string }) => ReactElement> = {
  lacrosse: LacrosseIcon,
  soccer: SoccerBallIcon,
  swimming: SwimIcon,
};
// Sports without their own mark fall back rather than rendering an empty tile.
const SPORT_ICON_FALLBACK = RunnerIcon;

const ADJ = ["Swift", "Mighty", "Brave", "Clever", "Bold", "Quick", "Fierce", "Steady"];
const NOUN = ["Falcon", "Tiger", "Wave", "Comet", "Blaze", "Storm", "Panther", "Ranger"];
function suggestUsername() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}${n}${Math.floor(Math.random() * 100)}`;
}

// Shared style tokens, scoped to this wizard. Still deliberately dark — the
// sign-up flow is a one-time immersive moment — but on the brand green now
// rather than a teal that appeared nowhere else in the product.
const SURFACE_BASE =
  "w-full rounded-2xl border border-white/[0.08] bg-[#111C15] p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1310]";
const SURFACE_SELECTED = "border-green-400 bg-green-400/10";
const SURFACE_UNSELECTED = "hover:border-white/20";
const INPUT_CLASS =
  "w-full rounded-2xl border border-white/[0.08] bg-[#111C15] px-5 py-4 text-lg text-[#ECF7EC] outline-none placeholder:text-[#66766A] transition focus-visible:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400";
const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-[#A2B5A4]";

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
  const [researchConsent, setResearchConsent] = useState(false);
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
          // Always sent, so the server records a real answer either way
          // rather than leaving the account looking like it was never asked.
          researchConsent,
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
    <div className="flex min-h-screen bg-[#0A1310] text-[#ECF7EC]" style={{ fontFamily: BODY_FONT }}>

      {/* Left brand panel — desktop only, gives the flow a wide PC layout */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex xl:w-3/5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-green-500/20 blur-3xl" />
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
            className="h-72 w-72 drop-shadow-[0_0_50px_rgba(74,222,128,0.4)]"
          />
          <p className="mt-8 max-w-sm text-center text-xl font-medium text-[#ECF7EC]/90">
            {t(lang).login.tagline}
          </p>
        </div>
        <p className="relative text-sm text-[#95A996]">Sideline365 · Student Sports</p>
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
                className="rounded-full p-1.5 text-[#A2B5A4] transition hover:bg-white/5 hover:text-[#ECF7EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && step <= 5 && (
              <button
                onClick={goNext}
                className="rounded px-1 text-sm font-medium text-[#A2B5A4] transition hover:text-[#ECF7EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
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
            className="h-full rounded-full bg-green-400 transition-all duration-300"
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
              researchConsent={researchConsent}
              onResearchConsentChange={setResearchConsent}
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
        <span className="text-green-400">Roybot</span>
        {s.intro.greetingSuffix}
      </h1>
      <p className="mt-3 text-lg text-[#A2B5A4]">{s.intro.sub}</p>
      {/* On desktop the left brand panel shows Roybot, so hide this one there. */}
      <div className="flex flex-1 items-center justify-center lg:hidden">
        <RoybotAvatar tier="beginner" className="h-44 w-44 drop-shadow-[0_0_24px_rgba(74,222,128,0.35)]" />
      </div>
      <div className="hidden flex-1 lg:block" aria-hidden="true" />
      <div className="mt-auto space-y-4">
        <button
          onClick={onOkay}
          className="w-full rounded-full bg-green-400 py-4 text-base font-bold text-[#052e28] transition hover:bg-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1310]"
        >
          {s.intro.okay}
        </button>
        <p className="text-center text-sm text-[#A2B5A4]">
          <Link
            href="/login"
            className="rounded font-semibold text-green-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
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
      {subtitle && <p className="mt-2 text-[#A2B5A4]">{subtitle}</p>}
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
      className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-green-400 py-4 text-base font-bold text-[#052e28] transition hover:bg-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1310] disabled:cursor-not-allowed disabled:opacity-40"
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
        className="mt-3 flex items-center gap-1.5 self-start rounded text-sm font-medium text-green-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
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
          const Icon = SPORT_ICONS[sport.id] ?? SPORT_ICON_FALLBACK;
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
                  isSelected ? "bg-green-400/20 text-green-300" : "bg-white/5 text-[#A2B5A4]"
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{label.name}</span>
                <span className="block text-sm text-[#A2B5A4]">{label.tagline}</span>
              </span>
              {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-green-400" />}
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
                <span className="block text-sm text-[#A2B5A4]">{label.detail}</span>
              </span>
              {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-green-400" />}
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
            className={`rounded-2xl border px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1310] ${
              grade === g
                ? "border-green-400 bg-green-400/10 text-[#ECF7EC]"
                : "border-white/[0.08] bg-[#111C15] text-[#A2B5A4] hover:border-white/20"
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
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${value === "ATHLETE" ? "bg-green-400/20 text-green-300" : "bg-white/5 text-[#A2B5A4]"}`}
          >
            <RunnerIcon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{s.role.athleteName}</span>
            <span className="block text-sm text-[#A2B5A4]">{s.role.athleteDesc}</span>
          </span>
          {value === "ATHLETE" && <CheckIcon className="h-5 w-5 shrink-0 text-green-400" />}
        </button>
        <button
          onClick={() => onChange("COACH")}
          aria-pressed={value === "COACH"}
          className={`${SURFACE_BASE} flex items-center gap-4 ${value === "COACH" ? SURFACE_SELECTED : SURFACE_UNSELECTED}`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${value === "COACH" ? "bg-green-400/20 text-green-300" : "bg-white/5 text-[#A2B5A4]"}`}
          >
            <ClipboardIcon className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{s.role.coachName}</span>
            <span className="block text-sm text-[#A2B5A4]">{s.role.coachDesc}</span>
          </span>
          {value === "COACH" && <CheckIcon className="h-5 w-5 shrink-0 text-green-400" />}
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
  researchConsent,
  onResearchConsentChange,
}: {
  s: SignupDict;
  email: string;
  password: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  researchConsent: boolean;
  onResearchConsentChange: (v: boolean) => void;
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
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#A2B5A4] hover:text-[#ECF7EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        >
          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {/* Unchecked to begin with, and deliberately absent from the submit
          button's `disabled` condition below: sign-up must succeed whether or
          not this is ticked, or it is not a choice. */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <label htmlFor="researchConsent" className="flex cursor-pointer items-start gap-3">
          <input
            id="researchConsent"
            type="checkbox"
            checked={researchConsent}
            onChange={(e) => onResearchConsentChange(e.target.checked)}
            aria-describedby="researchConsentDetail"
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-white/30 bg-transparent accent-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          />
          <span className="text-sm font-medium text-[#ECF7EC]">
            {s.account.researchLabel}{" "}
            <span className="whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#A2B5A4]">
              {s.account.researchOptional}
            </span>
          </span>
        </label>
        <p id="researchConsentDetail" className="mt-2 pl-8 text-xs leading-relaxed text-[#A2B5A4]">
          {s.account.researchDetail}
        </p>
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
