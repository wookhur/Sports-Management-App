"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORT_LIST } from "@/lib/sports";
import { SPORT_I18N, t, type Lang } from "@/lib/i18n";
import { useSidebar } from "./SidebarContext";
import {
  CloseIcon,
  DashboardIcon,
  HomeIcon,
  LibraryIcon,
  PenIcon,
  StarIcon,
  TimerIcon,
  TrophyIcon,
  ChartIcon,
  TargetIcon,
  ChatIcon,
  ClipboardIcon,
  CrosshairIcon,
} from "./navIcons";

export interface SidebarUser {
  name: string;
  role: "ATHLETE" | "COACH";
}

interface SidebarProps {
  lang: Lang;
  user: SidebarUser;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:mt-0">
      {children}
    </p>
  );
}

function NavItem({
  href,
  active,
  icon,
  label,
  onNavigate,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        active
          ? "bg-brand/10 font-semibold text-brand"
          : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {/* Active indicator bar */}
      {active && <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />}
      <span className={`h-5 w-5 shrink-0 ${active ? "text-brand" : "text-slate-400"}`}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarNav({ lang, user, onNavigate }: SidebarProps & { onNavigate: () => void }) {
  const pathname = usePathname() ?? "";
  const s = t(lang).sidebar;
  const isCoach = user.role === "COACH";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <SectionLabel>{s.menu}</SectionLabel>
        <div className="space-y-0.5">
          <NavItem href="/" active={pathname === "/"} icon={<HomeIcon className="h-5 w-5" />} label={s.home} onNavigate={onNavigate} />
          <NavItem
            href="/journal"
            active={pathname.startsWith("/journal")}
            icon={<ClipboardIcon className="h-5 w-5" />}
            label={s.journal}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/missions"
            active={pathname.startsWith("/missions")}
            icon={<TargetIcon className="h-5 w-5" />}
            label={s.missions}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/board"
            active={pathname.startsWith("/board")}
            icon={<ChatIcon className="h-5 w-5" />}
            label={s.board}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/games/bullseye"
            active={pathname.startsWith("/games")}
            icon={<CrosshairIcon className="h-5 w-5" />}
            label={s.games}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/training"
            active={pathname.startsWith("/training")}
            icon={<LibraryIcon className="h-5 w-5" />}
            label={s.library}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/stars"
            active={pathname.startsWith("/stars") || pathname.includes("/athletes")}
            icon={<StarIcon className="h-5 w-5" />}
            label={s.stars}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/leaderboard"
            active={pathname.startsWith("/leaderboard")}
            icon={<TrophyIcon className="h-5 w-5" />}
            label={s.leaderboard}
            onNavigate={onNavigate}
          />
          <NavItem href="/blog" active={pathname.startsWith("/blog")} icon={<PenIcon className="h-5 w-5" />} label={s.blog} onNavigate={onNavigate} />
        </div>

        <SectionLabel>{s.sports}</SectionLabel>
        <div className="space-y-0.5">
          {SPORT_LIST.map((sport) => {
            const href = `/sports/${sport.id}`;
            const active = pathname.startsWith(href) && !pathname.includes("/athletes");
            const name = SPORT_I18N[sport.id]?.[lang]?.name ?? sport.name;
            return (
              <Link
                key={sport.id}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  active
                    ? "bg-brand/10 font-semibold text-brand"
                    : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {active && (
                  <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                )}
                {/* Sports keep their emoji brand marks (used on every sport card
                    across the app) inside a tinted chip; functional nav icons
                    above are SVG. */}
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm"
                  style={{ backgroundColor: `${sport.accent}1a` }}
                  aria-hidden="true"
                >
                  {sport.emoji}
                </span>
                <span className="truncate">{name}</span>
              </Link>
            );
          })}
        </div>

        <SectionLabel>{s.myActivity}</SectionLabel>
        <div className="space-y-0.5">
          {isCoach ? (
            <>
              <NavItem
                href="/coach"
                active={pathname.startsWith("/coach")}
                icon={<DashboardIcon className="h-5 w-5" />}
                label={s.coachDashboard}
                onNavigate={onNavigate}
              />
              <NavItem
                href="/admin"
                active={pathname.startsWith("/admin")}
                icon={<ChartIcon className="h-5 w-5" />}
                label={s.admin}
                onNavigate={onNavigate}
              />
            </>
          ) : (
            <NavItem
              href="/records"
              active={pathname.startsWith("/records")}
              icon={<TimerIcon className="h-5 w-5" />}
              label={s.myRecords}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </nav>

      {/* User card pinned to the bottom — links to the profile page */}
      <div className="border-t border-slate-200 p-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
            {user.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-400">{isCoach ? t(lang).nav.roleCoach : t(lang).nav.roleAthlete}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar({ lang, user }: SidebarProps) {
  const { open, close } = useSidebar();
  const s = t(lang).sidebar;

  return (
    <>
      {/* Desktop: permanent left column, sticky for independent scrolling */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <Link
          href="/"
          className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 transition-colors hover:bg-slate-50"
        >
          <span className="text-xl" aria-hidden="true">🏅</span>
          <span className="text-lg font-bold tracking-tight">sideline365</span>
        </Link>
        <SidebarNav lang={lang} user={user} onNavigate={() => {}} />
      </aside>

      {/* Mobile: slide-in drawer, toggled from NavBar's hamburger button */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={s.menu}>
          <div className="absolute inset-0 bg-slate-900/50" onClick={close} aria-hidden="true" />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <Link href="/" onClick={close} className="flex items-center gap-2 font-bold">
                <span className="text-xl" aria-hidden="true">🏅</span>
                sideline365
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label={s.closeMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav lang={lang} user={user} onNavigate={close} />
          </aside>
        </div>
      )}
    </>
  );
}
