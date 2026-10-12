"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Code2,
  Sparkles,
  Users,
} from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar.store";
import { useCategories } from "@/lib/hooks/useCategories";
import { useReferences } from "@/lib/hooks/useReferences";
import { useSubscribers } from "@/lib/hooks/useSubscribers";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Layers,
    badgeKey: "categoriesCount",
  },
  {
    name: "References",
    href: "/references",
    icon: BookOpen,
    badgeKey: "referencesCount",
  },
  {
    name: "Create Reference",
    href: "/references/create",
    icon: PlusCircle,
    badge: "New",
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    badgeKey: "subscribersCount",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: referencesData } = useReferences({ limit: 1000 });
  const { data: subscribersData } = useSubscribers({ limit: 100 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = categoriesData?.categories || [];
  const references = referencesData?.references || [];
  const subscribers = subscribersData?.subscribers || [];

  const counts = {
    categoriesCount: mounted ? categories.length : 0,
    referencesCount: mounted ? references.length : 0,
    subscribersCount: mounted
      ? (subscribersData?.pagination?.total ?? subscribers.length)
      : 0,
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[#0d1322] border-r border-[#1e293b] text-slate-300 transition-all duration-300 ease-in-out select-none ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b]/80 relative">
        <Link
          href="/"
          className={`flex items-center gap-3 overflow-hidden transition-all duration-200 ${
            sidebarCollapsed ? "justify-center w-full" : ""
          }`}
          title="DevMemory Admin"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">
                  DevMemory
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Admin
                </span>
              </div>
              <span className="text-xs text-slate-400 truncate">
                Documentation Hub
              </span>
            </div>
          )}
        </Link>

        {/* Toggle Button at the top-right of sidebar */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors ${
            sidebarCollapsed
              ? "absolute -right-3 top-5 bg-[#111827] border border-[#1e293b] shadow-md z-50 text-indigo-400"
              : "shrink-0"
          }`}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          const badgeVal = item.badgeKey ? counts[item.badgeKey] : item.badge;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.name : undefined}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600/90 to-indigo-500/90 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#161f33]"
              } ${sidebarCollapsed ? "justify-center px-0 py-3" : ""}`}
            >
              <Icon
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-indigo-400"
                } ${sidebarCollapsed ? "w-5 h-5" : "w-5 h-5"}`}
              />

              {!sidebarCollapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {!sidebarCollapsed && badgeVal !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#1e293b] text-slate-400 group-hover:bg-indigo-950/60 group-hover:text-indigo-300"
                  }`}
                >
                  {badgeVal}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111827] text-white text-xs rounded-lg shadow-xl border border-[#1e293b] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                  <span>{item.name}</span>
                  {badgeVal !== null && (
                    <span className="bg-indigo-600/40 text-indigo-300 px-1.5 py-0.2 rounded text-[10px]">
                      {badgeVal}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#1e293b] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xs shrink-0 ring-2 ring-emerald-500/20">
          DM
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-white truncate">
              Administrator
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Mode
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
