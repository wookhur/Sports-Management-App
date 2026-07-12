import { z } from "zod";

// Either an uploaded image's relative URL (/api/blog/images/{id}) or a
// full external URL if the author links an already-hosted image instead.
export const coverImageSchema = z
  .string()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "올바른 이미지 경로 또는 URL을 입력하세요")
  .optional()
  .or(z.literal(""));
