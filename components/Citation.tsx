import React from "react";

interface CitationProps {
  citations: number[];
}

export function Citation({ citations }: CitationProps): React.ReactElement | null {
  if (!citations.length) return null;
  const filtered = citations.filter((n): n is number => typeof n === "number");
  if (filtered.length === 0) return null;

  return (
    <span className="ml-1 whitespace-nowrap">
      {filtered.map((n) => (
        <sup key={n} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
          <a href={`#ref-${n}`} className="no-underline hover:underline">
            [{n}]
          </a>
        </sup>
      ))}
    </span>
  );
}
