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

export interface ListItem {
  type: "list";
  items: string[];
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

export interface HybridContent {
  meta?: MetaInfo;
  chapters: Chapter[];
}
