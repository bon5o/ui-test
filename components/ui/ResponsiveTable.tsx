"use client";

import React from "react";

interface ResponsiveTableProps {
  children: React.ReactNode;
  /** ラッパーに付与する追加クラス（例: my-4） */
  className?: string;
}

/**
 * モバイルで横スクロール可能なテーブルラッパー。
 * - 狭い画面では overflow-x で横スクロール
 * - iOS でスムーズなスクロール（-webkit-overflow-scrolling: touch）
 * - テーブルは min-w-max で列の潰れを防止
 */
export function ResponsiveTable({
  children,
  className = "",
}: ResponsiveTableProps): React.ReactElement {
  return (
    <div
      className={`min-w-0 w-full max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

interface ResponsiveTableRootProps {
  children: React.ReactNode;
  /** テーブルに付与する追加クラス */
  tableClassName?: string;
}

/**
 * ラッパー + table をまとめたコンポーネント。
 * table には min-w-max を付与して列が潰れないようにする。
 */
export function ResponsiveTableRoot({
  children,
  tableClassName = "",
}: ResponsiveTableRootProps): React.ReactElement {
  return (
    <ResponsiveTable className="my-4">
      <table
        className={`min-w-max w-full border border-gray-200 rounded overflow-hidden text-sm ${tableClassName}`.trim()}
      >
        {children}
      </table>
    </ResponsiveTable>
  );
}
