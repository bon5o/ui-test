import Link from "next/link";
import { buildTermSegments } from "@/lib/termLinkify";
import { shouldSuppressTermLink, termLinkHref } from "@/lib/termLinkPolicy";

const LINK_CLASS =
  "text-[#7D9CD4] no-underline hover:no-underline visited:no-underline transition-colors hover:text-[#5E7AB8]";

interface TermLinkifyProps {
  text: string;
  /** 表示中の用語ページ slug（自己リンク化を避ける） */
  currentTermSlug?: string;
  /** 現在のパス（例: /design/double-gauss）。リンク先と一致または設計型・レンズ詳細と slug が一致する場合は非リンク */
  currentPathname?: string;
}

/**
 * 本文中の専門用語を自動リンク化する。
 * TERM_LINKS のルールに従い、長い用語を優先マッチ。
 * dangerouslySetInnerHTML は使用しない。
 */
export function TermLinkify({
  text,
  currentTermSlug,
  currentPathname,
}: TermLinkifyProps): React.ReactNode {
  if (typeof text !== "string" || text.length === 0) return null;
  const segments = buildTermSegments(text);
  const suppressOpts = { currentTermSlug, currentPathname };

  // 描画は確定済み segments から。空文字は生成しない。
  return (
    <>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          seg.value.length > 0 ? (
            <span key={`${seg.start}-${i}`}>{seg.value}</span>
          ) : null
        ) : shouldSuppressTermLink(seg.slug, suppressOpts) ? (
          <span key={`${seg.start}-${seg.end}-${seg.slug}`}>{seg.value}</span>
        ) : (
          <Link
            key={`${seg.start}-${seg.end}-${seg.slug}`}
            href={termLinkHref(seg.slug)}
            className={LINK_CLASS}
          >
            {seg.value}
          </Link>
        )
      )}
    </>
  );
}
