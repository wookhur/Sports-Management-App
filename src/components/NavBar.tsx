import Link from "next/link";
import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";
import LogoutButton from "./LogoutButton";
import SearchBox from "./SearchBox";
import LanguageSwitcher from "./LanguageSwitcher";
import SidebarToggleButton from "./SidebarToggleButton";
import BrandMark from "./BrandMark";
import NotificationBell from "./NotificationBell";
import { unreadCount } from "@/lib/notifyServer";

export default async function NavBar() {
  const session = await getSession();
  if (!session) return null;

  const isCoach = session.role === "COACH";
  const lang = await getLang();
  const s = t(lang).nav;
  const sb = t(lang).sidebar;
  const unread = await unreadCount(session.userId);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <SidebarToggleButton label={sb.openMenu} />
          {/* Below lg the sidebar is hidden, so the brand lives here; on lg
              the sidebar header owns it. */}
          <Link href="/" className="flex items-center gap-2 font-bold lg:hidden">
            <BrandMark className="h-6 w-6" />
            <span>Sideline365</span>
          </Link>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <div className="mr-1 hidden sm:block">
            <SearchBox compact lang={lang} />
          </div>
          {/* Quick links duplicate the sidebar on lg — show them only below it. */}
          <Link href="/" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 lg:hidden">
            {s.home}
          </Link>
          {isCoach ? (
            <Link href="/coach" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 lg:hidden">
              {s.coachDashboard}
            </Link>
          ) : (
            <Link href="/records" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 lg:hidden">
              {s.myRecords}
            </Link>
          )}
          <Link href="/blog" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 lg:hidden">
            {s.blog}
          </Link>
          {/* Plain <a>, not <Link>: forces a full navigation so the server
              re-reads ?tutorial=1 instead of reusing a cached render of "/". */}
          <a href="/?tutorial=1" className="hidden rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 md:block">
            {s.help}
          </a>
          <NotificationBell lang={lang} initialUnread={unread} />
          <div className="ml-2 hidden sm:block">
            <LanguageSwitcher lang={lang} />
          </div>
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {session.name} · {isCoach ? s.roleCoach : s.roleAthlete}
            </span>
            <LogoutButton lang={lang} />
          </div>
        </div>
      </nav>
    </header>
  );
}
