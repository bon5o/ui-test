"use client";

import { useEffect } from "react";

/**
 * 一時的なデバッグ用: viewport をはみ出している要素を console に出力する。
 * モバイル右余白の原因特定後に削除すること。
 */
export function OverflowDebug() {
  useEffect(() => {
    const docWidth = document.documentElement.clientWidth;
    const all = Array.from(document.querySelectorAll("*"));
    const overflow: { el: Element; rect: DOMRect }[] = [];
    all.forEach((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      if (rect.right > docWidth + 1 || rect.left < -1) {
        overflow.push({ el, rect });
      }
    });
    if (overflow.length > 0) {
      console.log("[OverflowDebug] viewport をはみ出している要素:", docWidth, overflow);
      overflow.forEach(({ el, rect }) => {
        console.log("  overflow element:", el, el.className, rect);
      });
    }
  }, []);

  return null;
}
