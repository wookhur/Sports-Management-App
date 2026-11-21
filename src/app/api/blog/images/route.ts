import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

// No external object storage is configured, so uploaded images are stored
// directly in Postgres and served back via GET /api/blog/images/[id]. Capped
// well under Netlify Functions' request-body limit (~6MB, lower once
// base64-encoded in transit).
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return failT("chooseImage");

  if (!ALLOWED_TYPES.has(file.type)) {
    return failT("imageFormat");
  }
  if (file.size > MAX_BYTES) {
    return failT("imageTooBig");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const image = await prisma.blogImage.create({
    data: { data: buffer, mimeType: file.type },
    select: { id: true },
  });

  return ok({ url: `/api/blog/images/${image.id}` }, 201);
}
