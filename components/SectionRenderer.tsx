"use client";

import React from "react";
import type { Section, ContentItem, Tone } from "../types/hybridContent";
import { ItemRenderer } from "./ItemRenderer";

interface SectionRendererProps {
  section: Section | null | undefined;
}

export function SectionRenderer({ section }: SectionRendererProps): React.ReactElement | null {
  if (!section) return null;

  const items = Array.isArray(section.items) ? section.items : [];
  const sectionTone: Tone = section.tone ?? "normal";
  const titleToneClass =
    sectionTone === "note"
      ? "text-base text-gray-600"
      : sectionTone === "muted"
        ? "text-lg text-gray-700"
        : "text-lg text-gray-800";
  const bodyToneClass =
    sectionTone === "note"
      ? "text-gray-600"
      : sectionTone === "muted"
        ? "text-gray-700"
        : "";

  return (
    <section {...(section.id ? { id: section.id } : {})} className="mb-8">
      {section.title != null && String(section.title) !== "" && (
        <h3 className={`mb-3 font-semibold ${titleToneClass}`}>
          {section.title}
        </h3>
      )}

      <div className={`space-y-4 ${bodyToneClass}`.trim()}>
        {items.filter((item): item is ContentItem => item != null).map((item, i) => (
          <ItemRenderer key={i} item={item} inheritedTone={sectionTone} />
        ))}
      </div>
    </section>
  );
}
