// Client-side: pull the drawing out of a PDF, and shrink any image for upload.
//
// The drills page accepts what soccerdrive.com/draw exports. Its "Download
// PDF" is a jsPDF file: one page holding the drawing as an image XObject
// (raw or Flate-compressed RGB, with a soft mask for the alpha channel), a
// small logo, and a line of footer text. That file is close to 10 MB
// because the pixels are stored uncompressed, which is far more than a
// serverless function will accept. So the browser does the work: it finds
// the largest image in the PDF, decodes it, and hands back a PNG that is a
// fraction of the size. The server only ever sees a small image.
//
// This is not a PDF renderer. It reads the subset jsPDF writes (and most
// simple exporters share): direct-object image streams with DeviceRGB or
// DeviceGray, 8 bits per component, optionally Flate-compressed with PNG
// predictors, optionally with an SMask. Anything else throws, and the upload
// form tells the person to use the site's "Download PNG" button instead.

export class PdfImageError extends Error {
  constructor(public readonly code: "no-image" | "unsupported" | "corrupt") {
    super(code);
  }
}

interface ImageObj {
  num: number;
  width: number;
  height: number;
  colors: number;
  bpc: number;
  filter: string | null;
  predictor: number;
  columns: number;
  smask: number | null;
  data: Uint8Array;
}

function dictNum(dict: string, key: string): number | null {
  const m = dict.match(new RegExp(`/${key}\\s+(\\d+)(?!\\s+0\\s+R)`));
  return m ? Number(m[1]) : null;
}

function dictRef(dict: string, key: string): number | null {
  const m = dict.match(new RegExp(`/${key}\\s+(\\d+)\\s+0\\s+R`));
  return m ? Number(m[1]) : null;
}

/** Every image XObject in the file, keyed by object number. */
function scanImages(bytes: Uint8Array): Map<number, ImageObj> {
  // latin1 maps each byte to one code unit, so string offsets are byte offsets.
  const text = new TextDecoder("latin1").decode(bytes);
  const out = new Map<number, ImageObj>();
  const re = /(\d+)\s+0\s+obj\s*<<([\s\S]*?)>>\s*stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const dict = m[2];
    if (!/\/Subtype\s*\/Image/.test(dict)) continue;
    const width = dictNum(dict, "Width");
    const height = dictNum(dict, "Height");
    let length = dictNum(dict, "Length");
    if (length === null) {
      // jsPDF writes lengths inline; other writers point at a separate object.
      const ref = dictRef(dict, "Length");
      if (ref !== null) {
        const lm = text.match(new RegExp(`(?:^|\\s)${ref}\\s+0\\s+obj\\s*(\\d+)`));
        if (lm) length = Number(lm[1]);
      }
    }
    if (!width || !height || length === null) continue;
    const cs = dict.match(/\/ColorSpace\s*\/(\w+)/)?.[1] ?? "DeviceRGB";
    const colors = cs === "DeviceGray" ? 1 : cs === "DeviceCMYK" ? 4 : 3;
    const filter = dict.match(/\/Filter\s*\/(\w+)/)?.[1] ?? null;
    const parms = dict.match(/\/DecodeParms\s*<<([^>]*)>>/)?.[1] ?? "";
    out.set(Number(m[1]), {
      num: Number(m[1]),
      width,
      height,
      colors,
      bpc: dictNum(dict, "BitsPerComponent") ?? 8,
      filter,
      predictor: dictNum(parms, "Predictor") ?? 1,
      columns: dictNum(parms, "Columns") ?? width,
      smask: dictRef(dict, "SMask"),
      data: bytes.subarray(m.index + m[0].length, m.index + m[0].length + length),
    });
  }
  return out;
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  // "deflate" in the Streams API is zlib-wrapped deflate, which is what
  // FlateDecode means.
  const ds = new DecompressionStream("deflate");
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Undo PNG row filters (Predictor >= 10). Each row starts with a filter byte. */
function unpredict(src: Uint8Array, columns: number, colors: number, bpc: number): Uint8Array {
  const bpp = Math.max(1, Math.ceil((colors * bpc) / 8));
  const rowLen = Math.ceil((columns * colors * bpc) / 8);
  const rows = Math.floor(src.length / (rowLen + 1));
  const out = new Uint8Array(rows * rowLen);
  for (let r = 0; r < rows; r += 1) {
    const type = src[r * (rowLen + 1)];
    const inOff = r * (rowLen + 1) + 1;
    const outOff = r * rowLen;
    const prevOff = outOff - rowLen;
    for (let i = 0; i < rowLen; i += 1) {
      const raw = src[inOff + i];
      const left = i >= bpp ? out[outOff + i - bpp] : 0;
      const up = r > 0 ? out[prevOff + i] : 0;
      const upLeft = r > 0 && i >= bpp ? out[prevOff + i - bpp] : 0;
      let v: number;
      switch (type) {
        case 0:
          v = raw;
          break;
        case 1:
          v = raw + left;
          break;
        case 2:
          v = raw + up;
          break;
        case 3:
          v = raw + ((left + up) >> 1);
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          v = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
          break;
        }
        default:
          throw new PdfImageError("corrupt");
      }
      out[outOff + i] = v & 0xff;
    }
  }
  return out;
}

async function samples(img: ImageObj): Promise<Uint8Array> {
  if (img.bpc !== 8) throw new PdfImageError("unsupported");
  let data: Uint8Array;
  if (img.filter === null) data = img.data;
  else if (img.filter === "FlateDecode") data = await inflate(img.data);
  else throw new PdfImageError("unsupported");
  if (img.predictor >= 10) data = unpredict(data, img.columns, img.colors, img.bpc);
  if (data.length < img.width * img.height * img.colors) throw new PdfImageError("corrupt");
  return data;
}

async function drawJpeg(data: Uint8Array, canvas: HTMLCanvasElement) {
  const bitmap = await createImageBitmap(new Blob([data as BlobPart], { type: "image/jpeg" }));
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
}

/**
 * The drawing inside a PDF, as a canvas painted on white.
 *
 * "The drawing" is the largest image that is not itself a soft mask. On a
 * soccerdrive export that is the pitch; the logo and the footer line are
 * left behind, which is what you want on a drill card.
 */
export async function pdfToCanvas(file: Blob): Promise<HTMLCanvasElement> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
    throw new PdfImageError("corrupt");
  }
  const images = scanImages(bytes);
  const masks = new Set([...images.values()].map((i) => i.smask).filter((n): n is number => n !== null));
  const main = [...images.values()]
    .filter((i) => !masks.has(i.num))
    .sort((a, b) => b.width * b.height - a.width * a.height)[0];
  if (!main) throw new PdfImageError("no-image");

  const canvas = document.createElement("canvas");
  if (main.filter === "DCTDecode") {
    await drawJpeg(main.data, canvas);
    return canvas;
  }

  const px = await samples(main);
  const mask = main.smask !== null ? images.get(main.smask) : undefined;
  const alpha = mask && mask.colors === 1 ? await samples(mask) : null;

  canvas.width = main.width;
  canvas.height = main.height;
  const ctx = canvas.getContext("2d")!;
  const out = ctx.createImageData(main.width, main.height);
  const n = main.width * main.height;
  for (let i = 0; i < n; i += 1) {
    let r: number, g: number, b: number;
    if (main.colors === 1) {
      r = g = b = px[i];
    } else if (main.colors === 4) {
      const k = px[i * 4 + 3];
      r = 255 - Math.min(255, px[i * 4] + k);
      g = 255 - Math.min(255, px[i * 4 + 1] + k);
      b = 255 - Math.min(255, px[i * 4 + 2] + k);
    } else {
      r = px[i * 3];
      g = px[i * 3 + 1];
      b = px[i * 3 + 2];
    }
    out.data[i * 4] = r;
    out.data[i * 4 + 1] = g;
    out.data[i * 4 + 2] = b;
    out.data[i * 4 + 3] = alpha ? alpha[i] : 255;
  }
  // Composite over white: a transparent pitch on a dark card is unreadable.
  const tmp = document.createElement("canvas");
  tmp.width = main.width;
  tmp.height = main.height;
  tmp.getContext("2d")!.putImageData(out, 0, 0);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tmp, 0, 0);
  return canvas;
}

export interface ShrunkImage {
  blob: Blob;
  width: number;
  height: number;
}

const MAX_EDGE = 1600;
const PNG_BUDGET = 1_500_000;

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new PdfImageError("corrupt"))), type, quality);
  });
}

/**
 * Fit an image inside 1600 px and encode it small enough to upload.
 *
 * PNG first, because a drill diagram is flat colour and lines and PNG keeps
 * those crisp. A photo of a whiteboard would blow past the budget as PNG, so
 * that falls back to JPEG.
 */
export async function shrinkForUpload(source: HTMLCanvasElement | Blob): Promise<ShrunkImage> {
  let canvas: HTMLCanvasElement;
  if (source instanceof Blob) {
    const bitmap = await createImageBitmap(source);
    canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
  } else {
    canvas = source;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(canvas.width, canvas.height));
  if (scale < 1) {
    const small = document.createElement("canvas");
    small.width = Math.round(canvas.width * scale);
    small.height = Math.round(canvas.height * scale);
    const ctx = small.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, small.width, small.height);
    canvas = small;
  }

  let blob = await toBlob(canvas, "image/png");
  if (blob.size > PNG_BUDGET) blob = await toBlob(canvas, "image/jpeg", 0.85);
  return { blob, width: canvas.width, height: canvas.height };
}

/** A drill file of any accepted kind, ready to upload. */
export async function prepareDrillImage(file: File): Promise<ShrunkImage> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (isPdf) return shrinkForUpload(await pdfToCanvas(file));
  return shrinkForUpload(file);
}
