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

    // start は「この trunk が描く親 nodeRow」直下だけに限定する（descendants 混入を防止）
    const directNodeRowEl = Array.from(containerEl.children).find(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el.hasAttribute("data-mobile-tree-node-row")
    );

    const startMarker = directNodeRowEl?.querySelector<HTMLElement>(
      `[data-mobile-tree-elbow-marker][data-mobile-tree-elbow-depth="${String(
        childDepth
      )}"][data-mobile-tree-elbow-role="parent"]`
    );

    if (!startMarker) {
      setTrunk(null);
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const startRect = startMarker.getBoundingClientRect();

    // 直下 children の「最初の子」だけを end にする（descendants 混入を防ぐ）
    const childrenRoot = containerEl.querySelector<HTMLElement>(
      '[data-mobile-tree-children-root]'
    );
    const firstChildLi = childrenRoot?.firstElementChild;
    if (!(firstChildLi instanceof HTMLElement)) {
      setTrunk(null);
      return;
    }

    const firstChildNodeMarker = firstChildLi.querySelector<HTMLElement>(
      `[data-mobile-tree-elbow-marker][data-mobile-tree-elbow-depth="${String(
        childDepth
      )}"][data-mobile-tree-elbow-role="node"]`
    );
    if (!firstChildNodeMarker) {
      setTrunk(null);
      return;
    }

    const firstEndRect = firstChildNodeMarker.getBoundingClientRect();

    // 1px線なので start/end は中心ではなく「矩形の上下端」で確定させる
    // （top/height の丸めズレで止まり位置が伸びすぎるのを防ぐ）
    const top = startRect.top - containerRect.top;
    const height = Math.max(0, firstEndRect.bottom - startRect.top);

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

