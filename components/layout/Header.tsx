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

export function Header() {
  return (
    <header className="static border-b border-gray-200 bg-white">
      <div className="container-page flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-4 md:gap-3 lg:py-5">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 shadow-sm sm:h-10 sm:w-10" />
          <div className="flex min-w-0 flex-col">
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
      <nav className="border-t border-gray-200 bg-gray-50 py-2 md:hidden">
        <div className="container-page flex flex-wrap gap-1">
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
  );
}
