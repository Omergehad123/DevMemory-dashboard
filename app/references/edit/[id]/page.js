"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  BookOpen,
  Eye,
  FileEdit,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Code,
  Wrench,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";
import {
  useReference,
  useUpdateReference,
  useDeleteReference,
} from "@/lib/hooks/useReferences";
import { slugify } from "@/lib/utils/slugify";
import TiptapEditor from "@/components/editor/TiptapEditor";
import DocumentRenderer from "@/components/editor/DocumentRenderer";

const hasContent = (doc) => {
  if (!doc || !doc.content || !Array.isArray(doc.content)) return false;
  return doc.content.some((node) => {
    if (node.type === "paragraph") {
      return (
        node.content &&
        node.content.some((c) => c.text && c.text.trim().length > 0)
      );
    }
    return true;
  });
};

export default function EditReferencePage({ params }) {
  const resolvedParams = use(params);
  const refId = resolvedParams.id;
  const router = useRouter();

  const {
    data: reference,
    isLoading: isRefLoading,
    isError: isRefError,
    error: refError,
  } = useReference(refId);

  const { data: categoriesData } = useCategories({ limit: 100 });
  const categories = categoriesData?.categories || [];

  const updateReferenceMutation = useUpdateReference();
  const deleteReferenceMutation = useDeleteReference();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(newTitle));
    }
  };

  // 3 separate optional content sections
  const [whyDoc, setWhyDoc] = useState(null);
  const [whatDoc, setWhatDoc] = useState(null);
  const [howDoc, setHowDoc] = useState(null);

  // Active section tab: 'why' | 'what' | 'how'
  const [activeSection, setActiveSection] = useState("why");

  // View mode for the editor surface: 'editor' | 'preview' | 'split'
  const [activeViewMode, setActiveViewMode] = useState("editor");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (reference && !initialized) {
      setTitle(reference.title || "");
      setSlug(reference.slug || slugify(reference.title || ""));
      setDescription(reference.description || "");
      setSeoTitle(reference.seoTitle || "");
      setSeoDescription(reference.seoDescription || "");
      const catId =
        typeof reference.categoryId === "object" && reference.categoryId !== null
          ? reference.categoryId._id || reference.categoryId.id
          : reference.categoryId || "";
      setCategoryId(catId);

      setWhyDoc(reference.whyContent || null);
      setWhatDoc(reference.whatContent || reference.content || null);
      setHowDoc(reference.howContent || null);

      // Default active tab to whichever section has content first
      if (hasContent(reference.whyContent)) {
        setActiveSection("why");
      } else if (hasContent(reference.whatContent || reference.content)) {
        setActiveSection("what");
      } else if (hasContent(reference.howContent)) {
        setActiveSection("how");
      } else {
        setActiveSection("why");
      }

      setInitialized(true);
    }
  }, [reference, initialized]);


  if (isRefLoading) {
    return (
      <div className="h-64 bg-[#111827] rounded-2xl border border-[#1e293b] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm font-medium text-slate-300">
            Loading reference details...
          </span>
        </div>
      </div>
    );
  }

  if (isRefError || (!reference && !isRefLoading)) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Reference Not Found</h2>
        <p className="text-slate-400 text-sm">
          {refError?.message ||
            "The requested reference could not be found or was removed."}
        </p>
        <Link
          href="/references"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to References</span>
        </Link>
      </div>
    );
  }

  const getCurrentDoc = () => {
    if (activeSection === "why") return whyDoc;
    if (activeSection === "what") return whatDoc;
    return howDoc;
  };

  const setCurrentDoc = (json) => {
    if (activeSection === "why") setWhyDoc(json);
    else if (activeSection === "what") setWhatDoc(json);
    else setHowDoc(json);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ text: "Please enter a reference title.", type: "error" });
      return;
    }

    setMessage({ text: "", type: "" });

    const computedSlug = slug.trim() ? slugify(slug.trim()) : slugify(title.trim());

    try {
      await updateReferenceMutation.mutateAsync({
        id: refId,
        data: {
          title: title.trim(),
          slug: computedSlug,
          description: description.trim(),
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          categoryId,
          whyContent: hasContent(whyDoc) ? whyDoc : null,
          whatContent: hasContent(whatDoc) ? whatDoc : null,
          howContent: hasContent(howDoc) ? howDoc : null,
        },
      });

      setMessage({ text: "Reference updated successfully!", type: "success" });
      setTimeout(() => {
        router.push("/references");
      }, 800);
    } catch (err) {

      setMessage({
        text: err.message || "Failed to update reference.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteReferenceMutation.mutateAsync(refId);
        router.push("/references");
      } catch (err) {
        setMessage({
          text: err.message || "Failed to delete reference.",
          type: "error",
        });
      }
    }
  };

  const isSaving = updateReferenceMutation.isPending;
  const isDeleting = deleteReferenceMutation.isPending;

  const sectionConfig = [
    {
      id: "why",
      label: "Why",
      badge: "Motivation & Problem",
      icon: HelpCircle,
      hasData: hasContent(whyDoc),
    },
    {
      id: "what",
      label: "What",
      badge: "Concept & Definition",
      icon: Code,
      hasData: hasContent(whatDoc),
    },
    {
      id: "how",
      label: "How",
      badge: "Usage & Implementation",
      icon: Wrench,
      hasData: hasContent(howDoc),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/references"
            className="p-2 rounded-xl bg-[#111827] border border-[#1e293b] text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            title="Back to References"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>REFERENCE EDITOR</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight truncate max-w-md">
              {title || "Edit Reference"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Reference"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-0.5 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setActiveViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${activeViewMode === "editor"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${activeViewMode === "preview"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("split")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${activeViewMode === "split"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <span>Split</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Reference</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message notification */}
      {message.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 animate-fadeIn ${message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metadata Form: Category, Title, Slug, Description & SEO */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category *
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                suppressHydrationWarning
                className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 text-white text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none cursor-pointer"
              >
                {categories.map((c) => {
                  const catId = c._id || c.id;
                  return (
                    <option key={catId} value={catId}>
                      {c.name}
                    </option>
                  );
                })}
              </select>
              <FolderOpen className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reference Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reference Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Slug & Summary Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#1e293b]">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Slug (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. array-map"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => setSlug(slugify(slug || title))}
              className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none placeholder-slate-400 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Auto-generated from title if left empty.
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Description / Summary (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Comprehensive guide on Array.map transformation patterns with code examples."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none placeholder-slate-400"
            />
          </div>
        </div>

        {/* SEO Metadata Box */}
        <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] space-y-3">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
            SEO & Search Engine Metadata (Optional)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Custom SEO Title
              </label>
              <input
                type="text"
                placeholder="e.g. JavaScript Array.map() Guide & Examples — DevMemory"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-[#111827] border border-[#1e293b] focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Custom SEO Meta Description
              </label>
              <input
                type="text"
                placeholder="e.g. Learn how to transform arrays immutably with Array.prototype.map() in JavaScript."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full bg-[#111827] border border-[#1e293b] focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>


      {/* 3 CONTENT SECTION TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Reference Sections</span>
              <span className="text-[11px] text-indigo-400 font-normal normal-case">
                (Why, What, How — all optional)
              </span>
            </h2>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sectionConfig.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${isActive
                    ? "bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/40"
                    : "bg-[#111827] border-[#1e293b] hover:border-slate-700 hover:bg-[#131d31]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-[#0b0f19] text-slate-400 border border-[#1e293b]"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`text-sm font-bold block ${isActive ? "text-white" : "text-slate-300"
                        }`}
                    >
                      {sec.label} Content
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {sec.badge}
                    </span>
                  </div>
                </div>

                <div>
                  {sec.hasData ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Drafted</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      Optional
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Editor & Preview Surface */}
        <div className="space-y-3">
          {activeViewMode === "editor" && (
            <TiptapEditor
              key={activeSection}
              content={getCurrentDoc()}
              onChange={(json) => setCurrentDoc(json)}
            />
          )}

          {activeViewMode === "preview" && (
            <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 md:p-8 min-h-[420px] shadow-xl">
              <div className="border-b border-[#1e293b] pb-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {activeSection.toUpperCase()} CONTENT PREVIEW
                  </span>
                  <h1 className="text-2xl font-bold text-white mt-1">
                    {title || "Untitled Reference"}
                  </h1>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  Section: {activeSection}
                </span>
              </div>
              <DocumentRenderer doc={getCurrentDoc()} />
            </div>
          )}

          {activeViewMode === "split" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  Editor ({activeSection.toUpperCase()})
                </div>
                <TiptapEditor
                  key={activeSection}
                  content={getCurrentDoc()}
                  onChange={(json) => setCurrentDoc(json)}
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  Live Preview ({activeSection.toUpperCase()})
                </div>
                <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 min-h-[420px] overflow-y-auto max-h-[600px] shadow-xl">
                  <div className="border-b border-[#1e293b] pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">
                      {title || "Untitled Reference"}
                    </h2>
                  </div>
                  <DocumentRenderer doc={getCurrentDoc()} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
