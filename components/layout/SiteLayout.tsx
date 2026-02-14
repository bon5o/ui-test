/* 変更点:
 * - 全背景を bg-white に統一、dark:bg-slate-900 を削除
 * - text-white を削除、text-[#111111] に統一
 * - ロゴの青系: from-sky-300 to-blue-400 → from-sky-200 to-blue-300（一段階薄く）
 * - モバイルナビ背景: bg-gray-50/50（白に近い薄いグレー）
 * - container-page で max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 を適用
 * - sm:, md:, lg: でレスポンシブ対応
 */
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "ホーム" },
  { href: "/design", label: "構成型で探す" },
  { href: "/era", label: "年代で探す" },
  { href: "/maker", label: "メーカーで探す" },
  { href: "/character", label: "描写傾向で探す" },
  { href: "/glossary", label: "用語集" },
  { href: "/references", label: "参考文献" },
  { href: "/about", label: "このサイトについて" }
];

export const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="container-page flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4 lg:py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 shadow-sm sm:h-10 sm:w-10" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide text-[#111111]">
                OLD LENS ARCHIVE
              </span>
              <span className="text-xs text-gray-600">
                レンズ構成と描写の研究ノート
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden flex-1 flex-wrap items-center gap-1 md:flex md:gap-2 md:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
        <nav className="border-t border-gray-200 bg-gray-50 md:hidden">
          <div className="container-page flex flex-wrap gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

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
