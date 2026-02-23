import type { HybridContent } from "../types/hybridContent";

/**
 * データがハイブリッド形式（chapters 配列を持つ）かどうかを判定する。
 * design / terms の両方で利用可能。
 */
export function isHybridContent(data: unknown): data is HybridContent {
  return (
    data != null &&
    typeof data === "object" &&
    "chapters" in data &&
    Array.isArray((data as HybridContent).chapters)
  );
}
