import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import AthleteGuideEditor from "@/components/AthleteGuideEditor";

export default async function NewAthleteGuidePage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sportId } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  // Authoring is coach-only for now.
  if (session.role !== "COACH") redirect(`/sports/${sportId}/athletes`);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href={`/sports/${sportId}/athletes`} className="text-sm text-slate-400 hover:text-slate-600">
          ← {sport.name} 유명 선수 훈련법
        </Link>
        <h1 className="mt-3 text-2xl font-bold">새 훈련법 작성</h1>
        <AthleteGuideEditor sport={sportId} sportName={sport.name} />
      </main>
    </>
  );
}
