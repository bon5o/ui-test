"use client";

import React from "react";
import Link from "next/link";
import { TERM_LINKS } from "@/lib/termLinks";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// キー長 desc でソート（1回だけ構築、モジュールスコープでキャッシュ）
const SORTED_TERMS = [...TERM_LINKS].sort((a, b) => b.term.length - a.term.length);
const TERM_TO_SLUG = new Map(TERM_LINKS.map((t) => [t.term, t.slug]));

const LINK_CLASS =
  "text-[#7D9CD4] underline decoration-[#7D9CD4]/30 underline-offset-2 transition-colors hover:text-[#5E7AB8] hover:decoration-[#7D9CD4]/55";

interface TermLinkifyProps {
  text: string;
}

/**
 * 本文中の専門用語を自動リンク化する。
 * TERM_LINKS のルールに従い、長い用語を優先マッチ。
 * dangerouslySetInnerHTML は使用しない。
 */
export function TermLinkify({ text }: TermLinkifyProps): React.ReactNode {
  if (!text || typeof text !== "string") return null;
  if (SORTED_TERMS.length === 0) return text;

  const pattern = SORTED_TERMS.map((t) => escapeRegex(t.term)).join("|");
  const regex = new RegExp(`(${pattern})`, "g");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    const term = match[1];
    const slug = TERM_TO_SLUG.get(term);
    if (slug == null) continue;

    parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    parts.push(
      <Link key={key++} href={`/terms/${slug}`} className={LINK_CLASS}>
        {term}
      </Link>
    );
    lastIndex = regex.lastIndex;
  }
  parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);

  return <>{parts}</>;
}
