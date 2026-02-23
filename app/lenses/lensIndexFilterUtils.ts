import type { LensIndexItem } from "../../types/lensIndex";

/** release_year から decade を生成（例: 1962 → "1960s"） */
export function yearToDecade(year: number | undefined): string {
  if (typeof year !== "number" || !Number.isFinite(year)) return "";
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

/** レンズの decade を取得（index.decade または release_year から算出） */
export function getDecade(item: LensIndexItem): string {
  return item.decade ?? yearToDecade(item.release_year);
}

/** レンズの design_type を取得 */
export function getDesignType(item: LensIndexItem): string {
  return item.design_type ?? "";
}

/** レンズのコーティング説明文を取得（フィルター照合用） */
export function getCoatingDescription(item: LensIndexItem): string {
  return item.coating ?? "";
}

/** レンズの価格範囲を取得 */
export function getPriceRange(item: LensIndexItem): { min: number; max: number } | null {
  if (
    typeof item.price_min !== "number" ||
    typeof item.price_max !== "number" ||
    !Number.isFinite(item.price_min) ||
    !Number.isFinite(item.price_max)
  ) {
    return null;
  }
  return { min: item.price_min, max: item.price_max };
}

/** レンズの描写特性・タグを取得 */
export function getCharacteristics(item: LensIndexItem): string[] {
  const chars = item.characteristics ?? [];
  const tags = item.tags ?? [];
  return [...new Set([...chars, ...tags])];
}

/** 価格帯が指定レンジと重なるか */
function priceRangeOverlaps(
  lensRange: { min: number; max: number },
  filterMin: number,
  filterMax: number
): boolean {
  return lensRange.min <= filterMax && lensRange.max >= filterMin;
}

/** PriceRange によるフィルタにマッチするか */
export function matchesPriceRangeFilter(
  item: LensIndexItem,
  range: { min: number | null; max: number | null }
): boolean {
  if (range.min === null && range.max === null) return true;
  const pr = getPriceRange(item);
  if (!pr) return false;
  if (range.min !== null && pr.max < range.min) return false;
  if (range.max !== null && pr.min > range.max) return false;
  return true;
}

/** 価格フィルターにマッチするか（priceRanges 用） */
export function matchesPriceFilter(
  item: LensIndexItem,
  selectedRanges: string[]
): boolean {
  if (selectedRanges.length === 0) return true;
  const pr = getPriceRange(item);
  if (!pr) return false;
  const rangeMap: Record<string, [number, number]> = {
    under_1: [0, 10000],
    "1_to_3": [10000, 30000],
    over_3: [30000, 1e9],
  };
  return selectedRanges.some((key) => {
    const [min, max] = rangeMap[key] ?? [0, 0];
    return priceRangeOverlaps(pr, min, max);
  });
}
