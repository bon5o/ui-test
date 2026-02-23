"use client";

import React from "react";
import type { Section, ContentItem } from "../types/hybridContent";
import { ItemRenderer } from "./ItemRenderer";

interface SectionRendererProps {
  section: Section | null | undefined;
}

export function SectionRenderer({ section }: SectionRendererProps): React.ReactElement | null {
  if (!section) return null;

  const items = Array.isArray(section.items) ? section.items : [];

  return (
    <section {...(section.id ? { id: section.id } : {})} className="mb-8">
      {section.title != null && String(section.title) !== "" && (
        <h3 className="mb-3 text-lg font-semibold text-gray-800">
          {section.title}
        </h3>
      )}

      <div className="space-y-4">
        {items.filter((item): item is ContentItem => item != null).map((item, i) => (
          <ItemRenderer key={i} item={item} />
        ))}
      </div>
    </section>
  );
}
