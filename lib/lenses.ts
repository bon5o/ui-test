import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { Lens } from "../types/lens";

/**
 * レンズデータのディレクトリパス
 */
const LENSES_DIRECTORY = join(process.cwd(), "data", "lenses");

/**
 * 全レンズデータを取得
 * ビルド時に全JSONファイルを読み込み、メモリにキャッシュ
 */
export function getAllLenses(): Lens[] {
  try {
    const fileNames = readdirSync(LENSES_DIRECTORY);
    const jsonFiles = fileNames.filter((fileName) =>
      fileName.endsWith(".json")
    );

    const lenses: Lens[] = jsonFiles.map((fileName) => {
      const filePath = join(LENSES_DIRECTORY, fileName);
      const fileContents = readFileSync(filePath, "utf-8");
      const lensData = JSON.parse(fileContents) as Lens;
      return lensData;
    });

    return lenses;
  } catch (error) {
    console.error("Error reading lenses data:", error);
    return [];
  }
}

/**
 * slugから単一レンズを取得
 * @param slug - レンズのslug
 * @returns レンズデータ、見つからない場合はnull
 */
export function getLensBySlug(slug: string): Lens | null {
  try {
    const lenses = getAllLenses();
    const lens = lenses.find((l) => l.meta.slug === slug);
    return lens || null;
  } catch (error) {
    console.error(`Error getting lens by slug "${slug}":`, error);
    return null;
  }
}

/**
 * 全レンズのslugを取得
 * generateStaticParams用の軽量な関数
 * @returns slugの配列
 */
export function getAllSlugs(): string[] {
  try {
    const lenses = getAllLenses();
    return lenses.map((lens) => lens.meta.slug);
  } catch (error) {
    console.error("Error getting all slugs:", error);
    return [];
  }
}
