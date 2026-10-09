"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronRight,
  Database,
  ExternalLink,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useReferences } from "@/lib/hooks/useReferences";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const { data: referencesData } = useReferences({ limit: 1000 });
  const { data: categoriesData } = useCategories({ limit: 100 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = categoriesData?.categories || [];
  const references = referencesData?.references || [];

  const getPageInfo = () => {
    if (pathname === "/") return { title: "Overview", group: "Dashboard" };
    if (pathname === "/categories")
      return { title: "Categories Management", group: "Resources" };
    if (pathname === "/references")
      return { title: "References Hub", group: "Resources" };
    if (pathname === "/references/create")
      return { title: "Create New Reference", group: "Editor" };
    if (pathname.startsWith("/references/edit/"))
      return { title: "Edit Reference", group: "Editor" };
    return { title: "Dashboard", group: "DevMemory" };
  };

  const { title, group } = getPageInfo();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-6">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-slate-200 transition-colors">
            {group}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-200 font-semibold">{title}</span>
        </div>
      </div>

      {/* Right: Actions & Stats Pill */}
      <div className="flex items-center gap-3.5">
        {mounted && (
          <div className="hidden md:flex items-center gap-2 bg-[#111827] border border-[#1e293b] px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {references.length} References
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-cyan-400 font-semibold">
              {categories.length} Categories
            </span>
          </div>
        )}

        {/* Primary CTA (if not already on create page) */}
        {pathname !== "/references/create" && (
          <Link
            href="/references/create"
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Reference</span>
          </Link>
        )}
      </div>
    </header>
  );
}
