"use client";

import React from "react";
import type { Section, ContentItem } from "../types/hybridContent";
import { ItemRenderer } from "./ItemRenderer";
import { Citation } from "./Citation";

interface SectionRendererProps {
  section: Section;
}

type ItemChunk =
  | { kind: "single"; item: ContentItem }
  | { kind: "float-group"; image: ContentItem; following: ContentItem[] };

function groupItems(items: ContentItem[], sectionId: string): ItemChunk[] {
  const chunks: ItemChunk[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    const raw = item as unknown as Record<string, unknown>;
    const layout = raw.layout as "left" | "right" | undefined;
    const nextRaw = items[i + 1] as unknown as Record<string, unknown> | undefined;
    const nextLayout = nextRaw?.layout as "left" | "right" | undefined;

    // Pattern B: paragraph/list → image(left/right) → 描画順を image → paragraph → ... に入替
    if (
      (raw.type === "paragraph" || raw.type === "list") &&
      nextRaw?.type === "image" &&
      (nextLayout === "left" || nextLayout === "right")
    ) {
      const imageItem = items[i + 1];
      const following: ContentItem[] = [item]; // 画像より前の段落を「続き」に含める
      i += 2;
      while (i < items.length) {
        const n = items[i] as unknown as Record<string, unknown>;
        if (n.type === "paragraph" || n.type === "list") {
          following.push(items[i]);
          i++;
        } else {
          break;
        }
      }
      console.debug("reordered float group", { sectionId, index: chunks.length });
      chunks.push({ kind: "float-group", image: imageItem, following });
      continue;
    }

    // Pattern A: image(left/right) → paragraph/list...
    if (raw.type === "image" && (layout === "left" || layout === "right")) {
      const following: ContentItem[] = [];
      i++;
      while (i < items.length) {
        const n = items[i] as unknown as Record<string, unknown>;
        if (n.type === "paragraph" || n.type === "list") {
          following.push(items[i]);
          i++;
        } else {
          break;
        }
      }
      chunks.push({ kind: "float-group", image: item, following });
      continue;
    }

    chunks.push({ kind: "single", item });
    i++;
  }
  return chunks;
}

function formatMetaDisplay(meta: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(meta)) {
    if (key === "title") continue;
    if (value != null && typeof value === "string") {
      parts.push(`${key}: ${value}`);
    }
  }
  return parts.join(" · ");
}

export function SectionRenderer({ section }: SectionRendererProps): React.ReactElement {
  return (
    <section id={section.id} className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{section.title}</h3>
      {section.meta && Object.keys(section.meta).length > 0 && (
        <p className="text-sm text-gray-500">
          {formatMetaDisplay(section.meta as Record<string, unknown>)}
        </p>
      )}
      <div className="space-y-4 after:content-[''] after:table after:clear-both">
        {groupItems(section.items, section.id).map((chunk, chunkIndex) => {
          if (chunk.kind === "single") {
            return (
              <ItemRenderer
                key={`${section.id}-chunk-${chunkIndex}`}
                item={chunk.item}
                index={chunkIndex}
              />
            );
          }
          const baseKey = `${section.id}-chunk-${chunkIndex}`;
          return (
            <div key={baseKey} className="flow-root space-y-4">
              <ItemRenderer item={chunk.image} index={chunkIndex} />
              <div className="space-y-4">
                {chunk.following.map((item, j) => (
                  <ItemRenderer
                    key={`${baseKey}-${j}`}
                    item={item}
                    index={chunkIndex * 100 + j}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {section.citations && section.citations.length > 0 && (
        <Citation citations={section.citations} />
      )}
    </section>
  );
}
