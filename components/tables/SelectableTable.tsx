"use client";

import React, { useState, useCallback } from "react";
import type { TableRowInput, TableCellValue, ListItem } from "../../types/hybridContent";
import { getTableRowCells, getTableRowCitations } from "../../lib/tableRowCells";
import { Citation } from "../Citation";
import { FilterDropdown } from "../FilterDropdown";

interface SelectableTableProps {
  headers: string[];
  rows: TableRowInput[];
  alwaysVisibleHeaders: string[];
  selectableHeaders: string[];
  citations?: number[];
  /** TableItem.display をそのまま渡す。"timeline" のとき年表レイアウトで描画 */
  display?: string;
  /** true のとき selectableHeaders の初期選択をすべて未選択にする */
  initialEmpty?: boolean;
}

function isListCell(val: unknown): val is ListItem {
  return (
    typeof val === "object" &&
    val != null &&
    "type" in val &&
    (val as ListItem).type === "list"
  );
}

function renderCellContent(cell: TableCellValue | undefined): React.ReactNode {
  if (cell == null) return null;
  if (typeof cell === "string") {
    return <span className="whitespace-pre-line">{cell}</span>;
  }
  if (Array.isArray(cell)) {
    return (
      <div className="flex flex-col gap-1">
        {cell.map((item, i) => (
          <React.Fragment key={i}>{renderCellContent(item)}</React.Fragment>
        ))}
      </div>
    );
  }
  if (isListCell(cell)) {
    const entries =
      Array.isArray(cell.items) ? cell.items :
      Array.isArray(cell.entries) ? cell.entries :
      Array.isArray(cell.bullets) ? cell.bullets :
      Array.isArray(cell.text) ? cell.text :
      [];
    return (
      <ul className="list-disc pl-4 space-y-0.5 text-[13px]">
        {entries.map((entry, i) => (
          <li key={i} className="whitespace-pre-line">{String(entry)}</li>
        ))}
      </ul>
    );
  }
  // ImageItem など
  return <span className="text-gray-400 text-xs">[画像]</span>;
}

export function SelectableTable({
  headers,
  rows,
  alwaysVisibleHeaders,
  selectableHeaders,
  citations,
  display,
  initialEmpty,
}: SelectableTableProps) {
  const [selectedHeaders, setSelectedHeaders] = useState<Set<string>>(
    () => new Set(initialEmpty ? [] : selectableHeaders)
  );
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleHeader = useCallback((header: string) => {
    setSelectedHeaders((prev) => {
      const next = new Set(prev);
      if (next.has(header)) {
        next.delete(header);
      } else {
        next.add(header);
      }
      return next;
    });
    setExpandedRows(new Set());
  }, []);

  const toggleRow = useCallback((rowIndex: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  }, []);

  const hiddenSelectableHeaders = selectableHeaders.filter(
    (h) => !selectedHeaders.has(h)
  );
  const hasHiddenColumns = hiddenSelectableHeaders.length > 0;

  /** 既存の FilterDropdown を使った列選択プルダウン */
  const columnSelector =
    selectableHeaders.length > 0 ? (
      <div className="mb-3 inline-block">
        <FilterDropdown
          label="表示する列"
          options={selectableHeaders}
          selected={selectedHeaders}
          onToggle={toggleHeader}
          multiple={true}
        />
      </div>
    ) : null;

  // ── timeline モード ──────────────────────────────────────────────
  if (display === "timeline") {
    // 年列: alwaysVisibleHeaders の先頭（"年"相当）
    const yearHeader = alwaysVisibleHeaders[0];
    const yearIndex = headers.indexOf(yearHeader);

    // カード内に常時表示するヘッダー: alwaysVisible（年を除く）
    const alwaysCardHeaders = alwaysVisibleHeaders.filter((h) => h !== yearHeader);

    // カード内に選択表示するヘッダー: 選択中の selectable
    const selectedCardHeaders = headers.filter(
      (h) =>
        selectableHeaders.includes(h) && selectedHeaders.has(h)
    );

    const cardHeaders = headers.filter(
      (h) => alwaysCardHeaders.includes(h) || selectedCardHeaders.includes(h)
    );

    return (
      <div className="my-4">
        {columnSelector}
        {/* 縦線は rows 全体に1本 */}
        <div className="relative space-y-4">
          <div className="pointer-events-none absolute inset-y-0 left-[51px] w-px bg-gray-200 z-0" />
          {rows.map((row, ri) => {
            const cells = getTableRowCells(row);
            const rowCitations = getTableRowCitations(row);
            const isExpanded = expandedRows.has(ri);

            const yearCell = yearIndex >= 0 ? cells[yearIndex] : cells[0];

            const hiddenCells = hiddenSelectableHeaders
              .map((h) => ({ header: h, cell: cells[headers.indexOf(h)] }))
              .filter(({ cell }) => {
                if (cell == null) return false;
                if (typeof cell === "string" && cell.trim() === "") return false;
                return true;
              });
            const rowHasHidden = hiddenCells.length > 0;

            return (
              <div key={ri} className="grid grid-cols-[50px_18px_1fr] gap-x-0.5">
                {/* 年 */}
                <div className="text-[13px] font-medium text-gray-800 whitespace-pre-line">
                  {renderCellContent(yearCell)}
                </div>

                {/* 円点 */}
                <div className="relative flex justify-center -translate-x-[10px]">
                  <div className="mt-1 h-3 w-3 rounded-full bg-white border-2 border-[#7D9CD4] z-10" />
                </div>

                {/* カード */}
                <div className="relative -left-1 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <div className="space-y-2">
                    {cardHeaders.map((h) => {
                      const cell = cells[headers.indexOf(h)];
                      const isEmpty =
                        cell == null ||
                        (typeof cell === "string" && cell.trim() === "");
                      if (isEmpty) return null;
                      return (
                        <div key={h} className="space-y-1">
                          <div className="text-[11px] font-medium text-gray-500">
                            {h}
                          </div>
                          <div className="text-[13px] text-gray-800 leading-6 break-words">
                            {renderCellContent(cell)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 詳細ボタン */}
                  {rowHasHidden && (
                    <button
                      onClick={() => toggleRow(ri)}
                      className="mt-2 rounded px-2 py-0.5 text-xs text-[#5E7AB8] border border-[#7D9CD4]/40 hover:bg-[#7D9CD4]/10 transition-colors"
                    >
                      {isExpanded ? "閉じる" : "詳細"}
                    </button>
                  )}

                  {/* 展開エリア */}
                  {isExpanded && rowHasHidden && (
                    <div className="mt-2 space-y-2 rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
                      {hiddenCells.map(({ header, cell }) => (
                        <div key={header} className="space-y-1">
                          <div className="text-[11px] font-medium text-gray-500">
                            {header}
                          </div>
                          <div className="text-[13px] text-gray-800 leading-6 break-words">
                            {renderCellContent(cell)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {rowCitations.length > 0 && (
                    <div className="mt-1">
                      <Citation citations={rowCitations} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {citations && citations.length > 0 && (
          <div className="mt-2">
            <Citation citations={citations} />
          </div>
        )}
      </div>
    );
  }

  // ── 通常テーブルモード（display !== "timeline"）──────────────────
  const visibleHeaders = headers.filter(
    (h) =>
      alwaysVisibleHeaders.includes(h) ||
      (selectableHeaders.includes(h) && selectedHeaders.has(h))
  );

  return (
    <div className="my-4">
      {columnSelector}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded overflow-hidden text-[13px]">
          <thead>
            <tr className="bg-gray-50">
              {visibleHeaders.map((h, i) => (
                <th
                  key={i}
                  className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
              {hasHiddenColumns && (
                <th className="w-16 border-b border-gray-200 px-2 py-2" />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const cells = getTableRowCells(row);
              const rowCitations = getTableRowCitations(row);
              const isExpanded = expandedRows.has(ri);

              const hiddenCells = hiddenSelectableHeaders
                .map((h) => ({ header: h, cell: cells[headers.indexOf(h)] }))
                .filter(({ cell }) => {
                  if (cell == null) return false;
                  if (typeof cell === "string" && cell.trim() === "") return false;
                  return true;
                });
              const rowHasHidden = hiddenCells.length > 0;

              return (
                <React.Fragment key={ri}>
                  <tr className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    {visibleHeaders.map((h, ci) => {
                      const cell = cells[headers.indexOf(h)];
                      const isLast = ci === visibleHeaders.length - 1;
                      return (
                        <td
                          key={ci}
                          className="border-b border-gray-100 px-3 py-2 text-[13px] text-gray-700 break-words align-top"
                        >
                          {renderCellContent(cell)}
                          {isLast &&
                            rowCitations.length > 0 &&
                            !hasHiddenColumns && (
                              <div className="mt-1">
                                <Citation citations={rowCitations} />
                              </div>
                            )}
                        </td>
                      );
                    })}
                    {hasHiddenColumns && (
                      <td className="w-16 border-b border-gray-100 px-2 py-2 align-top">
                        {rowHasHidden ? (
                          <button
                            onClick={() => toggleRow(ri)}
                            className="rounded px-2 py-1 text-xs text-[#5E7AB8] border border-[#7D9CD4]/40 hover:bg-[#7D9CD4]/10 transition-colors whitespace-nowrap"
                          >
                            {isExpanded ? "閉じる" : "詳細"}
                          </button>
                        ) : null}
                        {!rowHasHidden && rowCitations.length > 0 && (
                          <div className="mt-1">
                            <Citation citations={rowCitations} />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                  {isExpanded && rowHasHidden && (
                    <tr className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td
                        colSpan={visibleHeaders.length + (hasHiddenColumns ? 1 : 0)}
                        className="border-b border-gray-100 px-3 py-3"
                      >
                        <div className="space-y-2 rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
                          {hiddenCells.map(({ header, cell }) => (
                            <div key={header} className="flex gap-2 text-[13px]">
                              <span className="shrink-0 font-medium text-gray-500 min-w-[5rem]">
                                {header}：
                              </span>
                              <span className="text-gray-700 break-words">
                                {renderCellContent(cell)}
                              </span>
                            </div>
                          ))}
                          {rowCitations.length > 0 && (
                            <div className="mt-1">
                              <Citation citations={rowCitations} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {citations && citations.length > 0 && (
        <div className="mt-2">
          <Citation citations={citations} />
        </div>
      )}
    </div>
  );
}
