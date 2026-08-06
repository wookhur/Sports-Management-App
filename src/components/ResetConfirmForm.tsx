"use client";

import { useState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordReset";

/** Server-side token states and validation keys mapped to copy. */
function message(key: string, s: ReturnType<typeof t>["reset"]): string {
  switch (key) {
    case "expired":
      return s.errExpired;
    case "used":
      return s.errUsed;
    case "unknown":
      return s.errUnknown;
    case "tooShort":
      return s.errTooShort(MIN_PASSWORD_LENGTH);
    default:
      return s.errFailed;
  }
}

export default function ResetConfirmForm({ lang, token }: { lang: Lang; token: string }) {
  const s = t(lang).reset;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Catch the obvious mistakes without a round trip; the server enforces the
    // length rule regardless.
    if (password.length < MIN_PASSWORD_LENGTH) return setError(s.errTooShort(MIN_PASSWORD_LENGTH));
    if (password !== confirm) return setError(s.errMismatch);

    setBusy(true);
    const res = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setBusy(false);

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => ({})) : {};
      return setError(message(String((body as { error?: string }).error ?? ""), s));
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-4xl">✅</p>
        <h1 className="mt-3 text-xl font-bold">{s.doneTitle}</h1>
        <p className="mt-2 text-sm text-slate-600">{s.doneBody}</p>
        <Link href="/login" className="btn-primary mt-6 w-full">{s.signIn}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 className="text-xl font-bold">{s.newTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">{s.newSubtitle}</p>

      <label className="label mt-5" htmlFor="pw">{s.newPassword}</label>
      <input
        id="pw"
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="label mt-3" htmlFor="pw2">{s.confirmPassword}</label>
      <input
        id="pw2"
        type="password"
        required
        autoComplete="new-password"
        className="input"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
        {busy ? s.saving : s.save}
      </button>
    </form>
  );
}
