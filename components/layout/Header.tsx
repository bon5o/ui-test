import Link from "next/link";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "ホーム" },
  { href: "/design", label: "構成型" },
  { href: "/era", label: "年代で探す" },
  { href: "/maker", label: "メーカーで探す" },
  { href: "/character", label: "描写傾向で探す" },
  { href: "/glossary", label: "用語集" },
  { href: "/references", label: "参考文献" },
  { href: "/about", label: "このサイトについて" }
];

/** メール（封筒）由来のシンプルなアイコン */
function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="static bg-[#E1EBF7]">
      <div className="container-page flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-4 md:gap-3 lg:py-5">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#4A6B8A] shadow-sm sm:h-10 sm:w-10">
            <MailIcon className="h-5 w-5 sm:h-5 sm:w-5" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-bold tracking-wide text-[#2C4466]">
              沼便り。
            </span>
            <span className="text-xs text-[#4A6B8A]">
              なるべく、正確に沼をお届け。更新は悪しからず。
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden flex-1 flex-wrap items-center gap-1 md:flex md:gap-2 md:space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#2C4466] transition-colors hover:bg-white/50 hover:text-[#1E3350]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <nav className="bg-[#DAE6F4] py-2 md:hidden">
        <div className="container-page flex flex-wrap gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#2C4466] transition-colors hover:bg-white/50 hover:text-[#1E3350]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div
        className="h-4 w-full shrink-0 bg-gradient-to-b from-[#DAE6F4] to-white md:from-[#E1EBF7]"
        aria-hidden
      />
    </header>
  );
}
