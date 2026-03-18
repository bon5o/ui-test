import { TERM_LINKS } from "./termLinks";

export type TermSegment =
  | { kind: "text"; value: string; start: number; end: number }
  | { kind: "link"; value: string; slug: string; start: number; end: number };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// longest match 優先: 文字数 desc + 同長は安定比較
const SORTED_TERMS = [...TERM_LINKS].sort(
  (a, b) => b.term.length - a.term.length || a.term.localeCompare(b.term, "ja")
);
const TERM_TO_SLUG = new Map(SORTED_TERMS.map((t) => [t.term, t.slug]));

/**
 * 入力 text から安定した segments を返す（SSR/CSRで同一）。
 * - 辞書順序は固定
 * - longest match 優先
 * - regex は呼び出し毎に生成し、副作用（lastIndex）を閉じ込める
 * - 変動値は使わない
 */
export function buildTermSegments(text: string): TermSegment[] {
  if (typeof text !== "string" || text.length === 0) return [];
  if (SORTED_TERMS.length === 0) return [{ kind: "text", value: text, start: 0, end: text.length }];

  const pattern = SORTED_TERMS.map((t) => escapeRegex(t.term)).join("|");
  const regex = new RegExp(`(${pattern})`, "gu");

  const segments: TermSegment[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    const matchStart = m.index;
    const matchEnd = regex.lastIndex;
    const term = m[1];

    if (matchStart > lastIndex) {
      segments.push({
        kind: "text",
        value: text.slice(lastIndex, matchStart),
        start: lastIndex,
        end: matchStart,
      });
    }

    const slug = TERM_TO_SLUG.get(term);
    if (slug) {
      segments.push({
        kind: "link",
        value: term,
        slug,
        start: matchStart,
        end: matchEnd,
      });
    } else {
      // 定義漏れ等でも常に安定した分割になるよう、テキストとして残す
      segments.push({
        kind: "text",
        value: term,
        start: matchStart,
        end: matchEnd,
      });
    }
    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    segments.push({
      kind: "text",
      value: text.slice(lastIndex),
      start: lastIndex,
      end: text.length,
    });
  }

  return segments;
}

