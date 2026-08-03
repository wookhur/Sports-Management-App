import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { notify } from "@/lib/notifyServer";

const schema = z.object({ body: z.string().min(1, "내용을 입력하세요").max(500) });

type Params = { params: Promise<{ id: string }> };

// A coach (linked to the record's owner) leaves feedback on a shared record.
export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  const { id } = await params;

  const record = await prisma.record.findUnique({ where: { id } });
  if (!record) return fail("기록을 찾을 수 없습니다", 404);

  // Allow: the owner, or a coach linked to the owner (only on shared records).
  const isOwner = record.userId === session.userId;
  let allowed = isOwner;
  if (!allowed && record.shared && session.role === "COACH") {
    const link = await prisma.coachAthlete.findUnique({
      where: { coachId_athleteId: { coachId: session.userId, athleteId: record.userId } },
    });
    // A pending request grants nothing until the athlete accepts.
    allowed = link?.status === "ACCEPTED";
  }
  if (!allowed) return fail("코멘트를 남길 권한이 없습니다", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const comment = await prisma.comment.create({
    data: { recordId: id, authorId: session.userId, body: parsed.data.body.trim() },
    include: { author: { select: { name: true, role: true } } },
  });
  // Tell the record's owner, unless they are the one who just commented.
  if (!isOwner) await notify(record.userId, "recordComment", { name: session.name }, "/records");
  return ok(comment, 201);
}
