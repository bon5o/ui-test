import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const DESIGNS_DIRECTORY = join(process.cwd(), "data", "designs");

export interface DesignMeta {
  id: string;
  name: string;
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

export function getAllDesigns(): { id: string; name: string }[] {
  const ids = getAllDesignIds();
  return ids
    .map((id) => {
      const design = getDesignById(id);
      return design ? { id, name: design.meta.name } : null;
    })
    .filter((d): d is { id: string; name: string } => d !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
