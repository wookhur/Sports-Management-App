import Link from "next/link";
import NavBar from "@/components/NavBar";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

const T: Record<Lang, { title: string; body: string; home: string }> = {
  es: { title: "No encontramos esta página", body: "Puede que el enlace esté mal escrito o que la página ya no exista.", home: "Ir al inicio" },
  en: { title: "We couldn't find this page", body: "The link may be mistyped, or the page may no longer exist.", home: "Go to the home page" },
  ko: { title: "페이지를 찾을 수 없어요", body: "주소가 잘못되었거나 더 이상 없는 페이지일 수 있어요.", home: "홈으로 가기" },
};

/** The 404 page, in the visitor's language rather than the framework's English. */
export default async function NotFound() {
  const t = T[await getLang()];
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm font-bold text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.body}</p>
        <Link href="/" className="btn-primary mt-6 inline-block">
          {t.home}
        </Link>
      </main>
    </>
  );
}
