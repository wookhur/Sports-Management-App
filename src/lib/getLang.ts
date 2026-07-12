import { cookies } from "next/headers";
import { LANG_COOKIE, resolveLang, type Lang } from "./i18n";

/** Server Component helper: reads the "lang" cookie and resolves it. */
export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  return resolveLang(cookieStore.get(LANG_COOKIE)?.value);
}
