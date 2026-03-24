import Link from "next/link";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "ホーム" },
  { href: "/design", label: "構成型" },
  { href: "/maker", label: "メーカー" },
  { href: "/terms", label: "用語集" },
  { href: "/history", label: "歴史" },
  { href: "/compare", label: "比較一覧" },
  { href: "/thought", label: "思想" },
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
    <header className="isolate static relative w-full min-w-0 overflow-hidden overflow-x-clip bg-gradient-to-b from-[#a8b4d8] via-[#cad6f0] to-[#fcfcf9]">
      {/* 背景レイヤー。absolute 子はこのラッパー内でクリップ（blur のはみ出し対策） */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* 前玉っぽい楕円。位置固定。モバイルで blur 弱め + max-w-full で右はみ出し防止 */}
        <div className="absolute -top-56 left-[30%] h-[350px] w-[600px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_5%_5%,rgba(136,5,105,0.58),rgba(255,255,255,0)_58%)] opacity-70 blur-xl md:blur-2xl" />
        {/* コーティング反射（右側）。モバイルでは translate なしで右端に揃え、PC でだけ少し右に */}
        <div className="absolute -top-24 right-0 h-[380px] w-[380px] max-w-full translate-x-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.12),rgba(99,102,241,0.08),rgba(255,255,255,0)_62%)] blur-2xl opacity-55 md:max-w-none md:translate-x-1/4" />
        {/* ガラス面のごく薄いハイライト */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#fcfcf9]/45 to-transparent" />
      </div>

      <div className="relative z-10 container-page flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-4 md:gap-3 lg:py-5">
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
      <nav className="relative z-10 py-2 md:hidden">
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
    </header>
  );
}
