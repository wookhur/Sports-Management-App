import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import AthleteGuideEditor from "@/components/AthleteGuideEditor";
import { SPORT_I18N, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

const L: Record<
  Lang,
  {
    back: string;
    title: string;
  }
> = {
  ko: {
    back: "글로 돌아가기",
    title: "훈련법 수정",
  },
  en: {
    back: "Back to post",
    title: "Edit training method",
  },
  es: {
    back: "Volver a la publicación",
    title: "Editar método de entrenamiento",
  },
};

export default async function EditAthleteGuidePage({
  params,
}: {
  params: Promise<{ sportId: string; slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const t = L[lang];

  const { sportId, slug } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  if (session.role !== "COACH") redirect(`/sports/${sportId}/athletes`);

  const guide = await prisma.athleteGuide.findUnique({ where: { slug } });
  if (!guide || guide.sport !== sportId) notFound();

  const sportName = SPORT_I18N[sportId]?.[lang]?.name ?? sport.name;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href={`/sports/${sportId}/athletes/${slug}`} className="text-sm text-slate-500 hover:text-slate-600">
          ← {t.back}
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{t.title}</h1>
        <AthleteGuideEditor
          sport={sportId}
          sportName={sportName}
          lang={lang}
          initial={{
            slug: guide.slug,
            athleteName: guide.athleteName,
            title: guide.title,
            excerpt: guide.excerpt,
            coverImage: guide.coverImage ?? "",
            body: guide.body,
          }}
        />
      </main>
    </>
  );
}
