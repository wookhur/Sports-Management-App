"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ATHLETE" | "COACH">("ATHLETE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignup ? { name, email, password, role } : { email, password };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "오류가 발생했습니다");
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {isSignup && (
        <div>
          <label className="label">이름</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required />
        </div>
      )}
      <div>
        <label className="label">이메일</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="label">비밀번호</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignup ? "6자 이상" : "비밀번호"}
          required
        />
      </div>

      {isSignup && (
        <div>
          <label className="label">역할</label>
          <div className="grid grid-cols-2 gap-2">
            {(["ATHLETE", "COACH"] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  role === r
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r === "ATHLETE" ? "🏃 선수" : "📋 코치"}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
      </button>

      <p className="text-center text-sm text-slate-500">
        {isSignup ? (
          <>
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-brand">
              로그인
            </Link>
          </>
        ) : (
          <>
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-semibold text-brand">
              회원가입
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
