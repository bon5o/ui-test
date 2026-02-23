/**
 * ハイブリッド設計の JSON 構造の型定義
 * chapters → sections → items の階層
 */

export type ItemType = "paragraph" | "list" | "image" | "quote" | "table";

export interface ParagraphItem {
  type: "paragraph";
  text: string;
  citations?: number[];
}

/**
 * list 型のアイテム。
 * 理想: items を必ず持つこと（JSON 正規化で統一）。
 * 後方互換のため entries / bullets / text も許容する。
 */
export interface ListItem {
  type: "list";
  /** リスト項目（推奨）。必須にしないのは JSON 移行期の互換のため */
  items?: string[];
  /** 代替キー（items がない場合に代用） */
  entries?: string[];
  /** 代替キー（items がない場合に代用） */
  bullets?: string[];
  /** 代替キー（items がない場合に代用） */
  text?: string[];
  citations?: number[];
}

export interface ImageItem {
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
  layout?: "left" | "right" | "center";
  scale?: number;
  citations?: number[];
  variant?: string;
  era?: string;
}

export interface QuoteItem {
  type: "quote";
  text: string;
  citations?: number[];
}

export interface TableItem {
  type: "table";
  headers?: string[];
  rows: string[][];
  citations?: number[];
}

export type ContentItem =
  | ParagraphItem
  | ListItem
  | ImageItem
  | QuoteItem
  | TableItem;

export interface SectionMeta {
  title?: string;
  [key: string]: unknown;
}

export interface Section {
  id: string;
  title: string;
  meta?: SectionMeta;
  citations?: number[];
  items: ContentItem[];
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface MetaInfo {
  [key: string]: unknown;
}

export type Reference = {
  id: number;
  title: string;
  author_or_source?: string;
  url?: string;
  type?: string;
  reliability?: string;
};

export interface HybridContent {
  meta?: MetaInfo;
  chapters: Chapter[];
  references?: Reference[];
}
