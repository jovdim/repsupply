"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Edit, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  ChevronsUpDown,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  is_featured: boolean;
  product_categories: { categories: { id: number; name: string } }[];
  qc_groups: { count: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterFeatured, setFilterFeatured] = useState<string>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Inline Delete State
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
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
    
    const { data: catData } = await supabase.from("categories").select("id, name");
    if (catData) setCategories(catData);

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_categories (
          categories (
            id,
            name
          )
        ),
        qc_groups(count)
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      // @ts-ignore
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
       alert("Error deleting product: " + error.message);
    } else {
      setProducts(products.filter(p => p.id !== id));
      setConfirmDeleteId(null);
    }
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
      !product.is_featured;

    // Price range
    const price = parsePrice(product.price);
    const matchesPriceMin = priceMin ? price >= parseFloat(priceMin) : true;
    const matchesPriceMax = priceMax ? price <= parseFloat(priceMax) : true;

    return matchesSearch && matchesCategory && matchesFeatured && matchesPriceMin && matchesPriceMax;
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
  }, [search, selectedCategory, filterFeatured, priceMin, priceMax, sortConfig]);

  const hasActiveFilters = selectedCategory || filterFeatured !== "all" || search || sortConfig || priceMin || priceMax;

  const clearAllFilters = () => {
    setSelectedCategory("");
    setFilterFeatured("all");
    setSearch("");
    setSortConfig(null);
    setPriceMin("");
    setPriceMax("");
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 font-display">Products</h1>
          <p className="text-text-secondary text-sm">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} 
            {hasActiveFilters ? " matching filters" : " total"}
            {!hasActiveFilters && ` · ${products.filter(p => p.is_featured).length} featured`}
          </p>
        </div>
        <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 text-sm"
        >
            <Plus className="w-4 h-4" />
            Add Product
        </Link>
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
              <option value="all">All Status</option>
              <option value="featured">Featured</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          {/* Advanced + Reset */}
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                showAdvancedFilters 
                  ? "bg-white/10 border-white/15 text-white" 
                  : "bg-neutral-800/50 border-white/5 text-neutral-400 hover:text-white hover:border-white/10"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2.5 bg-neutral-800/50 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="border-t border-white/5 pt-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 bg-neutral-800/50 border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-white/15 transition-all placeholder:text-neutral-600 focus:ring-0"
                  />
                  <span className="text-neutral-500 text-sm">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 bg-neutral-800/50 border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-white/15 transition-all placeholder:text-neutral-600 focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
                         <div className="flex flex-wrap gap-1.5">
                            {product.product_categories.length > 0 ? (
                               product.product_categories.map((pc, idx) => (
                                  <span key={idx} className="inline-block px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[11px] text-neutral-400 font-medium">
                                     {pc.categories?.name || "Unknown"}
                                  </span>
                               ))
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
                      <td className="px-6 py-4 text-right relative">
                         <div className="flex items-center justify-end gap-2">
                            <Link 
                               href={`/admin/products/${product.id}`}
                               className="p-2 bg-neutral-800/50 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all active:scale-95"
                               title="Edit Product"
                            >
                               <Edit className="w-3.5 h-3.5" />
                            </Link>
                            
                               <button 
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     setConfirmDeleteId(product.id);
                                  }}
                                  className="p-2 bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
                                  title="Delete Product"
                               >
                                  <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Product?</h2>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this product? This will also remove any associated QC photos from the gallery and storage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                 Cancel
              </button>
              <button
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-400 transition-all active:scale-95"
              >
                 Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
