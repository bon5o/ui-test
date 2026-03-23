import React from "react";
import Link from "next/link";
import type { TableItem } from "@/types/hybridContent";
import type { TableTreeNode } from "@/lib/buildTreeTable";
import { buildTreeTableModel } from "@/lib/buildTreeTable";
import { Citation } from "@/components/Citation";

/** ノード見出し行と横枝の交点（px）。コンパクトカードと揃える */
const TREE_ELBOW_Y_PX = 13;
const TREE_LINE = "bg-[#7D9CD4]/25";
const TREE_AXIS_LEFT = "left-[9px]";

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

type PanelVariant = "root" | "child" | "grandchild";

function TreeNodePanel({
  node,
  headers,
  renderCell,
  variant,
}: {
  node: TableTreeNode;
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  variant: PanelVariant;
}): React.ReactElement {
  const cells = node.cells;
  const titleCell = cells[0];
  const restHeaders = headers.slice(1);

  const titleClasses =
    variant === "root"
      ? "text-base font-semibold leading-snug tracking-tight text-gray-900"
      : variant === "child"
        ? "text-[15px] font-semibold leading-snug text-gray-900"
        : "text-sm font-medium leading-snug text-gray-800";

  const shellClasses =
    variant === "root"
      ? "rounded-lg border border-gray-300/70 bg-white/95 py-2.5 pl-3 pr-3 shadow-sm ring-1 ring-gray-200/30 sm:py-3 sm:pl-3.5 sm:pr-3.5"
      : variant === "child"
        ? "rounded-md border border-gray-200/90 bg-[#fcfcf9]/95 py-1.5 pl-2.5 pr-2.5 sm:py-2 sm:pl-3 sm:pr-3"
        : "rounded-md border border-gray-200/70 bg-white/70 py-1.5 pl-2.5 pr-2 sm:pl-2.5 sm:pr-2.5";

  const inner = (
    <>
      <div
        className={`${titleClasses} ${node.href ? "group-hover/tree-node:decoration-[#7D9CD4]/45 underline decoration-transparent underline-offset-2" : ""}`}
        data-tree-title
      >
        {titleCell != null ? (
          renderCell(titleCell)
        ) : (
          <span className="font-normal text-gray-400">（無題）</span>
        )}
      </div>
      {restHeaders.map((label, i) => {
        const cell = cells[i + 1];
        const empty =
          cell == null || (typeof cell === "string" && cell.trim() === "");
        if (empty) return null;
        return (
          <div
            key={`${label}-${i}`}
            className="flex flex-col gap-y-0.5 sm:flex-row sm:items-baseline sm:gap-x-2"
          >
            <span className="shrink-0 text-[10px] font-medium text-gray-400 sm:w-[4.5rem] sm:text-[11px]">
              {label}
            </span>
            <div className="min-w-0 text-xs leading-snug text-gray-600 sm:text-[13px] sm:leading-snug">
              {renderCell(cell)}
            </div>
          </div>
        );
      })}
    </>
  );

  const panelClass = `group/tree-node min-w-0 space-y-1 ${shellClasses} transition-colors duration-150 ease-out hover:border-[#7D9CD4]/40 hover:bg-white`;

  const linkExtra =
    "block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D9CD4]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfcf9]";

  if (node.href != null) {
    return isExternalHref(node.href) ? (
      <a
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${panelClass} ${linkExtra}`}
        data-tree-link="external"
        data-tree-panel
      >
        {inner}
      </a>
    ) : (
      <Link
        href={node.href}
        className={`${panelClass} ${linkExtra}`}
        data-tree-link="internal"
        data-tree-panel
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={panelClass} data-tree-panel>
      {inner}
    </div>
  );
}

/** 親パネルから子リストへ降りる短い幹 */
function TreeParentStem(): React.ReactElement {
  return (
    <div
      className={`pointer-events-none absolute ${TREE_AXIS_LEFT} top-0 z-0 h-2 w-px ${TREE_LINE}`}
      aria-hidden
    />
  );
}

/**
 * 子ノード左側: 縦幹（兄弟間は連続）+ ノードへの横枝
 * - 最終兄弟: 縦幹は肘までのみ（下に無駄に伸びない）
 * - 中間兄弟: 縦幹は行全体の高さまで
 */
function TreeBranchConnector({
  isLastSibling,
}: {
  isLastSibling: boolean;
}): React.ReactElement {
  return (
    <div
      className="relative w-5 shrink-0 self-stretch sm:w-[22px]"
      aria-hidden
    >
      {!isLastSibling ? (
        <div
          className={`absolute ${TREE_AXIS_LEFT} top-0 bottom-0 w-px ${TREE_LINE}`}
        />
      ) : (
        <div
          className={`absolute ${TREE_AXIS_LEFT} top-0 w-px ${TREE_LINE}`}
          style={{ height: TREE_ELBOW_Y_PX }}
        />
      )}
      <div
        className={`absolute ${TREE_AXIS_LEFT} h-px w-[11px] sm:w-3 ${TREE_LINE}`}
        style={{ top: TREE_ELBOW_Y_PX }}
      />
    </div>
  );
}

function TreeSubtreeRow({
  node,
  index,
  siblingCount,
  headers,
  renderCell,
  depth,
  maxDepth,
}: {
  node: TableTreeNode;
  index: number;
  siblingCount: number;
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  depth: number;
  maxDepth: number;
}): React.ReactElement {
  const isLast = index === siblingCount - 1;
  const childVariant: PanelVariant =
    depth <= 1 ? "child" : "grandchild";

  return (
    <li
      className="flex min-w-0 gap-0"
      data-tree-node=""
      data-depth={depth}
      data-node-id={node.id}
    >
      <TreeBranchConnector isLastSibling={isLast} />
      <div className="min-w-0 flex-1 pb-2 sm:pb-2.5">
        <TreeNodePanel
          node={node}
          headers={headers}
          renderCell={renderCell}
          variant={childVariant}
        />
        {node.children.length > 0 && depth < maxDepth && (
          <TreeChildrenBlock
            nodes={node.children}
            headers={headers}
            renderCell={renderCell}
            depth={depth + 1}
            maxDepth={maxDepth}
            showParentStem={false}
          />
        )}
      </div>
    </li>
  );
}

function TreeChildrenBlock({
  nodes,
  headers,
  renderCell,
  depth,
  maxDepth,
  showParentStem,
}: {
  nodes: TableTreeNode[];
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  depth: number;
  maxDepth: number;
  showParentStem: boolean;
}): React.ReactElement {
  return (
    <div className="relative mt-1.5 min-w-0 sm:mt-2">
      {showParentStem && <TreeParentStem />}
      <ul
        className="relative z-[1] m-0 list-none p-0"
        data-tree-children=""
        data-depth={depth}
      >
        {nodes.map((node, index) => (
          <TreeSubtreeRow
            key={node.id}
            node={node}
            index={index}
            siblingCount={nodes.length}
            headers={headers}
            renderCell={renderCell}
            depth={depth}
            maxDepth={maxDepth}
          />
        ))}
      </ul>
    </div>
  );
}

function TreeRootBlock({
  node,
  headers,
  renderCell,
  maxDepth,
}: {
  node: TableTreeNode;
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  maxDepth: number;
}): React.ReactElement {
  return (
    <li className="list-none" data-tree-root="">
      <TreeNodePanel
        node={node}
        headers={headers}
        renderCell={renderCell}
        variant="root"
      />
      {node.children.length > 0 && maxDepth > 0 && (
        <TreeChildrenBlock
          nodes={node.children}
          headers={headers}
          renderCell={renderCell}
          depth={1}
          maxDepth={maxDepth}
          showParentStem
        />
      )}
    </li>
  );
}

const DEFAULT_MAX_DEPTH = 32;

export function TreeTableRenderer({
  table,
  headers,
  index,
  renderCell,
}: {
  table: TableItem;
  headers: string[];
  index: number;
  renderCell: (cell: unknown) => React.ReactNode;
}): React.ReactElement {
  const roots = buildTreeTableModel(table.rows);
  const effectiveHeaders = headers.length > 0 ? headers : ["名称"];

  return (
    <div
      key={index}
      className="tree-table-renderer my-4 w-full max-w-full overflow-x-hidden"
      data-table-display="tree"
    >
      <ul className="m-0 list-none space-y-5 p-0 sm:space-y-6">
        {roots.map((node) => (
          <TreeRootBlock
            key={node.id}
            node={node}
            headers={effectiveHeaders}
            renderCell={renderCell}
            maxDepth={DEFAULT_MAX_DEPTH}
          />
        ))}
      </ul>
      {table.citations && table.citations.length > 0 && (
        <div className="mt-2">
          <Citation citations={table.citations} />
        </div>
      )}
    </div>
  );
}
