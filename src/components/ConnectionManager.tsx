"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface Connection {
  id: string;
  name: string;
  email: string;
}

export default function ConnectionManager({
  role,
  connections,
}: {
  role: "ATHLETE" | "COACH";
  connections: Connection[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const counterpartLabel = role === "COACH" ? "선수" : "코치";

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "실패했습니다");
      return;
    }
    setEmail("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/connections?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">
        {role === "COACH" ? "내 선수" : "내 코치"}
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        {role === "COACH"
          ? "선수의 이메일로 로스터에 추가하세요."
          : "코치의 이메일을 등록하면 공유한 기록을 볼 수 있어요."}
      </p>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`${counterpartLabel} 이메일`}
          required
        />
        <button className="btn-primary shrink-0" disabled={loading}>
          {loading ? "…" : "추가"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-4 space-y-2">
        {connections.length === 0 && (
          <li className="text-sm text-slate-400">아직 연결된 {counterpartLabel}가 없어요.</li>
        )}
        {connections.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5"
          >
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-slate-400">{c.email}</p>
            </div>
            <button onClick={() => remove(c.id)} className="text-xs text-slate-400 hover:text-red-500">
              연결 해제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
