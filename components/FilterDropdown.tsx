"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export type GroupedOptions = {
  label: string;
  options: string[];
};

export type FilterDropdownProps = {
  label: string;
  options?: string[];
  groupedOptions?: GroupedOptions[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  multiple?: boolean;
  searchable?: boolean;
};

function filterByQuery(items: string[], q: string): string[] {
  if (!q.trim()) return items;
  const lower = q.trim().toLowerCase();
  return items.filter((item) => item.toLowerCase().includes(lower));
}

export function FilterDropdown({
  label,
  options,
  groupedOptions,
  selected,
  onToggle,
  multiple = true,
  searchable = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (options != null) {
      return filterByQuery(options, searchQuery);
    }
    return null;
  }, [options, searchQuery]);

  const filteredGroupedOptions = useMemo(() => {
    if (groupedOptions == null) return null;
    const q = searchQuery.trim().toLowerCase();
    return groupedOptions
      .map((g) => ({
        label: g.label,
        options: q ? g.options.filter((o) => o.toLowerCase().includes(q)) : g.options,
      }))
      .filter((g) => g.options.length > 0);
  }, [groupedOptions, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  /** groupedOptions の場合: 全 group を開いた状態で openGroups を初期化 */
  useEffect(() => {
    if (groupedOptions != null && groupedOptions.length > 0) {
      setOpenGroups((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const g of groupedOptions) {
          if (!(g.label in next)) {
            next[g.label] = true;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [groupedOptions]);

  /** searchable: 検索中はヒットした group を自動で開く */
  useEffect(() => {
    if (searchable && isSearching && filteredGroupedOptions != null) {
      setOpenGroups((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const g of filteredGroupedOptions) {
          if (!next[g.label]) {
            next[g.label] = true;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [searchable, isSearching, filteredGroupedOptions]);

  const toggleGroup = useCallback((groupLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupLabel]: !(prev[groupLabel] ?? true),
    }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCount = selected.size;
  const buttonLabel = multiple
    ? selectedCount > 0
      ? `${selectedCount} 件選択`
      : "選択"
    : Array.from(selected)[0] ?? "選択";

  const useGrouped = groupedOptions != null;
  const useFlat = options != null && !useGrouped;
  const showEmpty =
    (useFlat && (filteredOptions?.length ?? 0) === 0) ||
    (useGrouped && (filteredGroupedOptions?.length ?? 0) === 0);

  return (
    <div ref={containerRef} className="relative">
      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mt-2 flex w-full min-w-[140px] items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
          selectedCount > 0
            ? "border-[#7D9CD4] bg-[#7D9CD4]/10 text-[#5E7AB8]"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
        }`}
      >
        <span>{buttonLabel}</span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-md border border-gray-200 bg-white shadow-lg">
          {searchable && (
            <div className="sticky top-0 z-[1] border-b border-gray-100 bg-white p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索..."
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#7D9CD4] focus:outline-none focus:ring-1 focus:ring-[#7D9CD4]"
              />
            </div>
          )}
          <div className="max-h-80 overflow-y-auto p-2">
            {useFlat && filteredOptions != null && (
              <>
                {filteredOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(option)}
                      onChange={() => onToggle(option)}
                      className="h-4 w-4 rounded border-gray-300 text-[#7D9CD4] focus:ring-[#7D9CD4]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </>
            )}
            {useGrouped && filteredGroupedOptions != null && (
              <>
                {filteredGroupedOptions.map((group) => {
                  const groupIsOpen = isSearching
                    ? true
                    : (openGroups[group.label] ?? true);
                  return (
                    <div key={group.label} className="mb-3 last:mb-0">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        className="flex w-full items-center justify-between rounded px-2 py-1 text-left font-semibold text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                      >
                        <span>{group.label}</span>
                        <svg
                          className={`h-4 w-4 shrink-0 transition-transform ${groupIsOpen ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {groupIsOpen && (
                        <div className="mt-1 space-y-0.5">
                          {group.options.map((option) => (
                            <label
                              key={option}
                              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={selected.has(option)}
                                onChange={() => onToggle(option)}
                                className="h-4 w-4 rounded border-gray-300 text-[#7D9CD4] focus:ring-[#7D9CD4]"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {showEmpty && (
              <p className="py-4 text-center text-sm text-gray-400">該当する項目がありません</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
