import type { Lang } from "./i18n";
import es from "@/data/content/es.json";

// Spanish versions of the app's own articles (star athletes' training
// methods, the blog's launch posts, the community board's welcome posts),
// which are stored in English. Keyed by slug or id; `source` is the English
// title (or the start of a board post) each was translated from, so an
// article edited in the app since shows as edited instead of an outdated
// translation.

type Text = { title: string; excerpt?: string; body: string; source: string };
const ES = es as { guides: Record<string, Text>; blog: Record<string, Text>; board: Record<string, Text & { title: string | null }> };

/** A star athlete article in the reader's language, where a translation fits. */
export function localizeGuide<T extends { slug: string; title: string; excerpt: string; body?: string }>(g: T, lang: Lang): T {
  const tr = lang === "es" ? ES.guides[g.slug] : undefined;
  if (!tr || tr.source !== g.title) return g;
  return { ...g, title: tr.title, excerpt: tr.excerpt ?? g.excerpt, ...(g.body !== undefined && { body: tr.body }) };
}

/** A blog post in the reader's language, where a translation fits. */
export function localizeBlog<T extends { slug: string; title: string; excerpt: string; body?: string }>(p: T, lang: Lang): T {
  const tr = lang === "es" ? ES.blog[p.slug] : undefined;
  if (!tr || tr.source !== p.title) return p;
  return { ...p, title: tr.title, excerpt: tr.excerpt ?? p.excerpt, ...(p.body !== undefined && { body: tr.body }) };
}

/** A community board post in the reader's language, where a translation fits. */
export function localizeBoard<T extends { id: string; title: string | null; body: string }>(p: T, lang: Lang): T {
  const tr = lang === "es" ? ES.board[p.id] : undefined;
  if (!tr || !p.body.startsWith(tr.source)) return p;
  return { ...p, title: tr.title, body: tr.body };
}
