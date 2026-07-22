"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

export interface MissionItem {
  key: string;
  emoji: string;
  reward: number;
  goal: number;
  progress: number;
  met: boolean;
  claimed: boolean;
  manual: boolean;
  category: "daily" | "community";
  title: string;
  subtitle: string;
  /** in-app page to visit when the mission isn't met yet (auto missions) */
  goHref: string | null;
}

export interface RepairItem {
  key: string;
  emoji: string;
  cost: number;
  title: string;
  owned: boolean;
}

interface Props {
  lang: Lang;
  beans: number;
  level: number;
  intoLevel: number;
  step: number;
  needed: number;
  missions: MissionItem[];
  repairs: RepairItem[];
}

export default function MissionHub({
  lang,
  beans: initialBeans,
  level,
  intoLevel,
  step,
  needed,
  missions: initialMissions,
  repairs: initialRepairs,
}: Props) {
  const s = t(lang).missions;
  const router = useRouter();
  const [beans, setBeans] = useState(initialBeans);
  const [missions, setMissions] = useState(initialMissions);
  const [repairs, setRepairs] = useState(initialRepairs);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const repairedCount = repairs.filter((r) => r.owned).length;
  const houseDone = repairedCount === repairs.length;
  const housePct = Math.round((repairedCount / repairs.length) * 100);

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
      if (!res.ok) {
        setError(data?.error ?? "오류가 발생했어요");
      } else {
        setBeans(data.beans);
        setMissions((prev) => prev.map((m) => (m.key === key ? { ...m, claimed: true } : m)));
        router.refresh();
      }
    } catch {
      setError("서버에 연결할 수 없어요");
    } finally {
      setPending(null);
    }
  }

  async function repair(key: string) {
    setError(null);
    setPending(`r:${key}`);
    try {
      const res = await fetch("/api/missions/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repairKey: key }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "오류가 발생했어요");
      } else {
        setBeans(data.beans);
        setRepairs((prev) => prev.map((r) => (r.key === key ? { ...r, owned: true } : r)));
        router.refresh();
      }
    } catch {
      setError("서버에 연결할 수 없어요");
    } finally {
      setPending(null);
    }
  }

  const daily = missions.filter((m) => m.category === "daily");
  const community = missions.filter((m) => m.category === "community");

  return (
    <div className="space-y-6">
      {/* Stats bar: level + XP + beans */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-500 text-sm font-bold text-white">
            {s.levelLabel(level)}
          </span>
          <div className="min-w-[140px]">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${Math.round((intoLevel / step) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">{s.toNextLevel(needed)}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
          <span aria-hidden="true">🌱</span>
          <span className="tabular-nums">{beans}</span>
          <span className="font-medium">{s.beans}</span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Character / house card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative bg-gradient-to-b from-sky-300 to-sky-100 px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white drop-shadow-sm">{s.houseTitle}</h2>
            <span className="rounded-full bg-white/30 px-2.5 py-0.5 text-xs font-semibold text-white">
              {repairedCount}/{repairs.length}
            </span>
          </div>
          <div className="flex flex-col items-center py-6">
            <div className="text-7xl leading-none" aria-hidden="true">
              {houseDone ? "🏡" : "🥚"}
            </div>
            <div className="mt-1 text-3xl" aria-hidden="true">
              {houseDone ? "🐤" : "😢"}
            </div>
          </div>
          <p className="text-center text-xs font-medium text-sky-900/70">{s.houseSub}</p>
        </div>
        <div className="px-5 py-4">
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${housePct}%` }} />
          </div>
          {houseDone ? (
            <p className="py-2 text-center text-sm font-semibold text-emerald-600">{s.houseDone}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {repairs.map((r) => {
                const affordable = beans >= r.cost;
                const busy = pending === `r:${r.key}`;
                return (
                  <li key={r.key} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-lg" aria-hidden="true">
                      {r.emoji}
                    </span>
                    <span className="flex-1 text-sm font-medium">{r.title}</span>
                    {r.owned ? (
                      <span className="flex items-center gap-1 text-sm font-semibold text-brand">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] text-white">✓</span>
                        {s.repaired}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!affordable || busy}
                        onClick={() => repair(r.key)}
                        className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white transition enabled:hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        title={!affordable ? s.notEnough : undefined}
                      >
                        {busy ? "…" : s.repairCta(r.cost, s.beans.trim() || "🌱")}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Mission lists */}
      <MissionSection heading={s.dailyHeading} items={daily} lang={lang} pending={pending} onClaim={claim} />
      <MissionSection heading={s.communityHeading} items={community} lang={lang} pending={pending} onClaim={claim} />

      <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        💡 {s.howItWorks}
      </p>
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{heading}</h2>
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
                <p className="text-xs text-slate-400">{m.subtitle}</p>
                <p className="truncate text-sm font-semibold">
                  {m.title}
                  {showProgress && !m.claimed && (
                    <span className="ml-1 font-normal text-slate-400">
                      {m.progress}/{m.goal}
                    </span>
                  )}
                </p>
                {showProgress && (
                  <div className="mt-1.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand/70"
                      style={{ width: `${Math.round((m.progress / m.goal) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  🌱 {m.reward}
                </span>
                {m.claimed ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
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
                  <Link
                    href={m.goHref}
                    className="rounded-full border border-brand/30 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/5"
                  >
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
