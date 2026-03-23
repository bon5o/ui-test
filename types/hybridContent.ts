/**
 * ハイブリッド設計の JSON 構造の型定義
 * chapters → sections → items の階層
 */

export type ItemType = "paragraph" | "list" | "image" | "quote" | "table";

/** 文面トーン（表示の濃淡）。未指定は通常（normal）扱い */
export type Tone = "normal" | "muted" | "note" | "highlight_note";

export interface ParagraphItem {
  type: "paragraph";
  /** 表示の濃淡（任意） */
  tone?: Tone;
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
  /** 表示の濃淡（任意） */
  tone?: Tone;
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

/** テーブルセルに指定できる値。文字列・画像オブジェクト・それらの配列（縦並び） */
export type TableCellValue =
  | string
  | ImageItem
  | Array<string | ImageItem>;

/** テーブルの表示モード。未指定時は "responsive"（既存挙動） */
export type TableDisplayMode =
  | "responsive"
  | "cards"
  | "table"
  | "timeline"
  | "tree";

/**
 * display: "tree" 用。cells が headers と対応。
 * id / parentId / href はすべて任意（既存の行配列のみの rows も後方互換）
 */
export interface TreeTableRowRecord {
  id?: string;
  parentId?: string | null;
  href?: string;
  cells: TableCellValue[];
}

/** 1 行分: 従来のセル配列、または tree 用オブジェクト */
export type TableRowInput = TableCellValue[] | TreeTableRowRecord;

export interface TableItem {
  type: "table";
  /** 表示形式: responsive=画面幅で切替 / cards=常にカード / table=常に表 / tree=樹形図風。未指定は "responsive" */
  display?: TableDisplayMode;
  headers?: string[];
  /** 各セルは string / image オブジェクト / (string | image)[] のいずれか。tree 時は TreeTableRowRecord も可 */
  rows: TableRowInput[];
  citations?: number[];
}

export interface SectionMeta {
  title?: string;
  [key: string]: unknown;
}

export interface TocOptions {
  hidden?: boolean;
  label?: string;
}

export interface Section {
  /** 未指定時はレンダラー側でフォールバックキーを使用 */
  id?: string;
  title?: string;
  toc?: TocOptions;
  /** セクション全体の表示トーン（任意）。item 側に tone があれば item が優先。 */
  tone?: Tone;
  meta?: SectionMeta;
  citations?: number[];
  /** 子セクション（再帰）。未指定時は空配列扱い */
  sections?: Section[];
  /** 未指定時は空配列扱い（後方互換） */
  items?: ContentItem[];
}

/**
 * 任意の item に付与できるネスト（後方互換: 未指定なら従来どおりフラット）
 */
export interface ContentItemNesting {
  id?: string;
  /** item 直下の見出し（任意） */
  title?: string;
  /** 子アイテム（再帰） */
  children?: ContentItem[];
  /** item 直下の子セクション（再帰） */
  sections?: Section[];
}

export type ContentItem =
  | (ParagraphItem & ContentItemNesting)
  | (ListItem & ContentItemNesting)
  | (ImageItem & ContentItemNesting)
  | (QuoteItem & ContentItemNesting)
  | (TableItem & ContentItemNesting);

export interface Chapter {
  id: string;
  title: string;
  toc?: TocOptions;
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

export interface RootTocConfig {
  mode?: "auto";
  title?: string;
  depth?: 1 | 2;
}

export interface HybridContent {
  meta?: MetaInfo;
  toc?: RootTocConfig;
  chapters: Chapter[];
  references?: Reference[];
}
