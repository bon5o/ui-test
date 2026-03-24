import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { HybridContent } from "../types/hybridContent";

const HISTORY_DIRECTORY = join(process.cwd(), "data", "history");

export interface HistoryListItem {
  slug: string;
  title: string;
  english_name?: string;
  category?: string;
  summary?: string;
  updated_at?: string;
}

export function getAllHistoryItems(): HistoryListItem[] {
  try {
    const fileNames = readdirSync(HISTORY_DIRECTORY).filter((f) =>
      f.endsWith(".json")
    );
    return fileNames
      .map((f) => {
        const slug = f.replace(".json", "");
        const content = JSON.parse(
          readFileSync(join(HISTORY_DIRECTORY, f), "utf-8")
        ) as HybridContent;
        const meta = content.meta as
          | {
              name?: string;
              english_name?: string;
              category?: string;
              summary?: string;
              updated_at?: string;
            }
          | undefined;
        return {
          slug,
          title: typeof meta?.name === "string" ? meta.name : slug,
          english_name:
            typeof meta?.english_name === "string"
              ? meta.english_name
              : undefined,
          category:
            typeof meta?.category === "string" ? meta.category : undefined,
          summary:
            typeof meta?.summary === "string" ? meta.summary : undefined,
          updated_at:
            typeof meta?.updated_at === "string" ? meta.updated_at : undefined,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export function getAllHistorySlugs(): string[] {
  try {
    return readdirSync(HISTORY_DIRECTORY)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

export function getHistoryBySlug(slug: string): HybridContent | null {
  try {
    const filePath = join(HISTORY_DIRECTORY, `${slug}.json`);
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as HybridContent;
  } catch {
    return null;
  }
}
