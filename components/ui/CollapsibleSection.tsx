"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  );

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [isOpen]);

  return (
    <section
      className={`relative transition-colors duration-200 ${
        isOpen ? "border-l-2 border-l-[#88A3D4]" : "border-l-2 border-l-transparent"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex w-full cursor-pointer items-center justify-between py-5 pl-5 pr-2 text-left transition-colors hover:bg-[#88A3D4]/[0.04]"
        aria-expanded={isOpen}
      >
        <h2
          className={`text-lg font-semibold tracking-tight transition-colors duration-200 ${
            isOpen ? "text-[#88A3D4]" : "text-gray-900 group-hover:text-[#88A3D4]"
          }`}
        >
          {title}
        </h2>
        <svg
          className={`h-4 w-4 shrink-0 text-[#88A3D4] transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        style={{ height: height !== undefined ? `${height}px` : "auto" }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="pb-8 pl-5 pr-2 pt-1">
          {children}
        </div>
      </div>
    </section>
  );
}
