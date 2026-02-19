import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const DESIGNS_DIRECTORY = join(process.cwd(), "data", "designs");

export interface DesignMeta {
  id: string;
  name: string;
  english_name?: string;
  media?: {
    optical_formula?: Array<{ src: string; caption?: string; elements?: number; groups?: number }>;
  };
  origin?: {
    base_design?: string;
    photographic_adaptation?: string;
  };
}

export interface HistoricalDevelopmentItem {
  year?: number;
  period?: string;
  designer?: string;
  description: string;
}

export interface DesignBasicStructure {
  typical_configurations?: string[];
  symmetry?: { text: string };
  design_philosophy?: Array<{
    section: string;
    points: Array<{ text: string; citations?: number[] }>;
  }>;
}

export interface LensListItem {
  name: string | { text: string; citations?: number[] };
  slug?: string;
  description?: string | { text: string; citations?: number[] };
  [key: string]: unknown;
}

export interface Design {
  meta: DesignMeta;
  historical_development?: HistoricalDevelopmentItem[];
  basic_structure?: DesignBasicStructure;
  lens_list?: LensListItem[];
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
