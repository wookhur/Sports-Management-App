import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

// No external object storage is configured, so uploaded images are stored
// directly in Postgres and served back via GET /api/blog/images/[id]. Capped
// well under Netlify Functions' request-body limit (~6MB, lower once
// base64-encoded in transit).
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 이미지를 업로드할 수 있습니다", 403);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return fail("이미지 파일을 선택하세요");

  if (!ALLOWED_TYPES.has(file.type)) {
    return fail("JPG, PNG, WebP, GIF 형식만 업로드할 수 있습니다");
  }
  if (file.size > MAX_BYTES) {
    return fail("이미지 용량은 4MB 이하여야 합니다");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const image = await prisma.blogImage.create({
    data: { data: buffer, mimeType: file.type },
    select: { id: true },
  });

  return ok({ url: `/api/blog/images/${image.id}` }, 201);
}
