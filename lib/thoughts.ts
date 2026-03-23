import { readFileSync } from "fs";
import { join } from "path";
import type { ThoughtArticle } from "@/types/thought";

const DATA_PATH = join(process.cwd(), "data", "thoughts", "articles.json");

let cached: ThoughtArticle[] | null = null;

function loadArticles(): ThoughtArticle[] {
  if (cached) return cached;
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as unknown;
  if (!Array.isArray(data)) {
    cached = [];
    return cached;
  }
  cached = data.filter(
    (a): a is ThoughtArticle =>
      a != null &&
      typeof a === "object" &&
      typeof (a as ThoughtArticle).slug === "string" &&
      typeof (a as ThoughtArticle).title === "string" &&
      typeof (a as ThoughtArticle).date === "string" &&
      typeof (a as ThoughtArticle).body === "string"
  );
  return cached;
}

/** 新しい日付が先（一覧用） */
export function getThoughtsSortedByDateDesc(): ThoughtArticle[] {
  return [...loadArticles()].sort((a, b) => {
    if (a.date === b.date) return a.slug.localeCompare(b.slug);
    return a.date < b.date ? 1 : -1;
  });
}

export function getThoughtBySlug(slug: string): ThoughtArticle | undefined {
  return loadArticles().find((a) => a.slug === slug);
}

export function getAllThoughtSlugs(): string[] {
  return loadArticles().map((a) => a.slug);
}
