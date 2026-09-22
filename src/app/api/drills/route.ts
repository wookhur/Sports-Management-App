import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { AGE_LEVELS } from "@/lib/soccerDrills";
import { CUSTOM_DRILL_MAX_BYTES, CUSTOM_DRILL_TYPES, imageSize } from "@/lib/customDrills";

const AGE_KEYS = new Set<string>(AGE_LEVELS.map((a) => a.key));

/**
 * Bring in a drill drawn elsewhere.
 *
 * Multipart, because the body is an image. The client has already shrunk
 * it (see src/lib/pdfImage.ts); the caps here are the backstop, and the
 * stored width and height come from the file itself rather than the form.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected a multipart form");

  const file = form.get("file");
  if (!(file instanceof File)) return fail("Attach a PNG or JPEG of the drill");
  if (!(CUSTOM_DRILL_TYPES as readonly string[]).includes(file.type)) {
    return fail("The drill image must be a PNG or JPEG");
  }
  if (file.size > CUSTOM_DRILL_MAX_BYTES) return fail("The drill image must be under 2 MB", 413);

  const title = String(form.get("title") ?? "").trim();
  if (title.length < 1 || title.length > 120) return fail("Give the drill a title (up to 120 characters)");
  const description = String(form.get("description") ?? "").trim().slice(0, 2000) || null;
  const sport = String(form.get("sport") ?? "soccer");
  if (sport !== "soccer") return fail("Custom drills are available for soccer only");

  const ageLevels = form
    .getAll("ageLevels")
    .flatMap((v) => String(v).split(","))
    .map((v) => v.trim())
    .filter((v) => AGE_KEYS.has(v));
  const durationRaw = String(form.get("durationMin") ?? "").trim();
  const durationMin = durationRaw ? Number(durationRaw) : null;
  if (durationMin !== null && (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 240)) {
    return fail("Duration must be a whole number of minutes between 1 and 240");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const size = imageSize(bytes, file.type);
  if (!size) return fail("That file isn't a readable PNG or JPEG");

  const drill = await prisma.customDrill.create({
    data: {
      ownerId: session.userId,
      sport,
      title,
      description,
      ageLevels: [...new Set(ageLevels)],
      durationMin,
      image: Buffer.from(bytes),
      imageType: file.type,
      width: size.width,
      height: size.height,
    },
    select: { id: true, title: true },
  });
  return ok(drill, 201);
}
