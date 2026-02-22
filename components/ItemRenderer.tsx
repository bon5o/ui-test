"use client";

import React from "react";
import Image from "next/image";
import {
  type ContentItem,
  type ParagraphItem,
  type ListItem,
  type ImageItem,
  type QuoteItem,
  type TableItem,
} from "../types/hybridContent";
import { Citation } from "./Citation";

interface ItemRendererProps {
  item: ContentItem;
  index: number;
}

function assertNever(x: never): never {
  throw new Error(`Unknown item type: ${String(x)}`);
}

const KNOWN_TYPES = ["paragraph", "list", "image", "quote", "table"] as const;

function isKnownType(t: unknown): t is (typeof KNOWN_TYPES)[number] {
  return typeof t === "string" && KNOWN_TYPES.includes(t as (typeof KNOWN_TYPES)[number]);
}

function isEmptyOrKeyless(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj);
  return keys.length === 0;
}

function renderItemContent(item: ContentItem, index: number): React.ReactNode {
  const raw = item as unknown as Record<string, unknown>;

  if (isEmptyOrKeyless(raw)) {
    return null;
  }

  // 応急処置（移行期）: type が無い場合のフォールバック
  if (!isKnownType(raw.type)) {
    const media = raw.media as Record<string, unknown> | undefined;
    const images = media?.images as Array<{ src: string; caption?: string; alt?: string; layout?: string; scale?: number }> | undefined;
    if (images && Array.isArray(images) && images.length > 0) {
      console.warn(
        "[ItemRenderer] type なし・media.images あり → image として描画。JSON を { type: \"image\", src, ... } に正規化してください。",
        { fullItem: item }
      );
      const img = images[0];
      const scale = img.scale ?? 1;
      return (
        <figure
          key={index}
          className="inline-block align-top p-2 bg-[#F4F8FF] border border-gray-100 rounded"
        >
          <Image
            src={img.src}
            alt={img.alt ?? img.caption ?? "画像"}
            width={Math.round(600 * scale)}
            height={Math.round(400 * scale)}
            unoptimized
            className="rounded"
          />
          {img.caption != null && img.caption !== "" && (
            <figcaption className="mt-2 text-sm text-gray-600 text-center break-words whitespace-pre-line">
              {img.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    const text =
      typeof raw.text === "string"
        ? raw.text
        : typeof raw.description === "string"
          ? raw.description
          : typeof (raw.description as { text?: string })?.text === "string"
            ? (raw.description as { text: string }).text
            : typeof raw.name === "string"
              ? raw.name
              : undefined;
    if (text != null) {
      console.warn(
        "[ItemRenderer] type なし・text/description あり → paragraph として描画。JSON を { type: \"paragraph\", text, ... } に正規化してください。",
        { fullItem: item }
      );
      const citations = Array.isArray(raw.citations)
        ? (raw.citations as unknown[]).filter((n): n is number => typeof n === "number")
        : undefined;
      return (
        <p key={index} className="text-base font-normal leading-relaxed text-gray-700">
          {text}
          {citations && citations.length > 0 && <Citation citations={citations} />}
        </p>
      );
    }
    console.warn(
      "[ItemRenderer] 想定外の item: type が不正でフォールバックも不可。JSON を正規化してください。",
      { type: raw.type, fullItem: item, index }
    );
    return null;
  }

  switch (item.type) {
    case "paragraph": {
      const p = item as ParagraphItem;
      return (
        <p key={index} className="text-base font-normal leading-relaxed text-gray-700">
          {p.text}
          {p.citations && p.citations.length > 0 && (
            <Citation citations={p.citations} />
          )}
        </p>
      );
    }
    case "list": {
      const l = item as ListItem;
      return (
        <div key={index}>
          <ul className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700">
            {l.items.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ul>
          {l.citations && l.citations.length > 0 && (
            <Citation citations={l.citations} />
          )}
        </div>
      );
    }
    case "image": {
      const img = item as ImageItem;
      const scale = img.scale ?? 1;
      const baseWidth = 320;
      const figureWidth = baseWidth * scale;
      const layoutClass =
        img.layout === "left"
          ? "sm:float-left sm:mr-4 max-sm:float-none max-sm:mr-0 max-sm:ml-0 mb-4"
          : img.layout === "right"
            ? "sm:float-right sm:ml-4 max-sm:float-none max-sm:mr-0 max-sm:ml-0 mb-4"
            : img.layout === "center"
              ? "mx-auto block mb-4"
              : "mb-4";
      return (
        <figure
          key={index}
          className={`inline-block align-top p-2 bg-[#F4F8FF] border border-gray-100 rounded ${layoutClass}`}
          style={{ width: `${figureWidth}px`, maxWidth: `${figureWidth}px` }}
        >
          <Image
            src={img.src}
            alt={img.alt ?? img.caption ?? "画像"}
            width={Math.round(600 * scale)}
            height={Math.round(400 * scale)}
            unoptimized
            className="rounded h-auto"
          />
          {((img.variant != null || img.era != null) || (img.caption != null && img.caption !== "")) && (
            <figcaption className="mt-2 text-sm text-gray-600 text-center break-words whitespace-pre-line space-y-0.5">
              {(img.variant != null || img.era != null) && (
                <p className="text-xs font-medium text-gray-500">
                  {[img.variant, img.era].filter(Boolean).join(" · ")}
                </p>
              )}
              {img.caption != null && img.caption !== "" && (
                <p className="leading-relaxed">{img.caption}</p>
              )}
            </figcaption>
          )}
          {img.citations && img.citations.length > 0 && (
            <div className="mt-2 text-center">
              <Citation citations={img.citations} />
            </div>
          )}
        </figure>
      );
    }
    case "quote": {
      const q = item as QuoteItem;
      return (
        <blockquote key={index} className="border-l-2 border-[#7D9CD4]/50 pl-4 py-2 my-4 text-base text-gray-700 italic">
          {q.text}
          {q.citations && q.citations.length > 0 && (
            <Citation citations={q.citations} />
          )}
        </blockquote>
      );
    }
    case "table": {
      const t = item as TableItem;
      return (
        <div key={index} className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-200 rounded overflow-hidden text-sm">
            {t.headers && t.headers.length > 0 && (
              <thead>
                <tr className="bg-gray-50">
                  {t.headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 text-left font-medium text-gray-800 border-b border-gray-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {t.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 border-b border-gray-100 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {t.citations && t.citations.length > 0 && (
            <div className="mt-2">
              <Citation citations={t.citations} />
            </div>
          )}
        </div>
      );
    }
    default:
      return assertNever(item);
  }
}

export function ItemRenderer({ item, index }: ItemRendererProps): React.ReactNode {
  return renderItemContent(item, index);
}
