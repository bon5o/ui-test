"use client";

import React from "react";

export type TimelineItem = {
  year?: string | number;
  person?: string;
  event?: string;
  significance?: string;
};

interface TimelineListProps {
  items: TimelineItem[];
  /** 各項目の value をラップするコンポーネント（例: TermLinkify） */
  renderValue?: (text: string) => React.ReactNode;
}

/**
 * 年表を箇条書き＋インデントのUIで表示（md未満用）。
 * 左ボーダーで縦線を表現し、年＋人物を強調、出来事/意義を縦積みで表示。
 */
export function TimelineList({
  items,
  renderValue = (t) => t,
}: TimelineListProps): React.ReactElement {
  if (items.length === 0) return <></>;

  return (
    <div className="md:hidden space-y-4">
      {items.map((item, i) => {
        const year = item.year != null ? String(item.year) : undefined;
        const person = item.person;
        const event = item.event;
        const significance = item.significance;
        const hasDetails = event || significance;

        return (
          <div
            key={i}
            className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="relative pl-4">
              <div
                className="absolute left-1 top-2 bottom-2 w-px bg-gray-200"
                aria-hidden
              />
              <div className="flex flex-wrap items-baseline gap-x-2">
                {year && (
                  <span className="text-base font-semibold text-gray-900">
                    {year}
                  </span>
                )}
                {person && (
                  <span className="text-sm text-gray-600">{person}</span>
                )}
              </div>
              {hasDetails && (
                <ul className="mt-3 space-y-2 pl-5 list-disc">
                  {event && (
                    <li className="leading-6 whitespace-normal break-words text-left">
                      <span className="font-medium text-gray-800">出来事：</span>
                      <span className="text-gray-700">
                        {renderValue(event)}
                      </span>
                    </li>
                  )}
                  {significance && (
                    <li className="leading-6 whitespace-normal break-words text-left">
                      <span className="font-medium text-gray-800">意義：</span>
                      <span className="text-gray-700">
                        {renderValue(significance)}
                      </span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
