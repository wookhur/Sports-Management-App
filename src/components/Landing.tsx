import Link from "next/link";
import BrandMark from "./BrandMark";
import LanguageSwitcher from "./LanguageSwitcher";
import { t, type Lang } from "@/lib/i18n";
import {
  TimerIcon,
  ClipboardIcon,
  TargetIcon,
  StarIcon,
  TrophyIcon,
  ChatIcon,
  DashboardIcon,
  ChartIcon,
  ChevronRightIcon,
} from "./navIcons";

// Public intro for logged-out visitors.
//
// Rebuilt from a dark indigo/fuchsia gradient, which had three problems: it
// looked like a different product from the app behind it (light, green), it
// described the product instead of showing it, and it never mentioned coaches
// at all — the coach screen being the strongest thing here. Energy now comes
// from type and scale rather than from glow, and all motion is CSS keyframes
// so the page still needs no client JS.

// The feature copy carries an emoji per item, which is fine inside the app but
// reads as unfinished on the page a stranger judges first. Mapped to the icon
// set the rest of the product already uses, in feature order.
const FEATURE_ICONS = [TimerIcon, ClipboardIcon, TargetIcon, StarIcon, TrophyIcon, ChatIcon];
const COACH_ICONS = [DashboardIcon, ChartIcon, ChevronRightIcon];

const BAND_STYLE = ["bg-red-50 text-red-700", "bg-amber-50 text-amber-700", "bg-emerald-50 text-emerald-700"];
const BAND_DOT = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];

export default function Landing({ lang }: { lang: Lang }) {
  const s = t(lang).landing;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight">Sideline365</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher lang={lang} />
          <Link
            href="/login"
            className="whitespace-nowrap text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            {s.ctaLogin}
          </Link>
        </div>
      </header>

      {/* Hero — copy on the left, the actual product on the right */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-14">
        <div>
          <p className="sl-in sl-d1 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {s.kicker}
          </p>

          <h1 className="sl-in sl-d2 mt-5 font-display text-5xl font-bold uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            {s.headline1} <span className="text-brand">{s.headlineHi}</span>
            <br />
            {s.headline2}
          </h1>

          <p className="sl-in sl-d3 mt-6 max-w-md text-lg leading-relaxed text-slate-600">{s.sub}</p>

          <div className="sl-in sl-d4 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-7 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {s.ctaStart} →
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {s.ctaLogin}
            </Link>
          </div>

          <dl className="sl-in sl-d5 mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-slate-200 pt-6">
            {s.stats.map((st) => (
              <div key={st.label}>
                <dt className="font-display text-3xl font-bold tabular-nums">{st.value}</dt>
                <dd className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {st.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The coach screen, rendered rather than claimed. */}
        <div className="sl-in sl-d3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
            <p className="font-display text-xl font-bold">{s.preview.title}</p>
            <p className="mt-1 text-sm text-slate-500">{s.preview.subtitle}</p>

            <ul className="mt-5 space-y-3">
              {s.preview.rows.map((r, i) => (
                <li key={r.name} className="rounded-xl border border-slate-200 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{r.name}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${BAND_STYLE[i]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${BAND_DOT[i]}`} />
                      {r.band}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-snug text-slate-600">{r.why}</p>
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              ⓘ {s.preview.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* Coach section — the audience the old page never addressed */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {s.coachTitle}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-slate-600">{s.coachSub}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {s.coachPoints.map((c, i) => {
              const Icon = COACH_ICONS[i] ?? DashboardIcon;
              return (
                <div key={c.title}>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-dark">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {s.featuresTitle}
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {s.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? TimerIcon;
            return (
              <div key={f.title} className="bg-white p-6 transition hover:bg-slate-50">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-dark">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center lg:py-20">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            {s.finalTitle}
          </h2>
          <p className="mt-3 text-lg text-emerald-100">{s.finalSub}</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-dark transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
          >
            {s.finalCta} →
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <BrandMark className="h-5 w-5" />
          <span>Sideline365</span>
        </div>
      </footer>

      <style>{`
        @keyframes sl-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .sl-in { opacity: 0; animation: sl-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .sl-d1 { animation-delay: 0.04s; } .sl-d2 { animation-delay: 0.12s; }
        .sl-d3 { animation-delay: 0.22s; } .sl-d4 { animation-delay: 0.32s; }
        .sl-d5 { animation-delay: 0.42s; }
        @media (prefers-reduced-motion: reduce) {
          .sl-in { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
