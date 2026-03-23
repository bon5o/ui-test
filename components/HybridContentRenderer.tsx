import React from "react";
import type { HybridContent } from "../types/hybridContent";
import { ChapterRenderer } from "./ChapterRenderer";

interface HybridContentRendererProps {
  content: HybridContent;
  /** 表示中の用語ページ slug（自己リンク化を避ける） */
  currentTermSlug?: string;
  /** 現在のパス（設計型詳細などで用語リンクを抑制） */
  currentPathname?: string;
}

export function HybridContentRenderer({
  content,
  currentTermSlug,
  currentPathname,
}: HybridContentRendererProps): React.ReactElement {
  if (process.env.NODE_ENV !== "production") {
    const ids = content.chapters.map((c) => c.id);
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    const emptyOrMissing: string[] = [];
    ids.forEach((id, index) => {
      if (!id || id.trim() === "") {
        emptyOrMissing.push(`index=${index}`);
        return;
      }
      if (seen.has(id)) {
        duplicates.add(id);
      } else {
        seen.add(id);
      }
    });
    if (emptyOrMissing.length > 0 || duplicates.size > 0) {
      // 開発時のみ、章IDの問題を詳細にログ出力
      // JSON 側を修正するのが本質的な解決策
      // eslint-disable-next-line no-console
      console.warn("[HybridContentRenderer] Invalid chapter ids detected", {
        emptyOrMissing,
        duplicates: Array.from(duplicates),
        chapters: content.chapters.map((c, index) => ({
          index,
          id: c.id,
          title: c.title,
        })),
      });
    }
  }

  return (
    <div className="space-y-10">
      {content.chapters.map((chapter, index) => (
        <ChapterRenderer
          key={chapter.id || `chapter-${index}`}
          chapter={chapter}
          currentTermSlug={currentTermSlug}
          currentPathname={currentPathname}
        />
      ))}
    </div>
  );
}
