import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/login" className="text-3xl font-bold">
            🏅 SportsHub
          </Link>
          <p className="mt-2 text-sm text-slate-500">기록을 측정하고 코치와 공유하세요</p>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="mb-6 text-xl font-bold">로그인</h1>
          <AuthForm mode="login" />
        </div>
        <div className="mt-4 rounded-xl bg-slate-800/90 p-4 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">데모 계정</p>
          <p className="mt-1">선수: athlete@example.com / password123</p>
          <p>코치: coach@example.com / password123</p>
        </div>
      </div>
    </main>
  );
}
