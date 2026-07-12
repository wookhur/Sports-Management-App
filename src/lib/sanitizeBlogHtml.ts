import sanitizeHtml from "sanitize-html";

// Allow the formatting the rich text editor can produce (bold/italic/
// underline/strike, headings, lists, blockquote, links, and inline
// font-size via a style attribute) and nothing else — strips scripts,
// event handlers, iframes, etc. from coach-authored post bodies.
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
      "h2", "h3", "ul", "ol", "li", "blockquote", "a", "span", "code",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedStyles: {
      span: {
        "font-size": [/^\d+(?:\.\d+)?(?:px|em|rem)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  }).trim();
}
