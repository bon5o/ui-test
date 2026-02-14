"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const MOBILE_BREAKPOINT = 768;
const SCROLL_THRESHOLD = 10;

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
  const [isCompact, setIsCompact] = useState(false);
  const prevScrollY = useRef(0);
  const ticking = useRef(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    isMobileRef.current = mq.matches;
    prevScrollY.current = window.scrollY;

    const updateCompactState = (scrollY: number) => {
      if (!isMobileRef.current) {
        setIsCompact(false);
        return;
      }
      const delta = scrollY - prevScrollY.current;
      prevScrollY.current = scrollY;

      // 下スクロール & 一定量スクロール済み → 縮小
      if (delta > 0 && scrollY > SCROLL_THRESHOLD) {
        setIsCompact(true);
      }
      // 上スクロール → 拡大
      else if (delta < 0 || scrollY <= SCROLL_THRESHOLD) {
        setIsCompact(false);
      }
    };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        updateCompactState(window.scrollY);
        ticking.current = false;
      });
    };

    const handleResize = () => {
      const wasMobile = isMobileRef.current;
      isMobileRef.current = mq.matches;
      if (!mq.matches && wasMobile) {
        setIsCompact(false);
      }
    };

    mq.addEventListener("change", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // モバイル時のみ compact のパディングを適用（768px 以上では常に元のサイズ）
  const topRowPadding = isCompact ? "py-2" : "py-3 sm:py-4 lg:py-5";
  const mobileNavPadding = isCompact ? "py-2" : "py-3";

  return (
    <header
      className="sticky top-0 z-20 border-b border-gray-200 bg-white"
      data-compact={isCompact}
    >
      <div
        className={`container-page flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3 ${topRowPadding}`}
        style={{ transition: "padding 300ms ease-out, gap 300ms ease-out" }}
      >
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div
            className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 shadow-sm transition-all duration-300 sm:h-10 sm:w-10 ${
              isCompact ? "!h-8 !w-8 sm:!h-8 sm:!w-8" : ""
            }`}
          />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-bold tracking-wide text-[#111111]">
              OLD LENS ARCHIVE
            </span>
            <span
              className={`block overflow-hidden text-xs text-gray-600 transition-all duration-300 ease-out ${
                isCompact ? "max-h-0 opacity-0 md:max-h-none md:opacity-100" : "max-h-8 opacity-100"
              }`}
            >
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
        <div
          className={`container-page flex flex-wrap gap-1 ${mobileNavPadding}`}
          style={{ transition: "padding 300ms ease-out" }}
        >
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
