"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import type { LensIndexItem } from "../../types/lensIndex";
import {
  LensFilters,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from "./LensFilters";
import {
  getDecade,
  getDesignType,
  getCharacteristics,
  getCoatingDescription,
  matchesPriceFilter,
  matchesPriceRangeFilter,
} from "./lensIndexFilterUtils";
import { designTypeToLabel } from "./constructionTypes";

interface LensListProps {
  initialLenses: LensIndexItem[];
}

function parseFilterStateFromSearch(search: URLSearchParams): FilterState {
  const state: FilterState = {
    decades: new Set(),
    designTypes: new Set(),
    manufacturers: new Set(),
    priceRanges: new Set(),
    priceRange: { min: null, max: null },
    coatings: new Set(),
    characteristics: new Set(),
  };
  const decadeValues = search.getAll("decade");
  if (decadeValues.length > 0) state.decades = new Set(decadeValues);
  const priceMin = search.get("priceMin");
  const priceMax = search.get("priceMax");
  if (priceMin != null && priceMin !== "") {
    const n = parseInt(priceMin, 10);
    if (!isNaN(n)) state.priceRange.min = n;
  }
  if (priceMax != null && priceMax !== "") {
    const n = parseInt(priceMax, 10);
    if (!isNaN(n)) state.priceRange.max = n;
  }
  const paramMap: Record<string, keyof FilterState> = {
    decade: "decades",
    design: "designTypes",
    manufacturer: "manufacturers",
    price: "priceRanges",
    coating: "coatings",
    characteristic: "characteristics",
  };
  for (const [param, key] of Object.entries(paramMap)) {
    const values = search.getAll(param);
    if (values.length > 0 && (key === "decades" || key === "designTypes" || key === "manufacturers" || key === "priceRanges" || key === "coatings" || key === "characteristics")) {
      state[key] = new Set(values);
    }
  }
  return state;
}

function filterStateToSearchParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.priceRange.min != null) params.set("priceMin", String(state.priceRange.min));
  if (state.priceRange.max != null) params.set("priceMax", String(state.priceRange.max));
  const paramMap: Record<string, string> = {
    decades: "decade",
    designTypes: "design",
    manufacturers: "manufacturer",
    priceRanges: "price",
    coatings: "coating",
    characteristics: "characteristic",
  };
  for (const [key, param] of Object.entries(paramMap)) {
    const val = state[key as keyof FilterState];
    if (val instanceof Set) val.forEach((v) => params.append(param, v));
  }
  return params;
}

function matchesLens(item: LensIndexItem, state: FilterState): boolean {
  if (state.decades.size > 0) {
    const lensDecade = getDecade(item);
    if (!lensDecade || !state.decades.has(lensDecade)) return false;
  }
  if (state.designTypes.size > 0) {
    const lensDt = getDesignType(item);
    const lensLabel = designTypeToLabel[lensDt] ?? lensDt;
    if (!lensLabel || !state.designTypes.has(lensLabel)) return false;
  }
  if (state.manufacturers.size > 0) {
    const mfr = item.manufacturer ?? "";
    if (!mfr || !state.manufacturers.has(mfr)) return false;
  }
  if (state.priceRanges.size > 0) {
    if (!matchesPriceFilter(item, [...state.priceRanges])) return false;
  }
  if (state.priceRange.min !== null || state.priceRange.max !== null) {
    if (!matchesPriceRangeFilter(item, state.priceRange)) return false;
  }
  if (state.coatings.size > 0) {
    const desc = getCoatingDescription(item);
    if (!Array.from(state.coatings).some((opt) => desc.includes(opt))) return false;
  }
  if (state.characteristics.size > 0) {
    const lensTraits = getCharacteristics(item);
    if (!lensTraits.some((t) => state.characteristics.has(t))) return false;
  }
  return true;
}

export function LensList({ initialLenses }: LensListProps) {
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    setFilterState(parseFilterStateFromSearch(search));
  }, []);

  const updateUrl = useCallback(
    (state: FilterState) => {
      const params = filterStateToSearchParams(state);
      const qs = params.toString();
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", url);
    },
    []
  );

  const handleFilterChange = useCallback(
    (state: FilterState) => {
      setFilterState(state);
      updateUrl(state);
    },
    [updateUrl]
  );

  const handleReset = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const filteredLenses = useMemo(() => {
    return initialLenses.filter((item) => matchesLens(item, filterState));
  }, [initialLenses, filterState]);

  return (
    <div className="space-y-8">
      <LensFilters
        lenses={initialLenses}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredLenses.length} 件
          {initialLenses.length !== filteredLenses.length &&
            ` （全 ${initialLenses.length} 件中）`}
        </p>
      </div>

      {filteredLenses.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] py-16 text-center text-gray-600">
          該当するレンズが見つかりませんでした。
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLenses.map((item) => (
            <Link
              key={item.id}
              href={`/lenses/${item.id}`}
              className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#7D9CD4]/30 hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold text-[#111111] transition-colors group-hover:text-[#5E7AB8]">
                {item.name}
              </h2>
              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">構成型:</span>{" "}
                  {designTypeToLabel[item.design_type ?? ""] ?? item.design_type ?? "—"}
                </div>
                <div>
                  <span className="font-medium">発売年:</span>{" "}
                  {item.release_year ?? "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
