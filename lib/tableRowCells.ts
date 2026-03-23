import type { TableCellValue, TableRowInput, TreeTableRowRecord } from "@/types/hybridContent";

function isTreeRowRecord(row: TableRowInput): row is TreeTableRowRecord {
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
  if (isTreeRowRecord(row)) {
    return row.cells;
  }
  return [];
}
