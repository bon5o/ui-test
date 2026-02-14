"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Lens } from "../../types/lens";

interface LensListProps {
  initialLenses: Lens[];
}

export function LensList({ initialLenses }: LensListProps) {
  const [selectedDesignType, setSelectedDesignType] = useState<string>("all");
  const [selectedEra, setSelectedEra] = useState<string>("all");

  // ユニークな design_type と era を取得
  const designTypes = useMemo(() => {
    const types = new Set(initialLenses.map((lens) => lens.classification.design_type));
    return Array.from(types).sort();
  }, [initialLenses]);

  const eras = useMemo(() => {
    const eraSet = new Set(initialLenses.map((lens) => lens.classification.era));
    return Array.from(eraSet).sort();
  }, [initialLenses]);

  // フィルタリング
  const filteredLenses = useMemo(() => {
    return initialLenses.filter((lens) => {
      const matchesDesignType =
        selectedDesignType === "all" ||
        lens.classification.design_type === selectedDesignType;
      const matchesEra =
        selectedEra === "all" || lens.classification.era === selectedEra;
      return matchesDesignType && matchesEra;
    });
  }, [initialLenses, selectedDesignType, selectedEra]);

  return (
    <div>
      {/* フィルタUI */}
      <div className="mb-8 flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="design-type-filter"
            className="text-sm font-medium text-[#111111]"
          >
            設計タイプ
          </label>
          <select
            id="design-type-filter"
            value={selectedDesignType}
            onChange={(e) => setSelectedDesignType(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#111111] shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">すべて</option>
            {designTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="era-filter"
            className="text-sm font-medium text-[#111111]"
          >
            時代
          </label>
          <select
            id="era-filter"
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#111111] shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">すべて</option>
            {eras.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            {filteredLenses.length} 件表示
          </div>
        </div>
      </div>

      {/* レンズ一覧 */}
      {filteredLenses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          該当するレンズが見つかりませんでした。
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLenses.map((lens) => (
            <Link
              key={lens.meta.slug}
              href={`/lenses/${lens.meta.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold text-[#111111] group-hover:text-blue-500">
                {lens.meta.name}
              </h2>
              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">設計タイプ:</span>{" "}
                  {lens.classification.design_type}
                </div>
                <div>
                  <span className="font-medium">時代:</span>{" "}
                  {lens.classification.era}
                </div>
                <div>
                  <span className="font-medium">焦点距離:</span>{" "}
                  {lens.specifications.focal_length_mm}mm
                </div>
                <div>
                  <span className="font-medium">最大F値:</span> f/
                  {lens.specifications.max_aperture}
                </div>
                <div>
                  <span className="font-medium">発売年:</span>{" "}
                  {lens.meta.release_year}
                </div>
              </div>
              {lens.editorial.summary && (
                <p className="line-clamp-2 text-sm text-gray-500">
                  {lens.editorial.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
