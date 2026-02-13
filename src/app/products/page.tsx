"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import {
  Search,
  Grid3X3 as GridIcon,
  List,
  Rows,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  BrickWall
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { getProducts, type ProductFromDB } from "@/lib/supabase/products";
import { createClient } from "@/lib/supabase/client";
import { cacheGet, cacheSet, TTL } from "@/lib/cache";
import { useSearchParams, useRouter } from "next/navigation";

type FilterType = "all" | "featured" | "best_seller";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const initialFilter = (searchParams.get("filter") as FilterType) || "all";
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    ["all", "featured", "best_seller"].includes(initialFilter) ? initialFilter : "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<4 | 5>(5);
  const [mobileGridCols, setMobileGridCols] = useState<2 | 3>(3);
  const [isMobile, setIsMobile] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ProductFromDB[]>([]);
  const [allProducts, setAllProducts] = useState<ProductFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["All"]);

  // Read URL params on mount
  useEffect(() => {
    const catParam = searchParams.get("category");
    const filterParam = searchParams.get("filter") as FilterType | null;
    if (catParam && catParam !== selectedCategory) setSelectedCategory(catParam);
    if (
      filterParam &&
      filterParam !== activeFilter &&
      ["all", "featured", "best_seller"].includes(filterParam)
    ) {
      setActiveFilter(filterParam);
    }
  }, [searchParams, selectedCategory, activeFilter]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch all products and categories on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Check cache for categories
      const catCacheKey = "categories:names";
      let catNames = cacheGet<string[]>(catCacheKey);

      const [data, cats] = await Promise.all([
        getProducts(),
        catNames
          ? Promise.resolve(catNames)
          : (async () => {
              const supabase = createClient();
              const { data: catData } = await supabase
                .from("categories")
                .select("name")
                .order("name");
              const names = catData?.map((c: { name: string }) => c.name) || [];
              cacheSet(catCacheKey, names, TTL.LONG);
              return names;
            })(),
      ]);

      setAllProducts(data);
      setProducts(data);
      setCategories(["All", ...cats]);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Client-side filtering when search/category/filter changes
  useEffect(() => {
    let filtered = allProducts;

    // Apply filter tab
    if (activeFilter === "featured") {
      filtered = filtered.filter((p) => p.is_featured);
    } else if (activeFilter === "best_seller") {
      filtered = filtered.filter((p) => p.is_best_seller);
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) =>
        p.categories.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    setProducts(filtered);
  }, [searchQuery, selectedCategory, activeFilter, allProducts]);

  // Apply grid limits for Featured/Best Sellers
  const displayedProducts = (activeFilter === "featured" || activeFilter === "best_seller")
    ? products.slice(0, isMobile ? 9 : 15)
    : products;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setActiveFilter("all");
    router.replace("/products", { scroll: false });
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All" || activeFilter !== "all";

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // Update URL without full page reload
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams();
    if (activeFilter !== "all") params.set("filter", activeFilter);
    if (cat !== "All") params.set("category", cat);
    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const desktopGridClass =
    gridCols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5";

  const mobileGridClass =
    mobileGridCols === 2 ? "grid-cols-2" : "grid-cols-3";

  const filters: { key: FilterType; label: string; icon: any }[] = [
    { key: "all", label: "All", icon: BrickWall },
    { key: "featured", label: "Featured", icon: Star },
    { key: "best_seller", label: "Best Sellers", icon: Flame },
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 pt-4 pb-2 px-4 md:pt-24 md:static md:bg-transparent md:border-none md:p-0">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col gap-3 pb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold font-[var(--font-poetsen-one)] text-white">
                Products
              </h1>
              <div className="flex items-center gap-1">
                <div className="flex bg-bg-card rounded-lg border border-white/5 p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white/10 text-white" : "text-text-muted"}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setViewMode("grid"); setMobileGridCols(2); }}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" && mobileGridCols === 2 ? "bg-white/10 text-white" : "text-text-muted"}`}
                  >
                    <GridIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setViewMode("grid"); setMobileGridCols(3); }}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" && mobileGridCols === 3 ? "bg-white/10 text-white" : "text-text-muted"}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-card border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-text-primary outline-none focus:border-white/20 transition-colors placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Tabs */}
            <div className="flex gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => handleFilterChange(f.key)}
                  className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeFilter === f.key
                      ? "bg-white text-black"
                      : "bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <f.icon className="w-3 h-3" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Mobile Categories */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-white/20 text-white border border-white/20"
                        : "bg-white/5 text-text-secondary hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8 px-4 md:px-12 lg:px-20 xl:px-24">
            <h1 className="text-4xl font-bold text-text-primary mb-6 font-[var(--font-poetsen-one)]">
              Products
            </h1>

            {/* Desktop Toolbar */}
            <div className="bg-bg-card border border-white/5 p-4 rounded-2xl sticky top-24 z-30">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-primary border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-text-primary outline-none focus:border-white/20 transition-colors placeholder:text-text-muted"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs + Layout controls */}
                <div className="flex items-center gap-3">
                  {/* Filter Tabs */}
                  <div className="flex bg-bg-primary rounded-lg border border-white/5 p-1">
                    {filters.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => handleFilterChange(f.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                          activeFilter === f.key
                            ? "bg-white text-black"
                            : "text-text-muted hover:text-white"
                        }`}
                      >
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-6 bg-white/10" />

                  {/* Layout controls */}
                  <div className="flex bg-bg-primary rounded-lg border border-white/5 p-1">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-0.5 self-center" />
                    <button
                      onClick={() => { setViewMode("grid"); setGridCols(4); }}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === "grid" && gridCols === 4 ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
                      title="4 columns"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setViewMode("grid"); setGridCols(5); }}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === "grid" && gridCols === 5 ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
                      title="5 columns"
                    >
                      <Rows className="w-4 h-4 rotate-90" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-3 relative flex items-center gap-2">
                <button
                  onClick={() => scrollCategories("left")}
                  className="hidden xl:flex w-7 h-7 rounded-lg bg-bg-primary border border-white/5 items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />
                </button>
                <div className="relative flex-1 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-bg-card to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-bg-card to-transparent z-10 pointer-events-none" />
                  <div
                    ref={categoryScrollRef}
                    className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5 px-2"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`text-sm font-medium whitespace-nowrap px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-white/20 text-white border border-white/20"
                            : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => scrollCategories("right")}
                  className="hidden xl:flex w-7 h-7 rounded-lg bg-bg-primary border border-white/5 items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>

              {/* Results count */}
              <div className="mt-3 flex items-center justify-between text-xs text-text-muted px-1">
                <span>{displayedProducts.length} products</span>
                <div className="flex items-center gap-2">
                  {activeFilter !== "all" && (
                    <span className="bg-white/5 px-2 py-0.5 rounded-full">
                      {filters.find((f) => f.key === activeFilter)?.label}
                    </span>
                  )}
                  {searchQuery && (
                    <span>
                      Searching: &quot;{searchQuery}&quot;
                    </span>
                  )}
                  {hasActiveFilters && (
                    <button 
                       onClick={handleClearFilters}
                       className="text-white hover:text-neutral-300 transition-colors ml-2 underline underline-offset-4"
                    >
                       Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Constraint Container */}
      <div className="max-w-[1600px] mx-auto">
        <div className="px-4 md:px-12 lg:px-20 xl:px-24">
            {/* Results count - mobile */}
            <div className="md:hidden flex items-center justify-between px-2 py-2">
               <span className="text-xs text-text-muted">{displayedProducts.length} products</span>
               {hasActiveFilters && (
                  <button onClick={handleClearFilters} className="text-xs text-white underline underline-offset-4">
                     Clear
                  </button>
               )}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className={`grid ${mobileGridClass} sm:grid-cols-2 ${desktopGridClass} gap-2 md:gap-4`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-bg-card border border-white/5 rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-white/5" />
                    <div className="p-3 md:p-4 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-16" />
                      <div className="h-3 bg-white/5 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
            <div
                className={`grid ${mobileGridClass} sm:grid-cols-2 ${desktopGridClass} gap-2 md:gap-4 animate-fade-in`}
            >
                {displayedProducts.map((product) => (
                <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-bg-card border border-white/5 rounded-xl overflow-hidden active:scale-95 md:active:scale-100 hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer group"
                >
                    {/* Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <div className="text-neutral-600 text-xs font-medium">
                        Product Image
                    </div>
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        quality={100}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.is_featured && (
                      <div className="absolute top-2 left-2 bg-white/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4">
                    <div className="font-bold text-white text-sm md:text-base mb-0.5">
                        {product.price}
                    </div>
                    <h3 className="text-text-muted text-xs md:text-sm line-clamp-1 group-hover:text-white transition-colors">
                        {product.name}
                    </h3>
                    </div>
                </Link>
                ))}
            </div>
            ) : (
            <div className="space-y-2 animate-fade-in w-full">
                {displayedProducts.map((product) => (
                <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group bg-bg-card border border-white/5 rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:border-white/20 transition-all cursor-pointer"
                >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        quality={100}
                        className="object-cover"
                    />
                    </div>
                    <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary text-sm md:text-base mb-0.5">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs md:text-sm text-text-muted">
                        <span className="capitalize">{product.categories[0] || ""}</span>
                        {product.is_featured && (
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3 h-3 fill-current" /> Featured
                          </span>
                        )}
                    </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                    <span className="block text-lg md:text-xl font-bold text-white">
                        {product.price}
                    </span>
                    </div>
                </Link>
                ))}
            </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
                <div className="text-text-muted text-lg mb-2">No products found</div>
                <p className="text-text-muted text-sm">
                Try adjusting your search or filters.
                </p>
                <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setActiveFilter("all"); }}
                className="mt-4 text-sm text-white underline underline-offset-4 hover:no-underline cursor-pointer"
                >
                Clear all filters
                </button>
            </div>
            )}
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
