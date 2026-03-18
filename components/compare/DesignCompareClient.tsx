"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type React from "react";

type ComparisonField = { id: string; label: string };

type ComparisonAxis = {
  id: string;
  label: string;
  order?: number;
  value_type?: string;
  fields?: ComparisonField[];
};

type ComparisonItem = {
  id: string;
  name: string;
  short_name?: string;
  order?: number;
  links?: { detail_page?: string };
  values?: Record<string, unknown>;
};

type ComparisonMeta = {
  title?: string;
  description?: string;
  default_selected_ids?: string[];
  default_axis?: string;
};

export type DesignComparisonData = {
  meta?: ComparisonMeta;
  axes: ComparisonAxis[];
  items: ComparisonItem[];
};

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

function renderCellValue(val: unknown): React.ReactNode {
  if (val == null) return "—";
  if (typeof val === "string") return val;
  if (isStringArray(val)) {
    if (val.length === 0) return "—";
    return (
      <ul className="list-disc pl-5 space-y-1">
        {val.map((s, i) => (
          <li key={i} className="leading-6">
            {s}
          </li>
        ))}
      </ul>
    );
  }
  return typeof val === "number" || typeof val === "boolean" ? String(val) : "—";
}

function getItemLabel(it: ComparisonItem): string {
  return (it.short_name && it.short_name.trim() !== "" ? it.short_name : it.name) ?? it.id;
}

export function DesignCompareClient({ data }: { data: DesignComparisonData }) {
  const axes = useMemo(() => {
    return [...(data.axes ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [data.axes]);

  const items = useMemo(() => {
    return [...(data.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [data.items]);

  const defaultSelectedIds = useMemo(() => {
    const fromMeta = data.meta?.default_selected_ids;
    if (Array.isArray(fromMeta) && fromMeta.length > 0) return fromMeta;
    return items.map((it) => it.id);
  }, [data.meta?.default_selected_ids, items]);

  const defaultAxisId = useMemo(() => {
    const metaAxis = data.meta?.default_axis;
    const firstAxis = axes[0]?.id;
    return (metaAxis && axes.some((a) => a.id === metaAxis) ? metaAxis : firstAxis) ?? "";
  }, [data.meta?.default_axis, axes]);

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds);
  const [selectedAxisId, setSelectedAxisId] = useState<string>(defaultAxisId);

  const selectedAxis = useMemo(
    () => axes.find((a) => a.id === selectedAxisId) ?? null,
    [axes, selectedAxisId]
  );

  const selectedItems = useMemo(() => {
    const set = new Set(selectedIds);
    return items.filter((it) => set.has(it.id));
  }, [items, selectedIds]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return items.filter((it) => set.has(it.id)).map((it) => it.id);
    });
  };

  const reset = () => {
    setSelectedIds(defaultSelectedIds);
    setSelectedAxisId(defaultAxisId);
  };

  const hasFields = (selectedAxis?.fields?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
          レンズ構成型比較
        </h1>
        <p className="mt-2 text-[15px] text-gray-600">
          比較対象と比較軸を選ぶと、構成型ごとの差異を一覧で確認できます。
        </p>
      </header>

      {/* controls */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* multi-select dropdown */}
            <div className="min-w-[220px]">
              <div className="mb-1 text-xs font-medium text-gray-600">
                比較対象（{selectedItems.length}件選択中）
              </div>
              <details className="group rounded-lg border border-gray-200 bg-gray-50/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm text-gray-800">
                  <span className="truncate">
                    {selectedItems.length === 0
                      ? "未選択"
                      : selectedItems.length === items.length
                        ? "すべて"
                        : selectedItems.map(getItemLabel).join(" / ")}
                  </span>
                  <span
                    className="shrink-0 text-gray-500 transition-transform duration-150 group-open:rotate-180"
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </summary>
                <div className="border-t border-gray-200 bg-white p-2">
                  <div className="max-h-64 overflow-auto">
                    {items.map((it) => {
                      const checked = selectedIds.includes(it.id);
                      return (
                        <label
                          key={it.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleId(it.id)}
                            className="h-4 w-4 accent-[#7D9CD4]"
                          />
                          <span className="truncate">{getItemLabel(it)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </details>
            </div>

            {/* axis select */}
            <div className="min-w-[220px]">
              <div className="mb-1 text-xs font-medium text-gray-600">比較軸</div>
              <select
                value={selectedAxisId}
                onChange={(e) => setSelectedAxisId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7D9CD4]/35"
              >
                {axes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              リセット
            </button>
          </div>
        </div>
      </div>

      {/* results */}
      {selectedItems.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          比較対象を1つ以上選択してください。
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-800">
              {selectedAxis?.label ?? "—"}
            </div>
          </div>

          <div className="overflow-x-auto">
            {hasFields ? (
              <table className="min-w-[720px] w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 z-10 w-40 border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      項目
                    </th>
                    {selectedItems.map((it) => (
                      <th
                        key={it.id}
                        className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-800">{getItemLabel(it)}</span>
                          {it.links?.detail_page && (
                            <Link
                              href={it.links.detail_page}
                              className="text-[11px] text-[#7D9CD4] no-underline hover:no-underline hover:text-[#5E7AB8]"
                            >
                              詳細
                            </Link>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selectedAxis?.fields ?? []).map((f, ri) => (
                    <tr key={f.id} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                      <td className="sticky left-0 z-10 w-40 border-b border-gray-100 bg-inherit px-3 py-3 align-top text-sm font-medium text-gray-800">
                        {f.label}
                      </td>
                      {selectedItems.map((it) => {
                        const axisValues =
                          (it.values?.[selectedAxisId] as Record<string, unknown> | undefined) ?? undefined;
                        const val = axisValues?.[f.id];
                        return (
                          <td
                            key={`${it.id}-${f.id}`}
                            className="border-b border-gray-100 px-3 py-3 align-top text-gray-700 leading-6"
                          >
                            {renderCellValue(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-[720px] w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-64 border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      構成型
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      内容
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((it, i) => {
                    const val = it.values?.[selectedAxisId];
                    return (
                      <tr key={it.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                        <td className="border-b border-gray-100 px-3 py-3 align-top font-medium text-gray-800">
                          <div className="flex items-baseline gap-2">
                            <span>{getItemLabel(it)}</span>
                            {it.links?.detail_page && (
                              <Link
                                href={it.links.detail_page}
                                className="text-[11px] text-[#7D9CD4] no-underline hover:no-underline hover:text-[#5E7AB8]"
                              >
                                詳細
                              </Link>
                            )}
                          </div>
                        </td>
                        <td className="border-b border-gray-100 px-3 py-3 align-top text-gray-700 leading-6">
                          {renderCellValue(val)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

