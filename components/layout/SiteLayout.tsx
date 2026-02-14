/* 変更点:
 * - 全背景を bg-white に統一、dark:bg-slate-900 を削除
 * - text-white を削除、text-[#111111] に統一
 * - ロゴの青系: from-sky-300 to-blue-400 → from-sky-200 to-blue-300（一段階薄く）
 * - モバイルナビ背景: bg-gray-50/50（白に近い薄いグレー）
 * - container-page で max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 を適用
 * - sm:, md:, lg: でレスポンシブ対応
 */
import { Header } from "./Header";

export const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t border-gray-200 bg-white py-6 text-xs text-gray-600">
        <div className="container-page flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Old Lens Archive</p>
          <p>このサイトはオールドレンズ研究の個人的なノートを兼ねた非公式リファレンスです。</p>
        </div>
      </footer>
    </div>
  );
}
