"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Check, Link2, AlertCircle, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { convertLink } from "@/lib/linkConverter";

interface Category {
  id: number;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Multi-Category State
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link converter state
  const [linkConversion, setLinkConversion] = useState<{
    success: boolean;
    agentCount: number;
    platform: string | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  function toggleCategory(id: number) {
    setSelectedCategoryIds(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  }

  // Image upload handler
  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    
    const ext = file.name.split(".").pop() || "png";
    const fileName = `product-new-${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

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

  // Paste handler
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

  // Link conversion on change
  function handleLinkChange(value: string) {
    setLink(value);
    
    if (!value.trim()) {
      setLinkConversion(null);
      return;
    }

    const result = convertLink(value.trim());
    if (result.success) {
      setLinkConversion({
        success: true,
        agentCount: result.results?.length || 0,
        platform: result.platform || null,
        error: null,
      });
    } else {
      setLinkConversion({
        success: false,
        agentCount: 0,
        platform: null,
        error: result.error || "Unsupported link",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        price,
        image, 
        link,
        description,
        badge: badge || null,
        is_featured: isFeatured,
      })
      .select()
      .single();

    if (productError) {
      alert("Error creating product: " + productError.message);
      setLoading(false);
      return;
    }

    if (selectedCategoryIds.length > 0 && product) {
      const categoryInserts = selectedCategoryIds.map(catId => ({
        product_id: product.id,
        category_id: catId,
      }));

      const { error: catError } = await supabase
        .from("product_categories")
        .insert(categoryInserts);

      if (catError) {
        console.error("Error linking categories:", catError);
      }
    }

    // Create Default QC Group
    if (product) {
       await supabase.from("qc_groups").insert({
          product_id: product.id,
          folder_name: "Group 1",
          sort_order: 0
       });
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20" onPaste={handlePaste}>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 -ml-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Product</h1>
          <p className="text-text-secondary text-sm">Create a new item in your catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none transition-colors"
                placeholder="e.g. Nike Dunk Low"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Price</label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none transition-colors"
                placeholder="e.g. ¥299"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium text-text-secondary mb-2 block">Categories</label>
               
               {/* Category Search */}
               <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-white/30 outline-none"
                  />
               </div>

               <div className="border border-white/10 rounded-xl bg-black/20 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {categories
                        .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map(cat => {
                         const isSelected = selectedCategoryIds.includes(cat.id);
                         return (
                            <div 
                               key={cat.id}
                               onClick={() => toggleCategory(cat.id)}
                               className={`cursor-pointer rounded-lg px-3 py-2 flex items-center gap-3 transition-colors ${
                                  isSelected 
                                     ? "bg-white/10 text-white" 
                                     : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                               }`}
                            >
                               <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                  isSelected ? "bg-white border-white" : "border-neutral-600"
                               }`}>
                                  {isSelected && <Check className="w-3 h-3 text-black" />}
                               </div>
                               <span className="text-sm">{cat.name}</span>
                            </div>
                         );
                      })}
                      {categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                          <p className="text-xs text-neutral-500 text-center py-4">No categories found.</p>
                      )}
                  </div>
               </div>
               
               {/* Selected Tags */}
               {selectedCategoryIds.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-3">
                    {selectedCategoryIds.map(id => {
                        const cat = categories.find(c => c.id === id);
                        if (!cat) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-xs text-white border border-white/5">
                             {cat.name}
                             <button
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); toggleCategory(id); }}
                                className="hover:text-white/70"
                             >
                                <X className="w-3 h-3" />
                             </button>
                          </span>
                        );
                    })}
                 </div>
               )}

               {selectedCategoryIds.length === 0 && (
                  <p className="text-xs text-amber-500 mt-2">Please select at least one category.</p>
               )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none transition-colors"
                placeholder="e.g. Hot, New, Sale"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none resize-none transition-colors"
              placeholder="e.g. Premium quality leather..."
            />
          </div>
           
           <div className="flex items-center gap-3 p-4 bg-black/20 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                  isFeatured ? "bg-white" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                    isFeatured ? "translate-x-6 bg-black" : "translate-x-1 bg-neutral-400"
                  }`}
                />
              </button>
              <label className="text-sm font-medium text-white cursor-pointer select-none" onClick={() => setIsFeatured(!isFeatured)}>
                 Feature this product on the homepage
              </label>
           </div>
        </div>

        {/* Media */}
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
           <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Media</h2>
           
           <div className="space-y-4">
              {/* Image Upload Zone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Product Image</label>
                
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
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-sm text-neutral-400">Uploading...</p>
                    </div>
                  ) : image ? (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                        <Image src={image} alt="Preview" fill className="object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-white font-medium mb-1">Image uploaded</p>
                        <p className="text-xs text-neutral-500 truncate max-w-md">{image}</p>
                        <p className="text-xs text-neutral-600 mt-2">Drop a new image, paste, or click to replace</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImage(""); }}
                        className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-300 font-medium">Drop image here, paste, or click to upload</p>
                        <p className="text-xs text-neutral-600 mt-1">PNG, JPG, WebP, AVIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* URL fallback */}
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-2">
                  <span>or paste URL directly:</span>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/5 py-1 text-neutral-400 focus:border-white/20 outline-none text-xs transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* External Link with Auto-Conversion */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  External Link
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none transition-colors"
                  placeholder="Paste a Taobao, Weidian, or 1688 link..."
                />
                
                {/* Link conversion status */}
                {linkConversion && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                    linkConversion.success 
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                      : "bg-amber-500/5 border-amber-500/10 text-amber-400"
                  }`}>
                    {linkConversion.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          <strong>{linkConversion.platform}</strong> detected · {linkConversion.agentCount} agent links ready
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{linkConversion.error}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
           </div>
        </div>

        <div className="flex justify-end gap-4">
           <Link
              href="/admin/products"
              className="px-6 py-3 rounded-lg text-sm font-bold text-text-secondary hover:text-white transition-colors"
           >
              Cancel
           </Link>
           <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
              {loading ? (
                 <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                 <>
                    <Save className="w-4 h-4" />
                    Create Product
                 </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
}
