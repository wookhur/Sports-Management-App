// BlogPost.body historically stored plain text with lightweight markers
// ("## Heading", numbered lines treated as headings, blank-line paragraphs).
// Posts written/edited through the rich text editor store real HTML
// instead. `toEditableHtml` upgrades old plain-text bodies to equivalent
// HTML on the fly, so both the editor and the detail page can treat every
// post's body as HTML without a one-time DB migration.

const NUMBERED_HEADING_RE = /^\d+\.\s+\S.{0,80}$/;
const MARKDOWN_HEADING_RE = /^##\s+(\S.*)$/;

/** Heuristic: does this body already contain HTML markup? */
export function isHtmlBody(body: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(body);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function legacyBodyToHtml(body: string): string {
  return body
    .split(/\n\n+/)
    .map((p) => {
      const mdHeading = p.match(MARKDOWN_HEADING_RE);
      if (mdHeading) return `<h2>${escapeHtml(mdHeading[1])}</h2>`;
      if (NUMBERED_HEADING_RE.test(p)) return `<h2>${escapeHtml(p)}</h2>`;
      return `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

/** Body as HTML, upgrading legacy plain-text posts on the fly. */
export function toEditableHtml(body: string): string {
  return isHtmlBody(body) ? body : legacyBodyToHtml(body);
}

/** True if the body has no visible text once tags are stripped. */
export function isBodyEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}
