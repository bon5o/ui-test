"use client";

import React from "react";

const TREE_LINE = "bg-[#7D9CD4]/25";
const TREE_ELBOW_Y_PX = 13;

const INDENT_STEP_PX = 10;
const INDENT_MAX_PX = 28;
/** TREE_AXIS_LEFT: left-[7px] と揃える（connector lane 内の軸） */
const CONNECTOR_AXIS_X_PX = 7;

export function MobileTreeParentTrunk({
  childDepth,
  parentRow,
  childrenBlock,
}: {
  /** 親→children の接続。子側の connector lane は depth=childDepth に揃う */
  childDepth: number;
  parentRow: React.ReactNode;
  childrenBlock: React.ReactNode;
}): React.ReactElement {
  const parentDepth = Math.max(0, childDepth - 1);
  const padLeftChildPx = Math.min(childDepth * INDENT_STEP_PX, INDENT_MAX_PX);
  const padLeftParentPx = Math.min(parentDepth * INDENT_STEP_PX, INDENT_MAX_PX);
  const left = padLeftChildPx - padLeftParentPx + CONNECTOR_AXIS_X_PX;

  return (
    <>
      {/* 親 card row の高さに連動し、子の最初の接続点までの短い縦線だけ描く */}
      <div className="relative">
        <div
          aria-hidden
          className={`pointer-events-none absolute z-[1] ${TREE_LINE} w-px`}
          style={{
            left,
            top: TREE_ELBOW_Y_PX,
            // 子の elbow（= TREE_ELBOW_Y_PX）を含めるため、1px分だけ余裕を持たせて終端を作る
            bottom: -(TREE_ELBOW_Y_PX + 1),
          }}
        />
        {parentRow}
      </div>
      {childrenBlock}
    </>
  );
}

