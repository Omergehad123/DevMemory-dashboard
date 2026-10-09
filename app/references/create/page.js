"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  BookOpen,
  Eye,
  FileEdit,
  FolderOpen,
  Loader2,
  HelpCircle,
  Code,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateReference } from "@/lib/hooks/useReferences";
import TiptapEditor from "@/components/editor/TiptapEditor";
import DocumentRenderer from "@/components/editor/DocumentRenderer";

const SAMPLE_TEMPLATES = {
  why: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Why use Array.prototype.map()?" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Traditional iterative loops require manual state management, index tracking, and array mutations. Using map provides a declarative, immutable approach that transforms data without altering the source collection.",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Key Advantage: Predictable, pure transformations prevent accidental state mutation bugs in modern applications.",
              },
            ],
          },
        ],
      },
    ],
  },
  what: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "What is Array.prototype.map()?" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The ",
          },
          {
            type: "text",
            marks: [{ type: "code" }],
            text: "map()",
          },
          {
            type: "text",
            text: " method creates a new array populated with the results of calling a provided callback function on every element in the calling array.",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [
          {
            type: "text",
            text: "// Signature\nconst newArray = arr.map((element, index, array) => { /* return transformed element */ });",
          },
        ],
      },
    ],
  },
  how: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "How to use Array.prototype.map()" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Here is a practical example transforming an array of numbers and objects:",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [
          {
            type: "text",
            text: "const numbers = [1, 2, 3, 4];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled); // [2, 4, 6, 8]\n\n// Chaining with filter\nconst users = [\n  { id: 1, name: 'Alice', active: true },\n  { id: 2, name: 'Bob', active: false },\n];\nconst activeNames = users.filter(u => u.active).map(u => u.name);\nconsole.log(activeNames); // ['Alice']",
          },
        ],
      },
    ],
  },
};

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

export default function CreateReferencePage() {
  const router = useRouter();
  const createReferenceMutation = useCreateReference();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const categories = categoriesData?.categories || [];

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // 3 separate optional content states
  const [whyDoc, setWhyDoc] = useState(null);
  const [whatDoc, setWhatDoc] = useState(null);
  const [howDoc, setHowDoc] = useState(null);

  // Active section tab: 'why' | 'what' | 'how'
  const [activeSection, setActiveSection] = useState("why");

  // View mode for the editor surface: 'editor' | 'preview' | 'split'
  const [activeViewMode, setActiveViewMode] = useState("editor");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0]._id || categories[0].id);
    }
  }, [categories, categoryId]);

  const handleLoadSample = () => {
    setTitle("Understanding Array Transformations & Mapping Patterns");
    setSlug("array-transformations-mapping-patterns");
    setDescription("Comprehensive guide on array transformations and mapping patterns.");
    setWhyDoc(SAMPLE_TEMPLATES.why);
    setWhatDoc(SAMPLE_TEMPLATES.what);
    setHowDoc(SAMPLE_TEMPLATES.how);
  };

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
      setErrorMessage("Please enter a reference title.");
      return;
    }
    if (!categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    setErrorMessage("");

    try {
      await createReferenceMutation.mutateAsync({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        categoryId,
        whyContent: hasContent(whyDoc) ? whyDoc : null,
        whatContent: hasContent(whatDoc) ? whatDoc : null,
        howContent: hasContent(howDoc) ? howDoc : null,
      });

      router.push("/references");
    } catch (err) {
      setErrorMessage(
        err.message || "Failed to save reference. Please check inputs."
      );
    }
  };


  const isSaving = createReferenceMutation.isPending;

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
              <span>REFERENCE CREATOR</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create New Reference
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Sample Loader */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#111827] hover:bg-[#1e293b] text-slate-300 text-xs font-medium rounded-xl border border-[#1e293b] transition-colors cursor-pointer"
            title="Load sample Why / What / How template"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample (Why/What/How)</span>
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Reference</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
          <span>{errorMessage}</span>
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
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((c) => {
                    const catId = c._id || c.id;
                    return (
                      <option key={catId} value={catId}>
                        {c.name}
                      </option>
                    );
                  })
                )}
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
              placeholder="e.g. Array.prototype.map() - Complete Guide & Use Cases"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
