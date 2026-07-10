import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; role?: string }>;
}) {
  if (await getSession()) redirect("/");

  const { name, role } = await searchParams;
  const initialRole = role === "COACH" ? "COACH" : "ATHLETE";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/login" className="text-3xl font-bold">
            🏅 sideline365
          </Link>
          <p className="mt-2 text-sm text-slate-500">몇 초면 시작할 수 있어요</p>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="mb-6 text-xl font-bold">회원가입</h1>
          <AuthForm mode="signup" initialName={name} initialRole={initialRole} />
        </div>
      </div>
    </main>
  );
}
