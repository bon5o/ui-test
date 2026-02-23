"use client";

import React from "react";

export type ResponsiveTableCardCell = {
  label: React.ReactNode;
  value: React.ReactNode;
};

export type ResponsiveTableCardRow = {
  cells: ResponsiveTableCardCell[];
};

interface ResponsiveTableCardsProps {
  /** カード群のタイトル（任意） */
  title?: string;
  /** 1行=1カードのデータ */
  rows: ResponsiveTableCardRow[];
  className?: string;
}

/**
 * モバイル(md未満)でテーブルを「横長カード」表示に切り替えるコンポーネント。
 * - md未満: 1行=1カードの縦並び
 * - 呼び出し側で table を hidden md:block にして並置する
 */
export function ResponsiveTableCards({
  title,
  rows,
  className = "",
}: ResponsiveTableCardsProps): React.ReactElement {
  if (rows.length === 0) return <></>;

  return (
    <div className={`md:hidden space-y-3 ${className}`.trim()}>
      {title && (
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      )}
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="space-y-3">
            {row.cells.map((cell, ci) => (
              <div
                key={ci}
                className="flex items-start justify-between gap-3"
              >
                <div className="min-w-0 shrink-0 text-sm font-medium text-gray-900 whitespace-normal break-words">
                  {cell.label}
                </div>
                <div className="min-w-0 flex-1 text-right text-sm text-gray-700 whitespace-normal break-words">
                  {cell.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
