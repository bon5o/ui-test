import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const MAKERS_DIRECTORY = join(process.cwd(), "data", "makers");

/** 一覧用の maker メタ情報（meta をソース・オブ・トゥルース） */
export interface MakerListItem {
  id: string;
  name: string;
  english_name?: string;
  /** 階層パス（例: "camera/japan"）。無い場合は "uncategorized" */
  category?: string;
}

export function getAllMakers(): MakerListItem[] {
  try {
    const fileNames = readdirSync(MAKERS_DIRECTORY);
    const jsonFiles = fileNames.filter((f) => f.endsWith(".json"));
    const list: MakerListItem[] = [];

    for (const fileName of jsonFiles) {
      const filePath = join(MAKERS_DIRECTORY, fileName);
      const contents = readFileSync(filePath, "utf-8");
      const data = JSON.parse(contents) as { meta?: Record<string, unknown> };
      const meta = data?.meta as {
        id?: string;
        name?: string;
        english_name?: string;
        category?: string;
      } | undefined;

      const id =
        typeof meta?.id === "string" ? meta.id : fileName.replace(".json", "");
      const name = typeof meta?.name === "string" ? meta.name : id;
      const english_name =
        typeof meta?.english_name === "string" ? meta.english_name : undefined;
      const category =
        typeof meta?.category === "string"
          ? meta.category.trim() || "uncategorized"
          : "uncategorized";

      list.push({ id, name, english_name, category });
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
