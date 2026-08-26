import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import { prisma } from "@/lib/db";
import { coachDigest } from "@/lib/digestServer";
import { isWorthSending } from "@/lib/digest";
import { digestHtml } from "@/lib/digestEmail";
import { appUrl } from "@/lib/mailer";
import { t } from "@/lib/i18n";
import DigestOptOut from "@/components/DigestOptOut";

export const dynamic = "force-dynamic";

/**
 * Shows the coach exactly what Monday's email will contain — the real rendered
 * HTML in an iframe, not a re-implementation. Without this the digest is
 * invisible until a mail provider is wired up, and a feature nobody can see is
 * a feature nobody trusts.
 */
export default async function CoachDigestPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

  const lang = await getLang();
  const s = t(lang).digest;

  const [digest, me] = await Promise.all([
    coachDigest(session.userId, session.name),
    prisma.user.findUnique({ where: { id: session.userId }, select: { digestOptOut: true } }),
  ]);
  const worth = isWorthSending(digest);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/coach" className="text-sm font-semibold text-brand hover:underline">
        ← {t(lang).report.back}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{s.previewTitle}</h1>
          <p className="mt-1 text-slate-500">{s.previewSubtitle}</p>
        </div>
        <DigestOptOut
          optedOut={me?.digestOptOut ?? false}
          onLabel={s.previewSendingOn}
          offLabel={s.previewSendingOff}
        />
      </div>

      {worth ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          {/* The real email markup, sandboxed so its styles can't touch the app. */}
          <iframe
            title={s.previewTitle}
            sandbox=""
            srcDoc={digestHtml(digest, lang, appUrl())}
            className="h-[1150px] w-full bg-slate-50"
          />
        </div>
      ) : (
        <section className="card mt-6 p-10 text-center">
          <p className="text-lg font-semibold">{s.previewNothing}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{s.previewNothingHint}</p>
        </section>
      )}
    </main>
  );
}
