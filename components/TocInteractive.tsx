"use client";

import React from "react";
import { useAccordionNav } from "@/components/nav/AccordionNavProvider";

export type TocGroupSerialized = {
  parent: { id: string; label: string };
  children: { id: string; label: string }[];
};

function formatTocNumber(parts: number[], level: number): string {
  if (parts.length === 0) return "";
  return level === 1 ? `${parts[0]}.` : parts.join(".");
}

function TocHashLink({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: React.ReactNode;
}): React.ReactElement {
  const nav = useAccordionNav();

  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(e) => {
        if (!nav) return;
        e.preventDefault();
        void nav.navigateToElementId(id);
      }}
    >
      {children}
    </a>
  );
}

export function TocInteractive({
  title,
  groups,
}: {
  title: string;
  groups: TocGroupSerialized[];
}): React.ReactElement {
  return (
    <details className="group mb-8 rounded-md border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-slate-700">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 select-none py-1 text-[15px] font-semibold text-slate-700 outline-none"
        aria-label={title}
      >
        <span
          className="inline-flex h-5 w-5 items-center justify-center text-slate-500 transition-transform duration-150 group-open:rotate-90"
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08.02Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span>{title}</span>
      </summary>

      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="mt-2 text-[15px]">
            {groups.map((g, gi) => {
              const chapterNo = gi + 1;
              const parentLabel = g.parent.label?.trim();
              if (!parentLabel) return null;

              return (
                <div
                  key={`group-${g.parent.id}`}
                  className="border-b border-slate-200/70 py-2 last:border-b-0"
                >
                  <TocHashLink
                    id={g.parent.id}
                    className="block rounded-sm px-1 py-1 leading-6 text-slate-700 no-underline hover:bg-slate-100/70 hover:text-slate-900 visited:text-slate-700 visited:no-underline hover:no-underline"
                  >
                    <span className="tabular-nums">{formatTocNumber([chapterNo], 1)}</span>{" "}
                    <span>{parentLabel}</span>
                  </TocHashLink>

                  {g.children.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {g.children.map((c, ci) => {
                        const childLabel = c.label?.trim();
                        if (!childLabel) return null;
                        const num = formatTocNumber([chapterNo, ci + 1], 2);
                        return (
                          <TocHashLink
                            key={`child-${c.id}`}
                            id={c.id}
                            className="block rounded-sm px-1 py-1 pl-5 text-[14px] leading-6 text-slate-600 no-underline hover:bg-slate-100/70 hover:text-slate-900 visited:text-slate-600 visited:no-underline hover:no-underline"
                          >
                            <span className="tabular-nums">{num}</span>{" "}
                            <span>{childLabel}</span>
                          </TocHashLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </details>
  );
}
