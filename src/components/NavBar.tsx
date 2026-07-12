import Link from "next/link";
import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";
import LogoutButton from "./LogoutButton";
import SearchBox from "./SearchBox";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function NavBar() {
  const session = await getSession();
  if (!session) return null;

  const isCoach = session.role === "COACH";
  const lang = await getLang();
  const s = t(lang).nav;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">🏅</span>
          <span>sideline365</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <div className="mr-1 hidden sm:block">
            <SearchBox compact />
          </div>
          <Link href="/" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
            {s.home}
          </Link>
          {isCoach ? (
            <Link href="/coach" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
              {s.coachDashboard}
            </Link>
          ) : (
            <Link href="/records" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
              {s.myRecords}
            </Link>
          )}
          <Link href="/blog" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
            {s.blog}
          </Link>
          {/* Plain <a>, not <Link>: forces a full navigation so the server
              re-reads ?tutorial=1 instead of reusing a cached render of "/". */}
          <a href="/?tutorial=1" className="hidden rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 md:block">
            {s.help}
          </a>
          <div className="ml-2 hidden sm:block">
            <LanguageSwitcher lang={lang} />
          </div>
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {session.name} · {isCoach ? s.roleCoach : s.roleAthlete}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
