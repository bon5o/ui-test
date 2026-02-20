/* 変更点:
 * - body に bg-white を設定（背景色を全ページ白に統一）
 * - デフォルト文字色を #111111 (black) に設定
 * - dark: 背景・文字色を削除（白背景・黒文字に統一）
 */
import type { Metadata } from "next";
import { Sawarabi_Mincho } from "next/font/google";
import "./globals.css";
import { SiteLayout } from "../components/layout/SiteLayout";

const sawarabiMincho = Sawarabi_Mincho({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const siteName = "沼便り。";

export const metadata: Metadata = {
  title: siteName,
  description:
    "オールドレンズのレンズ構成と描写傾向を体系的に整理したリファレンスサイト。のつもり",
  openGraph: {
    title: siteName,
    siteName,
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`min-h-screen bg-white text-[#111111] ${sawarabiMincho.className}`}>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
