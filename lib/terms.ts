import { readFileSync } from "fs";
import { join } from "path";

const TERMS_DIRECTORY = join(process.cwd(), "data", "terms");

export interface Term {
  slug: string;
  title: string;
  content: string;
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
