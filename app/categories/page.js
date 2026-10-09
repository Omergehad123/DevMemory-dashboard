"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  X,
  ImageIcon,
  FolderPlus,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hooks/useCategories";
import { useReferences } from "@/lib/hooks/useReferences";

function CategoriesContent() {
  const { data: referencesData } = useReferences({ limit: 1000 });
  const references = referencesData?.references || [];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCategories({ limit: 100 });

  const categories = data?.categories || [];

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState("");

  // Form State: name, slug, description, image, stack, seoTitle, seoDescription
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [stack, setStack] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setStack("");
    setSeoTitle("");
    setSeoDescription("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setStack(cat.stack || "");
    setSeoTitle(cat.seoTitle || "");
    setSeoDescription(cat.seoDescription || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setFormError("");

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      image: image.trim(),
      stack: stack.trim() || "General",
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
    };

    try {
      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id;
        await updateCategoryMutation.mutateAsync({
          id: catId,
          data: payload,
        });
      } else {
        await createCategoryMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save category. Please try again.");
    }
  };

  const handleDelete = async (id, catName) => {
    const refCount = references.filter(
      (r) =>
        r.categoryId === id ||
        r.categoryId?._id === id ||
        r.categoryId?.id === id
    ).length;

    const confirmMsg =
      refCount > 0
        ? `Category "${catName}" has ${refCount} reference(s). Deleting it will also remove associated references. Are you sure?`
        : `Are you sure you want to delete category "${catName}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await deleteCategoryMutation.mutateAsync(id);
      } catch (err) {
        alert(err.message || "Failed to delete category.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>CATEGORIES</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your developer documentation categories, tech stacks, and topics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors disabled:opacity-50"
            title="Refresh categories"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-indigo-400" : ""}`}
            />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Category</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#111827] border border-[#1e293b] rounded-2xl h-72 flex flex-col justify-between p-4"
            >
              <div className="h-32 bg-[#1e293b]/60 rounded-xl mb-3"></div>
              <div className="space-y-2">
                <div className="h-5 bg-[#1e293b]/80 rounded w-2/3"></div>
                <div className="h-3 bg-[#1e293b]/50 rounded w-full"></div>
                <div className="h-3 bg-[#1e293b]/50 rounded w-4/5"></div>
              </div>
              <div className="h-8 bg-[#1e293b]/40 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="p-8 bg-[#111827] border border-rose-500/30 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Failed to load categories
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              {error?.message ||
                "Could not connect to the backend server. Please verify the backend is running."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Responsive Grid Layout for Category Cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const catId = category._id || category.id;
            const count = references.filter(
              (r) =>
                r.categoryId === catId ||
                r.categoryId?._id === catId ||
                r.categoryId?.id === catId
            ).length;

            return (
              <div
                key={catId}
                className="group bg-[#111827] border border-[#1e293b] hover:border-slate-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Category Image Cover */}
                  <div className="h-36 w-full bg-[#0d1322] relative overflow-hidden border-b border-[#1e293b]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/40 to-slate-900 text-slate-400">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Top-right Action Buttons overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0b0f19]/80 backdrop-blur-md px-1.5 py-1 rounded-lg border border-[#1e293b]">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(catId, category.name)}
                        disabled={deleteCategoryMutation.isPending}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stack Pill Badge */}
                    {category.stack && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-[#0b0f19]/85 backdrop-blur-md text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wide shadow-sm">
                          {category.stack}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {category.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 border-t border-[#1e293b] bg-[#0d1322]/40 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <strong className="text-slate-200">{count}</strong>{" "}
                    {count === 1 ? "reference" : "references"}
                  </span>

                  <Link
                    href={`/references?category=${catId}`}
                    className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    View docs &rarr;
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Dedicated "+ Create New Category" Card at the end */}
          <button
            onClick={openCreateModal}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#1e293b] hover:border-indigo-500/60 bg-[#111827]/30 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-300 transition-all duration-300 min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1e293b] group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm border border-transparent group-hover:border-indigo-500/30">
              <Plus className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-white group-hover:text-indigo-300">
              + Create New Category
            </span>
            <span className="text-xs text-slate-400 text-center max-w-[200px] mt-1">
              Add a category with name, description, image, and stack
            </span>
          </button>
        </div>
      )}

      {/* Modal for Creating / Editing Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JavaScript"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    URL Slug (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. javascript"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* 2. Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Core JavaScript language features, ES6+ methods, and modern APIs."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* 3. Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://... or /image.png"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
                {image && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-[#1e293b] bg-[#0b0f19]">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 4. Stack */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stack / Category Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend, Backend, Database"
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              {/* 5. SEO Settings (Collapsible / Group) */}
              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  SEO & Search Engine Metadata (Optional)
                </span>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Custom SEO Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JavaScript Reference Guide — DevMemory"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1e293b] focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Custom SEO Meta Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Master JavaScript syntax, ES6+ methods, async programming, and modern patterns."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1e293b] focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>


              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b] mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  {isSubmitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {isSubmitting
                      ? "Saving..."
                      : editingCategory
                        ? "Save Changes"
                        : "Create Category"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 bg-[#111827] rounded-2xl border border-[#1e293b] flex items-center justify-center text-slate-400">
          Loading categories...
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}

