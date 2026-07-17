import type { Metadata } from "next";
import { getLang } from "@/lib/getLang";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "sideline365 · 스포츠 통합 관리",
  description: "기록을 측정하고 코치와 공유해 더 나은 운동 성과를 만드는 스포츠 통합 관리 앱",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const session = await getSession();

  return (
    <html lang={lang}>
      <body>
        {session ? (
          <SidebarProvider>
            <div className="lg:flex">
              <Sidebar lang={lang} user={{ name: session.name, role: session.role }} />
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </SidebarProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
