import type { HybridContent } from "../types/hybridContent";

export type TocEntry =
  | { level: 1; id: string; label: string }
  | { level: 2; id: string; label: string; parentId: string };

export type BuiltToc = {
  title?: string;
  entries: TocEntry[];
};

/**
 * root.toc に基づき目次データを生成する（pure / SSR&CSRで同一）。
 * - まずは mode: "auto" のみ対応
 * - depth: 1=chapterのみ / 2=chapter+section
 * - chapter/section の toc.hidden=true は除外
 * - label は toc.label ?? title
 */
export function buildToc(root: HybridContent): BuiltToc | null {
  const cfg = root?.toc;
  if (!cfg) return null;
  if (cfg.mode !== "auto") return null;

  const depth: 1 | 2 = cfg.depth === 1 ? 1 : 2;
  const entries: TocEntry[] = [];

  const normalizeLabel = (v: unknown): string | null => {
    if (v == null) return null;
    const s = String(v).trim();
    return s.length > 0 ? s : null;
  };

  for (const chapter of root.chapters ?? []) {
    if (!chapter?.id) continue;
    if (chapter.toc?.hidden === true) continue;
    const chapterLabel =
      normalizeLabel(chapter.toc?.label) ??
      normalizeLabel(chapter.title) ??
      normalizeLabel(chapter.id);
    if (!chapterLabel) continue;
    entries.push({ level: 1, id: chapter.id, label: chapterLabel });

    if (depth === 2) {
      const appendSections = (sections: typeof chapter.sections): void => {
        for (const section of sections ?? []) {
          if (!section?.id) continue;
          if (section.toc?.hidden === true) continue;
          const sectionLabel =
            normalizeLabel(section.toc?.label) ??
            normalizeLabel(section.title) ??
            normalizeLabel(section.id);
          if (!sectionLabel) continue;
          entries.push({
            level: 2,
            id: section.id,
            parentId: chapter.id,
            label: sectionLabel,
          });
          if (section.sections?.length) {
            appendSections(section.sections);
          }
        }
      };
      appendSections(chapter.sections);
    }
  }

  // 参考文献（entries には子要素を出さない）
  const hasReferences = Array.isArray(root.references) && root.references.length > 0;
  if (hasReferences) {
    const id = "references";
    const already = entries.some((e) => e.level === 1 && e.id === id);
    if (!already) {
      entries.push({ level: 1, id, label: "参考文献" });
    }
  }

  return { title: cfg.title, entries };
}

