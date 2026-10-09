"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSidebarStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "devmemory-admin-store-v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Backward-compatible alias
export const useStore = useSidebarStore;
