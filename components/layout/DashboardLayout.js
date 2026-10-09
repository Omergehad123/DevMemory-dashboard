"use client";

import { useSidebarStore } from "@/lib/stores/sidebar.store";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useEffect, useState, Suspense } from "react";

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col font-sans">
      <Suspense fallback={<aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#0d1322] border-r border-[#1e293b]" />}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area smoothly adapting to sidebar state */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          mounted && sidebarCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        <Suspense fallback={<header className="h-16 bg-[#0b0f19] border-b border-[#1e293b]" />}>
          <Header />
        </Suspense>
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
