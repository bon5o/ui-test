/** CollapsibleSection の height トランジション時間（ms）と一致させる */
export const ACCORDION_HEIGHT_TRANSITION_MS = 300;

/** 展開後レイアウト確定の余裕 */
export const ACCORDION_SCROLL_SETTLE_MS = 90;

export function accordionExpandWaitMs(): number {
  return ACCORDION_HEIGHT_TRANSITION_MS + ACCORDION_SCROLL_SETTLE_MS;
}
