"use client";

import { useState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { RESET_TTL_MINUTES } from "@/lib/passwordReset";

export default function ResetRequestForm({ lang }: { lang: Lang }) {
  const s = t(lang).reset;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setBusy(false);
    // Confirmed either way: this screen must look identical whether or not the
    // address has an account, or it becomes a way to enumerate users.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-4xl">📬</p>
        <h1 className="mt-3 text-xl font-bold">{s.sentTitle}</h1>
        <p className="mt-2 text-sm text-slate-600">{s.sentBody(email)}</p>
        <p className="mt-1 text-xs text-slate-400">{s.sentHint(RESET_TTL_MINUTES)}</p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
          {s.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 className="text-xl font-bold">{s.requestTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">{s.requestSubtitle}</p>

      <label className="label mt-5" htmlFor="reset-email">{s.emailLabel}</label>
      <input
        id="reset-email"
        type="email"
        required
        autoComplete="email"
        className="input"
        placeholder={s.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
        {busy ? s.submitting : s.submit}
      </button>
      <Link href="/login" className="mt-4 block text-center text-sm text-slate-400 hover:text-slate-600">
        {s.backToLogin}
      </Link>
    </form>
  );
}
