"use client";

import { useState } from "react";
import type { Metric } from "@/lib/sports";
import Stopwatch from "./Stopwatch";
import ManualRecordForm from "./ManualRecordForm";

type Tab = "timer" | "manual";

export default function RecordEntry({
  sportId,
  metrics,
}: {
  sportId: string;
  metrics: Metric[];
}) {
  const [tab, setTab] = useState<Tab>("timer");

  return (
    <div>
      {/* Segmented control: measure with the timer, or enter a known result. */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("timer")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            tab === "timer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          ⏱️ 타이머로 측정
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            tab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          ✍️ 직접 입력
        </button>
      </div>

      {tab === "timer" ? (
        <Stopwatch sportId={sportId} metrics={metrics} />
      ) : (
        <ManualRecordForm sportId={sportId} metrics={metrics} />
      )}
    </div>
  );
}
