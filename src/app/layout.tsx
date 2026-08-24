import type { Metadata } from "next";
import { getLang } from "@/lib/getLang";
import { getSession } from "@/lib/auth";
import Sidebar, { type SidebarPet } from "@/components/Sidebar";
import FontLink from "@/components/FontLink";
import { SidebarProvider } from "@/components/SidebarContext";
import { getShellData } from "@/lib/shell";
import { petState, careActions } from "@/lib/pet";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sideline365 · 스포츠 통합 관리",
  description: "기록을 측정하고 코치와 공유해 더 나은 운동 성과를 만드는 스포츠 통합 관리 앱",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const session = await getSession();

  // The companion rides along in the sidebar on every authenticated page.
  let pet: SidebarPet | null = null;
  if (session) {
    const u = await getShellData(session.userId);
    {
      const st = petState(u.petGrowth);
      const cheapest = careActions(u.petGrowth).reduce(
        (min, c) => (min === 0 ? c.cost : Math.min(min, c.cost)),
        0,
      );
      pet = {
        growth: u.petGrowth,
        label: st.label[lang],
        pct: st.stage === "egg" ? st.hatchPct : st.toNext == null ? 1 : st.into / st.span,
        needsCare: cheapest > 0 && u.beans >= cheapest,
      };
    }
  }

  return (
    <html lang={lang}>
      <head>
        {/* Barlow for the whole app, not just the sign-up wizard. Skipped under
            test so the suite does not depend on Google's CDN being reachable —
            typeface has no bearing on what the a11y and i18n specs assert. */}
        {process.env.NEXT_PUBLIC_NO_WEBFONT === "1" ? null : <FontLink />}
      </head>
      <body>
        {session ? (
          <SidebarProvider>
            <div className="lg:flex">
              <Sidebar lang={lang} user={{ name: session.name, role: session.role }} pet={pet} />
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
