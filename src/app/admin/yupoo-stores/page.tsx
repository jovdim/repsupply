"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { invalidateYupooCache, getYupooStores } from "@/lib/supabase/yupoo";
import { Plus, Search, Settings, Trash2, ExternalLink, X, Image as ImageIcon, Loader2, Save, ChevronLeft, ChevronRight, Check, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

interface YupooStore {
  id: number;
  name: string;
  link: string;
  image: string;
}

export default function AdminYupooStoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<YupooStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<YupooStore | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  async function fetchStores() {
    setLoading(true);
    const data = await getYupooStores();
    setStores(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchStores();
  }, []);

  function handleOpenModal(store?: YupooStore) {
    if (store) {
      setEditingStore(store);
      setName(store.name);
      setLink(store.link);
      setImage(store.image || "");
    } else {
      setEditingStore(null);
      setName("");
      setLink("");
      setImage("");
    }
    setIsModalOpen(true);
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
    
    const compressed = await compressImage(file);
    const ext = compressed.name.split(".").pop() || "webp";
    const fileName = `yupoo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, compressed);

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
    
    const storeData = { name, link, image };

    if (editingStore) {
      const { error } = await supabase
        .from("yupoo_stores")
        .update(storeData)
        .eq("id", editingStore.id);
      
      if (error) alert("Error updating store: " + error.message);
    } else {
      const { error } = await supabase
        .from("yupoo_stores")
        .insert(storeData);
      
      if (error) alert("Error creating store: " + error.message);
    }

    setIsModalOpen(false);
    invalidateYupooCache();
    fetchStores();
  }

  async function handleDelete(id: number) {
    try {
      // 1. Get store image URL
      const storeToDelete = stores.find(s => s.id === id);
      if (storeToDelete?.image) {
        const fileName = storeToDelete.image.split("/").pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from("product-images")
            .remove([fileName]);
          
          if (storageError) {
            console.error("Error cleaning up storage:", storageError);
          }
        }
      }

      // 2. Delete the record
      const { error } = await supabase.from("yupoo_stores").delete().eq("id", id);
      if (error) {
        alert("Error deleting store: " + error.message);
      } else {
        setStores(prev => prev.filter(s => s.id !== id));
        invalidateYupooCache();
      }
    } catch (err) {
      console.error("Delete process error:", err);
      alert("An unexpected error occurred during deletion.");
    }
  }

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
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
            <h1 className="text-3xl font-bold text-white mb-1">Yupoo Stores</h1>
            <p className="text-text-secondary text-sm">
              {stores.length} verified sellers
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="Search stores..."
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

      {/* Stores List */}
      <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center text-text-muted">
            <Loader2 className="inline-block w-6 h-6 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <p className="text-sm font-medium">
              {searchQuery ? "No stores match your search." : "No stores yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Store Name</th>
                  <th className="px-6 py-4">Link</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedStores.map((store) => (
                  <tr key={store.id} className="hover:bg-white/[0.01] transition-colors group/row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-white/5 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                          {store.image ? (
                            <Image src={store.image} alt={store.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-neutral-600" />
                          )}
                        </div>
                        <span className="font-semibold text-white text-sm">{store.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={store.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-xs"
                      >
                         <ExternalLink className="w-3 h-3" />
                         {store.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(store)}
                          className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all active:scale-95 group/btn"
                          title="Manage Store"
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
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredStores.length)} of {filteredStores.length}
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
                {editingStore ? "Update Store" : "New Store"}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {editingStore ? "Editing store details" : "Create a new verified seller"}
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
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Store Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700"
                  placeholder="e.g. TopShoeFactory"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Yupoo Link <span className="text-red-500">*</span></label>
                <div className="relative group/input">
                  <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within/input:text-white transition-colors" />
                  <input
                    type="url"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700 font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Store Media <span className="text-red-500">*</span></label>
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
                disabled={uploading || !name || !link}
                className="flex-[2] bg-white text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingStore ? "Save Changes" : "Create Store"}
              </button>
              
              {editingStore && (
                <button
                  type="button"
                  onClick={() => {
                    if (isDeleting && editingStore) {
                      handleDelete(editingStore.id);
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
                  title={isDeleting ? "Confirm Delete" : "Delete Store"}
                >
                  <Trash2 className="w-4 h-4" />
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
