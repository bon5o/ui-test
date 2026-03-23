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

    // 最初の子の「幹線への接続点（elbow marker）」に厳密に合わせる
    const endMarkers = Array.from(
      containerEl.querySelectorAll<HTMLElement>(
        `[data-mobile-tree-elbow-marker][data-mobile-tree-elbow-depth="${String(childDepth)}"][data-mobile-tree-elbow-role="node"]`
      )
    );

    if (startMarkers.length === 0 || endMarkers.length === 0) {
      setTrunk(null);
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const startRect = startMarkers[0].getBoundingClientRect();

    // DOM上で最上段にある子を「最初の子」とみなす
    let firstEndRect = endMarkers[0].getBoundingClientRect();
    for (let i = 1; i < endMarkers.length; i++) {
      const r = endMarkers[i].getBoundingClientRect();
      if (r.top < firstEndRect.top) firstEndRect = r;
    }

    // 1px線なので centerY から top/height を作る（両端の center を確実に含める）
    const startCenterY =
      startRect.top - containerRect.top + startRect.height / 2;
    const endCenterY =
      firstEndRect.top - containerRect.top + firstEndRect.height / 2;

    const top = startCenterY - 0.5;
    const height = Math.max(0, endCenterY - startCenterY + 1);

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

