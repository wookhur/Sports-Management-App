import { cookies, headers } from "next/headers";
import { LANG_COOKIE, langFromAcceptLanguage, resolveLang, type Lang } from "./i18n";

/**
 * Server Component helper: the visitor's language.
 *
 * An explicit choice always wins — once someone picks a language from the
 * switcher, the cookie decides and the browser's opinion is ignored. Only on a
 * first visit, with no cookie to go on, do we read Accept-Language, so an
 * English or Spanish speaker's first screen is one they can read. Korean stays
 * the default for anyone whose browser asks for something else.
 */
export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(LANG_COOKIE)?.value;
  if (chosen) return resolveLang(chosen);

  const headerList = await headers();
  return langFromAcceptLanguage(headerList.get("accept-language")) ?? "ko";
}
