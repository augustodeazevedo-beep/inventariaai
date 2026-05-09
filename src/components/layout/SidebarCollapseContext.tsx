import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Ctx = { collapsed: boolean; toggle: () => void };
const SidebarCollapseContext = createContext<Ctx>({ collapsed: false, toggle: () => {} });

const STORAGE_KEY = "inventaria.sidebar.collapsed";

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <SidebarCollapseContext.Provider value={{ collapsed, toggle: () => setCollapsed((c) => !c) }}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export const useSidebarCollapse = () => useContext(SidebarCollapseContext);