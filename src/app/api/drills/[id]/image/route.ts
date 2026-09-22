import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { drillCircle } from "@/lib/customDrills";

/**
 * The drill's pixels. Same visibility rule as the page: the owner and their
 * team circle. Cached privately for an hour; the image never changes, and a
 * deleted drill's URL simply stops resolving.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Sign in to continue", { status: 401 });

  const { id } = await params;
  const drill = await prisma.customDrill.findUnique({
    where: { id },
    select: { ownerId: true, image: true, imageType: true },
  });
  if (!drill) return new Response("Not found", { status: 404 });
  if (drill.ownerId !== session.userId && !(await drillCircle(session.userId)).includes(drill.ownerId)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(drill.image), {
    headers: {
      "Content-Type": drill.imageType,
      "Content-Length": String(drill.image.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
