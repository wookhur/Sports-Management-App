import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

// Public intro/hero for logged-out visitors. Energetic but self-contained:
// all motion is CSS keyframes declared inline, so no client JS is needed.
export default function Landing({ lang }: { lang: Lang }) {
  const s = t(lang).landing;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Animated aurora background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="sl-orb sl-orb-a" />
        <div className="sl-orb sl-orb-b" />
        <div className="sl-orb sl-orb-c" />
        <div className="absolute inset-0 bg-slate-950/40" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🏅</span>
          <span className="text-lg font-bold tracking-tight">sideline365</span>
        </div>
        <Link href="/login" className="text-sm font-semibold text-slate-200 hover:text-white">
          {s.ctaLogin}
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pt-20 text-center">
        <p className="sl-fade sl-d1 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
          {s.kicker}
        </p>
        <h1 className="sl-fade sl-d2 mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          {s.headline1}{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
            {s.headlineHi}
          </span>
          <br />
          {s.headline2}
        </h1>
        <p className="sl-fade sl-d3 mx-auto mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
          {s.sub}
        </p>
        <div className="sl-fade sl-d4 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-full bg-white px-7 py-3.5 text-base font-bold text-slate-900 shadow-lg transition hover:scale-[1.03] hover:bg-slate-100 sm:w-auto"
          >
            {s.ctaStart} →
          </Link>
          <Link
            href="/login"
            className="w-full rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            {s.ctaLogin}
          </Link>
        </div>

        {/* Stats */}
        <div className="sl-fade sl-d5 mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
          {s.stats.map((st) => (
            <div key={st.label}>
              <p className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                {st.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{st.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">{s.featuresTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
            >
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-10 shadow-2xl">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{s.finalTitle}</h2>
          <p className="mt-2 text-indigo-100">{s.finalSub}</p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 text-base font-bold text-slate-900 transition hover:scale-[1.03]"
          >
            {s.finalCta} →
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes sl-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%, 8%) scale(1.15); } }
        @keyframes sl-float-b { 0%,100% { transform: translate(0,0) scale(1.1); } 50% { transform: translate(-8%, 5%) scale(1); } }
        @keyframes sl-float-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5%, -7%) scale(1.2); } }
        @keyframes sl-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .sl-orb { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: 0.55; }
        .sl-orb-a { top: -12%; left: -8%; width: 46vw; height: 46vw; background: #6366f1; animation: sl-float-a 16s ease-in-out infinite; }
        .sl-orb-b { top: 8%; right: -12%; width: 42vw; height: 42vw; background: #d946ef; animation: sl-float-b 19s ease-in-out infinite; }
        .sl-orb-c { bottom: -18%; left: 22%; width: 40vw; height: 40vw; background: #0ea5e9; animation: sl-float-c 22s ease-in-out infinite; }
        .sl-fade { opacity: 0; animation: sl-fade-up 0.7s ease-out forwards; }
        .sl-d1 { animation-delay: 0.05s; } .sl-d2 { animation-delay: 0.15s; } .sl-d3 { animation-delay: 0.28s; }
        .sl-d4 { animation-delay: 0.42s; } .sl-d5 { animation-delay: 0.56s; }
        @media (prefers-reduced-motion: reduce) {
          .sl-orb { animation: none; } .sl-fade { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
