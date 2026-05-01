"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import FloatingSectionNav from "./FloatingSectionNav";

type Ctx = { setTabBarHidden: (hidden: boolean) => void };

const TabBarCtx = createContext<Ctx | null>(null);

/** Скрыть нижний таб-бар (например экран ввода токена на `/`). */
export function useTabBarHidden(): (hidden: boolean) => void {
  const c = useContext(TabBarCtx);
  return c?.setTabBarHidden ?? (() => {});
}

export default function TabBarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [hiddenByPage, setHiddenByPage] = useState(false);
  const setTabBarHidden = useCallback((hidden: boolean) => {
    setHiddenByPage(hidden);
  }, []);

  const onTabRoutes = pathname === "/" || pathname.startsWith("/analytics");
  const showTabBar = onTabRoutes && !hiddenByPage;

  const value = useMemo(() => ({ setTabBarHidden }), [setTabBarHidden]);

  return (
    <TabBarCtx.Provider value={value}>
      {children}
      {showTabBar ? <FloatingSectionNav /> : null}
    </TabBarCtx.Provider>
  );
}
