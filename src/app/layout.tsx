import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스포츠 통합 관리 · SportsHub",
  description: "기록을 측정하고 코치와 공유해 더 나은 운동 성과를 만드는 스포츠 통합 관리 앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
