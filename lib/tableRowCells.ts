import type {
  TableCellValue,
  TableRowInput,
  TableRowCellsRecord,
  TreeTableRowRecord,
} from "@/types/hybridContent";

function isCellsRowRecord(row: TableRowInput): row is TreeTableRowRecord | TableRowCellsRecord {
  return (
    row != null &&
    typeof row === "object" &&
    !Array.isArray(row) &&
    "cells" in row &&
    Array.isArray((row as TreeTableRowRecord).cells)
  );
}

/** 従来の行配列と tree 用 { cells } を統一してセル配列にする */
export function getTableRowCells(row: TableRowInput): TableCellValue[] {
  if (Array.isArray(row)) {
    return row;
  }
  if (isCellsRowRecord(row)) {
    return row.cells;
  }
  return [];
}

export function getTableRowCitations(row: TableRowInput): number[] {
  if (Array.isArray(row)) return [];
  if (!isCellsRowRecord(row)) return [];
  const citations = (row as { citations?: unknown }).citations;
  if (!Array.isArray(citations)) return [];
  return citations.filter((n): n is number => typeof n === "number");
}
