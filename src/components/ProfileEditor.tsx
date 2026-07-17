"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ProfileData {
  name: string;
  username: string;
  school: string;
  grade: string;
  dob: string; // yyyy-mm-dd or ""
  experienceLevel: string;
  sportInterests: string[];
}

export default function ProfileEditor({
  initial,
  gradeOptions,
  experienceOptions,
  sportOptions,
}: {
  initial: ProfileData;
  gradeOptions: string[];
  experienceOptions: { value: string; label: string }[];
  sportOptions: { id: string; name: string; emoji: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function toggleSport(id: string) {
    set(
      "sportInterests",
      form.sportInterests.includes(id)
        ? form.sportInterests.filter((s) => s !== id)
        : [...form.sportInterests, id],
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? "저장하지 못했습니다");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <h2 className="font-bold">프로필 수정</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pf-name">이름</label>
          <input id="pf-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={40} required />
        </div>
        <div>
          <label className="label" htmlFor="pf-username">아이디</label>
          <input id="pf-username" className="input" value={form.username} onChange={(e) => set("username", e.target.value)} maxLength={30} placeholder="username" />
        </div>
        <div>
          <label className="label" htmlFor="pf-school">학교</label>
          <input id="pf-school" className="input" value={form.school} onChange={(e) => set("school", e.target.value)} maxLength={60} placeholder="예: 한국고등학교" />
        </div>
        <div>
          <label className="label" htmlFor="pf-grade">학년</label>
          <select id="pf-grade" className="input" value={form.grade} onChange={(e) => set("grade", e.target.value)}>
            <option value="">선택 안 함</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf-dob">생년월일</label>
          <input id="pf-dob" type="date" className="input" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pf-exp">운동 경험</label>
          <select id="pf-exp" className="input" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
            <option value="">선택 안 함</option>
            {experienceOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className="label">관심 종목</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="관심 종목 선택">
          {sportOptions.map((s) => {
            const on = form.sportInterests.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSport(s.id)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  on ? "border-brand bg-brand/10 text-brand" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {s.emoji} {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">저장했어요 ✓</p>}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
