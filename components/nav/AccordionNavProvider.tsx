"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { accordionExpandWaitMs } from "@/lib/accordionNavConstants";

export type AccordionRegistration = {
  rootRef: RefObject<HTMLElement | null>;
  /** 対象要素がこのアコーディオン内にあれば true にすべきだが、root.contains で判定するため省略可 */
  expand: () => void;
};

type AccordionNavContextValue = {
  register: (reg: AccordionRegistration) => () => void;
  /** 要素 id へ移動。含む親アコーディオンを外側から順に開き、展開後にスクロール */
  navigateToElementId: (elementId: string) => Promise<void>;
};

const AccordionNavContext = createContext<AccordionNavContextValue | null>(null);

/**
 * 目次ジャンプ・深いネストの #id へのアクセス用。
 * CollapsibleSection が rootRef で登録し、navigateToElementId 時に閉じた親を開く。
 */
export function AccordionNavProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const registrationsRef = useRef<AccordionRegistration[]>([]);

  const register = useCallback((reg: AccordionRegistration) => {
    registrationsRef.current.push(reg);
    return () => {
      registrationsRef.current = registrationsRef.current.filter((r) => r !== reg);
    };
  }, []);

  const navigateToElementId = useCallback(async (elementId: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(elementId);
    if (!el) return;

    const regs = [...registrationsRef.current];
    const containing = regs.filter(
      (r) => r.rootRef.current != null && r.rootRef.current.contains(el)
    );

    /** 外側のパネルから先に開く: A が B の祖先なら A を先に */
    containing.sort((a, b) => {
      const ar = a.rootRef.current;
      const br = b.rootRef.current;
      if (!ar || !br) return 0;
      if (ar === br) return 0;
      if (ar.contains(br)) return -1;
      if (br.contains(ar)) return 1;
      return 0;
    });

    containing.forEach((r) => r.expand());

    await new Promise<void>((resolve) => {
      setTimeout(resolve, accordionExpandWaitMs());
    });

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    if (typeof history !== "undefined" && history.replaceState) {
      const hash = `#${elementId}`;
      const url = `${window.location.pathname}${window.location.search}${hash}`;
      history.replaceState(null, "", url);
    }
  }, []);

  const value = useMemo(
    () => ({ register, navigateToElementId }),
    [register, navigateToElementId]
  );

  return (
    <AccordionNavContext.Provider value={value}>{children}</AccordionNavContext.Provider>
  );
}

export function useAccordionNav(): AccordionNavContextValue | null {
  return useContext(AccordionNavContext);
}
