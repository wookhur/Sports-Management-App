import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import DeletePostButton from "@/components/DeletePostButton";
import { formatDate } from "@/lib/format";
import { toEditableHtml } from "@/lib/blogBody";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";
import { SPORT_I18N, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    back: (sportName: string) => string;
    edit: string;
  }
> = {
  ko: {
    back: (sportName) => `${sportName} 유명 선수 훈련법`,
    edit: "수정",
  },
  en: {
    back: (sportName) => `${sportName} famous athlete training methods`,
    edit: "Edit",
  },
  es: {
    back: (sportName) => `Métodos de entrenamiento de atletas famosos de ${sportName}`,
    edit: "Editar",
  },
};

export default async function AthleteGuidePage({
  params,
}: {
  params: Promise<{ sportId: string; slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";
  const { sportId, slug } = await params;

  const lang = await getLang();
  const t = L[lang];

  const sport = getSport(sportId);
  if (!sport) notFound();

  const sportName = SPORT_I18N[sportId]?.[lang]?.name ?? sport.name;

  const guide = await prisma.athleteGuide.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!guide || !guide.published || guide.sport !== sportId) notFound();

  const bodyHtml = sanitizeBlogHtml(toEditableHtml(guide.body));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href={`/sports/${sportId}/athletes`} className="text-sm text-slate-400 hover:text-slate-600">
            ← {t.back(sportName)}
          </Link>
          {isCoach && (
            <div className="flex items-center gap-3">
              <Link
                href={`/sports/${sportId}/athletes/${guide.slug}/edit`}
                className="text-xs font-medium text-slate-400 hover:text-brand"
              >
                {t.edit}
              </Link>
              <DeletePostButton
                slug={guide.slug}
                redirectTo={`/sports/${sportId}/athletes`}
                endpointBase="/api/athlete-guides"
                lang={lang}
              />
            </div>
          )}
        </div>

        <header className="mt-4">
          {!guide.coverImage && <div className="text-5xl">{sport.emoji}</div>}
          <div className="mt-3 flex items-center gap-2">
            <span className="badge bg-brand/10 text-brand">{guide.athleteName}</span>
            <span className="text-sm text-slate-400">{formatDate(guide.createdAt, lang)}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{guide.title}</h1>
          <p className="mt-2 text-slate-500">{guide.author?.name ?? "sideline365"}</p>
        </header>

        {guide.coverImage && (
          <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={guide.coverImage} alt={guide.title} className="h-full w-full object-cover" />
          </div>
        )}

        <article className="blog-body mt-6" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </main>
    </>
  );
}
