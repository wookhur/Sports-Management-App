import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

const patchSchema = z.object({
  shared: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id } = await params;

  const record = await prisma.record.findUnique({ where: { id } });
  if (!record || record.userId !== session.userId) return failT("recordNotFound", 404);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return failT("invalid");

  const updated = await prisma.record.update({
    where: { id },
    data: {
      ...(parsed.data.shared !== undefined ? { shared: parsed.data.shared } : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes.trim() || null } : {}),
    },
  });
  return ok(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id } = await params;

  const record = await prisma.record.findUnique({ where: { id } });
  if (!record || record.userId !== session.userId) return failT("recordNotFound", 404);

  await prisma.record.delete({ where: { id } });
  return ok({ ok: true });
}
