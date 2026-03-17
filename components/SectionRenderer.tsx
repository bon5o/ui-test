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
    sectionTone === "highlight_note"
      ? "text-base text-gray-600"
      : sectionTone === "note"
      ? "text-base text-gray-600"
      : sectionTone === "muted"
        ? "text-lg text-gray-700"
        : "text-lg text-gray-800";
  const bodyToneClass =
    sectionTone === "highlight_note"
      ? "text-gray-600"
      : sectionTone === "note"
      ? "text-gray-600"
      : sectionTone === "muted"
        ? "text-gray-700"
        : "";
  const sectionWrapClass =
    sectionTone === "highlight_note"
      ? "bg-[#F7F8F9] border-1 border-[#a4bfd9] rounded px-3 py-2"
      : "";

  return (
    <section {...(section.id ? { id: section.id } : {})} className={`mb-8 ${sectionWrapClass}`.trim()}>
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
