import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import AthleteGuideEditor from "@/components/AthleteGuideEditor";
import { SPORT_I18N, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

const L: Record<
  Lang,
  {
    back: (sportName: string) => string;
    title: string;
  }
> = {
  ko: {
    back: (sportName) => `${sportName} 유명 선수 훈련법`,
    title: "새 훈련법 작성",
  },
  en: {
    back: (sportName) => `${sportName} famous athlete training methods`,
    title: "New training method",
  },
  es: {
    back: (sportName) => `Métodos de entrenamiento de atletas famosos de ${sportName}`,
    title: "Nuevo método de entrenamiento",
  },
};

export default async function NewAthleteGuidePage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const t = L[lang];

  const { sportId } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  const sportName = SPORT_I18N[sportId]?.[lang]?.name ?? sport.name;

  // Authoring is coach-only for now.
  if (session.role !== "COACH") redirect(`/sports/${sportId}/athletes`);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href={`/sports/${sportId}/athletes`} className="text-sm text-slate-400 hover:text-slate-600">
          ← {t.back(sportName)}
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{t.title}</h1>
        <AthleteGuideEditor sport={sportId} sportName={sportName} lang={lang} />
      </main>
    </>
  );
}
