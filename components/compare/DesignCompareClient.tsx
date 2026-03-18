"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";

type ComparisonField = { id: string; label: string };

type ComparisonAxis = {
  id: string;
  label: string;
  order?: number;
  value_type?: string;
  fields?: ComparisonField[];
  description?: string;
};

type UiAxis = {
  id: string;
  label: string;
  order: number;
  description?: string;
  kind: "data" | "pros_cons";
  dataAxisId?: string;
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
  // 将来 default_axes が追加されても対応しやすいよう任意で持つ
  default_axes?: string[];
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

function useDismiss(
  isOpen: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>
) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      const inside = refs.some((r) => (r.current ? r.current.contains(target) : false));
      if (!inside) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as never);
    };
  }, [isOpen, onClose, refs]);
}

export function DesignCompareClient({ data }: { data: DesignComparisonData }) {
  const axes = useMemo(() => {
    return [...(data.axes ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [data.axes]);

  // UI表示用の軸: pros/cons を 1つの「メリット/デメリット」に統合
  const uiAxes = useMemo((): UiAxis[] => {
    const pros = axes.find((a) => a.id === "pros");
    const cons = axes.find((a) => a.id === "cons");
    const base: UiAxis[] = axes
      .filter((a) => a.id !== "pros" && a.id !== "cons")
      .map((a) => ({
        id: a.id,
        label: a.label,
        order: a.order ?? 0,
        description: a.description,
        kind: "data" as const,
        dataAxisId: a.id,
      }));

    // pros/cons がどちらか存在する場合のみ統合軸を出す
    if (pros || cons) {
      const order = Math.min(pros?.order ?? 9999, cons?.order ?? 9999);
      base.push({
        id: "pros_cons",
        label: "メリット/デメリット",
        order: Number.isFinite(order) ? order : 9999,
        kind: "pros_cons",
      });
    }

    return base.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "ja"));
  }, [axes]);

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
  // 初期状態は「表示用軸」を全選択（pros/cons は pros_cons 1軸として数える）
  const defaultUiAxisIds = useMemo(() => uiAxes.map((a) => a.id), [uiAxes]);
  const [selectedUiAxisIds, setSelectedUiAxisIds] = useState<string[]>(defaultUiAxisIds);

  const selectedUiAxes = useMemo(() => {
    const set = new Set(selectedUiAxisIds);
    return uiAxes.filter((a) => set.has(a.id));
  }, [uiAxes, selectedUiAxisIds]);

  const hasProsData = axes.some((a) => a.id === "pros");
  const hasConsData = axes.some((a) => a.id === "cons");

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

  const toggleAxisId = (id: string) => {
    setSelectedUiAxisIds((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      // UI軸の順序に合わせて並べ直す
      return uiAxes.filter((a) => set.has(a.id)).map((a) => a.id);
    });
  };

  const reset = () => {
    setSelectedIds(defaultSelectedIds);
    setSelectedUiAxisIds(defaultUiAxisIds);
  };

  // overlay dropdown states
  const [itemsOpen, setItemsOpen] = useState(false);
  const [axesOpen, setAxesOpen] = useState(false);
  const itemsWrapRef = useRef<HTMLDivElement | null>(null);
  const axesWrapRef = useRef<HTMLDivElement | null>(null);
  useDismiss(itemsOpen, () => setItemsOpen(false), [itemsWrapRef]);
  useDismiss(axesOpen, () => setAxesOpen(false), [axesWrapRef]);

  // table theme (header / sticky / stripe)
  const HEADER_BG = "bg-slate-50";
  const STRIPE_BG = "bg-gray-50/50";
  const STICKY_BG = HEADER_BG; // 要件: 左固定「項目」列は全行ヘッダー色で統一

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
            <div className="min-w-[220px] relative" ref={itemsWrapRef}>
              <div className="mb-1 text-xs font-medium text-gray-600">
                比較対象（{selectedItems.length}件選択中）
              </div>
              <button
                type="button"
                onClick={() => {
                  setItemsOpen((v) => !v);
                  setAxesOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-2 text-left text-sm text-gray-800 shadow-sm hover:bg-gray-50"
                aria-haspopup="dialog"
                aria-expanded={itemsOpen}
              >
                <span className="truncate">
                  {selectedItems.length === 0
                    ? "未選択"
                    : selectedItems.length === items.length
                      ? "すべて"
                      : selectedItems.map(getItemLabel).join(" / ")}
                </span>
                <span className="shrink-0 text-gray-500" aria-hidden="true">
                  ▾
                </span>
              </button>
              {itemsOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="max-h-72 overflow-auto p-2">
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
              )}
            </div>

            {/* axis select */}
            <div className="min-w-[220px] relative" ref={axesWrapRef}>
              <div className="mb-1 text-xs font-medium text-gray-600">
                比較軸（{selectedUiAxes.length}軸選択中）
              </div>
              <button
                type="button"
                onClick={() => {
                  setAxesOpen((v) => !v);
                  setItemsOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-800 shadow-sm hover:bg-gray-50"
                aria-haspopup="dialog"
                aria-expanded={axesOpen}
              >
                <span className="truncate">
                  {selectedUiAxes.length === 0
                    ? "未選択"
                    : selectedUiAxes.length === uiAxes.length
                      ? "すべて"
                      : selectedUiAxes.map((a) => a.label).join(" / ")}
                </span>
                <span className="shrink-0 text-gray-500" aria-hidden="true">
                  ▾
                </span>
              </button>
              {axesOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="max-h-72 overflow-auto p-2">
                    {uiAxes.map((a) => {
                      const checked = selectedUiAxisIds.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAxisId(a.id)}
                            className="h-4 w-4 accent-[#7D9CD4]"
                          />
                          <span className="truncate">{a.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
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
      ) : selectedUiAxes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          比較軸を1つ以上選択してください。
        </div>
      ) : (
        <div className="space-y-6">
          {selectedUiAxes.map((uiAxis) => {
            // 表示順は「プルダウン表示順（uiAxes）」を source of truth とする
            if (uiAxis.kind === "pros_cons") {
              if (!hasProsData && !hasConsData) return null;
              return (
                <section key="pros-cons" className="rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <div className="text-sm font-semibold text-gray-800">メリット / デメリット</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[720px] w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className={HEADER_BG}>
                          <th className={`sticky left-0 z-30 w-[5.5em] min-w-[5em] max-w-[6em] border-b border-r border-gray-200 ${HEADER_BG} px-2 py-2 text-left text-xs font-semibold text-gray-600 whitespace-normal break-words`}>
                            項目
                          </th>
                          {selectedItems.map((it) => (
                            <th
                              key={it.id}
                              className={`border-b border-r border-gray-200 ${HEADER_BG} px-3 py-2 text-left text-xs font-semibold text-gray-600 last:border-r-0`}
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
                        {(
                          [
                            hasProsData ? ({ key: "pros", label: "メリット" } as const) : null,
                            hasConsData ? ({ key: "cons", label: "デメリット" } as const) : null,
                          ].filter(Boolean) as Array<{ key: "pros" | "cons"; label: string }>
                        ).map((row, ri) => (
                          <tr key={row.key} className={ri % 2 === 0 ? "bg-white" : STRIPE_BG}>
                            <td className={`sticky left-0 z-20 w-[5.5em] min-w-[5em] max-w-[6em] border-b border-r border-gray-200 ${STICKY_BG} px-2 py-3 align-top text-sm font-medium text-gray-800 whitespace-normal break-words`}>
                              {row.label}
                            </td>
                            {selectedItems.map((it) => {
                              const val = it.values?.[row.key];
                              return (
                                <td
                                  key={`${it.id}-${row.key}`}
                                  className="border-b border-r border-gray-200 px-3 py-3 align-top text-gray-700 leading-6 last:border-r-0"
                                >
                                  {renderCellValue(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            }

            const axisId = uiAxis.dataAxisId;
            const axis = axisId ? axes.find((a) => a.id === axisId) : null;
            if (!axis) return null;
            const hasFields = (axis.fields?.length ?? 0) > 0;

            return (
              <section key={axis.id} className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <div className="text-sm font-semibold text-gray-800">{axis.label}</div>
                  {axis.description && axis.description.trim() !== "" && (
                    <div className="mt-1 text-xs text-gray-600">{axis.description}</div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  {hasFields ? (
                    <table className="min-w-[720px] w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className={HEADER_BG}>
                          <th className={`sticky left-0 z-30 w-[5.5em] min-w-[5em] max-w-[6em] border-b border-r border-gray-200 ${HEADER_BG} px-2 py-2 text-left text-xs font-semibold text-gray-600 whitespace-normal break-words`}>
                            項目
                          </th>
                          {selectedItems.map((it) => (
                            <th
                              key={it.id}
                              className={`border-b border-r border-gray-200 ${HEADER_BG} px-3 py-2 text-left text-xs font-semibold text-gray-600 last:border-r-0`}
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
                        {(axis.fields ?? []).map((f, ri) => {
                          const rowBg = ri % 2 === 0 ? "bg-white" : STRIPE_BG;
                          return (
                            <tr key={f.id} className={rowBg}>
                              <td className={`sticky left-0 z-20 w-[5.5em] min-w-[5em] max-w-[6em] border-b border-r border-gray-200 ${STICKY_BG} px-2 py-3 align-top text-sm font-medium text-gray-800 whitespace-normal break-words`}>
                                {f.label}
                              </td>
                              {selectedItems.map((it) => {
                                const axisValues =
                                  (it.values?.[axisId] as Record<string, unknown> | undefined) ?? undefined;
                                const val = axisValues?.[f.id];
                                return (
                                  <td
                                    key={`${it.id}-${axisId}-${f.id}`}
                                    className="border-b border-r border-gray-200 px-3 py-3 align-top text-gray-700 leading-6 last:border-r-0"
                                  >
                                    {renderCellValue(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-[720px] w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className={HEADER_BG}>
                          <th className={`w-64 border-b border-r border-gray-200 ${HEADER_BG} px-3 py-2 text-left text-xs font-semibold text-gray-600`}>
                            構成型
                          </th>
                          <th className={`border-b border-gray-200 ${HEADER_BG} px-3 py-2 text-left text-xs font-semibold text-gray-600`}>
                            内容
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((it, i) => {
                          const val = it.values?.[axisId];
                          return (
                            <tr key={`${it.id}-${axisId}`} className={i % 2 === 0 ? "bg-white" : STRIPE_BG}>
                              <td className={`border-b border-r border-gray-200 ${STICKY_BG} px-3 py-3 align-top font-medium text-gray-800`}>
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
                              <td className="border-b border-gray-200 px-3 py-3 align-top text-gray-700 leading-6">
                                {renderCellValue(val)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

