// Shared community-board constants + helpers.

export const BOARD_CATEGORIES = ["general", "tips", "gameplay"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

export function isBoardCategory(v: string): v is BoardCategory {
  return (BOARD_CATEGORIES as readonly string[]).includes(v);
}

/** Turn a YouTube/Vimeo watch URL into an embeddable src, or null if we can't
 *  recognize it (the UI then falls back to a plain "watch" link). */
export function embedUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  }
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
