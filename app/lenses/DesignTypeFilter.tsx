"use client";

import { useState, useRef, useEffect } from "react";
import { constructionTypes } from "./constructionTypes";

interface DesignTypeFilterProps {
  selected: Set<string>;
  onToggle: (value: string) => void;
}

export function DesignTypeFilter({ selected, onToggle }: DesignTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categories = Object.keys(constructionTypes);
  const selectedCount = selected.size;

  return (
    <div ref={containerRef} className="relative">
      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        構成型
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
        <span>
          {selectedCount > 0 ? `${selectedCount} 件選択` : "選択"}
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
          <div className="max-h-64 overflow-y-auto p-2">
            {categories.map((category) => {
              const types = constructionTypes[category];
              const isExpanded = expandedCategories.has(category);
              return (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    <span>{category}</span>
                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="space-y-0.5 pb-2 pl-4 pr-2">
                      {types.map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(type)}
                            onChange={() => onToggle(type)}
                            className="h-4 w-4 rounded border-gray-300 text-[#7D9CD4] focus:ring-[#7D9CD4]"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
