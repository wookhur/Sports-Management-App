import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function NavBar() {
  const session = await getSession();
  if (!session) return null;

  const isCoach = session.role === "COACH";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">🏅</span>
          <span>SportsHub</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
            홈
          </Link>
          {isCoach ? (
            <Link href="/coach" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
              코치 대시보드
            </Link>
          ) : (
            <Link href="/records" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
              내 기록
            </Link>
          )}
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {session.name} · {isCoach ? "코치" : "선수"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
