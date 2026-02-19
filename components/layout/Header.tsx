"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

// ========== 定数 ==========
const MOBILE_BREAKPOINT = 768;
const SCROLL_THRESHOLD = 10;
const HEADER_MAX_HEIGHT = 400; // モバイルヘッダーの想定最大高さ（px）

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

// ========== メインコンポーネント ==========
export function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const prevScrollY = useRef(0);
  const ticking = useRef(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    isMobileRef.current = mq.matches;
    prevScrollY.current = window.scrollY;

    const updateVisibility = (scrollY: number) => {
      if (!isMobileRef.current) {
        setIsHidden(false);
        return;
      }
      const delta = scrollY - prevScrollY.current;
      prevScrollY.current = scrollY;

      // 下スクロール & 閾値超え → 非表示
      if (delta > 0 && scrollY > SCROLL_THRESHOLD) {
        setIsHidden(true);
      }
      // 上スクロール または 画面上部付近 → 表示
      else if (delta < 0 || scrollY <= SCROLL_THRESHOLD) {
        setIsHidden(false);
      }
    };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        updateVisibility(window.scrollY);
        ticking.current = false;
      });
    };

    const handleResize = () => {
      isMobileRef.current = mq.matches;
      if (!mq.matches) {
        setIsHidden(false);
      }
    };

    mq.addEventListener("change", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="overflow-hidden transition-[max-height] duration-300 ease-out md:max-h-none"
      style={{
        maxHeight: isHidden ? 0 : HEADER_MAX_HEIGHT
      }}
    >
      <header
        className={`sticky top-0 z-20 border-b border-gray-200 bg-white transition-transform duration-300 ease-out md:translate-y-0 ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
        data-hidden={isHidden}
      >
        {/* ロゴ・タイトル行 */}
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

        {/* モバイルナビ */}
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
    </div>
  );
}
