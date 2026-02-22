import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const TERMS_DIRECTORY = join(process.cwd(), "data", "terms");

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
}

export function getAllTerms(): TermListItem[] {
  try {
    const fileNames = readdirSync(TERMS_DIRECTORY);
    return fileNames
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const slug = f.replace(".json", "");
        const term = getTermBySlug(slug);
        return term ? { slug: term.slug, title: term.title } : null;
      })
      .filter((t): t is TermListItem => t !== null)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export function getTermBySlug(slug: string): Term | null {
  try {
    const filePath = join(TERMS_DIRECTORY, `${slug}.json`);
    const contents = readFileSync(filePath, "utf-8");
    return JSON.parse(contents) as Term;
  } catch {
    return null;
  }
}
