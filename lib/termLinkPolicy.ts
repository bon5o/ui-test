/**
 * 用語リンク（/terms/[slug]）の表示方針。
 * 現在ページと同一視できる場合はリンクにせずテキスト表示にする。
 */

export function termLinkHref(slug: string): string {
  return `/terms/${slug}`;
}

function normalizePathname(path: string): string {
  const t = path.trim();
  if (t === "") return "";
  return t.replace(/\/+$/, "") || "/";
}

/**
 * TermLinkify 等で、用語リンクを出さずプレーンテキスト相当にするか。
 * - 用語ページ自身: currentTermSlug または pathname === /terms/[slug]
 * - 設計型詳細: pathname === /design/[slug] かつ slug が一致（例: ダブルガウス）
 * - レンズ詳細: pathname === /lenses/[slug] かつ slug が一致（用語とレンズ slug が同じ場合）
 */
export function shouldSuppressTermLink(
  slug: string,
  opts: { currentTermSlug?: string; currentPathname?: string }
): boolean {
  if (opts.currentTermSlug && slug === opts.currentTermSlug) return true;
  const path = opts.currentPathname ? normalizePathname(opts.currentPathname) : "";
  if (!path) return false;
  if (path === normalizePathname(termLinkHref(slug))) return true;
  if (path === `/design/${slug}`) return true;
  if (path === `/lenses/${slug}`) return true;
  return false;
}
