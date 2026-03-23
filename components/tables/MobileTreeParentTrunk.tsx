"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const TREE_LINE = "bg-[#7D9CD4]/25";

type TrunkStyle = {
  left: number;
  top: number;
  height: number;
};

const INDENT_STEP_PX = 10;
const INDENT_MAX_PX = 28;
/** TREE_AXIS_LEFT: left-[7px] と揃える（connector lane 内の軸） */
const CONNECTOR_AXIS_X_PX = 7;

export function MobileTreeParentTrunk({
  childDepth,
  children,
}: {
  /** 親→children への接続で、子側は depth=childDepth の elbow が対象 */
  childDepth: number;
  children: React.ReactNode;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [trunk, setTrunk] = useState<TrunkStyle | null>(null);

  const recalc = () => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const startMarkers = Array.from(
      containerEl.querySelectorAll<HTMLElement>(
        `[data-mobile-tree-elbow-marker][data-mobile-tree-elbow-depth="${String(childDepth)}"][data-mobile-tree-elbow-role="parent"]`
      )
    );

    const horizontals = Array.from(
      containerEl.querySelectorAll<HTMLElement>(
        `[data-mobile-tree-elbow-horizontal][data-mobile-tree-elbow-horizontal-depth="${String(childDepth)}"]`
      )
    );

    if (startMarkers.length === 0 || horizontals.length === 0) {
      setTrunk(null);
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const startRect = startMarkers[0].getBoundingClientRect();
    const firstHorizontalRect = horizontals[0].getBoundingClientRect();

    const top = startRect.top - containerRect.top;
    // 横線（L字腕）の始点までを確実に含めて交わる
    const height = Math.max(1, firstHorizontalRect.bottom - startRect.top);

    const parentDepth = Math.max(0, childDepth - 1);
    const padLeftChildPx = Math.min(childDepth * INDENT_STEP_PX, INDENT_MAX_PX);
    const padLeftParentPx = Math.min(parentDepth * INDENT_STEP_PX, INDENT_MAX_PX);
    // wrapper は親 li の padding-left 後に配置されるため、相対位置は差分で計算する
    const padLeftDeltaPx = padLeftChildPx - padLeftParentPx;
    setTrunk({
      // 縦線は connector 軸（MobileTreeNode の横線）と同じ x に揃える
      left: padLeftDeltaPx + CONNECTOR_AXIS_X_PX,
      top,
      height,
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
          className={`pointer-events-none absolute z-[1] ${TREE_LINE} w-px`}
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

