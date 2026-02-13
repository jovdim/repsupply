"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCategories, invalidateCategoryCache, type CategoryFromDB as Category } from "@/lib/supabase/categories";
import { invalidateAdminCache } from "@/lib/supabase/admin";
import { Plus, Search, Settings, Trash2, Star, GripVertical, X, Check, Image as ImageIcon, Upload, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Featured toggle loading
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const supabase = createClient();

  async function fetchCategories() {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleOpenModal(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setImage(category.image);
    } else {
      setEditingCategory(null);
      setName("");
      setSlug("");
      setImage("");
    }
    setIsModalOpen(true);
    // Reset upload and delete state
    setUploading(false);
    setIsDragOver(false);
    setIsDeleting(false);
  }

  // Image Upload Logic
  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    
    const ext = file.name.split(".").pop() || "png";
    const fileName = `category-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images") // Re-using product-images bucket for simplicity
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      alert("Error uploading image: " + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setImage(publicUrl);
    setUploading(false);
  }

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, []);

  // Paste handler for modal
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) handleImageUpload(file);
        return;
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({ name, slug, image })
        .eq("id", editingCategory.id);
      
      if (error) alert("Error updating category: " + error.message);
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ name, slug, image });
      
      if (error) alert("Error creating category: " + error.message);
    }

    setIsModalOpen(false);
    invalidateCategoryCache();
    invalidateAdminCache();
    fetchCategories();
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
       alert("Error deleting category: " + error.message);
    } else {
       invalidateCategoryCache();
       invalidateAdminCache();
       setCategories(prev => prev.filter(c => c.id !== id));
    }
  }

  async function handleToggleFeatured(id: number, currentValue: boolean) {
    setTogglingId(id);
    const { error } = await supabase
      .from("categories")
      .update({ is_featured: !currentValue })
      .eq("id", id);
    
    if (error) {
      alert("Error updating category: " + error.message);
    } else {
      invalidateCategoryCache();
      invalidateAdminCache();
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, is_featured: !currentValue } : c
      ));
    }
    setTogglingId(null);
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingCategory && name) {
      setSlug(name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""));
    }
  }, [name, editingCategory]);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCount = categories.filter(c => c.is_featured).length;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="relative">
      <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Categories</h1>
            <p className="text-text-secondary text-sm">
              {categories.length} categories · {featuredCount} featured on homepage
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-white/15 transition-all placeholder:text-neutral-600 focus:ring-0"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center text-text-muted">
            <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <p className="text-sm font-medium">
              {searchQuery ? "No categories match your search." : "No categories yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.01] transition-colors group/row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neutral-800 border border-white/5 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                          {cat.image ? (
                            <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-neutral-600" />
                          )}
                        </div>
                        <span className="font-semibold text-white text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-neutral-400 bg-white/5 px-2 py-1 rounded font-mono">
                        /{cat.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(cat.id, !!cat.is_featured)}
                        disabled={togglingId === cat.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          cat.is_featured ? "bg-white" : "bg-neutral-700"
                        } ${togglingId === cat.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                        title={cat.is_featured ? "Remove from homepage" : "Show on homepage"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                            cat.is_featured 
                              ? "translate-x-6 bg-black" 
                              : "translate-x-1 bg-neutral-400"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all active:scale-95 group/btn"
                          title="Manage Category"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">Manage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <span className="text-xs text-neutral-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-white text-black"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Form Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-lg bg-neutral-950 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${
          isModalOpen ? "translate-x-0" : "translate-x-full invisible"
        } flex flex-col h-screen`}
      >
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editingCategory ? "Update Category" : "New Category"}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {editingCategory ? "Editing category details" : "Create a new product category"}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all active:scale-95 border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700"
                  placeholder="e.g. Hoodies"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">URL Slug <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700 font-mono"
                  placeholder="e.g. hoodies"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Category Media <span className="text-red-500">*</span></label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 group overflow-hidden ${
                    isDragOver 
                      ? "border-white/40 bg-white/5" 
                      : "border-white/5 bg-neutral-900/30 hover:border-white/10 hover:bg-neutral-900/50"
                  }`}
                >
                   <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) handleImageUpload(file);
                     }}
                   />
                   
                   <div className="aspect-video flex items-center justify-center">
                      {uploading ? (
                         <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-white opacity-40" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Uploading...</span>
                         </div>
                      ) : image ? (
                         <div className="absolute inset-0 p-3">
                            <div className="relative w-full h-full rounded-xl overflow-hidden group/img shadow-2xl">
                               <Image src={image} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover/img:scale-110" />
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                  <div className="text-center transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300">
                                     <ImageIcon className="w-6 h-6 text-white mx-auto mb-2 opacity-80" />
                                     <p className="text-[10px] font-bold text-white uppercase tracking-widest">Replace Media</p>
                                  </div>
                               </div>
                               <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setImage(""); }}
                                  className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg transition-colors backdrop-blur-md z-10"
                               >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                         </div>
                      ) : (
                         <div className="text-center p-8">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 shadow-inner">
                              <Upload className="w-6 h-6 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                            </div>
                            <p className="text-xs font-semibold text-neutral-400">Click or drop to upload</p>
                            <p className="text-[9px] text-neutral-600 mt-2 uppercase tracking-widest font-bold">PNG, JPG, WEBP • MAX 5MB</p>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-white/5">
              <button
                type="submit"
                disabled={uploading || !name || !slug || !image}
                className="flex-[2] bg-white text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
              
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    if (isDeleting) {
                      handleDelete(editingCategory.id);
                      setIsModalOpen(false);
                    } else {
                      setIsDeleting(true);
                    }
                  }}
                  className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isDeleting 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                  }`}
                  title={isDeleting ? "Confirm Delete" : "Delete Category"}
                >
                  {isDeleting ? <Trash2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  <span className="truncate">{isDeleting ? "Sure?" : "Delete"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
