"use client";

/**
 * Barlow, loaded without blocking the page.
 *
 * A plain `<link rel="stylesheet">` in <head> blocks first paint until the
 * stylesheet resolves — and when Google Fonts is slow or unreachable, that is
 * the whole app waiting on a third party. Measured here at ~13s per navigation
 * on a network that resets the connection.
 *
 * `media="print"` makes the browser fetch it at low priority without blocking
 * render; the onLoad handler then promotes it to `all`. If it never arrives,
 * nothing happens and the system stack stays — the page is readable either way,
 * which is the point.
 *
 * Deliberately not next/font/google: `next build` must not depend on reaching
 * Google's servers, the same constraint the sign-up wizard was written under.
 */
const HREF =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600;700&display=swap";

export default function FontLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href={HREF}
        media="print"
        onLoad={(e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        }}
      />
      <noscript>
        <link rel="stylesheet" href={HREF} />
      </noscript>
    </>
  );
}
