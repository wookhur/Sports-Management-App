"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // The server may return a non-JSON error page (e.g. a 500 from a broken
      // DB connection). Parse defensively so the UI never hangs.
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          data?.error ??
            (res.status >= 500
              ? "서버 오류가 발생했습니다. 데이터베이스 설정을 확인해주세요."
              : `요청을 처리하지 못했습니다 (${res.status})`)
        );
        setLoading(false);
        return;
      }
      // Hard navigation (not client router) so the freshly-set session cookie is
      // sent on a full document request — reliable even inside an embedded frame.
      window.location.assign("/");
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
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
          placeholder="비밀번호"
          required
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "처리 중…" : "로그인"}
      </button>

      <p className="text-center text-sm text-slate-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-brand">
          회원가입
        </Link>
      </p>
    </form>
  );
}
