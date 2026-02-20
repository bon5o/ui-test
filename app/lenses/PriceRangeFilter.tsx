"use client";

import { useState, useRef, useEffect } from "react";

export type PriceRange = {
  min: number | null;
  max: number | null;
};

const PRICE_PRESETS: { label: string; min: number; max: number }[] = [
  { label: "〜10,000円", min: 0, max: 10000 },
  { label: "10,000〜30,000円", min: 10000, max: 30000 },
  { label: "30,000〜50,000円", min: 30000, max: 50000 },
  { label: "50,000〜100,000円", min: 50000, max: 100000 },
  { label: "100,000円以上", min: 100000, max: 999999999 },
];

interface PriceRangeFilterProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
}

function isPresetActive(
  preset: { min: number; max: number },
  value: PriceRange
): boolean {
  if (value.min === null && value.max === null) return false;
  return value.min === preset.min && value.max === preset.max;
}

export function PriceRangeFilter({ value, onChange }: PriceRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyPreset = (min: number, max: number) => {
    onChange({ min, max });
  };

  const applyCustom = () => {
    const minVal = customMin === "" ? null : parseInt(customMin, 10);
    const maxVal = customMax === "" ? null : parseInt(customMax, 10);

    if (minVal !== null && isNaN(minVal)) return;
    if (maxVal !== null && isNaN(maxVal)) return;
    if (minVal !== null && minVal < 0) return;
    if (maxVal !== null && maxVal < 0) return;
    if (minVal !== null && maxVal !== null && minVal > maxVal) return;

    onChange({ min: minVal ?? null, max: maxVal ?? null });
  };

  const hasActiveFilter = value.min !== null || value.max !== null;
  const activePreset = PRICE_PRESETS.find((p) => isPresetActive(p, value));

  return (
    <div ref={containerRef} className="relative">
      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        中古相場
      </span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mt-2 flex w-full min-w-[140px] items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
          hasActiveFilter
            ? "border-[#7D9CD4] bg-[#7D9CD4]/10 text-[#5E7AB8]"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
        }`}
      >
        <span>
          {activePreset
            ? activePreset.label
            : hasActiveFilter
              ? `${value.min ?? "—"}〜${value.max ?? "—"}円`
              : "選択"}
        </span>
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
          <div className="max-h-80 overflow-y-auto p-2">
            <div className="mb-3">
              <span className="block px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                価格帯
              </span>
              <div className="mt-1 space-y-0.5">
                {PRICE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.min, preset.max)}
                    className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                      isPresetActive(preset, value)
                        ? "bg-[#7D9CD4]/20 text-[#5E7AB8]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <span className="block px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                カスタム
              </span>
              <div className="mt-2 flex flex-col gap-2">
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={() => onChange({ min: null, max: null })}
                    className="text-xs text-[#7D9CD4] hover:text-[#5E7AB8] hover:underline"
                  >
                    クリア
                  </button>
                )}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">最小価格（円）</label>
                  <input
                    type="number"
                    min={0}
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#7D9CD4] focus:outline-none focus:ring-1 focus:ring-[#7D9CD4]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">最大価格（円）</label>
                  <input
                    type="number"
                    min={0}
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#7D9CD4] focus:outline-none focus:ring-1 focus:ring-[#7D9CD4]"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCustom}
                  className="rounded-md bg-[#7D9CD4] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5E7AB8]"
                >
                  適用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
