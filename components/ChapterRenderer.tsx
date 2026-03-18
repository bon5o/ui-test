import React from "react";
import type { Chapter } from "../types/hybridContent";
import { SectionRenderer } from "./SectionRenderer";
import { CollapsibleSection } from "./ui/CollapsibleSection";

interface ChapterRendererProps {
  chapter: Chapter;
  /** 表示中の用語ページ slug（自己リンク化を避ける） */
  currentTermSlug?: string;
}

export function ChapterRenderer({
  chapter,
  currentTermSlug,
}: ChapterRendererProps): React.ReactElement {
  if (process.env.NODE_ENV !== "production") {
    const sections = (chapter.sections ?? []).filter(Boolean);
    const ids = sections.map((s) => s.id);
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    const emptyOrMissing: Array<{ index: number; title?: string }> = [];
    ids.forEach((id, index) => {
      if (!id || id.trim() === "") {
        emptyOrMissing.push({ index, title: sections[index]?.title });
        return;
      }
      if (seen.has(id)) {
        duplicates.add(id);
      } else {
        seen.add(id);
      }
    });
    if (emptyOrMissing.length > 0 || duplicates.size > 0) {
      // 開発時のみ、セクションIDの問題を詳細にログ出力
      // JSON 側を修正するのが本質的な解決策
      // eslint-disable-next-line no-console
      console.warn("[ChapterRenderer] Invalid section ids detected", {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        emptyOrMissing,
        duplicates: Array.from(duplicates),
        sections: sections.map((s, index) => ({
          index,
          id: s.id,
          title: s.title,
        })),
      });
    }
  }

  return (
    <CollapsibleSection defaultOpen={true} title={chapter.title}>
      <div id={chapter.id} className="space-y-8">
        {(chapter.sections ?? []).filter(Boolean).map((section, index) => (
          <SectionRenderer
            key={section.id || `section-${index}`}
            section={section}
            currentTermSlug={currentTermSlug}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}
