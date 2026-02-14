"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "../ui/Icons";

export const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial =
      stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

  if (!mounted) {
    return (
      <button
        aria-label="テーマ切り替え"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-[#111111] shadow-sm"
      >
        <span className="h-4 w-4 rounded-full bg-slate-400" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="テーマ切り替え"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-[#111111] shadow-sm transition-colors hover:border-blue-400 hover:text-blue-500"
    >
      {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  );
};

