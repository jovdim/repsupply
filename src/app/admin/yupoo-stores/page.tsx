"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Edit, Trash2, ExternalLink, X, Image as ImageIcon, Loader2, Save, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface YupooStore {
  id: number;
  name: string;
  link: string;
  image: string;
}

export default function AdminYupooStoresPage() {
  const [stores, setStores] = useState<YupooStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<YupooStore | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    const { data } = await supabase.from("yupoo_stores").select("*").order("name");
    if (data) setStores(data);
    setLoading(false);
  }

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
  }

  // Image Upload Logic
  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    
    const ext = file.name.split(".").pop() || "png";
    const fileName = `yupoo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
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
    fetchStores();
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from("yupoo_stores").delete().eq("id", id);
    if (error) {
       alert("Error deleting store: " + error.message);
    } else {
       setStores(prev => prev.filter(s => s.id !== id));
       setConfirmDeleteId(null);
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Yupoo Stores</h1>
          <p className="text-text-secondary text-sm">
            {stores.length} verified sellers
          </p>
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
                          className="p-2 bg-neutral-800/50 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all active:scale-95"
                          title="Edit Store"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setConfirmDeleteId(confirmDeleteId === store.id ? null : store.id)}
                            className={`p-2 rounded-lg transition-all active:scale-95 border ${
                              confirmDeleteId === store.id
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-red-500/5 border-red-500/10 text-red-500/60 hover:text-red-400 hover:bg-red-500/10"
                            }`}
                            title="Delete Store"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === store.id && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                              <div className="px-4 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 mb-1">
                                Confirm Delete?
                              </div>
                              <button
                                onClick={() => handleDelete(store.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Yes, Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-400 hover:bg-white/5 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </div>
                          )}
                        </div>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onPaste={handlePaste}>
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-scale-in">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-white">
                 {editingStore ? "Edit Store" : "New Store"}
               </h2>
               <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
             </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Store Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none"
                  placeholder="e.g. TopShoeFactory"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Yupoo Link</label>
                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-lg px-3 focus-within:border-white/30 transition-colors">
                   <ExternalLink className="w-4 h-4 text-neutral-500" />
                   <input
                     type="url"
                     required
                     value={link}
                     onChange={(e) => setLink(e.target.value)}
                     className="flex-1 bg-transparent py-3 text-white outline-none placeholder:text-neutral-600"
                     placeholder="https://..."
                   />
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Store Image</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? "border-white/40 bg-white/5" 
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
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
                   
                   {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                         <Loader2 className="w-6 h-6 animate-spin text-white" />
                         <span className="text-xs text-neutral-400">Uploading...</span>
                      </div>
                   ) : image ? (
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-lg bg-neutral-800 relative overflow-hidden flex-shrink-0 border border-white/10">
                            <Image src={image} alt="Preview" fill className="object-cover" />
                         </div>
                         <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-medium text-white truncate max-w-[200px]">{image.split('/').pop()}</p>
                            <p className="text-[10px] text-neutral-500">Click to replace</p>
                         </div>
                         <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setImage(""); }}
                            className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
                         >
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                   ) : (
                      <div className="flex flex-col items-center gap-2">
                         <ImageIcon className="w-6 h-6 text-neutral-600" />
                         <span className="text-xs text-neutral-400">Drop image here or click to upload</span>
                      </div>
                   )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {editingStore ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
