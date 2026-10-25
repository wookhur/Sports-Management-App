import type { Metadata } from "next";
import { getLang } from "@/lib/getLang";
import { getSession } from "@/lib/auth";
import Sidebar, { type SidebarPet } from "@/components/Sidebar";
import FontLink from "@/components/FontLink";
import { SidebarProvider } from "@/components/SidebarContext";
import { getShellData } from "@/lib/shell";
import { petState, careActions } from "@/lib/pet";
import "./globals.css";

// The browser tab and the description search engines show, in the visitor's
// language: a Spanish-speaking coach saw "Training, tracked" on every tab.
const META: Record<"ko" | "en" | "es", Metadata> = {
  en: {
    title: "Sideline365 · Training, tracked",
    description:
      "Athletes log their training; coaches see who to check on today, and why. Sideline365 turns what a squad already records into something a coach can act on.",
  },
  es: {
    title: "Sideline365 · Entrenamiento registrado",
    description:
      "Los atletas registran su entrenamiento; los entrenadores ven a quién atender hoy y por qué. Sideline365 convierte lo que el equipo ya registra en algo con lo que el entrenador puede actuar.",
  },
  ko: {
    title: "Sideline365 · 훈련을 기록으로",
    description:
      "선수는 훈련을 기록하고, 코치는 오늘 누구를 챙겨야 하는지와 그 이유를 봅니다. Sideline365는 팀이 이미 남기는 기록을 코치가 바로 쓸 수 있는 정보로 바꿉니다.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return META[await getLang()];
}

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
