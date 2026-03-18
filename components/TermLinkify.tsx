import Link from "next/link";
import { buildTermSegments } from "@/lib/termLinkify";

const LINK_CLASS =
  "text-[#7D9CD4] no-underline hover:no-underline visited:no-underline transition-colors hover:text-[#5E7AB8]";

interface TermLinkifyProps {
  text: string;
  /** 表示中の用語ページ slug（自己リンク化を避ける） */
  currentTermSlug?: string;
}

/**
 * 本文中の専門用語を自動リンク化する。
 * TERM_LINKS のルールに従い、長い用語を優先マッチ。
 * dangerouslySetInnerHTML は使用しない。
 */
export function TermLinkify({ text, currentTermSlug }: TermLinkifyProps): React.ReactNode {
  if (typeof text !== "string" || text.length === 0) return null;
  const segments = buildTermSegments(text);

  // 描画は確定済み segments から。空文字は生成しない。
  return (
    <>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          seg.value.length > 0 ? (
            <span key={`${seg.start}-${i}`}>{seg.value}</span>
          ) : null
        ) : (
          seg.slug === currentTermSlug ? (
            <span key={`${seg.start}-${seg.end}-${seg.slug}`}>{seg.value}</span>
          ) : (
            <Link
              key={`${seg.start}-${seg.end}-${seg.slug}`}
              href={`/terms/${seg.slug}`}
              className={LINK_CLASS}
            >
              {seg.value}
            </Link>
          )
        )
      )}
    </>
  );
}
