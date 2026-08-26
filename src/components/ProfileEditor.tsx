"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EXPERIENCE_I18N,
  GRADE_I18N_EN,
  GRADE_I18N_ES,
  type Lang,
} from "@/lib/i18n";

export interface ProfileData {
  name: string;
  username: string;
  school: string;
  grade: string;
  dob: string; // yyyy-mm-dd or ""
  experienceLevel: string;
  sportInterests: string[];
}

const L: Record<
  Lang,
  {
    heading: string;
    name: string;
    username: string;
    school: string;
    schoolPlaceholder: string;
    grade: string;
    none: string;
    dob: string;
    experience: string;
    interests: string;
    interestsAria: string;
    save: string;
    saving: string;
    saved: string;
    errFallback: string;
  }
> = {
  ko: {
    heading: "프로필 수정",
    name: "이름",
    username: "아이디",
    school: "학교",
    schoolPlaceholder: "예: 한국고등학교",
    grade: "학년",
    none: "선택 안 함",
    dob: "생년월일",
    experience: "운동 경험",
    interests: "관심 종목",
    interestsAria: "관심 종목 선택",
    save: "저장",
    saving: "저장 중…",
    saved: "저장했어요 ✓",
    errFallback: "저장하지 못했습니다",
  },
  en: {
    heading: "Edit profile",
    name: "Name",
    username: "Username",
    school: "School",
    schoolPlaceholder: "e.g. Lincoln High School",
    grade: "Grade",
    none: "Not set",
    dob: "Date of birth",
    experience: "Experience",
    interests: "Sport interests",
    interestsAria: "Select sport interests",
    save: "Save",
    saving: "Saving…",
    saved: "Saved ✓",
    errFallback: "Couldn't save your changes",
  },
  es: {
    heading: "Editar perfil",
    name: "Nombre",
    username: "Nombre de usuario",
    school: "Escuela",
    schoolPlaceholder: "ej. Colegio Lincoln",
    grade: "Grado",
    none: "Sin seleccionar",
    dob: "Fecha de nacimiento",
    experience: "Experiencia",
    interests: "Deportes de interés",
    interestsAria: "Seleccionar deportes de interés",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Guardado ✓",
    errFallback: "No se pudieron guardar los cambios",
  },
};

/** Display label for a stored Korean grade value (values stay Korean in the DB). */
function gradeLabel(g: string, lang: Lang): string {
  return lang === "en" ? GRADE_I18N_EN[g] ?? g : lang === "es" ? GRADE_I18N_ES[g] ?? g : g;
}

export default function ProfileEditor({
  initial,
  gradeOptions,
  experienceOptions,
  sportOptions,
  lang = "en",
}: {
  initial: ProfileData;
  gradeOptions: string[];
  experienceOptions: { value: string; label: string }[];
  sportOptions: { id: string; name: string; emoji: string }[];
  lang?: Lang;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const t = L[lang];

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
      setError(data?.error ?? t.errFallback);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <h2 className="font-bold">{t.heading}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pf-name">{t.name}</label>
          <input id="pf-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={40} required />
        </div>
        <div>
          <label className="label" htmlFor="pf-username">{t.username}</label>
          <input id="pf-username" className="input" value={form.username} onChange={(e) => set("username", e.target.value)} maxLength={30} placeholder="username" />
        </div>
        <div>
          <label className="label" htmlFor="pf-school">{t.school}</label>
          <input id="pf-school" className="input" value={form.school} onChange={(e) => set("school", e.target.value)} maxLength={60} placeholder={t.schoolPlaceholder} />
        </div>
        <div>
          <label className="label" htmlFor="pf-grade">{t.grade}</label>
          <select id="pf-grade" className="input" value={form.grade} onChange={(e) => set("grade", e.target.value)}>
            <option value="">{t.none}</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>{gradeLabel(g, lang)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf-dob">{t.dob}</label>
          <input id="pf-dob" type="date" className="input" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pf-exp">{t.experience}</label>
          <select id="pf-exp" className="input" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
            <option value="">{t.none}</option>
            {experienceOptions.map((o) => (
              <option key={o.value} value={o.value}>{EXPERIENCE_I18N[o.value]?.[lang]?.label ?? o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className="label">{t.interests}</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.interestsAria}>
          {sportOptions.map((s) => {
            const on = form.sportInterests.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSport(s.id)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  on ? "border-brand bg-brand/10 text-brand-dark" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {s.emoji} {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t.saved}</p>}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? t.saving : t.save}
      </button>
    </form>
  );
}
