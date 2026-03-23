"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const DEBUG_MOBILE_TREE_TRUNK = process.env.NODE_ENV !== "production";
const DEBUG_PARENT_TRUNK_COLOR = "rgba(255, 0, 0, 1)";

const INDENT_STEP_PX = 10;
const INDENT_MAX_PX = 28;
/** TREE_AXIS_LEFT: left-[7px] と揃える（connector lane 内の軸） */
const CONNECTOR_AXIS_X_PX = 7;
/**
 * PC版の `TreeParentStem` 相当の「短い縦幹」。
 * sibling trunk は `MobileTreeSiblingTrunk` が担当し、
 * ここ（parent trunk）は「長い幹」にならないように固定長にする。
 */
const PARENT_STEM_HEIGHT_PX = 12;
const PARENT_STEM_TOP_OFFSET_PX = 1;
const PARENT_STEM_WIDTH_PX = 3;

type TrunkStyle = {
  left: number;
  top: number;
  height: number;
};

export function MobileTreeParentTrunk({
  childDepth,
  startElbowMarkerId,
  endElbowMarkerId,
  parentId,
  subtreeId,
  parentRow,
  childrenBlock,
}: {
  childDepth: number;
  /**
   * 親 elbow（role="parent"）の id
   * trunk はここから開始する
   */
  startElbowMarkerId: string;
  /**
   * 直下最初の子 elbow（role="node"）の id
   * trunk はここで停止する
   */
  endElbowMarkerId: string;
  parentId?: string;
  subtreeId?: string;
  parentRow: React.ReactNode;
  childrenBlock: React.ReactNode;
}): React.ReactElement {
  // left/top は outgoing elbow marker（startElbowMarkerId）の実測座標から決める。
  // ここで理論計算（indent/connector lane など）をしない。

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [trunk, setTrunk] = useState<TrunkStyle | null>(null);
  const lastLogRef = useRef<{
    left: number;
    top: number;
    height: number;
    startId: string;
    endId: string;
  } | null>(null);

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

    // 親カードの接続点（elbow）直下からだけ描く
    const top = startRect.top - wrapperRect.top + PARENT_STEM_TOP_OFFSET_PX;
    const height = PARENT_STEM_HEIGHT_PX;

    // outgoing marker の中心に揃える（w-px=1px 前提だが実測 width を使う）
    const markerCenterXWithinWrapper =
      startRect.left - wrapperRect.left + startRect.width / 2;
    const left = markerCenterXWithinWrapper - PARENT_STEM_WIDTH_PX / 2;

    if (DEBUG_MOBILE_TREE_TRUNK && typeof window !== "undefined") {
      const prev = lastLogRef.current;
      const shouldLog =
        prev == null ||
        prev.startId !== startElbowMarkerId ||
        prev.endId !== endElbowMarkerId ||
        Math.abs(prev.left - left) > 0.5 ||
        Math.abs(prev.top - top) > 0.5 ||
        Math.abs(prev.height - height) > 0.5;

      if (shouldLog) {
        // eslint-disable-next-line no-console
        console.log("[MobileTreeParentTrunk]", {
          childDepth,
          parentId,
          subtreeId,
          wrapperNodeId: wrapperEl.dataset.debugNodeWrapper,
          startElbowMarkerId,
          endElbowMarkerId,
          left,
          top,
          height,
          wrapperRectTop: wrapperRect.top,
          wrapperRectLeft: wrapperRect.left,
          startRectTop: startRect.top,
          startRectLeft: startRect.left,
          outgoingMarkerNodeId: startEl.dataset.debugOutgoingNode,
          markerWidth: startRect.width,
          startDataset: {
            role: startEl.dataset.mobileTreeElbowRole,
            depth: startEl.dataset.mobileTreeElbowDepth,
          },
          endDataset: {
            role: endEl.dataset.mobileTreeElbowRole,
            depth: endEl.dataset.mobileTreeElbowDepth,
          },
        });
        lastLogRef.current = { left, top, height, startId: startElbowMarkerId, endId: endElbowMarkerId };
      }
    }

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
    <div>
      <div
        ref={wrapperRef}
        className="relative"
        data-debug-line-wrapper="parent-trunk-wrapper"
        data-mobile-tree-parent-trunk-wrapper=""
        data-debug-node-wrapper={parentId ?? ""}
        data-debug-parent-trunk-wrapper={parentId ?? ""}
      >
        {trunk && (
          <div
            aria-hidden
            data-debug-line="parent-trunk"
            className={`pointer-events-none absolute z-[99999] opacity-100 w-[3px]`}
            style={{
              left: trunk.left,
              top: trunk.top,
              height: trunk.height,
              backgroundColor: DEBUG_PARENT_TRUNK_COLOR,
            }}
          />
        )}
        {parentRow}
      </div>
      {childrenBlock}
    </div>
  );
}

