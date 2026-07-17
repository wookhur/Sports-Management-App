"use client";

import { useSidebar } from "./SidebarContext";
import { MenuIcon } from "./navIcons";

export default function SidebarToggleButton({ label = "메뉴 열기" }: { label?: string }) {
  const { toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );
}
