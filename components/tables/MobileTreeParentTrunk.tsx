"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const TREE_LINE = "bg-[#7D9CD4]/25";

const INDENT_STEP_PX = 10;
const INDENT_MAX_PX = 28;
/** TREE_AXIS_LEFT: left-[7px] と揃える（connector lane 内の軸） */
const CONNECTOR_AXIS_X_PX = 7;

type TrunkStyle = {
  left: number;
  top: number;
  height: number;
};

export function MobileTreeParentTrunk({
  childDepth,
  startElbowMarkerId,
  endElbowMarkerId,
  parentRow,
  childrenBlock,
}: {
  childDepth: number;
  /**
   * 親 elbow 中心（role="parent"）の id
   * trunk はここから開始する
   */
  startElbowMarkerId: string;
  /**
   * 直下最初の子 elbow 中心（role="node"）の id
   * trunk はここで停止する
   */
  endElbowMarkerId: string;
  parentRow: React.ReactNode;
  childrenBlock: React.ReactNode;
}): React.ReactElement {
  const parentDepth = Math.max(0, childDepth - 1);
  const padLeftChildPx = Math.min(childDepth * INDENT_STEP_PX, INDENT_MAX_PX);
  const padLeftParentPx = Math.min(parentDepth * INDENT_STEP_PX, INDENT_MAX_PX);
  const left = padLeftChildPx - padLeftParentPx + CONNECTOR_AXIS_X_PX;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [trunk, setTrunk] = useState<TrunkStyle | null>(null);

  const recalc = () => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    const startEl = document.getElementById(startElbowMarkerId);
    const endEl = document.getElementById(endElbowMarkerId);
    if (!startEl || !endEl) {
      setTrunk(null);
      return;
    }

    const wrapperRect = wrapperEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const startCenterY =
      startRect.top - wrapperRect.top + startRect.height / 2;
    const endCenterY = endRect.top - wrapperRect.top + endRect.height / 2;

    const top = startCenterY - 0.5;
    // 1px 線なので end 中心までを確実に含める
    const height = Math.max(1, endCenterY - startCenterY + 1);

    setTrunk({ left, top, height });
  };

  useLayoutEffect(() => {
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDepth, startElbowMarkerId, endElbowMarkerId]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childDepth, startElbowMarkerId, endElbowMarkerId]);

  return (
    <div ref={wrapperRef} className="relative">
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
      {parentRow}
      {childrenBlock}
    </div>
  );
}

