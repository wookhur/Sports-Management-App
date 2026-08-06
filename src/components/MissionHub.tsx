"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PetAvatar from "./PetAvatar";
import { t, type Lang } from "@/lib/i18n";

export type MissionCategory = "training" | "conditioning" | "lifestyle";

export interface MissionItem {
  key: string;
  emoji: string;
  reward: number;
  goal: number;
  progress: number;
  met: boolean;
  claimed: boolean;
  manual: boolean;
  category: MissionCategory;
  title: string;
  /** in-app page to visit when the mission isn't met yet (auto missions) */
  goHref: string | null;
}

export interface CareItem {
  key: string;
  emoji: string;
  cost: number;
  title: string;
}

interface PetView {
  growth: number;
  stage: "egg" | "bird";
  label: string;
  hatched: boolean;
  hatchPct: number; // egg progress 0..1
  into: number; // growth into current sub-stage
  span: number;
  toNext: number | null;
}

interface Props {
  lang: Lang;
  beans: number;
  pet: PetView;
  care: CareItem[];
  missions: MissionItem[];
}

export default function MissionHub({ lang, beans, pet, care, missions }: Props) {
  const s = t(lang).missions;
  const router = useRouter();
  // Server data is read straight from props — never mirrored into state. The
  // available care actions and mission tier change as the pet grows, so a
  // useState copy would go stale after the first action and send requests the
  // server rejects.
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hatchMsg, setHatchMsg] = useState(false);
  // Tracks the server re-render so buttons stay disabled until fresh data lands.
  const [refreshing, startRefresh] = useTransition();

  async function claim(key: string) {
    setError(null);
    setPending(`m:${key}`);
    try {
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionKey: key }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) setError(data?.error ?? "오류가 발생했어요");
      else startRefresh(() => router.refresh());
    } catch {
      setError("서버에 연결할 수 없어요");
    } finally {
      setPending(null);
    }
  }

  async function doCare(key: string) {
    setError(null);
    setPending(`c:${key}`);
    try {
      const res = await fetch("/api/pet/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionKey: key }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) setError(data?.error ?? "오류가 발생했어요");
      else {
        if (data.justHatched) setHatchMsg(true);
        // Let the server recompute the pet state + available care/missions.
        startRefresh(() => router.refresh());
      }
    } catch {
      setError("서버에 연결할 수 없어요");
    } finally {
      setPending(null);
    }
  }

  const pct = pet.stage === "egg" ? pet.hatchPct : pet.toNext == null ? 1 : pet.into / pet.span;
  const cats: { key: MissionCategory; label: string }[] = [
    { key: "training", label: s.catTraining },
    { key: "conditioning", label: s.catConditioning },
    { key: "lifestyle", label: s.catLifestyle },
  ];

  return (
    <div className="space-y-6">
      {/* Beans balance */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-bold text-emerald-700">
          <span aria-hidden="true">🌱</span>
          <span className="tabular-nums">{beans}</span>
          <span className="font-medium">{s.beans}</span>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {hatchMsg && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">
          {s.hatchedMsg}
        </p>
      )}

      {/* Pet card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative bg-gradient-to-b from-sky-300 to-sky-100 px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white drop-shadow-sm">{s.petTitle}</h2>
            <span className="rounded-full bg-white/30 px-2.5 py-0.5 text-xs font-semibold text-white">{pet.label}</span>
          </div>
          <div className="flex justify-center py-4">
            <PetAvatar growth={pet.growth} className="h-36 w-36" />
          </div>
          <p className="text-center text-xs font-medium text-sky-900/70">{s.petSub}</p>
        </div>
        <div className="px-5 py-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>
              {pet.stage === "egg"
                ? s.hatchTo(Math.max(0, Math.ceil((1 - pet.hatchPct) * 100)))
                : pet.toNext == null
                  ? s.maxed
                  : s.growTo(pet.toNext)}
            </span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>

          <h3 className="mb-2 text-sm font-semibold text-slate-500">{s.careHeading}</h3>
          <div className="grid grid-cols-3 gap-2">
            {care.map((c) => {
              const affordable = beans >= c.cost;
              const busy = pending === `c:${c.key}` || refreshing;
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={!affordable || busy}
                  onClick={() => doCare(c.key)}
                  title={!affordable ? s.notEnough : undefined}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 p-3 transition enabled:hover:border-brand/40 enabled:hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
                  <span className="text-center text-[11px] font-medium leading-tight text-slate-600">{c.title}</span>
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">
                    🌱 {s.careCta(c.cost, "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Missions by category */}
      {cats.map((c) => (
        <MissionSection
          key={c.key}
          heading={c.label}
          items={missions.filter((m) => m.category === c.key)}
          lang={lang}
          pending={pending}
          onClaim={claim}
        />
      ))}

      <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">💡 {s.howItWorks}</p>
    </div>
  );
}

function MissionSection({
  heading,
  items,
  lang,
  pending,
  onClaim,
}: {
  heading: string;
  items: MissionItem[];
  lang: Lang;
  pending: string | null;
  onClaim: (key: string) => void;
}) {
  const s = t(lang).missions;
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{heading}</h2>
      <div className="card divide-y divide-slate-100">
        {items.map((m) => {
          const busy = pending === `m:${m.key}`;
          const showProgress = m.goal > 1;
          return (
            <div key={m.key} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg" aria-hidden="true">
                {m.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {m.title}
                  {showProgress && !m.claimed && (
                    <span className="ml-1 font-normal text-slate-500">
                      {m.progress}/{m.goal}
                    </span>
                  )}
                </p>
                {showProgress && (
                  <div className="mt-1.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand/70" style={{ width: `${Math.round((m.progress / m.goal) * 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">🌱 {m.reward}</span>
                {m.claimed ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] text-white">✓</span>
                    {s.claimed}
                  </span>
                ) : m.met ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onClaim(m.key)}
                    className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white transition enabled:hover:bg-brand/90 disabled:opacity-60"
                  >
                    {busy ? s.claiming : s.claim}
                  </button>
                ) : m.goHref ? (
                  <Link href={m.goHref} className="rounded-full border border-brand/30 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/5">
                    {s.go}
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-300">{s.progressDays(m.progress)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
