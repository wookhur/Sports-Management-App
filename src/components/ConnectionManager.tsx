"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export interface Connection {
  id: string;
  name: string;
  email: string;
}

const L: Record<
  Lang,
  {
    headingCoachView: string;
    headingAthleteView: string;
    subCoachView: string;
    subAthleteView: string;
    emailPlaceholderAthlete: string;
    emailPlaceholderCoach: string;
    add: string;
    errFailed: string;
    emptyAthlete: string;
    emptyCoach: string;
    disconnect: string;
  }
> = {
  ko: {
    headingCoachView: "내 선수",
    headingAthleteView: "내 코치",
    subCoachView: "선수의 이메일로 로스터에 추가하세요.",
    subAthleteView: "코치의 이메일을 등록하면 공유한 기록을 볼 수 있어요.",
    emailPlaceholderAthlete: "선수 이메일",
    emailPlaceholderCoach: "코치 이메일",
    add: "추가",
    errFailed: "실패했습니다",
    emptyAthlete: "아직 연결된 선수가 없어요.",
    emptyCoach: "아직 연결된 코치가 없어요.",
    disconnect: "연결 해제",
  },
  en: {
    headingCoachView: "My Athletes",
    headingAthleteView: "My Coaches",
    subCoachView: "Add athletes to your roster by email.",
    subAthleteView: "Add your coach's email so they can see the records you share.",
    emailPlaceholderAthlete: "Athlete's email",
    emailPlaceholderCoach: "Coach's email",
    add: "Add",
    errFailed: "Something went wrong",
    emptyAthlete: "No athletes connected yet.",
    emptyCoach: "No coaches connected yet.",
    disconnect: "Disconnect",
  },
  es: {
    headingCoachView: "Mis atletas",
    headingAthleteView: "Mis entrenadores",
    subCoachView: "Agrega atletas a tu plantilla con su correo electrónico.",
    subAthleteView: "Registra el correo de tu entrenador para que pueda ver las marcas que compartas.",
    emailPlaceholderAthlete: "Correo del atleta",
    emailPlaceholderCoach: "Correo del entrenador",
    add: "Agregar",
    errFailed: "Algo salió mal",
    emptyAthlete: "Aún no tienes atletas conectados.",
    emptyCoach: "Aún no tienes entrenadores conectados.",
    disconnect: "Desconectar",
  },
};

export default function ConnectionManager({
  role,
  connections,
  lang = "ko",
  hideList = false,
}: {
  role: "ATHLETE" | "COACH";
  connections: Connection[];
  lang?: Lang;
  /** On /connections the accepted list is rendered separately; don't repeat it. */
  hideList?: boolean;
}) {
  const s = L[lang];
  const c = t(lang).connect;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(data.error ?? s.errFailed);
      return;
    }
    setEmail("");
    // The counterpart has to accept before anything is linked, so say so
    // rather than letting the cleared form imply it worked instantly.
    setNotice(data.status === "ACCEPTED" ? c.alreadyLinked(data.name ?? "") : c.requestSent(data.name ?? ""));
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/connections?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">
        {role === "COACH" ? s.headingCoachView : s.headingAthleteView}
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        {role === "COACH" ? s.subCoachView : s.subAthleteView}
      </p>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={role === "COACH" ? s.emailPlaceholderAthlete : s.emailPlaceholderCoach}
          required
        />
        <button className="btn-primary shrink-0" disabled={loading}>
          {loading ? "…" : s.add}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {notice && (
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
          <span className="mt-0.5 block text-xs text-emerald-600">{c.requestSentHint}</span>
        </p>
      )}

      <ul className={`mt-4 space-y-2 ${hideList ? "hidden" : ""}`}>
        {connections.length === 0 && (
          <li className="text-sm text-slate-400">{role === "COACH" ? s.emptyAthlete : s.emptyCoach}</li>
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
              {s.disconnect}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
