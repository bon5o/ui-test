"use client";

import React, { useId, useState } from "react";

interface CitationProps {
  citations: number[];
}

/**
 * 本文末尾の引用番号。[出典] トグルで展開し、既定では番号リンクを隠して視線の負担を減らす。
 * JSON の citations: number[] 形式は変更しない。
 */
export function Citation({ citations }: CitationProps): React.ReactElement | null {
  if (!citations.length) return null;
  const filtered = citations.filter((n): n is number => typeof n === "number");
  if (filtered.length === 0) return null;

  const baseId = useId().replace(/:/g, "");
  const panelId = `cit-panel-${baseId}`;
  const btnId = `cit-btn-${baseId}`;
  const [open, setOpen] = useState(false);

  return (
    <span className="ml-0.5 inline-flex max-w-full flex-wrap items-baseline gap-x-1 align-baseline">
      <button
        id={btnId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline shrink-0 border-0 bg-transparent p-0 text-[0.6rem] font-normal leading-none tracking-tight text-gray-400 underline decoration-gray-300 decoration-1 underline-offset-[3px] hover:text-gray-500 hover:decoration-gray-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[#fcfcf9] rounded-sm"
      >
        {open ? "▲" : "[出典]"}
      </button>
      {open && (
        <span
          id={panelId}
          role="region"
          aria-labelledby={btnId}
          className="inline whitespace-normal"
        >
          {filtered.map((n) => (
            <sup key={n} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
              <a href={`#ref-${n}`} className="no-underline hover:underline">
                [{n}]
              </a>
            </sup>
          ))}
        </span>
      )}
    </span>
  );
}
