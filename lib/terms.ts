import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { HybridContent } from "../types/hybridContent";
import { TERM_LINKS } from "./termLinks";

const TERMS_DIRECTORY = join(process.cwd(), "data", "terms");
const DESIGNS_DIRECTORY = join(process.cwd(), "data", "designs");
const LENSES_DIRECTORY = join(process.cwd(), "data", "lenses");

/** 引用付きテキスト */
export interface CitedText {
  text: string;
  citations?: number[];
}

/** 構造情報 */
export interface TermStructure {
  elements?: number;
  cemented?: boolean;
  typical_combination?: string[];
}

/** 履歴・由来の各項目 */
export interface TermHistoricalItem {
  text: string;
  citations?: number[];
}

/** 歴史的背景 */
export interface TermHistoricalBackground {
  first_developed?: TermHistoricalItem;
  inventor?: TermHistoricalItem;
  notes?: TermHistoricalItem;
}

/** 比較（動的キー） */
export interface TermComparison {
  [key: string]: { text: string; citations?: number[] } | undefined;
}

/** 光学構成図の1項目 */
export interface TermOpticalFormulaItem {
  src: string;
  variant?: string;
  era?: string;
  caption?: string;
}

/** メディア */
export interface TermMedia {
  optical_formula?: TermOpticalFormulaItem[];
}

/** 図表 */
export interface TermDiagram {
  type?: string;
  description?: string;
  citations?: number[];
}

/** 参考文献 */
export interface TermReference {
  id: number;
  title: string;
  author_or_source: string;
  url?: string;
  type?: string;
  reliability?: string;
}

export interface Term {
  slug: string;
  title: string;
  english_name?: string;
  category?: string;
  media?: TermMedia;
  field?: string[];
  overview?: CitedText[];
  principle?: CitedText[];
  structure?: TermStructure;
  correction_target?: string[];
  uncorrected_aberrations?: string[];
  advantages?: CitedText[];
  disadvantages?: CitedText[];
  historical_background?: TermHistoricalBackground;
  applications?: CitedText[];
  comparison?: TermComparison;
  related_terms?: string[];
  see_also?: string[];
  diagrams?: TermDiagram[];
  references?: TermReference[];
}

export interface TermListItem {
  slug: string;
  title: string;
  english_name?: string;
  /** category パス（例: "lens_element/singlet_geometry"） */
  category?: string;
}

export function getAllTerms(): TermListItem[] {
  try {
    const fileNames = readdirSync(TERMS_DIRECTORY).filter((f) => f.endsWith(".json"));
    const slugs = new Set<string>(fileNames.map((f) => f.replace(".json", "")));

    // TermLinkify で参照される slug は terms/ に無くても候補に含める（designs/lenses へのフォールバック用）
    for (const { slug } of TERM_LINKS) slugs.add(slug);

    const items = Array.from(slugs)
      .map((slug) => {
        const term = getTermBySlug(slug);
        if (!term) return null;
        const rawTitle =
          "title" in term && typeof term.title === "string"
            ? term.title
            : (term as HybridContent).meta?.title ??
              (term as HybridContent).meta?.name ??
              slug;
        const title = typeof rawTitle === "string" ? rawTitle : String(slug);
        const rawEnglish =
          "english_name" in term && typeof term.english_name === "string"
            ? term.english_name
            : (term as HybridContent).meta?.english_name;
        const english_name = typeof rawEnglish === "string" ? rawEnglish : undefined;
        const category =
          (term as HybridContent).meta?.category ??
          ("category" in term ? (term as Term).category : undefined);
        const categoryStr = typeof category === "string" ? category : undefined;
        const item: TermListItem = { slug, title, english_name, category: categoryStr };
        return item;
      })
      .filter((t): t is TermListItem => t != null)
      .sort((a, b) => a.title.localeCompare(b.title));

    return items;
  } catch {
    return [];
  }
}

export function getTermBySlug(slug: string): Term | HybridContent | null {
  const candidates = [
    join(TERMS_DIRECTORY, `${slug}.json`),
    join(DESIGNS_DIRECTORY, `${slug}.json`),
    join(LENSES_DIRECTORY, `${slug}.json`),
  ];
  for (const filePath of candidates) {
    try {
      const contents = readFileSync(filePath, "utf-8");
      return JSON.parse(contents) as Term | HybridContent;
    } catch {
      // continue
    }
  }
  return null;
}
