import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import AthleteGuideEditor from "@/components/AthleteGuideEditor";

export default async function EditAthleteGuidePage({
  params,
}: {
  params: Promise<{ sportId: string; slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sportId, slug } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  if (session.role !== "COACH") redirect(`/sports/${sportId}/athletes`);

  const guide = await prisma.athleteGuide.findUnique({ where: { slug } });
  if (!guide || guide.sport !== sportId) notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href={`/sports/${sportId}/athletes/${slug}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← 글로 돌아가기
        </Link>
        <h1 className="mt-3 text-2xl font-bold">훈련법 수정</h1>
        <AthleteGuideEditor
          sport={sportId}
          sportName={sport.name}
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
