import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { teamRole } from "@/lib/teamAccess";
import { DOC_KINDS, type DocKind } from "@/lib/bitacora";
import type { Prisma } from "@prisma/client";

/**
 * Save one of the season log's form sections (goals, year-end report,
 * self-evaluations) for a school year. The page autosaves the whole form, so
 * this replaces the document; the schema fills in anything left out.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id, kind } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return failT("teamNotFound", 404);
  if (!(kind in DOC_KINDS)) return failT("invalid", 404);

  const body = (await req.json().catch(() => null)) as { year?: unknown; data?: unknown } | null;
  const year = Number(body?.year);
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return failT("invalid");
  const parsed = DOC_KINDS[kind as DocKind].safeParse(body?.data ?? {});
  if (!parsed.success) return failIssue(parsed.error.issues);

  const data = parsed.data as Prisma.InputJsonValue;
  await prisma.teamSeasonDoc.upsert({
    where: { teamId_year_kind: { teamId: id, year, kind } },
    update: { data },
    create: { teamId: id, year, kind, data },
  });
  return ok({ kind, year });
}
