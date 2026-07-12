import { prisma } from "@/lib/db";

// Public (no auth) so <Image> tags and Next's image optimizer can fetch it
// directly, same as any static asset. Long, immutable cache: image bytes
// never change for a given id (edits upload a new row instead).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await prisma.blogImage.findUnique({ where: { id } });
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
