import React from "react";

/**
 * 親 subtree のラッパ（親 stem は `MobileTreeNode` の connector lane 内に描画）。
 * 長い幹は `MobileTreeSiblingTrunk` の責務。
 */
export function MobileTreeParentTrunk({
  parentRow,
  childrenBlock,
  parentNodeId,
}: {
  parentRow: React.ReactNode;
  childrenBlock: React.ReactNode;
  /** DevTools 用: この親 subtree の node id */
  parentNodeId?: string;
}): React.ReactElement {
  return (
    <div
      className="min-w-0"
      data-mobile-tree-parent-subtree={parentNodeId}
      data-debug-node-wrapper={parentNodeId ?? ""}
    >
      {parentRow}
      {childrenBlock}
    </div>
  );
}
