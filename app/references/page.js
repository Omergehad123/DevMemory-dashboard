"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  X,
  FileCode,
  Tag,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";
import {
  useReferences,
  useDeleteReference,
} from "@/lib/hooks/useReferences";
import DocumentRenderer from "@/components/editor/DocumentRenderer";

function ReferencesContent() {
  const searchParams = useSearchParams();
  const initialCategoryFilter = searchParams.get("category") || "all";

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter);
  const [sortBy, setSortBy] = useState("created-desc");
  const [previewingRef, setPreviewingRef] = useState(null);
  const [previewTab, setPreviewTab] = useState("why");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenPreview = (ref) => {
    setPreviewingRef(ref);
    if (ref.whyContent) setPreviewTab("why");
    else if (ref.whatContent || ref.content) setPreviewTab("what");
    else if (ref.howContent) setPreviewTab("how");
    else setPreviewTab("why");
  };

  const { data: categoriesData } = useCategories({ limit: 100 });
  const categories = categoriesData?.categories || [];

  const {
    data: referencesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useReferences({
    categoryId: selectedCategory,
    search: searchQuery,
    sortBy,
    limit: 100,
  });

  const rawReferences = referencesData?.references || [];
  const references = sortBy === "created-desc"
    ? [...rawReferences].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    : sortBy === "title-asc"
      ? [...rawReferences].sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      : rawReferences;
  const pagination = referencesData?.pagination || {};

  const deleteReferenceMutation = useDeleteReference();

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        setActionError("");
        await deleteReferenceMutation.mutateAsync(id);
        if (previewingRef && (previewingRef._id === id || previewingRef.id === id)) {
          setPreviewingRef(null);
        }
      } catch (err) {
        setActionError(err.message || "Failed to delete reference");
      }
    }
  };

  const getCategoryInfo = (cat) => {
    if (typeof cat === "object" && cat !== null) {
      return {
        name: cat.name || "Uncategorized",
        stack: cat.stack || "General",
      };
    }
    const found = categories.find((c) => c._id === cat || c.id === cat);
    return (
      found || {
        name: "Uncategorized",
        stack: "General",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>REFERENCES HUB</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            DevMemory References
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage documentation guides, syntax cheat-sheets, and code-heavy developer
            references.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors disabled:opacity-50"
            title="Refresh references"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-indigo-400" : ""}`}
            />
          </button>

          <Link
            href="/references/create"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Reference</span>
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search references by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category & Sort Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              suppressHydrationWarning
              className="w-full md:w-48 bg-[#0b0f19] border border-[#1e293b] text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="all">All Categories</option>
              {mounted &&
                categories.map((c) => {
                  const catId = c._id || c.id;
                  return (
                    <option key={catId} value={catId}>
                      {c.name}
                    </option>
                  );
                })}
            </select>
            <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              suppressHydrationWarning
              className="w-full md:w-44 bg-[#0b0f19] border border-[#1e293b] text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="created-desc">Newest Created</option>
              <option value="updated-desc">Recently Updated</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0d1322]/80 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-5">Reference Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Stack</th>
                <th className="py-3.5 px-4">Created At</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/70 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      <p className="text-sm font-medium text-slate-300">
                        Loading references from server...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rose-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8" />
                      <p className="text-sm font-medium">
                        {error?.message || "Failed to load references from server"}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-xs"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : references.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <BookOpen className="w-10 h-10 text-slate-400" />
                      <p className="text-base font-medium text-slate-300">
                        No references found.
                      </p>
                      <Link
                        href="/references/create"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        + Create a new reference now
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                references.map((ref) => {
                  const refId = ref._id || ref.id;
                  const category = getCategoryInfo(ref.categoryId);

                  return (
                    <tr
                      key={refId}
                      className="group hover:bg-[#161f33]/60 transition-colors"
                    >
                      {/* Reference Title */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div>
                            <Link
                              href={`/references/edit/${refId}`}
                              className="font-semibold text-slate-100 hover:text-indigo-300 transition-colors line-clamp-1 block"
                            >
                              {ref.title}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {refId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          {category.name}
                        </span>
                      </td>

                      {/* Stack */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 inline-flex items-center">
                          {category.stack || "General"}
                        </span>
                      </td>

                      {/* Created & Updated At */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Created:{" "}
                              {ref.createdAt
                                ? new Date(ref.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                                : "N/A"}
                            </span>
                          </div>
                          {ref.updatedAt && (
                            <div className="text-[11px] text-slate-500 pl-5">
                              Updated:{" "}
                              {new Date(ref.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Preview */}
                          <button
                            onClick={() => handleOpenPreview(ref)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-[#1e293b] transition-colors"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/references/edit/${refId}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1e293b] transition-colors"
                            title="Edit Reference"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(refId, ref.title)}
                            disabled={deleteReferenceMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                            title="Delete Reference"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0d1322]/50 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {references.length} of {pagination.total || references.length} total references
          </span>
          <span>Connected to MongoDB Backend</span>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {previewingRef && (() => {
        const activeDoc =
          previewTab === "why"
            ? previewingRef.whyContent
            : previewTab === "what"
              ? previewingRef.whatContent || previewingRef.content
              : previewingRef.howContent;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#0d1322]">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {getCategoryInfo(previewingRef.categoryId).name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {previewingRef.createdAt && (
                        <span>
                          Created: {new Date(previewingRef.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {previewingRef.updatedAt && (
                        <span>
                          • Updated: {new Date(previewingRef.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white truncate">
                    {previewingRef.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/references/edit/${previewingRef._id || previewingRef.id
                      }`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => setPreviewingRef(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 3 Preview Tabs: Why / What / How */}
              <div className="flex items-center gap-2 px-6 py-2.5 bg-[#0b0f19] border-b border-[#1e293b]">
                {[
                  {
                    id: "why",
                    label: "Why",
                    hasData: !!previewingRef.whyContent,
                  },
                  {
                    id: "what",
                    label: "What",
                    hasData: !!(
                      previewingRef.whatContent || previewingRef.content
                    ),
                  },
                  {
                    id: "how",
                    label: "How",
                    hasData: !!previewingRef.howContent,
                  },
                ].map((tab) => {
                  const isCurrent = previewTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPreviewTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isCurrent
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${tab.hasData
                          ? isCurrent
                            ? "bg-emerald-300"
                            : "bg-emerald-400"
                          : "bg-slate-600"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Modal Body: Rich Rendered Document */}
              <div className="p-6 overflow-y-auto flex-1 bg-[#0b0f19]">
                <DocumentRenderer doc={activeDoc} />
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#1e293b] bg-[#0d1322] flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  Section: {previewTab.toUpperCase()} • Nodes:{" "}
                  {activeDoc?.content?.length || 0}
                </span>
                <button
                  onClick={() => setPreviewingRef(null)}
                  className="px-4 py-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function ReferencesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 bg-[#111827] rounded-2xl border border-[#1e293b] flex items-center justify-center text-slate-400">
          Loading references...
        </div>
      }
    >
      <ReferencesContent />
    </Suspense>
  );
}
