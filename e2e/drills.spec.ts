import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { deflateSync } from "node:zlib";
import { login, ATHLETE, COACH } from "./helpers";

/**
 * Drills people draw elsewhere and bring in.
 *
 * The interesting part is not the upload itself but the two things around
 * it: the PDF that soccerdrive.com exports is unpacked in the browser (so a
 * 10 MB file becomes a small PNG before it is sent), and a drill is a team
 * resource — the coach's athletes see it, other coaches on the platform do
 * not.
 */

const STRANGER = { email: "clare.nam@example.com", password: "password123" };
const PREFIX = `e2e drill ${process.pid}`;

test.afterAll(async () => {
  const db = new PrismaClient();
  try {
    await db.customDrill.deleteMany({ where: { title: { startsWith: PREFIX } } });
  } finally {
    await db.$disconnect();
  }
});

function crc32(buf: Buffer): number {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

/** A solid-colour PNG of the given size. */
function png(width: number, height: number, rgb: [number, number, number]): Buffer {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x += 1) raw.set(rgb, y * (width * 3 + 1) + 1 + x * 3);
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * A PDF shaped like soccerdrive.com's export: one page, a small logo image,
 * and the drawing as an uncompressed RGB image with a Flate-compressed,
 * PNG-predicted soft mask. Same object layout jsPDF writes.
 */
function soccerDrivePdf(width: number, height: number): Buffer {
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i += 1) rgb.set([0x22, 0x8b, 0x22], i * 3); // pitch green
  // Predictor 12 = PNG "Up" filter on every row; a flat mask makes every
  // row after the first all zeros, which is what jsPDF's output looks like.
  const maskRows = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y += 1) {
    maskRows[y * (width + 1)] = 2;
    if (y === 0) maskRows.fill(255, 1, width + 1);
  }
  const mask = deflateSync(maskRows);
  const logo = Buffer.alloc(20 * 20).fill(128);

  const objs: Buffer[] = [];
  const obj = (n: number, head: string, stream?: Buffer) =>
    objs.push(
      stream
        ? Buffer.concat([Buffer.from(`${n} 0 obj\n<<${head}\n/Length ${stream.length}\n>>\nstream\n`), stream, Buffer.from("\nendstream\nendobj\n")])
        : Buffer.from(`${n} 0 obj\n<<${head}>>\nendobj\n`),
    );
  const content = Buffer.from(`q\n72 0 0 72 486 684 cm\n/I0 Do\nQ\nq\n504 0 0 315 54 351 cm\n/I1 Do\nQ\n`);
  obj(1, "/Type /Pages\n/Kids [3 0 R]\n/Count 1");
  obj(2, "/XObject <</I0 20 0 R /I1 22 0 R>>");
  obj(3, "/Type /Page\n/Parent 1 0 R\n/Resources 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R");
  obj(4, "", content);
  obj(20, "\n/Type /XObject\n/Subtype /Image\n/Width 20\n/Height 20\n/ColorSpace /DeviceGray\n/BitsPerComponent 8", logo);
  obj(22, `\n/Type /XObject\n/Subtype /Image\n/Width ${width}\n/Height ${height}\n/ColorSpace /DeviceRGB\n/BitsPerComponent 8\n/DecodeParms <</Colors 3 /BitsPerComponent 8 /Columns ${width}>>\n/SMask 23 0 R`, rgb);
  obj(23, `\n/Type /XObject\n/Subtype /Image\n/Width ${width}\n/Height ${height}\n/ColorSpace /DeviceGray\n/BitsPerComponent 8\n/DecodeParms <</Predictor 12 /Colors 1 /BitsPerComponent 8 /Columns ${width}>>\n/Filter /FlateDecode`, mask);
  obj(5, "/Type /Catalog\n/Pages 1 0 R");
  return Buffer.concat([Buffer.from("%PDF-1.3\n"), ...objs, Buffer.from("trailer\n<</Root 5 0 R>>\n%%EOF\n")]);
}

// Requests go through the page rather than page.request: the production build
// sets a Secure session cookie, which the browser sends to 127.0.0.1 but
// Playwright's Node-side request context does not.
async function upload(page: Page, title: string, file: Buffer, mimeType = "image/png", fields: Record<string, string> = {}) {
  return page.evaluate(
    async ([b64, mime, title, fields]) => {
      const bytes = Uint8Array.from(atob(b64 as string), (c) => c.charCodeAt(0));
      const body = new FormData();
      body.append("file", new Blob([bytes], { type: mime as string }), mime === "image/png" ? "drill.png" : "drill.jpg");
      body.append("title", title as string);
      body.append("sport", "soccer");
      for (const [k, v] of Object.entries(fields as Record<string, string>)) body.append(k, v);
      const res = await fetch("/api/drills", { method: "POST", body });
      return { status: res.status, data: await res.json().catch(() => null) };
    },
    [file.toString("base64"), mimeType, title, fields] as const,
  );
}

async function req(page: Page, path: string, method = "GET") {
  return page.evaluate(
    async ([p, m]) => {
      const res = await fetch(p as string, { method: m as string, cache: "no-store" });
      return { status: res.status, type: res.headers.get("content-type") ?? "" };
    },
    [path, method] as const,
  );
}

test("a coach's uploaded drill shows on the drills page and opens as its own page", async ({ page }) => {
  await login(page, COACH);
  const title = `${PREFIX} rondo`;
  const res = await upload(page, title, png(160, 100, [34, 139, 34]), "image/png", {
    ageLevels: "u9-11",
    durationMin: "12",
    description: "Four attackers, two defenders.",
  });
  expect(res.status).toBe(201);
  const { id } = res.data;

  await page.goto("/sports/soccer/drills", { waitUntil: "networkidle" });
  const card = page.locator(`a[href="/sports/soccer/drills/${id}"]`);
  await expect(card).toBeVisible();
  await expect(card).toContainText(title);
  await expect(card).toContainText("12");

  // Tagged 9–11, so it sits in that view and not in the 12+ one.
  await page.goto("/sports/soccer/drills?age=u12%2B", { waitUntil: "networkidle" });
  await expect(page.locator(`a[href="/sports/soccer/drills/${id}"]`)).toHaveCount(0);

  await page.goto(`/sports/soccer/drills/${id}`, { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveText(title);
  await expect(page.locator("main")).toContainText("Four attackers, two defenders.");
  const img = await req(page, `/api/drills/${id}/image`);
  expect(img.status).toBe(200);
  expect(img.type).toBe("image/png");
});

test("the stored size is read from the file, not the form, and junk is refused", async ({ page }) => {
  await login(page, COACH);
  const res = await upload(page, `${PREFIX} sized`, png(64, 48, [0, 0, 0]));
  expect(res.status).toBe(201);
  const { id } = res.data;
  const db = new PrismaClient();
  try {
    const row = await db.customDrill.findUniqueOrThrow({ where: { id }, select: { width: true, height: true } });
    expect(row).toEqual({ width: 64, height: 48 });
  } finally {
    await db.$disconnect();
  }

  const junk = await upload(page, `${PREFIX} junk`, Buffer.from("not an image at all"));
  expect(junk.status).toBe(400);
  const untitled = await upload(page, "   ", png(8, 8, [0, 0, 0]));
  expect(untitled.status).toBe(400);
});

test("the coach's athlete sees the drill; an unrelated coach cannot even confirm it exists", async ({ page, browser }) => {
  await login(page, COACH);
  const res = await upload(page, `${PREFIX} shared`, png(40, 25, [200, 30, 30]));
  const { id } = res.data;

  const athleteCtx = await browser.newContext();
  const athlete = await athleteCtx.newPage();
  await login(athlete, ATHLETE);
  expect((await req(athlete, `/api/drills/${id}/image`)).status).toBe(200);
  await athlete.goto(`/sports/soccer/drills/${id}`, { waitUntil: "networkidle" });
  await expect(athlete.locator("h1")).toContainText("shared");
  // Not theirs, so no delete control.
  await expect(athlete.getByRole("button", { name: /Delete drill|드릴 삭제|Eliminar ejercicio/ })).toHaveCount(0);
  expect((await req(athlete, `/api/drills/${id}`, "DELETE")).status).toBe(404);
  await athleteCtx.close();

  const strangerCtx = await browser.newContext();
  const stranger = await strangerCtx.newPage();
  await login(stranger, STRANGER);
  expect((await req(stranger, `/api/drills/${id}/image`)).status).toBe(404);
  const detail = await stranger.goto(`/sports/soccer/drills/${id}`);
  expect(detail?.status()).toBe(404);
  expect((await req(stranger, `/api/drills/${id}`, "DELETE")).status).toBe(404);
  await strangerCtx.close();

  // Still there for the owner, who can then take it down.
  expect((await req(page, `/api/drills/${id}/image`)).status).toBe(200);
  expect((await req(page, `/api/drills/${id}`, "DELETE")).status).toBe(200);
  expect((await req(page, `/api/drills/${id}/image`)).status).toBe(404);
});

test("a soccerdrive PDF is unpacked in the browser and uploaded as a small PNG", async ({ page }) => {
  await login(page, COACH);
  await page.goto("/sports/soccer/drills", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Upload your own drill|내 드릴 올리기|Subir mi propio ejercicio/ }).click();

  await page.setInputFiles("#drill-file", {
    name: "Drill.pdf",
    mimeType: "application/pdf",
    buffer: soccerDrivePdf(1984, 1240),
  });
  // Shrunk to 1600 wide, and the status line says so.
  await expect(page.getByRole("status").filter({ hasText: /1600×1000/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("form img")).toBeVisible();

  const title = `${PREFIX} from pdf`;
  await page.fill("#drill-title", title);
  await page.getByRole("button", { name: /^(Upload|올리기|Subir)$/ }).click();
  await page.waitForURL(/\/sports\/soccer\/drills\/[a-z0-9]+$/, { timeout: 20_000 });
  await expect(page.locator("h1")).toHaveText(title);

  const db = new PrismaClient();
  try {
    const row = await db.customDrill.findFirstOrThrow({
      where: { title },
      select: { width: true, height: true, imageType: true, image: true },
    });
    expect(row.width).toBe(1600);
    expect(row.height).toBe(1000);
    expect(row.imageType).toBe("image/png");
    // The PDF was ~7 MB of raw pixels; the stored PNG is a fraction of that.
    expect(row.image.length).toBeLessThan(200_000);
  } finally {
    await db.$disconnect();
  }
});

test("a PDF with no image in it is explained, not uploaded", async ({ page }) => {
  await login(page, COACH);
  await page.goto("/sports/soccer/drills", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Upload your own drill|내 드릴 올리기|Subir mi propio ejercicio/ }).click();
  await page.setInputFiles("#drill-file", {
    name: "text-only.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.3\n1 0 obj\n<</Type /Catalog>>\nendobj\ntrailer\n<</Root 1 0 R>>\n%%EOF\n"),
  });
  await expect(page.locator("form [role='alert']")).toContainText(/Download PNG/);
  await expect(page.getByRole("button", { name: /^(Upload|올리기|Subir)$/ })).toBeDisabled();
});
