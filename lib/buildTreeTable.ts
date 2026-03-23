import type { TableCellValue, TableRowInput, TreeTableRowRecord } from "@/types/hybridContent";
import { getTableRowCells, getTableRowCitations } from "@/lib/tableRowCells";

export type NormalizedTableTreeRow = {
  id: string;
  parentId: string | null;
  href?: string;
  cells: TableCellValue[];
  citations: number[];
  sourceIndex: number;
};

export type TableTreeNode = NormalizedTableTreeRow & {
  children: TableTreeNode[];
};

function rowMeta(row: TableRowInput, rowIndex: number): NormalizedTableTreeRow {
  const cells = getTableRowCells(row);
  const citations = getTableRowCitations(row);
  if (Array.isArray(row)) {
    return {
      id: `__row_${rowIndex}`,
      parentId: null,
      href: undefined,
      cells,
      citations,
      sourceIndex: rowIndex,
    };
  }
  const o = row as TreeTableRowRecord & Record<string, unknown>;
  const rawId = o.id;
  const id =
    typeof rawId === "string" && rawId.trim() !== ""
      ? rawId.trim()
      : `__row_${rowIndex}`;
  let parentId: string | null = null;
  if (o.parentId !== undefined && o.parentId !== null && o.parentId !== "") {
    parentId = String(o.parentId);
  }
  const href =
    typeof o.href === "string" && o.href.trim() !== "" ? o.href.trim() : undefined;
  return { id, parentId, href, cells, citations, sourceIndex: rowIndex };
}

function sortChildrenRecursive(nodes: TableTreeNode[]): void {
  nodes.sort((a, b) => a.sourceIndex - b.sourceIndex);
  for (const n of nodes) {
    sortChildrenRecursive(n.children);
  }
}

/**
 * id / parentId から木を構築。
 * - id 欠落 → __row_{index}
 * - 親不在・欠損 → ルート
 * - id 重複 → 後続に __dup_{index} を付与
 * - 行順は兄弟間の表示順に反映（sourceIndex）
 */
export function buildTreeTableModel(rows: TableRowInput[]): TableTreeNode[] {
  if (rows.length === 0) return [];

  const metas = rows.map((r, i) => rowMeta(r, i));
  const usedIds = new Set<string>();
  for (const m of metas) {
    let id = m.id;
    if (usedIds.has(id)) {
      id = `${m.id}__dup_${m.sourceIndex}`;
    }
    usedIds.add(id);
    m.id = id;
  }

  const idToNode = new Map<string, TableTreeNode>();
  for (const m of metas) {
    idToNode.set(m.id, { ...m, children: [] });
  }

  const roots: TableTreeNode[] = [];
  for (const m of metas) {
    const node = idToNode.get(m.id)!;
    const pid = m.parentId;
    if (pid != null && idToNode.has(pid)) {
      idToNode.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  sortChildrenRecursive(roots);
  return roots;
}
