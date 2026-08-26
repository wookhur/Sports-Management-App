"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { label: string }> = {
  ko: { label: "로그아웃" },
  en: { label: "Log out" },
  es: { label: "Cerrar sesión" },
};

export default function LogoutButton({ lang = "en" }: { lang?: Lang }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <button onClick={logout} disabled={loading} className="btn-ghost text-xs">
      {L[lang].label}
    </button>
  );
}
