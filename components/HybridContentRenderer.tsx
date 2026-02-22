"use client";

import React from "react";
import type { HybridContent } from "../types/hybridContent";
import { ChapterRenderer } from "./ChapterRenderer";

interface HybridContentRendererProps {
  content: HybridContent;
}

export function HybridContentRenderer({
  content,
}: HybridContentRendererProps): React.ReactElement {
  return (
    <div className="space-y-12">
      {content.chapters.map((chapter) => (
        <ChapterRenderer key={chapter.id} chapter={chapter} />
      ))}
    </div>
  );
}
