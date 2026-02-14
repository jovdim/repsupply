"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProducts, getAdminProducts, ProductFromDB } from "@/lib/supabase/products";
import { getCategories } from "@/lib/supabase/categories";
import { invalidateAdminCache } from "@/lib/supabase/admin";
import { useImagePreload } from "@/hooks/useImagePreload";
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Settings, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  ChevronsUpDown,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  Check,
  Upload,
  Link2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { convertLink } from "@/lib/linkConverter";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  image: string;
  is_featured: boolean;
  is_best_seller?: boolean;
  link?: string;
  description?: string;
  product_categories: { categories: { id: number; name: string } }[];
  qc_groups: { count: number }[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterFeatured, setFilterFeatured] = useState<string>("all");

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkConversion, setLinkConversion] = useState<{
    success: boolean;
    agentCount: number;
    platform: string | null;
    error: string | null;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Featured toggle loading state
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    try {
      // Use cached utilities
      const [catData, productsFromDB] = await Promise.all([
        getCategories(),
        getAdminProducts()
      ]);

      if (catData) setCategories(catData.map(c => ({ id: c.id, name: c.name })));
      // @ts-ignore
      setProducts(productsFromDB || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      // 1. Get main image URL
      const productToDelete = products.find(p => p.id === id);
      const imageUrls: string[] = [];
      if (productToDelete?.image) {
        imageUrls.push(productToDelete.image);
      }

      // 2. Get all QC image URLs
      const { data: qcCats } = await supabase
        .from("qc_groups")
        .select("id, qc_images(image_url)")
        .eq("product_id", id);

      if (qcCats) {
        qcCats.forEach(group => {
          if (group.qc_images) {
            (group.qc_images as any[]).forEach(img => {
              if (img.image_url) imageUrls.push(img.image_url);
            });
          }
        });
      }

      // 3. Delete files from storage
      if (imageUrls.length > 0) {
        const fileNames = imageUrls
          .map(url => url.split("/").pop())
          .filter(Boolean) as string[];

        if (fileNames.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("product-images")
            .remove(fileNames);
          
          if (storageError) {
            console.error("Error cleaning up storage:", storageError);
          }
        }
      }

      // 4. Delete the product record
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        alert("Error deleting product record: " + error.message);
      } else {
        invalidateAdminCache();
        setProducts(products.filter(p => p.id !== id));
        setIsDeleting(false);
        setIsModalOpen(false);
        setEditingProduct(null);
      }
    } catch (err) {
      console.error("Delete process error:", err);
      alert("An unexpected error occurred during deletion.");
    }
  }

  function handleOpenModal(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setSlug(product.slug || "");
      setPrice(product.price);
      setImage(product.image);
      setLink(product.link || "");
      description ? setDescription(product.description || "") : setDescription("");
      setIsFeatured(product.is_featured);
      setIsBestSeller(product.is_best_seller || false);
      
      if (product.product_categories) {
         const ids = product.product_categories.map((pc: any) => pc.categories?.id).filter(Boolean);
         setSelectedCategoryIds(ids);
      } else {
         setSelectedCategoryIds([]);
      }

      if (product.link) {
        const result = convertLink(product.link);
        if (result.success) {
          setLinkConversion({
            success: true,
            agentCount: result.results?.length || 0,
            platform: result.platform || null,
            error: null,
          });
        }
      } else {
        setLinkConversion(null);
      }
    } else {
      setEditingProduct(null);
      setName("");
      setSlug("");
      setPrice("");
      setImage("");
      setLink("");
      setDescription("");
      setIsFeatured(false);
      setIsBestSeller(false);
      setSelectedCategoryIds([]);
      setLinkConversion(null);
    }
    setIsDeleting(false);
    setIsModalOpen(true);
  }

  function toggleCategory(categoryId: number) {
    setSelectedCategoryIds(prev => {
      const isSelected = prev.includes(categoryId);
      if (!isSelected && prev.length >= 5) {
        return prev; // Limit reached
      }
      return isSelected 
        ? prev.filter(c => c !== categoryId) 
        : [...prev, categoryId];
    });
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    
    const ext = file.name.split(".").pop() || "png";
    const fileName = `product-${editingProduct?.id || "new"}-${Date.now()}.${ext}`;
    
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
  }, [editingProduct]);

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

  function handleNameChange(value: string) {
    setName(value);
    if (!editingProduct) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !price || !image || !link || selectedCategoryIds.length === 0) {
      alert("Please fill in all required fields (Name, Price, Category, Image, and Link).");
      return;
    }

    setSaving(true);
    
    const productData = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      price,
      image,
      link,
      description,
      is_featured: isFeatured,
      is_best_seller: isBestSeller,
      updated_at: new Date().toISOString(),
    };

    let productId: number;

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        alert("Error updating product: " + error.message);
        setSaving(false);
        return;
      }
      productId = editingProduct.id;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...productData, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) {
        alert("Error creating product: " + error.message);
        setSaving(false);
        return;
      }
      productId = data.id;
    }

    // Update categories
    await supabase.from("product_categories").delete().eq("product_id", productId);

    if (selectedCategoryIds.length > 0) {
      const categoryInserts = selectedCategoryIds.map(catId => ({
        product_id: productId,
        category_id: catId,
      }));

      const { error: catError } = await supabase
        .from("product_categories")
        .insert(categoryInserts);

      if (catError) {
        console.error("Error linking categories:", catError);
      }
    }

    setIsModalOpen(false);
    setSaving(false);
    invalidateAdminCache(); // Clear both product and stats caches
    fetchData();
  }

  async function handleToggleFeatured(productId: number, currentValue: boolean) {
    setTogglingFeaturedId(productId);
    const { error } = await supabase
      .from("products")
      .update({ is_featured: !currentValue })
      .eq("id", productId);
    
    if (error) {
      alert("Error updating featured status: " + error.message);
    } else {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_featured: !currentValue } : p
      ));
    }
    setTogglingFeaturedId(null);
  }

  // Sorting
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
     if (!sortConfig || sortConfig.key !== key) {
        return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
     }
     return sortConfig.direction === "asc" 
        ? <ChevronUp className="w-3.5 h-3.5 text-white" /> 
        : <ChevronDown className="w-3.5 h-3.5 text-white" />;
  };

  const parsePrice = (p: string) => parseFloat(p.replace(/[^0-9.]/g, "")) || 0;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory 
      ? product.product_categories.some(pc => pc.categories?.id.toString() === selectedCategory)
      : true;

    const matchesFeatured = 
      filterFeatured === "all" ? true :
      filterFeatured === "featured" ? product.is_featured :
      filterFeatured === "best_seller" ? product.is_best_seller :
      true;

    return matchesSearch && matchesCategory && matchesFeatured;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aValue: any = a[sortConfig.key as keyof Product];
    let bValue: any = b[sortConfig.key as keyof Product];

    if (sortConfig.key === "price") {
        aValue = parsePrice(a.price);
        bValue = parsePrice(b.price);
    } else if (sortConfig.key === "category") {
        aValue = a.product_categories[0]?.categories?.name || "";
        bValue = b.product_categories[0]?.categories?.name || "";
    } else if (sortConfig.key === "qc") {
        aValue = a.qc_groups[0]?.count || 0;
        bValue = b.qc_groups[0]?.count || 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, filterFeatured, sortConfig]);

  // Preload images for the current view
  useImagePreload(paginatedProducts.map(p => p.image));

  const hasActiveFilters = selectedCategory || filterFeatured !== "all" || search || sortConfig;

  const clearAllFilters = () => {
    setSelectedCategory("");
    setFilterFeatured("all");
    setSearch("");
    setSortConfig(null);
  };

  // Best seller toggle handler
  async function handleToggleBestSeller(productId: number, currentValue: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_best_seller: !currentValue })
      .eq("id", productId);
    
    if (error) {
      alert("Error updating best seller status: " + error.message);
    } else {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_best_seller: !currentValue } : p
      ));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
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
            <h1 className="text-3xl font-bold text-white mb-1 font-display">Products</h1>
            <p className="text-text-secondary text-sm">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} 
              {hasActiveFilters ? " matching filters" : " total"}
              {!hasActiveFilters && ` · ${products.filter(p => p.is_featured).length} featured`}
            </p>
          </div>
        </div>
        <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 text-sm"
        >
            <Plus className="w-4 h-4" />
            Add Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-white/15 transition-all placeholder:text-neutral-600 focus:ring-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3 relative group">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/15 transition-all appearance-none cursor-pointer focus:ring-0"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2 relative group">
            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none" />
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/15 transition-all appearance-none cursor-pointer focus:ring-0"
            >
              <option value="all">All Products</option>
              <option value="featured">Featured Products</option>
              <option value="best_seller">Best Sellers</option>
            </select>
          </div>

          {/* Reset */}
          <div className="md:col-span-2 flex gap-2 items-center">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex-1 px-3 py-2.5 bg-neutral-800/50 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-20 text-center text-text-muted">
             <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
             <p className="text-sm font-medium">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center text-text-muted">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 opacity-20" />
             </div>
             <p className="text-sm font-medium">No products match your criteria.</p>
             {hasActiveFilters && (
               <button onClick={clearAllFilters} className="mt-3 text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors">
                 Clear all filters
               </button>
             )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-white/5">
                  <tr>
                    <th 
                      className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => requestSort("name")}
                    >
                      <div className="flex items-center gap-2">
                         Product {getSortIcon("name")}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => requestSort("category")}
                    >
                       <div className="flex items-center gap-2">
                          Category {getSortIcon("category")}
                       </div>
                    </th>
                    <th 
                      className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => requestSort("price")}
                    >
                       <div className="flex items-center gap-2">
                          Price {getSortIcon("price")}
                       </div>
                    </th>
                    <th 
                      className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => requestSort("qc")}
                    >
                       <div className="flex items-center gap-2">
                          QC Photos {getSortIcon("qc")}
                       </div>
                    </th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4">Best Seller</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-white/[0.01] transition-colors group/row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-11 h-11 rounded-lg bg-neutral-800 border border-white/5 overflow-hidden flex-shrink-0 shadow-inner">
                             <Image
                               src={product.image}
                               alt={product.name}
                               fill
                               className="object-cover group-hover/row:scale-110 transition-transform duration-500"
                             />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-semibold text-white text-sm">{product.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="relative group/cats max-w-[180px]">
                            {product.product_categories.length > 0 ? (
                               <>
                                 <div className="flex gap-1.5 overflow-hidden">
                                    {product.product_categories.slice(0, 2).map((pc, idx) => (
                                       <span key={idx} className="inline-block px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[11px] text-neutral-400 font-medium truncate max-w-[80px]">
                                          {pc.categories?.name || "Unknown"}
                                       </span>
                                    ))}
                                    {product.product_categories.length > 2 && (
                                       <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[11px] text-neutral-400 font-medium flex-shrink-0">
                                          +{product.product_categories.length - 2}
                                       </span>
                                    )}
                                 </div>
                                 {/* Hover tooltip showing all categories */}
                                 {product.product_categories.length > 2 && (
                                    <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover/cats:block">
                                       <div className="bg-neutral-900 border border-white/10 rounded-xl p-3 shadow-2xl min-w-[180px]">
                                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-2">All Categories</p>
                                          <div className="flex flex-wrap gap-1.5">
                                             {product.product_categories.map((pc, idx) => (
                                                <span key={idx} className="inline-block px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[11px] text-neutral-400 font-medium">
                                                   {pc.categories?.name || "Unknown"}
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 )}
                               </>
                            ) : (
                               <span className="text-neutral-600 italic text-[11px]">Uncategorized</span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-300 font-medium whitespace-nowrap text-sm">
                        {product.price}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                           href={`/admin/qc-images/${product.id}`}
                           className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 transition-colors group/qc"
                        >
                           <FolderOpen className="w-4 h-4 text-neutral-500 group-hover/qc:text-white transition-colors" />
                           <span className="text-neutral-400 group-hover/qc:text-white transition-colors text-xs font-medium">
                              {product.qc_groups && product.qc_groups[0] ? product.qc_groups[0].count : 0} Groups
                           </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {/* Inline Featured Toggle */}
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                          disabled={togglingFeaturedId === product.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            product.is_featured ? "bg-white" : "bg-neutral-700"
                          } ${togglingFeaturedId === product.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                          title={product.is_featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                              product.is_featured 
                                ? "translate-x-6 bg-black" 
                                : "translate-x-1 bg-neutral-400"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleBestSeller(product.id, !!product.is_best_seller)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            product.is_best_seller ? "bg-emerald-500" : "bg-neutral-700"
                          } cursor-pointer`}
                          title={product.is_best_seller ? "Remove from best sellers" : "Mark as best seller"}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                              product.is_best_seller 
                                ? "translate-x-6 bg-white" 
                                : "translate-x-1 bg-neutral-400"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                               onClick={() => handleOpenModal(product)}
                               className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all active:scale-95 group/btn"
                               title="Manage Product"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <span className="text-xs text-neutral-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
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
          </>
        )}
      </div>

      {/* Form Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-2xl bg-neutral-950 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${
          isModalOpen ? "translate-x-0" : "translate-x-full invisible"
        } flex flex-col h-screen`}
      >
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editingProduct ? "Update Product" : "New Product"}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {editingProduct ? "Editing product details" : "Create a new product listing"}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all active:scale-95 border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700"
                    placeholder="e.g. Jordan 4 Retro Black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Slug <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700"
                    placeholder="e.g. jordan-4-retro-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Price <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700"
                    placeholder="e.g. ￥290"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categories <span className="text-red-500">*</span></label>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedCategoryIds.length >= 5 ? "text-amber-500" : "text-neutral-600"}`}>
                    {selectedCategoryIds.length >= 5 ? "Limit Reached (Max 5)" : "Max 5 Categories"}
                  </span>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:border-white/20 outline-none"
                  />
                </div>
                <div className="border border-white/5 rounded-2xl bg-neutral-900/30 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {categories
                      .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(cat => {
                        const isSelected = selectedCategoryIds.includes(cat.id);
                        const isLimitReached = selectedCategoryIds.length >= 5 && !isSelected;
                        return (
                          <div 
                            key={cat.id}
                            onClick={() => !isLimitReached && toggleCategory(cat.id)}
                            className={`rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all ${
                              isSelected 
                                ? "bg-white/10 text-white cursor-pointer" 
                                : isLimitReached
                                  ? "opacity-30 cursor-not-allowed"
                                  : "text-neutral-500 hover:bg-white/5 hover:text-neutral-300 cursor-pointer"
                            }`}
                            title={isLimitReached ? "Maximum of 5 categories reached" : ""}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                              isSelected ? "bg-white border-white" : "border-neutral-700"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <span className="text-sm font-medium">{cat.name}</span>
                          </div>
                        );
                    })}
                  </div>
                </div>
                {selectedCategoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedCategoryIds.map(id => {
                      const cat = categories.find(c => c.id === id);
                      if (!cat) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-white border border-white/5 uppercase tracking-wider">
                          {cat.name}
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleCategory(id); }} className="hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700 resize-none"
                  placeholder="Additional notes about this product..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isFeatured 
                      ? "bg-white/10 border-white/20 text-white" 
                      : "bg-neutral-900/30 border-white/5 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isFeatured ? "bg-white border-white" : "border-neutral-700"
                  }`}>
                    {isFeatured && <Check className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBestSeller(!isBestSeller)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isBestSeller 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-neutral-900/30 border-white/5 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isBestSeller ? "bg-emerald-500 border-emerald-500" : "border-neutral-700"
                  }`}>
                    {isBestSeller && <Check className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Best Seller</span>
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">External Link <span className="text-red-500">*</span></label>
                  <div className="relative group/input">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within/input:text-white transition-colors" />
                    <input
                      type="url"
                      required
                      value={link}
                      onChange={(e) => handleLinkChange(e.target.value)}
                      className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-3.5 text-sm text-white focus:border-white/20 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-700 font-mono"
                      placeholder="Taobao, Weidian, or 1688 link..."
                    />
                  </div>
                  {linkConversion && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium animate-in fade-in slide-in-from-top-1 ${
                      linkConversion.success 
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                        : "bg-amber-500/5 border-amber-500/10 text-amber-400"
                    }`}>
                      {linkConversion.success ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{linkConversion.platform} detected · {linkConversion.agentCount} agent links ready</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{linkConversion.error}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Product Media <span className="text-red-500">*</span></label>
                    {editingProduct && (
                      <Link 
                        href={`/admin/qc-images/${editingProduct.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all group"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white uppercase tracking-widest">Manage QC ({editingProduct.qc_groups?.[0]?.count || 0})</span>
                      </Link>
                    )}
                  </div>
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
                          <p className="text-[9px] text-neutral-600 mt-2 uppercase tracking-widest font-bold">PNG, JPG, WEBP • MAX 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-white/5 bg-neutral-950 sticky bottom-0 z-20 pb-4">
              <button
                type="submit"
                disabled={saving || uploading || !name || !price || !image || !link || selectedCategoryIds.length === 0}
                className="flex-[2] bg-white text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
              
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    if (isDeleting) {
                      handleDelete(editingProduct.id);
                    } else {
                      setIsDeleting(true);
                    }
                  }}
                  className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isDeleting 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                  }`}
                  title={isDeleting ? "Confirm Delete" : "Delete Product"}
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
