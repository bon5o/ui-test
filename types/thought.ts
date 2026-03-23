export interface ThoughtArticle {
  slug: string;
  title: string;
  /** ISO 日付 YYYY-MM-DD */
  date: string;
  summary?: string;
  body: string;
}
