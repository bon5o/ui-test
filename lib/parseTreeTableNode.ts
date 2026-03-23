import type { TableCellValue } from "@/types/hybridContent";

export type TreeNodeSupplementaryRow = {
  label: string;
  cell: TableCellValue | undefined;
};

export type ParsedTreeNodeColumns = {
  titleCell: TableCellValue | undefined;
  /** headers に「年代」があるときだけ。カード外表示用 */
  externalYearCell: TableCellValue | undefined;
  /** テーブル定義に「年代」列が存在する */
  hasYearColumn: boolean;
  supplementary: TreeNodeSupplementaryRow[];
};

/**
 * tree 表示専用: header 名で「名称」「年代」を解釈する。
 * - 名称: あればその列をタイトル、なければ 0 列目
 * - 年代: ヘッダーが厳密に「年代」の列のみカード外へ（列が無ければ従来どおり補助へ戻さない／列ごと存在しない扱い）
 */
export function parseTreeNodeColumns(
  headers: string[],
  cells: TableCellValue[]
): ParsedTreeNodeColumns {
  const yearIdx = headers.findIndex((h) => h === "年代");
  const nameIdx = headers.findIndex((h) => h === "名称");
  let titleIdx = nameIdx >= 0 ? nameIdx : 0;
  const hasYearColumn = yearIdx >= 0;

  /** 「名称」無しで 1 列目が「年代」だけのとき、タイトル列と年代列の衝突を避ける */
  if (hasYearColumn && titleIdx === yearIdx) {
    const alt = headers.findIndex((_, i) => i !== yearIdx);
    titleIdx = alt >= 0 ? alt : -1;
  }

  const titleCell = titleIdx >= 0 ? cells[titleIdx] : undefined;
  const externalYearCell = hasYearColumn ? cells[yearIdx] : undefined;

  const supplementary: TreeNodeSupplementaryRow[] = [];
  headers.forEach((label, i) => {
    if (titleIdx >= 0 && i === titleIdx) return;
    if (hasYearColumn && i === yearIdx) return;
    supplementary.push({ label, cell: cells[i] });
  });

  return {
    titleCell,
    externalYearCell,
    hasYearColumn,
    supplementary,
  };
}

/** ツリー全体で年代列を持つか（レイアウト用の列幅そろえ） */
export function treeHeadersHaveYearColumn(headers: string[]): boolean {
  return headers.some((h) => h === "年代");
}
