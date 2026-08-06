"use client";

import Link from "next/link";
import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export default function AuthForm({ lang }: { lang: Lang }) {
  const s = t(lang).login;
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
        setError(data?.error ?? (res.status >= 500 ? s.errServer : s.errGeneric(res.status)));
        setLoading(false);
        return;
      }
      // Hard navigation (not client router) so the freshly-set session cookie is
      // sent on a full document request — reliable even inside an embedded frame.
      window.location.assign("/");
    } catch {
      setError(s.errNetwork);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">{s.emailLabel}</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={s.emailPlaceholder}
          required
        />
      </div>
      <div>
        <label className="label">{s.passwordLabel}</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={s.passwordPlaceholder}
          required
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? s.submitLoading : s.submit}
      </button>

      <p className="text-center text-sm">
        <Link href="/forgot" className="text-slate-500 hover:text-slate-600">
          {t(lang).reset.forgotLink}
        </Link>
      </p>

      <p className="text-center text-sm text-slate-500">
        {s.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-brand">
          {s.signupLink}
        </Link>
      </p>
    </form>
  );
}
