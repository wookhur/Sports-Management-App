"use client";

import { useSidebar } from "./SidebarContext";

export default function SidebarToggleButton() {
  const { toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="메뉴 열기"
      className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-slate-500 hover:bg-slate-100 lg:hidden"
    >
      ☰
    </button>
  );
}
