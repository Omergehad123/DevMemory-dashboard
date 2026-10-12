"use client";

import Link from "next/link";
import {
  BookOpen,
  Layers,
  Code2,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Terminal,
  FileEdit,
  ExternalLink,
  Users,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useReferences } from "@/lib/hooks/useReferences";
import { useSubscribers } from "@/lib/hooks/useSubscribers";
import { useEffect, useState } from "react";

export default function OverviewPage() {
  const { data: referencesData, isLoading: isReferencesLoading } = useReferences({
    limit: 100,
  });
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({
    limit: 100,
  });
  const { data: subscribersData } = useSubscribers({
    limit: 100,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = categoriesData?.categories || [];
  const references = referencesData?.references || [];
  const subscribers = subscribersData?.subscribers || [];
  const totalSubscribers = subscribersData?.pagination?.total ?? subscribers.length;

  if (!mounted || isCategoriesLoading || isReferencesLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-[#111827] rounded-xl border border-[#1e293b]"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalReferences = references.length;
  const totalCategories = categories.length;

  // Count code blocks across all references (checking why, what, how, and legacy content)
  const totalCodeBlocks = references.reduce((acc, ref) => {
    const countNodes = (doc) =>
      doc?.content?.filter((node) => node.type === "codeBlock")?.length || 0;
    const whyCount = countNodes(ref.whyContent);
    const whatCount = countNodes(ref.whatContent || ref.content);
    const howCount = countNodes(ref.howContent);
    return acc + whyCount + whatCount + howCount;
  }, 0);

  // Group references by category
  const categoryCounts = categories.map((cat) => {
    const catId = cat._id || cat.id;
    const count = references.filter(
      (r) =>
        r.categoryId === catId ||
        r.categoryId?._id === catId ||
        r.categoryId?.id === catId
    ).length;
    return {
      ...cat,
      id: catId,
      count,
      percentage: totalReferences > 0 ? Math.round((count / totalReferences) * 100) : 0,
    };
  });

  const recentReferences = references.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total References */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 hover:border-indigo-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total References
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalReferences}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Live Backend API</span>
            <Link
              href="/references"
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 hover:border-cyan-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalCategories}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Organized topic hubs</span>
            <Link
              href="/categories"
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
            >
              Explore <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Code Blocks */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Code Snippets
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalCodeBlocks}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Syntax highlighted</span>
            <span className="text-emerald-400 font-medium">Multi-language</span>
          </div>
        </div>

        {/* Card 4: Newsletter Users */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 hover:border-purple-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Newsletter Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalSubscribers}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Assigned emails</span>
            <Link
              href="/users"
              className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
            >
              View users <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Categories Breakdown & Recent References */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent References (2 cols) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1e293b] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Recent References</h2>
                <p className="text-xs text-slate-400">
                  Latest documentation references created in the system
                </p>
              </div>
              <Link
                href="/references"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                View all references <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#1e293b]/70">
              {recentReferences.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No references found. Create your first reference!
                </div>
              ) : (
                recentReferences.map((ref) => {
                  const refId = ref._id || ref.id;
                  const category =
                    typeof ref.categoryId === "object" && ref.categoryId !== null
                      ? ref.categoryId
                      : categories.find(
                          (c) => c._id === ref.categoryId || c.id === ref.categoryId
                        );
                  return (
                    <div
                      key={refId}
                      className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#161f33]/40 -mx-3 px-3 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/references/edit/${refId}`}
                            className="font-medium text-sm text-slate-200 hover:text-indigo-400 transition-colors truncate block"
                          >
                            {ref.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {category && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {category.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3" />
                            {new Date(ref.updatedAt || ref.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/references/edit/${refId}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
                          title="Edit Reference"
                        >
                          <FileEdit className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {recentReferences.length} of {totalReferences} references
            </span>
            <Link
              href="/references/create"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + Create New
            </Link>
          </div>
        </div>

        {/* Categories Breakdown (1 col) */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Categories</h2>
                <p className="text-xs text-slate-400">
                  Distribution across stacks
                </p>
              </div>
              <Link
                href="/categories"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-4">
              {categoryCounts.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      <span className="text-slate-300 font-medium truncate max-w-[120px]">
                        {cat.name}
                      </span>
                      {cat.stack && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({cat.stack})
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-semibold">
                      {cat.count} {cat.count === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e293b]">
            <Link
              href="/categories"
              className="flex items-center justify-center gap-2 w-full py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Category</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
