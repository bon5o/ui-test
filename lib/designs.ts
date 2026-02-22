import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const DESIGNS_DIRECTORY = join(process.cwd(), "data", "designs");
const CATEGORIES_PATH = join(process.cwd(), "data", "categories.json");

export interface CategoryItem {
  slug: string;
  label: string;
}

export function getCategories(): CategoryItem[] {
  try {
    const contents = readFileSync(CATEGORIES_PATH, "utf-8");
    const data = JSON.parse(contents) as CategoryItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export interface DesignMeta {
  id: string;
  name: string;
  category?: string;
  english_name?: string;
  media?: {
    optical_formula?: Array<{
      src: string;
      variant?: string;
      era?: string;
      caption?: string;
      elements?: number;
      groups?: number;
    }>;
    images?: Array<{
      src: string;
      caption?: string;
      alt?: string;
    }>;
    citations?: number[];
  };
  origin?: DesignOrigin;
}

export interface DesignOrigin {
  base_design?: string;
  photographic_adaptation?: string;
  citations?: number[];
}

export interface HistoricalDevelopmentItem {
  year?: number;
  period?: string;
  designer?: string;
  description: string | { text: string; citations?: number[] };
  citations?: number[];
  media?: {
    images?: Array<{ src: string; caption?: string; alt?: string }>;
  };
}

export interface LayoutOverviewSection {
  section: string;
  content?: string;
  items?: string[];
  citations?: number[];
}

export interface DesignBasicStructure {
  layout_overview?: {
    title?: string;
    sections?: LayoutOverviewSection[];
  };
  /** @deprecated 旧形式 - トップレベルの design_philosophy を使用 */
  design_philosophy?: Array<{
    section: string;
    points: Array<{ text: string; citations?: number[] }>;
  }>;
  /** @deprecated 旧形式 - layout_overview を使用 */
  typical_configurations?: string[];
  /** @deprecated 旧形式 */
  symmetry?: { text: string };
}

export interface DesignPhilosophyItem {
  section: string;
  points: Array<{ text: string; citations?: number[] }>;
}

export interface LensListItem {
  name: string | { text: string; citations?: number[] };
  slug?: string;
  description?: string | { text: string; citations?: number[] };
  [key: string]: unknown;
}

export interface Design {
  meta: DesignMeta;
  origin?: DesignOrigin;
  basic_structure?: DesignBasicStructure;
  historical_development?: HistoricalDevelopmentItem[];
  design_philosophy?: DesignPhilosophyItem[];
  optical_characteristics?: Record<string, unknown>;
  rendering_character?: Record<string, unknown>;
  operational_characteristics?: Record<string, unknown>;
  variants?: unknown[];
  modern_evolution?: Record<string, unknown>;
  lens_list?: LensListItem[];
  references?: unknown[];
  [key: string]: unknown;
}

function getDesignFilePath(id: string): string {
  return join(DESIGNS_DIRECTORY, `${id}.json`);
}

export function getDesignById(id: string): Design | null {
  try {
    const filePath = getDesignFilePath(id);
    const contents = readFileSync(filePath, "utf-8");
    return JSON.parse(contents) as Design;
  } catch {
    return null;
  }
}

export function getAllDesignIds(): string[] {
  try {
    const fileNames = readdirSync(DESIGNS_DIRECTORY);
    return fileNames
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

export interface DesignListItem {
  id: string;
  name: string;
  category: string;
}

export function getAllDesigns(): DesignListItem[] {
  const ids = getAllDesignIds();
  return ids
    .map((id) => {
      const design = getDesignById(id);
      if (!design) return null;
      const slug = design.meta.category ?? "other";
      return { id, name: design.meta.name, category: slug };
    })
    .filter((d): d is DesignListItem => d !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
