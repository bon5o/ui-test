"use client";

import React from "react";
import type { Chapter } from "../types/hybridContent";
import { SectionRenderer } from "./SectionRenderer";
import { CollapsibleSection } from "./ui/CollapsibleSection";

interface ChapterRendererProps {
  chapter: Chapter;
}

export function ChapterRenderer({ chapter }: ChapterRendererProps): React.ReactElement {
  return (
    <CollapsibleSection defaultOpen={true} title={chapter.title}>
      <div id={chapter.id} className="space-y-8">
        {chapter.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </CollapsibleSection>
  );
}
