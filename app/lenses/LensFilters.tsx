"use client";

import { useState, useMemo } from "react";
import type { Lens } from "../../types/lens";
import { getDesignType } from "./lensFilterUtils";
import { DesignTypeFilter } from "./DesignTypeFilter";
import { PriceRangeFilter, type PriceRange } from "./PriceRangeFilter";
import { FilterDropdown, type GroupedOptions } from "../../components/FilterDropdown";
import { manufacturerData } from "./manufacturerData";

export type PriceRangeFilterState = PriceRange;

export interface FilterState {
  decades: Set<string>;
  designTypes: Set<string>;
  manufacturers: Set<string>;
  priceRanges: Set<string>;
  priceRange: PriceRangeFilterState;
  coatings: Set<string>;
  characteristics: Set<string>;
}

export const DEFAULT_PRICE_RANGE: PriceRangeFilterState = {
  min: null,
  max: null,
};

const DECADES = Array.from({ length: 18 }, (_, i) => `${1850 + i * 10}s`);

const RENDERING_TRAIT_GROUPS: GroupedOptions[] = [
  {
    label: "contrast",
    options: [
      "high_contrast",
      "low_contrast",
      "medium_contrast",
      "microcontrast_high",
      "microcontrast_low",
      "contrast_drop_backlight",
    ],
  },
  {
    label: "resolution",
    options: [
      "high_resolution",
      "low_resolution",
      "sharp_center",
      "soft_center",
      "sharp_edges",
      "soft_edges",
      "chromatic_aberration_strong",
      "chromatic_aberration_controlled",
      "spherochromatism_strong",
      "spherochromatism_light",
      "edge_halo_strong",
      "edge_halo_light",
    ],
  },
  {
    label: "bokeh",
    options: [
      "soap_bubble_bokeh",
      "smooth_bokeh",
      "nervous_bokeh",
      "swirly_bokeh",
      "onion_ring_bokeh",
      "busy_background",
      "bokeh_cat_eye",
      "bokeh_round",
      "bokeh_polygonal",
      "bokeh_oval",
      "transition_hard",
      "transition_soft",
    ],
  },
  {
    label: "color",
    options: [
      "color_warm",
      "color_cool",
      "color_neutral",
      "color_muted",
      "color_vivid",
      "color_pastel",
    ],
  },
  {
    label: "distortion",
    options: [
      "distortion_barrel",
      "distortion_pincushion",
      "distortion_mustache",
      "field_curvature_strong",
      "field_curvature_weak",
      "vignetting_strong",
      "vignetting_light",
      "focus_shift_strong",
      "focus_shift_minor",
    ],
  },
  {
    label: "flare",
    options: [
      "flare_prone",
      "flare_resistant",
      "ghost_strong",
      "ghost_controlled",
      "flare_veiling",
      "backlight_resistant",
    ],
  },
  {
    label: "rendering",
    options: [
      "flat_rendering",
      "3d_pop",
      "glow_wide_open",
      "crisp_stopped_down",
      "soft_focus",
      "rendering_classic",
      "rendering_modern",
      "rendering_neutral",
      "rendering_dreamy",
    ],
  },
];

const COATING_OPTIONS: string[] = [
  "ノンコート",
  "単層コーティング",
  "単層 MgF2 コーティング",
  "アンバー系単層コーティング",
  "ソフトコート",
  "ハードコート",
  "2層コーティング",
  "3層以上の初期マルチコーティング",
  "一般的マルチコーティング",
  "T コーティング",
  "T* コーティング",
  "SMC (Super-Multi-Coated)",
  "HMC (Hard Multi Coating)",
  "SHMC (Super Hydrophobic Multi Coating)",
  "各社固有名のマルチコート",
];

export const DEFAULT_FILTER_STATE: FilterState = {
  decades: new Set(),
  designTypes: new Set(),
  manufacturers: new Set(),
  priceRanges: new Set(),
  priceRange: { ...DEFAULT_PRICE_RANGE },
  coatings: new Set(),
  characteristics: new Set(),
};

interface LensFiltersProps {
  lenses: Lens[];
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
  onReset: () => void;
}

export function LensFilters({
  lenses = [],
  filterState,
  onFilterChange,
  onReset,
}: LensFiltersProps) {
  const safeLenses = Array.isArray(lenses) ? lenses : [];
  type SetFilterKey = "decades" | "designTypes" | "manufacturers" | "priceRanges" | "coatings" | "characteristics";
  const toggle = (key: SetFilterKey, value: string) => {
    const prev = filterState[key];
    const next = new Set(prev);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onFilterChange({ ...filterState, [key]: next });
  };

  const designTypes = [...new Set(safeLenses.map((l) => getDesignType(l)))].filter(Boolean).sort();
  const manufacturers = [...new Set(safeLenses.map((l) => l.meta.manufacturer_id))].sort();

  const allDataManufacturers = useMemo(
    () =>
      new Set([
        ...manufacturerData.popular,
        ...manufacturerData.regions.flatMap((r) => r.manufacturers),
      ]),
    []
  );

  const manufacturerGroupedOptions = useMemo<GroupedOptions[]>(() => {
    const groups: GroupedOptions[] = [
      { label: "Popular", options: manufacturerData.popular },
      ...manufacturerData.regions.map((r) => ({ label: r.region, options: r.manufacturers })),
    ];
    const others = manufacturers.filter((id) => !allDataManufacturers.has(id));
    if (others.length > 0) {
      groups.push({ label: "その他", options: others });
    }
    return groups;
  }, [manufacturers, allDataManufacturers]);
  if (typeof window !== "undefined") {
    console.log("[LensFilters] lenses count:", safeLenses.length);
    console.log("[LensFilters] designTypes:", designTypes);
    console.log("[LensFilters] manufacturers:", manufacturers);
  }

  const hasActiveFilters =
    filterState.decades.size > 0 ||
    filterState.designTypes.size > 0 ||
    filterState.manufacturers.size > 0 ||
    filterState.priceRanges.size > 0 ||
    filterState.priceRange.min !== null ||
    filterState.priceRange.max !== null ||
    filterState.coatings.size > 0 ||
    filterState.characteristics.size > 0;

  const setTags: { key: SetFilterKey }[] = [
    { key: "decades" },
    { key: "designTypes" },
    { key: "manufacturers" },
    { key: "priceRanges" },
    { key: "coatings" },
    { key: "characteristics" },
  ];

  const hasPriceRange =
    filterState.priceRange.min !== null || filterState.priceRange.max !== null;
  const priceRangeLabel =
    filterState.priceRange.min != null && filterState.priceRange.max != null
      ? `${filterState.priceRange.min.toLocaleString()}〜${filterState.priceRange.max.toLocaleString()}円`
      : filterState.priceRange.min != null
        ? `${filterState.priceRange.min.toLocaleString()}円以上`
        : filterState.priceRange.max != null
          ? `${filterState.priceRange.max.toLocaleString()}円以下`
          : "";

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="space-y-6 rounded-xl border border-gray-100 bg-[#F8FAFC] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className="flex w-fit items-center gap-2 text-base font-medium text-gray-800 transition-colors hover:text-[#5E7AB8]"
          aria-expanded={isFilterOpen}
        >
          <span>絞り込み</span>
          <span className="text-sm text-gray-500" aria-hidden>
            {isFilterOpen ? "▲" : "▼"}
          </span>
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-[#7D9CD4] transition-colors hover:text-[#5E7AB8] hover:underline"
          >
            リセット
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
          {setTags.flatMap(({ key }) =>
            Array.from(filterState[key]).map((value) => (
              <span
                key={`${key}-${value}`}
                className="inline-flex items-center gap-1 rounded-full bg-[#7D9CD4]/20 px-2.5 py-1 text-xs text-[#5E7AB8]"
              >
                {value}
                <button
                  type="button"
                  onClick={() => toggle(key, value)}
                  className="ml-0.5 rounded p-0.5 transition-colors hover:bg-[#7D9CD4]/30 hover:text-[#5E7AB8]"
                  aria-label={`${value}を解除`}
                >
                  ×
                </button>
              </span>
            ))
          )}
          {hasPriceRange && priceRangeLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#7D9CD4]/20 px-2.5 py-1 text-xs text-[#5E7AB8]">
              {priceRangeLabel}
              <button
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filterState,
                    priceRange: { min: null, max: null },
                  })
                }
                className="ml-0.5 rounded p-0.5 transition-colors hover:bg-[#7D9CD4]/30 hover:text-[#5E7AB8]"
                aria-label="中古相場を解除"
              >
                ×
              </button>
            </span>
          )}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-[#7D9CD4] hover:bg-[#7D9CD4]/10 hover:text-[#5E7AB8]"
          >
            すべてクリア
          </button>
        </div>
      )}

      {isFilterOpen && (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FilterDropdown
          label="年代"
          options={DECADES}
          selected={filterState.decades}
          onToggle={(v) => toggle("decades", v)}
        />
        <DesignTypeFilter
          selected={filterState.designTypes}
          onToggle={(v) => toggle("designTypes", v)}
        />
        <FilterDropdown
          label="メーカー"
          groupedOptions={manufacturerGroupedOptions}
          selected={filterState.manufacturers}
          onToggle={(v) => toggle("manufacturers", v)}
          searchable
        />
        <PriceRangeFilter
          value={filterState.priceRange}
          onChange={(priceRange) => onFilterChange({ ...filterState, priceRange })}
        />
        <FilterDropdown
          label="コーティング"
          options={COATING_OPTIONS}
          selected={filterState.coatings}
          onToggle={(v) => toggle("coatings", v)}
        />
        <FilterDropdown
          label="描写特性"
          groupedOptions={RENDERING_TRAIT_GROUPS}
          selected={filterState.characteristics}
          onToggle={(v) => toggle("characteristics", v)}
          searchable
        />
      </div>
      )}
    </div>
  );
}
