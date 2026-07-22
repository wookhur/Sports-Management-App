import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

// Image upload for community-board posts. Unlike the blog uploader (coach-only),
// any logged-in user can attach photos here. Bytes are stored as a BlogImage row
// and served back via the public GET /api/blog/images/[id].
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

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
