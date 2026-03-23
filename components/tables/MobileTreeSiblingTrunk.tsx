"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const TREE_LINE = "bg-[#7D9CD4]/25";
const DEBUG_MOBILE_TREE_TRUNK = process.env.NODE_ENV !== "production";
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
  parentId,
  subtreeId,
  children,
}: {
  childDepth: number;
  parentId?: string;
  subtreeId?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [trunk, setTrunk] = useState<TrunkStyle | null>(null);
  const parentIdSafe = parentId ?? null;
  const subtreeIdSafe = subtreeId ?? null;
  const DEBUG_SIBLING_TRUNK_COLOR = "rgba(0, 0, 255, 1)";
  const lastLogRef = useRef<{
    left: number;
    top: number;
    height: number;
    markersCount: number;
  } | null>(null);

  const recalc = () => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    if (parentIdSafe == null || subtreeIdSafe == null) {
      setTrunk(null);
      return;
    }

    const markers = Array.from(
      containerEl.querySelectorAll<HTMLElement>(
        `[data-mobile-tree-elbow-marker][data-mobile-tree-elbow-role="node"][data-mobile-tree-elbow-subtree-id="${subtreeIdSafe}"][data-mobile-tree-elbow-parent-id="${parentIdSafe}"]`
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

    const top = firstRect.top - containerRect.top;
    // PC版は last sibling 側の縦線が「肘（TREE_ELBOW_Y_PX）の位置」で止まる。
    // mobileでも elbow marker の top を基準に揃えることで、最終ノード直下への伸びを抑える。
    const height = Math.max(1, lastRect.top - firstRect.top);

    if (DEBUG_MOBILE_TREE_TRUNK && typeof window !== "undefined") {
      const markersInfo = markers.map((m) => ({
        id: m.id,
        top: m.getBoundingClientRect().top,
        role: m.dataset.mobileTreeElbowRole,
      }));

      const prev = lastLogRef.current;
      const shouldLog =
        prev == null ||
        prev.markersCount !== markers.length ||
        Math.abs(prev.left - left) > 0.5 ||
        Math.abs(prev.top - top) > 0.5 ||
        Math.abs(prev.height - height) > 0.5;

      if (shouldLog) {
        // eslint-disable-next-line no-console
        console.log("[MobileTreeSiblingTrunk]", {
          parentId: parentIdSafe,
          subtreeId: subtreeIdSafe,
          childDepth,
          markersCount: markers.length,
          markerIds: markers.map((m) => m.id),
          markersInfo,
          left,
          top,
          height,
          containerRectTop: containerRect.top,
          firstMarkerTop: firstRect.top,
          lastMarkerTop: lastRect.top,
        });
        lastLogRef.current = { left, top, height, markersCount: markers.length };
      }
    }

    // sibling trunk は「兄弟が2人以上」のときだけ縦線を出す
    if (markers.length < 2) {
      setTrunk(null);
      return;
    }

    setTrunk({ left, top, height });
  };

  useLayoutEffect(() => {
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDepth, parentIdSafe, subtreeIdSafe]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDepth, parentIdSafe, subtreeIdSafe]);

  return (
    <div
      ref={containerRef}
      className="relative mt-1.5 min-w-0 sm:mt-2"
      data-debug-line-wrapper="sibling-trunk-wrapper"
      data-mobile-tree-sibling-trunk-wrapper=""
      data-mobile-tree-sibling-trunk-parent-id={parentIdSafe ?? undefined}
      data-mobile-tree-sibling-trunk-subtree-id={subtreeIdSafe ?? undefined}
    >
      {trunk && (
        <div
          aria-hidden
          data-debug-line="sibling-trunk"
          className="pointer-events-none absolute z-[99999] opacity-100 w-[3px]"
          style={{
            left: trunk.left,
            top: trunk.top,
            height: trunk.height,
            backgroundColor: DEBUG_SIBLING_TRUNK_COLOR,
          }}
        />
      )}
      {children}
    </div>
  );
}

