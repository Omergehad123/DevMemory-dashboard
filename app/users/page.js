"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSubscribers, useDeleteSubscriber } from "@/lib/hooks/useSubscribers";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const limit = 20;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSubscribers({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const deleteMutation = useDeleteSubscriber();

  const subscribers = useMemo(
    () => data?.subscribers || [],
    [data?.subscribers]
  );
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1, limit: 20 };

  // Calculate some quick stats
  const totalSubscribers = pagination.total || subscribers.length;

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return subscribers.filter(
      (s) => new Date(s.subscribedAt).toDateString() === today
    ).length;
  }, [subscribers]);

  const handleCopyEmail = (id, email) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleCopyAllEmails = () => {
    if (!subscribers.length) return;
    const emailList = subscribers.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emailList);
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  const handleExportCSV = () => {
    if (!subscribers.length) return;
    const header = "Email,Subscribed Date\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.email}","${new Date(s.subscribedAt).toISOString()}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `devmemory-subscribers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Users & Subscribers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              {totalSubscribers} Assigned {totalSubscribers === 1 ? "Email" : "Emails"}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Assigned emails and subscription dates for all newsletter members.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh list"
            className="p-2 rounded-xl bg-[#161f33] border border-[#1e293b] text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-indigo-400" : ""}`}
            />
          </button>

          <button
            onClick={handleCopyAllEmails}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161f33] border border-[#1e293b] text-slate-300 hover:text-white hover:bg-[#1e293b] text-xs font-medium transition-all disabled:opacity-40"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy All</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Assigned Emails
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalSubscribers}</div>
          <p className="text-xs text-slate-400 mt-1">Confirmed newsletter recipients</p>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Subscribed Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{todayCount}</div>
          <p className="text-xs text-slate-400 mt-1">New readers joined today</p>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Delivery Channel
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">Active</div>
          <p className="text-xs text-slate-400 mt-1">Direct developer updates</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by assigned email address..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Table: Assigned Emails and Their Date Only */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0d1322]/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-5 w-12 text-center">#</th>
                <th className="py-3.5 px-5">Assigned Email</th>
                <th className="py-3.5 px-5">Subscribed Date</th>
                <th className="py-3.5 px-5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-sm">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5 text-center">
                      <div className="w-5 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="w-48 h-4 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="w-36 h-4 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="w-8 h-4 bg-slate-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="py-12 px-5 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-8 h-8 text-rose-400" />
                      <p className="text-slate-300 font-medium">
                        {error?.message || "Failed to load subscribers."}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 px-5 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-semibold text-white">
                        No assigned emails found
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {search
                          ? `No subscribers match your search "${search}".`
                          : "When users enter their email on the home page newsletter section, their assigned emails and dates will show up right here."}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="mt-1 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:underline"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((item, index) => {
                  const itemIndex = (pagination.page - 1) * pagination.limit + index + 1;
                  const isCopied = copiedId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#161f33]/60 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-4 px-5 text-center text-xs text-slate-400 font-mono">
                        {itemIndex}
                      </td>

                      {/* Assigned Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {item.email}
                            </span>
                            <button
                              onClick={() => handleCopyEmail(item._id, item.email)}
                              title="Copy email"
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Date Only */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-slate-200 text-xs font-medium">
                              {formatDate(item.subscribedAt)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {getRelativeTime(item.subscribedAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setDeleteTarget(item)}
                          title="Remove subscriber"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-[#1e293b] flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing page <span className="font-bold text-white">{pagination.page}</span> of{" "}
              <span className="font-bold text-white">{pagination.pages}</span> (
              {totalSubscribers} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#161f33] border border-[#1e293b] text-slate-300 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#161f33] border border-[#1e293b] text-slate-300 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Remove Subscriber?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-white">{deleteTarget.email}</span> from the newsletter?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Email</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
