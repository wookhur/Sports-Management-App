// Localized authored content.
//
// The app has two kinds of translatable text. UI chrome lives in i18n.ts as
// per-namespace dictionaries. Editorial reference content — training programs,
// drill libraries — is different: it is deeply nested, has no stable per-string
// key, and is edited as prose. Keying that externally drifts the moment someone
// reorders a phase, so those files carry their translations inline instead.
//
// A plain string is accepted too, so a not-yet-translated entry renders its
// authored text in every language rather than blanking out.

import type { Lang } from "./i18n";

export interface LocalizedText {
  ko: string;
  en: string;
  es: string;
}

export type Localized = LocalizedText | string;

/** Pick the caller's language, falling back to Korean (the authored source). */
export function L(value: Localized, lang: Lang): string {
  if (typeof value === "string") return value;
  return value[lang] || value.ko;
}

/** Same, for arrays of authored lines (drill steps, coaching points). */
export function LA(values: Localized[], lang: Lang): string[] {
  return values.map((v) => L(v, lang));
}

/**
 * Every language variant joined together, for building a search haystack.
 * Search deliberately matches across all languages: someone browsing in
 * Spanish still finds a drill by its English name, and results don't change
 * meaning when they flip the language switcher.
 */
export function searchText(value: Localized): string {
  return typeof value === "string" ? value : `${value.ko} ${value.en} ${value.es}`;
}
