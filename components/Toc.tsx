import type { HybridContent } from "../types/hybridContent";
import { buildToc } from "../lib/buildToc";

interface TocProps {
  content: HybridContent;
}

function formatTocNumber(parts: number[], level: number): string {
  if (parts.length === 0) return "";
  // 章レベルは "1."、子以降は "1.1" / "1.1.1"
  return level === 1 ? `${parts[0]}.` : parts.join(".");
}

export function Toc({ content }: TocProps): React.ReactNode {
  const toc = buildToc(content);
  if (!toc) return null;
  if (toc.entries.length === 0) return null;

  const title = toc.title ?? "目次";

  // 章(=level 1)ごとにまとめて「親グループ単位」で区切り線を出す
  const groups: Array<{
    parent: (typeof toc.entries)[number];
    children: (typeof toc.entries)[number][];
  }> = [];
  let current:
    | { parent: (typeof toc.entries)[number]; children: (typeof toc.entries)[number][] }
    | null = null;

  for (const e of toc.entries) {
    if (e.level === 1) {
      if (current) groups.push(current);
      current = { parent: e, children: [] };
      continue;
    }
    if (!current) {
      // 想定外（先頭が子）でも落ちないようフォールバック
      current = { parent: e, children: [] };
      continue;
    }
    current.children.push(e);
  }
  if (current) groups.push(current);

  return (
    <details
      className="group mb-8 rounded-md border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-slate-700"
      open
    >
      <summary
        className="flex cursor-pointer list-none items-center gap-2 select-none py-1 text-[15px] font-semibold text-slate-700 outline-none"
        aria-label={title}
      >
        <span
          className="inline-flex h-5 w-5 items-center justify-center text-slate-500 transition-transform duration-150 group-open:rotate-90"
          aria-hidden="true"
        >
          {/* chevron-right */}
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

      {/* simple open/close animation without JS */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="mt-2 text-[15px]">
            {groups.map((g, gi) => {
              const chapterNo = gi + 1;
              const parent = g.parent;
              const parentLabel = parent.label?.trim();
              if (!parentLabel) return null;

              return (
                <div
                  key={`group-${parent.id}`}
                  className="border-b border-slate-200/70 py-2 last:border-b-0"
                >
                  <a
                    href={`#${parent.id}`}
                    className="block rounded-sm px-1 py-1 leading-6 text-slate-700 no-underline hover:bg-slate-100/70 hover:text-slate-900 visited:text-slate-700 visited:no-underline hover:no-underline"
                  >
                    <span className="tabular-nums">{formatTocNumber([chapterNo], 1)}</span>{" "}
                    <span>{parentLabel}</span>
                  </a>

                  {g.children.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {g.children.map((c, ci) => {
                        const childLabel = c.label?.trim();
                        if (!childLabel) return null;
                        const num = formatTocNumber([chapterNo, ci + 1], 2);
                        return (
                          <a
                            key={`child-${c.id}`}
                            href={`#${c.id}`}
                            className="block rounded-sm px-1 py-1 pl-5 text-[14px] leading-6 text-slate-600 no-underline hover:bg-slate-100/70 hover:text-slate-900 visited:text-slate-600 visited:no-underline hover:no-underline"
                          >
                            <span className="tabular-nums">{num}</span>{" "}
                            <span>{childLabel}</span>
                          </a>
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

