// ASCII-only so the slug is always URL-safe (Korean titles collapse to
// "post", made unique by the suffix below — avoids encoded-URL 404s).
export function slugify(title: string, fallback = "post"): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Math.abs(hashCode(title + Date.now())).toString(36).slice(0, 6);
  return `${base || fallback}-${suffix}`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
