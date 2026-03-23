import type { ReactNode } from "react";
import type { HybridContent } from "../types/hybridContent";
import { buildToc } from "../lib/buildToc";
import { TocInteractive, type TocGroupSerialized } from "./TocInteractive";

interface TocProps {
  content: HybridContent;
}

export function Toc({ content }: TocProps): ReactNode {
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

  const serialized: TocGroupSerialized[] = groups.map((g) => ({
    parent: { id: g.parent.id, label: g.parent.label },
    children: g.children.map((c) => ({ id: c.id, label: c.label })),
  }));

  return <TocInteractive title={title} groups={serialized} />;
}

