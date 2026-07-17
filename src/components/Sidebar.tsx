"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORT_LIST } from "@/lib/sports";
import { useSidebar } from "./SidebarContext";

function NavItem({
  href,
  active,
  emoji,
  label,
  onNavigate,
}: {
  href: string;
  active: boolean;
  emoji: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      {label}
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-4">
      <NavItem href="/" active={pathname === "/"} emoji="🏠" label="홈" onNavigate={onNavigate} />

      <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">스포츠</p>
      {SPORT_LIST.map((sport) => {
        const hubHref = `/sports/${sport.id}`;
        const athletesHref = `/sports/${sport.id}/athletes`;
        return (
          <div key={sport.id}>
            <NavItem
              href={hubHref}
              active={pathname === hubHref}
              emoji={sport.emoji}
              label={sport.name}
              onNavigate={onNavigate}
            />
            <Link
              href={athletesHref}
              onClick={onNavigate}
              className={`ml-7 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                pathname?.startsWith(athletesHref)
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              ⭐ 스타 선수 훈련법
            </Link>
          </div>
        );
      })}

      <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">더보기</p>
      <NavItem href="/blog" active={pathname === "/blog"} emoji="📝" label="블로그" onNavigate={onNavigate} />
    </nav>
  );
}

export default function Sidebar() {
  const { open, close } = useSidebar();

  return (
    <>
      {/* Desktop: permanent left column */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
        <SidebarNav onNavigate={() => {}} />
      </aside>

      {/* Mobile: slide-in drawer, toggled from NavBar's hamburger button */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} aria-hidden="true" />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <span className="font-bold">메뉴</span>
              <button
                type="button"
                onClick={close}
                aria-label="메뉴 닫기"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <SidebarNav onNavigate={close} />
          </aside>
        </div>
      )}
    </>
  );
}
