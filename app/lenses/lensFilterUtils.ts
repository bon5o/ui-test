import type { Lens } from "../../types/lens";

/** release_year から era を生成（例: 1962 → "1960s"） */
export function yearToEra(year: number): string {
  if (typeof year !== "number" || !Number.isFinite(year)) return "";
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

/** レンズの設計型を取得（meta.design_type または classification.design_type） */
export function getDesignType(lens: Lens): string {
  return lens.meta.design_type ?? lens.classification?.design_type ?? "";
}

/** レンズのコーティングを取得（meta.coating または coating.type の簡略化） */
export function getCoating(lens: Lens): string {
  if (lens.meta.coating) return lens.meta.coating;
  const t = lens.coating?.type ?? "";
  if (t.includes("multi") || t.includes("multi-layer")) return "multi";
  if (t.includes("single") || t.includes("mono")) return "single";
  return t || "";
}

/** レンズのコーティング説明文を取得（フィルター照合用） */
export function getCoatingDescription(lens: Lens): string {
  const parts: string[] = [];
  if (lens.meta.coating) parts.push(lens.meta.coating);
  if (lens.coating?.type) parts.push(lens.coating.type);
  if (lens.coating?.notes) parts.push(lens.coating.notes);
  return parts.join(" ");
}

/** レンズの価格範囲を取得（meta.price_range または market_info.price_range_jpy） */
export function getPriceRange(lens: Lens): { min: number; max: number } | null {
  const pr = lens.meta.price_range ?? lens.market_info?.price_range_jpy;
  if (!pr || typeof pr.min !== "number" || typeof pr.max !== "number") return null;
  return pr;
}

/** レンズの描写特性を取得（meta.characteristics または category_tags から推測） */
export function getCharacteristics(lens: Lens): string[] {
  if (lens.meta.characteristics && Array.isArray(lens.meta.characteristics)) {
    return lens.meta.characteristics;
  }
  return lens.classification?.category_tags ?? [];
}

/** 価格帯が指定レンジと重なるか */
function priceRangeOverlaps(
  lensRange: { min: number; max: number },
  filterMin: number,
  filterMax: number
): boolean {
  return lensRange.min <= filterMax && lensRange.max >= filterMin;
}

/** PriceRange によるフィルタにマッチするか（レンズの price_range と比較、min>max は重複判定で防ぐ） */
export function matchesPriceRangeFilter(
  lens: Lens,
  range: { min: number | null; max: number | null }
): boolean {
  if (range.min === null && range.max === null) return true;
  const pr = getPriceRange(lens);
  if (!pr) return false;

  if (range.min !== null && pr.max < range.min) return false;
  if (range.max !== null && pr.min > range.max) return false;
  return true;
}

/** 価格フィルターにマッチするか（旧 priceRanges 用） */
export function matchesPriceFilter(
  lens: Lens,
  selectedRanges: string[]
): boolean {
  if (selectedRanges.length === 0) return true;
  const pr = getPriceRange(lens);
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
