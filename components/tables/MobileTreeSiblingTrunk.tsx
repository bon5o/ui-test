"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const TREE_LINE = "bg-[#7D9CD4]/25";
// Temporary debug: color-code line sources
const DEBUG_MOBILE_TREE_LINE_COLORS = true;
const INDENT_STEP_PX = 10;
const INDENT_MAX_PX = 28;
/** TREE_AXIS_LEFT: left-[7px] と揃える（connector lane 内の軸） */
const CONNECTOR_AXIS_X_PX = 7;

type TrunkStyle = {
  left: number;
  top: number;
  height: number;
};

export function MobileTreeSiblingTrunk({
  childDepth,
  children,
}: {
  childDepth: number;
  children: React.ReactNode;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [trunk, setTrunk] = useState<TrunkStyle | null>(null);

  const recalc = () => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const markers = Array.from(
      containerEl.querySelectorAll<HTMLElement>(
        `[data-mobile-tree-elbow-marker][data-mobile-tree-elbow-depth="${String(childDepth)}"][data-mobile-tree-elbow-role="node"]`
      )
    );
    if (markers.length === 0) {
      setTrunk(null);
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const firstRect = markers[0].getBoundingClientRect();
    const lastRect = markers[markers.length - 1].getBoundingClientRect();

    const padLeftPx = Math.min(childDepth * INDENT_STEP_PX, INDENT_MAX_PX);
    const left = padLeftPx + CONNECTOR_AXIS_X_PX;

    setTrunk({
      left,
      top: firstRect.top - containerRect.top,
      height: lastRect.bottom - firstRect.top,
    });
  };

  useLayoutEffect(() => {
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDepth]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDepth]);

  return (
    <div ref={containerRef} className="relative mt-0">
      {trunk && (
        <div
          aria-hidden
          data-debug-mobile-tree-line="sibling-trunk"
          className={`pointer-events-none absolute z-[2] ${
            DEBUG_MOBILE_TREE_LINE_COLORS ? "bg-blue-500/60" : TREE_LINE
          } w-px`}
          style={{
            left: trunk.left,
            top: trunk.top,
            height: trunk.height,
          }}
        />
      )}
      {children}
    </div>
  );
}

