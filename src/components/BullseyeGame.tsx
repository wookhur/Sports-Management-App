"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";
import { GAMES } from "@/lib/games";

// Logical canvas size (drawn at device-pixel resolution, scaled by CSS).
const W = 340;
const H = 300;
const CX = W / 2;
const CY = 128;
const R = 108;
const SHOTS = GAMES.bullseye.shots;

type Phase = "idle" | "aim" | "power" | "resolve" | "done";
interface Marker {
  x: number;
  y: number;
  pts: number;
}

interface GState {
  phase: Phase;
  aimX: number;
  aimDir: number;
  aimSpeed: number;
  power: number;
  powerDir: number;
  powerSpeed: number;
  idealPower: number;
  lockedX: number;
  shotIdx: number;
  total: number;
  markers: Marker[];
  raf: number;
  last: number;
}

function shotSpeeds(i: number) {
  // Difficulty ramps with each shot.
  return { aim: 150 + i * 42, power: 72 + i * 20 };
}

// Deterministic-ish per-shot ideal power derived from index (no Math.random so
// the same session is reproducible; still feels varied across 5 shots).
const IDEAL_POWERS = [50, 38, 62, 45, 57];

export default function BullseyeGame({ lang }: { lang: Lang }) {
  const s = t(lang).games;
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const g = useRef<GState>({
    phase: "idle",
    aimX: CX - R,
    aimDir: 1,
    aimSpeed: 0,
    power: 0,
    powerDir: 1,
    powerSpeed: 0,
    idealPower: 50,
    lockedX: CX,
    shotIdx: 0,
    total: 0,
    markers: [],
    raf: 0,
    last: 0,
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [shotIdx, setShotIdx] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastPts, setLastPts] = useState<number | null>(null);
  const [lastBull, setLastBull] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ best: number; isRecord: boolean; rank: number } | null>(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const st = g.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, W, H);

    // Target rings (archery colors), outer → inner.
    const bands: [number, string][] = [
      [1, "#ffffff"],
      [0.8, "#0f172a"],
      [0.6, "#3b82f6"],
      [0.4, "#ef4444"],
      [0.2, "#f59e0b"],
    ];
    for (const [f, color] of bands) {
      ctx.beginPath();
      ctx.arc(CX, CY, R * f, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(148,163,184,0.5)";
      ctx.stroke();
    }
    // Center pip
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();

    // Landed markers
    st.markers.forEach((m, i) => {
      const isLast = i === st.markers.length - 1;
      ctx.beginPath();
      ctx.arc(m.x, m.y, isLast ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isLast ? "#22c55e" : "rgba(15,23,42,0.55)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    });

    // AIM: vertical sweeping line
    if (st.phase === "aim") {
      ctx.beginPath();
      ctx.moveTo(st.aimX, CY - R - 16);
      ctx.lineTo(st.aimX, CY + R + 16);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4f46e5";
      ctx.stroke();
      // pointer triangle
      ctx.beginPath();
      ctx.moveTo(st.aimX - 6, CY - R - 16);
      ctx.lineTo(st.aimX + 6, CY - R - 16);
      ctx.lineTo(st.aimX, CY - R - 8);
      ctx.closePath();
      ctx.fillStyle = "#4f46e5";
      ctx.fill();
    }

    // POWER: locked aim line (dim) + right-side power gauge with ideal zone
    if (st.phase === "power") {
      ctx.beginPath();
      ctx.moveTo(st.lockedX, CY - R - 16);
      ctx.lineTo(st.lockedX, CY + R + 16);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(79,70,229,0.5)";
      ctx.stroke();
      ctx.setLineDash([]);

      const gx = W - 22;
      const gTop = CY - R;
      const gh = R * 2;
      // gauge track
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(gx - 7, gTop, 14, gh);
      // ideal zone (~±8%)
      const idyTop = gTop + gh * (1 - (st.idealPower + 8) / 100);
      const idyH = gh * 0.16;
      ctx.fillStyle = "rgba(34,197,94,0.35)";
      ctx.fillRect(gx - 7, idyTop, 14, idyH);
      // fill from bottom by current power
      const fh = gh * (st.power / 100);
      ctx.fillStyle = "#4f46e5";
      ctx.fillRect(gx - 7, gTop + gh - fh, 14, fh);
      // frame
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#94a3b8";
      ctx.strokeRect(gx - 7, gTop, 14, gh);
    }
  }, []);

  const frame = useCallback(
    (ts: number) => {
      const st = g.current;
      const dt = Math.min(0.05, st.last ? (ts - st.last) / 1000 : 0);
      st.last = ts;
      if (st.phase === "aim") {
        st.aimX += st.aimDir * st.aimSpeed * dt;
        if (st.aimX > CX + R) {
          st.aimX = CX + R;
          st.aimDir = -1;
        } else if (st.aimX < CX - R) {
          st.aimX = CX - R;
          st.aimDir = 1;
        }
      } else if (st.phase === "power") {
        st.power += st.powerDir * st.powerSpeed * dt;
        if (st.power > 100) {
          st.power = 100;
          st.powerDir = -1;
        } else if (st.power < 0) {
          st.power = 0;
          st.powerDir = 1;
        }
      }
      draw();
      st.raf = requestAnimationFrame(frame);
    },
    [draw],
  );

  const setupShot = useCallback((i: number) => {
    const st = g.current;
    const sp = shotSpeeds(i);
    st.aimX = CX - R;
    st.aimDir = 1;
    st.aimSpeed = sp.aim;
    st.power = 0;
    st.powerDir = 1;
    st.powerSpeed = sp.power;
    st.idealPower = IDEAL_POWERS[i % IDEAL_POWERS.length];
    st.shotIdx = i;
    st.phase = "aim";
    setShotIdx(i);
    setPhase("aim");
  }, []);

  const submitScore = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "bullseye", score: g.current.total }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setResult(data);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }, [router]);

  const startGame = useCallback(() => {
    const st = g.current;
    st.total = 0;
    st.markers = [];
    st.last = 0;
    setTotal(0);
    setLastPts(null);
    setLastBull(false);
    setResult(null);
    setupShot(0);
    cancelAnimationFrame(st.raf);
    st.raf = requestAnimationFrame(frame);
  }, [frame, setupShot]);

  const lock = useCallback(() => {
    const st = g.current;
    if (st.phase === "aim") {
      st.lockedX = st.aimX;
      st.phase = "power";
      setPhase("power");
      return;
    }
    if (st.phase === "power") {
      // Resolve the shot: aim → X, power vs ideal → Y.
      const errX = st.lockedX - CX;
      const yOff = ((st.idealPower - st.power) / 100) * R * 1.3;
      const x = st.lockedX;
      const y = CY + yOff;
      const dist = Math.hypot(errX, yOff);
      const norm = Math.min(1, dist / R);
      const pts = Math.round(100 * Math.pow(1 - norm, 1.8));
      const bull = norm < 0.06;

      st.markers.push({ x, y, pts });
      st.total += pts;
      st.phase = "resolve";
      setPhase("resolve");
      setTotal(st.total);
      setLastPts(pts);
      setLastBull(bull);
      draw();

      window.setTimeout(() => {
        if (st.shotIdx + 1 < SHOTS) {
          setupShot(st.shotIdx + 1);
        } else {
          st.phase = "done";
          cancelAnimationFrame(st.raf);
          setPhase("done");
          void submitScore();
        }
      }, 950);
    }
  }, [draw, setupShot, submitScore]);

  // Input: Space to lock, and pointer taps on the canvas.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.key === " ") {
        const ph = g.current.phase;
        if (ph === "aim" || ph === "power") {
          e.preventDefault();
          lock();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lock]);

  // Cleanup rAF on unmount.
  useEffect(() => {
    // Draw an initial idle target.
    draw();
    return () => cancelAnimationFrame(g.current.raf);
  }, [draw]);

  // Hi-DPI canvas setup.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    draw();
  }, [draw]);

  const tappable = phase === "aim" || phase === "power";

  return (
    <div className="card overflow-hidden">
      {/* HUD */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-500">
          {phase === "idle" || phase === "done" ? s.title.replace("🎯 ", "") : s.shotOf(shotIdx + 1, SHOTS)}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-500">{s.total}</span>
          <span className="text-lg font-extrabold tabular-nums text-brand">{total}</span>
        </span>
      </div>

      <div className="relative select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={() => tappable && lock()}
          style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "manipulation" }}
          className={`mx-auto block ${tappable ? "cursor-pointer" : ""}`}
        />

        {/* Phase label / hint overlay */}
        {tappable && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-1">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                phase === "aim" ? "bg-indigo-600" : "bg-fuchsia-600"
              }`}
            >
              {phase === "aim" ? s.aimPhase : s.powerPhase}
            </span>
            <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-white">
              {phase === "aim" ? s.aimHint : s.powerHint}
            </span>
          </div>
        )}

        {/* Per-shot points popup */}
        {phase === "resolve" && lastPts != null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-slate-900/85 px-5 py-3 text-center text-white shadow-lg">
              <p className="text-2xl font-extrabold">+{lastPts}</p>
              {lastBull && <p className="text-xs font-semibold text-amber-300">{s.bullseye}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Controls / result */}
      <div className="px-4 py-4">
        {phase === "idle" && (
          <button
            type="button"
            onClick={startGame}
            className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand/90"
          >
            {s.start}
          </button>
        )}

        {phase === "done" && (
          <div className="text-center">
            <p className="text-sm text-slate-500">{s.finalScore}</p>
            <p className="text-4xl font-extrabold tabular-nums">{total}</p>
            {submitting ? (
              <p className="mt-1 text-xs text-slate-500">{s.submitting}</p>
            ) : (
              result && (
                <p className="mt-1 text-sm font-semibold">
                  {result.isRecord && <span className="text-amber-700">{s.newRecord} </span>}
                  <span className="text-slate-500">{s.yourRank(result.rank)}</span>
                </p>
              )
            )}
            <button
              type="button"
              onClick={startGame}
              className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand/90"
            >
              {s.playAgain}
            </button>
          </div>
        )}

        {tappable && (
          <button
            type="button"
            onClick={lock}
            className="w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {s.lock}
          </button>
        )}

        {phase === "resolve" && (
          <div className="h-[46px]" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
