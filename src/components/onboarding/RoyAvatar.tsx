// Original flat-style illustration for the Roy intro screen — a generic
// coach silhouette (cap + clipboard) with a soft ambient glow behind it,
// not a copy of any reference art.
export default function RoyAvatar() {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48" aria-hidden="true">
      <defs>
        <radialGradient id="roy-glow" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#roy-glow)" />
      <circle cx="100" cy="100" r="80" fill="#0F221E" />
      <circle cx="100" cy="82" r="34" fill="#5eead4" />
      <path d="M66 74a34 34 0 0 1 68 0c-10-6-24-9-34-9s-24 3-34 9Z" fill="#0f766e" />
      <rect x="70" y="120" width="60" height="52" rx="16" fill="#2dd4bf" />
      <rect x="86" y="112" width="28" height="20" rx="6" fill="#5eead4" />
      <rect x="112" y="128" width="34" height="44" rx="6" fill="#f0fdfa" transform="rotate(8 112 128)" />
      <rect x="118" y="136" width="20" height="3" rx="1.5" fill="#0f766e" transform="rotate(8 118 136)" />
      <rect x="115" y="144" width="20" height="3" rx="1.5" fill="#0f766e" transform="rotate(8 115 144)" />
    </svg>
  );
}
