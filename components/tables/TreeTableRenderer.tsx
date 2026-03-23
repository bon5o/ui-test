import React from "react";
import Link from "next/link";
import type { TableItem } from "@/types/hybridContent";
import type { TableTreeNode } from "@/lib/buildTreeTable";
import { buildTreeTableModel } from "@/lib/buildTreeTable";
import {
  parseTreeNodeColumns,
  treeHeadersHaveYearColumn,
  type TreeNodeSupplementaryRow,
} from "@/lib/parseTreeTableNode";
import { Citation } from "@/components/Citation";

/** ノード見出し行と横枝の交点（px）。コンパクトカードと揃える */
const TREE_ELBOW_Y_PX = 13;
const TREE_LINE = "bg-[#7D9CD4]/25";
const TREE_AXIS_LEFT = "left-[7px]";
const TREE_CONNECTOR_WIDTH = "w-4 sm:w-[18px]";
/**
 * 左側3領域: [枝線][年代列][カード]
 * - 年代は列内左寄せ、右 padding でカードとの呼吸感を確保
 * - 列は w-max + min-w で 4 桁・「1890年代」程度が 1 行に収まる幅を確保（ラベルは whitespace-nowrap）
 */
const TREE_YEAR_LANE_WIDTH =
  "flex w-max min-w-[3.4rem] max-w-[7rem] shrink-0 sm:min-w-[3.8rem] sm:max-w-[7.2rem]";
const TREE_YEAR_LANE_PAD_LEFT = "pl-0 sm:pl-0.5";
const TREE_YEAR_LANE_PAD_RIGHT = "pr-2.5 sm:pr-3.5";

/** 全 tree ノードカード共通（白・影なし・同一パディング）。ルートは枠色だけ差す */
const TREE_CARD_PADDING =
  "py-2 pl-2.5 pr-2.5 sm:py-2 sm:pl-3 sm:pr-3";
const TREE_CARD_BASE = `min-w-0 rounded-md border bg-white ${TREE_CARD_PADDING}`;
const TREE_CARD_BORDER = "border-gray-200/90";
const TREE_CARD_BORDER_ROOT = "border-gray-300/80";
const TREE_CARD_HOVER =
  "transition-colors duration-150 ease-out hover:border-[#7D9CD4]/40";
/** セル内の画像 figure がカードをはみ出さないよう制御 */
const TREE_CARD_MEDIA =
  "[&_figure]:mx-0 [&_figure]:mt-0 [&_figure]:mb-1.5 [&_figure]:max-w-full [&_figure]:bg-white [&_figure]:border-gray-200/80 [&_figure]:p-1.5 [&_figure]:last:mb-0";
/** 名称行: 全深度・ルートとも同一（通常ウェイト）。ルートの強調は枠色のみ */
const TREE_TITLE = "text-[15px] font-normal leading-snug text-gray-900";
const MOBILE_TREE_CARD_MEDIA =
  "[&_figure]:mx-auto [&_figure]:mt-0 [&_figure]:mb-1.5 [&_figure]:max-w-[12.5rem] [&_figure]:bg-white [&_figure]:border-gray-200/80 [&_figure]:p-1 [&_figure]:last:mb-0";

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

type PanelVariant = "root" | "child" | "grandchild";

/** 枝の肘付近に寄せた小さな年代ラベル（カード外） */
function TreeYearLane({
  cell,
  renderCell,
  hasYearColumn,
  laneAlign,
}: {
  cell: unknown;
  renderCell: (cell: unknown) => React.ReactNode;
  hasYearColumn: boolean;
  laneAlign: "root" | "child";
}): React.ReactElement | null {
  if (!hasYearColumn) return null;

  /** カードの pt-2 と揃える / 子行は枝の肘付近に合わせる */
  const ptClass =
    laneAlign === "root" ? "pt-2 sm:pt-2" : "pt-[11px] sm:pt-3";

  const showContent =
    cell != null &&
    !(typeof cell === "string" && cell.trim() === "");

  return (
    <div
      className={`${TREE_YEAR_LANE_WIDTH} flex-col items-start ${ptClass} pb-0.5 ${TREE_YEAR_LANE_PAD_LEFT} ${TREE_YEAR_LANE_PAD_RIGHT} text-left`}
      data-tree-year-lane=""
      aria-hidden={!showContent}
    >
      {showContent ? (
        <span className="inline-block max-w-full whitespace-nowrap text-left text-[13px] font-normal leading-none text-gray-500 tabular-nums sm:text-[13px] sm:leading-none [&_*]:whitespace-nowrap [&_*]:text-[length:inherit] [&_*]:leading-none">
          {typeof cell === "string" ? cell : renderCell(cell)}
        </span>
      ) : (
        <span className="inline-block min-h-[1em] w-px shrink-0" aria-hidden />
      )}
    </div>
  );
}

function TreeNodePanel({
  node,
  titleCell,
  supplementary,
  renderCell,
  variant,
}: {
  node: TableTreeNode;
  titleCell: unknown;
  supplementary: TreeNodeSupplementaryRow[];
  renderCell: (cell: unknown) => React.ReactNode;
  variant: PanelVariant;
}): React.ReactElement {
  const titleClasses = TREE_TITLE;

  const borderClass =
    variant === "root" ? TREE_CARD_BORDER_ROOT : TREE_CARD_BORDER;
  const shellClasses = `${TREE_CARD_BASE} ${borderClass} ${TREE_CARD_MEDIA}`;

  const inner = (
    <>
      <div
        className={`${titleClasses} font-normal [&_*]:font-normal ${node.href ? "group-hover/tree-node:decoration-[#7D9CD4]/45 underline decoration-transparent underline-offset-2" : ""}`}
        data-tree-title
      >
        {titleCell != null ? (
          renderCell(titleCell)
        ) : (
          <span className="font-normal text-gray-400">（無題）</span>
        )}
      </div>
      {supplementary.map(({ label, cell }, i) => {
        const empty =
          cell == null || (typeof cell === "string" && cell.trim() === "");
        if (empty) return null;
        return (
          <div
            key={`${label}-${i}`}
            className="flex flex-col gap-y-0.5 sm:flex-row sm:items-baseline sm:gap-x-2"
          >
            <span className="shrink-0 text-[10px] font-normal text-gray-400 sm:w-[4.5rem] sm:text-[10.5px]">
              {label}
            </span>
            <div className="min-w-0 text-[12px] leading-snug text-gray-600 sm:text-[12.5px] sm:leading-snug">
              {renderCell(cell)}
            </div>
          </div>
        );
      })}
      {node.citations.length > 0 && (
        <div className="pt-1.5">
          <Citation citations={node.citations} />
        </div>
      )}
    </>
  );

  const panelClass = `group/tree-node space-y-1 ${shellClasses} ${TREE_CARD_HOVER}`;

  const linkExtra =
    "block min-w-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D9CD4]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

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
      className={`relative ${TREE_CONNECTOR_WIDTH} shrink-0 self-stretch`}
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
        className={`absolute ${TREE_AXIS_LEFT} h-px w-[9px] sm:w-[10px] ${TREE_LINE}`}
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
  hasYearColumn,
}: {
  node: TableTreeNode;
  index: number;
  siblingCount: number;
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  depth: number;
  maxDepth: number;
  hasYearColumn: boolean;
}): React.ReactElement {
  const isLast = index === siblingCount - 1;
  const childVariant: PanelVariant =
    depth <= 1 ? "child" : "grandchild";
  const parsed = parseTreeNodeColumns(headers, node.cells);

  return (
    <li
      className="flex min-w-0 gap-0"
      data-tree-node=""
      data-depth={depth}
      data-node-id={node.id}
    >
      <TreeBranchConnector isLastSibling={isLast} />
      <TreeYearLane
        cell={parsed.externalYearCell}
        renderCell={renderCell}
        hasYearColumn={hasYearColumn}
        laneAlign="child"
      />
      <div className="min-w-0 flex-1 pb-2 sm:pb-2.5">
        <TreeNodePanel
          node={node}
          titleCell={parsed.titleCell}
          supplementary={parsed.supplementary}
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
            hasYearColumn={hasYearColumn}
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
  hasYearColumn,
}: {
  nodes: TableTreeNode[];
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  depth: number;
  maxDepth: number;
  showParentStem: boolean;
  hasYearColumn: boolean;
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
            hasYearColumn={hasYearColumn}
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
  hasYearColumn,
}: {
  node: TableTreeNode;
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  maxDepth: number;
  hasYearColumn: boolean;
}): React.ReactElement {
  const parsed = parseTreeNodeColumns(headers, node.cells);

  return (
    <li className="list-none" data-tree-root="">
      <div className="flex min-w-0 gap-0">
        {hasYearColumn && (
          <div
            className={`${TREE_CONNECTOR_WIDTH} shrink-0 self-stretch`}
            aria-hidden
          />
        )}
        <TreeYearLane
          cell={parsed.externalYearCell}
          renderCell={renderCell}
          hasYearColumn={hasYearColumn}
          laneAlign="root"
        />
        <div className="min-w-0 flex-1 pb-2 sm:pb-2.5">
          <TreeNodePanel
            node={node}
            titleCell={parsed.titleCell}
            supplementary={parsed.supplementary}
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
              hasYearColumn={hasYearColumn}
            />
          )}
        </div>
      </div>
    </li>
  );
}

const DEFAULT_MAX_DEPTH = 32;
const MOBILE_INDENT_STEP = 10;
const MOBILE_INDENT_MAX = 28;

function pickMobileSupplementary(
  rows: TreeNodeSupplementaryRow[]
): {
  featureRow: TreeNodeSupplementaryRow | null;
  otherRows: TreeNodeSupplementaryRow[];
} {
  const filled = rows.filter(({ cell }) => {
    return !(cell == null || (typeof cell === "string" && cell.trim() === ""));
  });
  const featureIdx = filled.findIndex(({ label }) => label === "特徴");
  if (featureIdx < 0) return { featureRow: null, otherRows: filled };
  return {
    featureRow: filled[featureIdx],
    otherRows: filled.filter((_, i) => i !== featureIdx),
  };
}

function MobileTreeNode({
  node,
  headers,
  renderCell,
  depth,
  maxDepth,
  isLastSibling,
}: {
  node: TableTreeNode;
  headers: string[];
  renderCell: (cell: unknown) => React.ReactNode;
  depth: number;
  maxDepth: number;
  isLastSibling: boolean;
}): React.ReactElement {
  const parsed = parseTreeNodeColumns(headers, node.cells);
  const { featureRow, otherRows } = pickMobileSupplementary(parsed.supplementary);
  const padLeft = Math.min(depth * MOBILE_INDENT_STEP, MOBILE_INDENT_MAX);
  const showConnector = depth > 0;

  return (
    <li className="list-none" style={{ paddingLeft: `${padLeft}px` }}>
      <div className="flex min-w-0 gap-0.5">
        {showConnector ? (
          <div className="relative w-4 shrink-0 self-stretch pointer-events-none" aria-hidden>
            {!isLastSibling ? (
              <div className={`absolute ${TREE_AXIS_LEFT} top-0 bottom-0 w-px ${TREE_LINE}`} />
            ) : (
              <div
                className={`absolute ${TREE_AXIS_LEFT} top-0 w-px ${TREE_LINE}`}
                style={{ height: TREE_ELBOW_Y_PX }}
              />
            )}
            <div
              className={`absolute ${TREE_AXIS_LEFT} h-px w-[10px] ${TREE_LINE}`}
              style={{ top: TREE_ELBOW_Y_PX }}
            />
          </div>
        ) : (
          <div className="w-4 shrink-0" aria-hidden />
        )}

        <article
          className={`min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2.5 ${MOBILE_TREE_CARD_MEDIA}`}
          data-mobile-tree-node=""
          data-depth={depth}
        >
          {parsed.externalYearCell != null &&
            !(typeof parsed.externalYearCell === "string" && parsed.externalYearCell.trim() === "") && (
              <div className="mb-1 text-[11px] leading-none text-gray-500 tabular-nums">
                {renderCell(parsed.externalYearCell)}
              </div>
            )}

          <div className="text-[15px] font-normal leading-snug text-gray-900 [&_*]:font-normal">
            {parsed.titleCell != null ? (
              renderCell(parsed.titleCell)
            ) : (
              <span className="font-normal text-gray-400">（無題）</span>
            )}
          </div>

          {featureRow != null && (
            <div className="mt-2 space-y-0.5">
              <div className="text-[10px] font-normal text-gray-400">{featureRow.label}</div>
              <div className="text-[12px] leading-snug text-gray-700">
                {renderCell(featureRow.cell)}
              </div>
            </div>
          )}

          {otherRows.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] text-gray-500">詳細</summary>
              <div className="mt-1.5 space-y-1.5">
                {otherRows.map(({ label, cell }, i) => (
                  <div key={`${label}-${i}`} className="space-y-0.5">
                    <div className="text-[10px] font-normal text-gray-400">{label}</div>
                    <div className="text-[12px] leading-snug text-gray-700">
                      {renderCell(cell)}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {node.citations.length > 0 && (
            <div className="mt-2">
              <Citation citations={node.citations} />
            </div>
          )}
        </article>
      </div>

      {node.children.length > 0 && depth < maxDepth && (
        <ul className="mt-2 space-y-2 p-0">
          {node.children.map((child, index) => (
            <MobileTreeNode
              key={child.id}
              node={child}
              headers={headers}
              renderCell={renderCell}
              depth={depth + 1}
              maxDepth={maxDepth}
              isLastSibling={index === node.children.length - 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

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
  const hasYearColumn = treeHeadersHaveYearColumn(effectiveHeaders);

  return (
    <div
      key={index}
      className="tree-table-renderer my-4 w-full max-w-full"
      data-table-display="tree"
    >
      <div className="hidden md:block">
        <ul className="m-0 list-none space-y-5 p-0 sm:space-y-5">
          {roots.map((node) => (
            <TreeRootBlock
              key={node.id}
              node={node}
              headers={effectiveHeaders}
              renderCell={renderCell}
              maxDepth={DEFAULT_MAX_DEPTH}
              hasYearColumn={hasYearColumn}
            />
          ))}
        </ul>
        {table.citations && table.citations.length > 0 && (
          <div className="mt-2">
            <Citation citations={table.citations} />
          </div>
        )}
      </div>

      <div className="md:hidden">
        <ul className="m-0 list-none space-y-2.5 p-0">
          {roots.map((node) => (
            <MobileTreeNode
              key={node.id}
              node={node}
              headers={effectiveHeaders}
              renderCell={renderCell}
              depth={0}
              maxDepth={DEFAULT_MAX_DEPTH}
              isLastSibling
            />
          ))}
        </ul>
        {table.citations && table.citations.length > 0 && (
          <div className="mt-2">
            <Citation citations={table.citations} />
          </div>
        )}
      </div>
    </div>
  );
}
