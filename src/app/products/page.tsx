"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Grid3X3 as GridIcon,
  List,
  Rows,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

// Extended product data
const products = [
  {
    id: 1,
    name: "Nike Dunk Low Panda",
    price: "¥299",
    category: "shoes",
    image: "/test-product-images/img1.avif",
    link: "https://weidian.com/item.html?itemID=123",
    rating: 4.9,
  },
  {
    id: 2,
    name: "FOG Essentials Hoodie",
    price: "¥189",
    category: "hoodies",
    image: "/test-product-images/img2.avif",
    link: "https://item.taobao.com/item.htm?id=456",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Chrome Hearts Tee",
    price: "¥159",
    category: "t-shirts",
    image: "/test-product-images/img3.avif",
    link: "https://detail.1688.com/offer/789.html",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Jaded London Cargos",
    price: "¥259",
    category: "pants",
    image: "/test-product-images/img4.avif",
    link: "https://weidian.com/item.html?itemID=101112",
    rating: 4.8,
  },
  {
    id: 5,
    name: "Represent Hoodie",
    price: "¥219",
    category: "hoodies",
    image: "/test-product-images/img5.avif",
    link: "https://weidian.com/item.html?itemID=131415",
    rating: 4.9,
  },
  {
    id: 6,
    name: "Gallery Dept Jeans",
    price: "¥329",
    category: "pants",
    image: "/test-product-images/img1.avif",
    link: "https://weidian.com/item.html?itemID=161718",
    rating: 4.6,
  },
  {
    id: 7,
    name: "Jordan 4 Retro",
    price: "¥399",
    category: "shoes",
    image: "/test-product-images/img2.avif",
    link: "https://weidian.com/item.html?itemID=192021",
    rating: 4.8,
  },
  {
    id: 8,
    name: "Trapstar Jacket",
    price: "¥289",
    category: "jackets",
    image: "/test-product-images/img3.avif",
    link: "https://weidian.com/item.html?itemID=222324",
    rating: 4.5,
  },
  {
    id: 9,
    name: "Stussy Tee",
    price: "¥129",
    category: "t-shirts",
    image: "/test-product-images/img4.avif",
    link: "https://item.taobao.com/item.htm?id=252627",
    rating: 4.7,
  },
  {
    id: 10,
    name: "Carhartt Double Knee",
    price: "¥269",
    category: "pants",
    image: "/test-product-images/img5.avif",
    link: "https://item.taobao.com/item.htm?id=282930",
    rating: 4.8,
  },
  {
    id: 11,
    name: "Bape Shark Hoodie",
    price: "¥450",
    category: "hoodies",
    image: "/test-product-images/img1.avif",
    link: "https://item.taobao.com/item.htm?id=313233",
    rating: 4.6,
  },
  {
    id: 12,
    name: "Yeezy Slides",
    price: "¥110",
    category: "shoes",
    image: "/test-product-images/img3.avif",
    link: "https://weidian.com/item.html?itemID=343536",
    rating: 4.9,
  },
];

const categories = [
  "All",
  "Shoes",
  "Hoodies",
  "T-Shirts",
  "Pants",
  "Jackets",
  "Accessories",
  "Bags",
  "Watches",
  "Jewelry",
  "Hats",
  "Socks",
  "Underwear",
  "Shorts",
  "Sweaters",
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<3 | 4 | 5>(5);
  const [mobileGridCols, setMobileGridCols] = useState<2 | 3>(3);
  const [isMobile, setIsMobile] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  // Grid classes — 3/4 col have max-width per card to prevent oversizing
  const desktopGridClass =
    gridCols === 3
      ? "lg:grid-cols-3 max-w-4xl mx-auto"
      : gridCols === 4
        ? "lg:grid-cols-4 max-w-6xl mx-auto"
        : "lg:grid-cols-5";

  const mobileGridClass =
    mobileGridCols === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="min-h-screen bg-bg-primary pb-12">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 pt-4 pb-2 px-4 md:pt-24 md:static md:bg-transparent md:border-none md:p-0">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col gap-3 pb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold font-[var(--font-poetsen-one)] text-white">
                Marketplace
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

            {/* Mobile Categories */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-white text-black"
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
          <div className="hidden md:block mb-8 px-4">
            <h1 className="text-4xl font-bold text-text-primary mb-6 font-[var(--font-poetsen-one)]">
              Marketplace
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

                {/* Layout controls */}
                <div className="flex items-center gap-3">
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
                      onClick={() => { setViewMode("grid"); setGridCols(3); }}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === "grid" && gridCols === 3 ? "bg-white/10 text-white" : "text-text-muted hover:text-white"}`}
                      title="3 columns"
                    >
                      <GridIcon className="w-4 h-4" />
                    </button>
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
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-sm font-medium whitespace-nowrap px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-white text-black"
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
                <span>{filteredProducts.length} products</span>
                {searchQuery && (
                  <span>
                    Searching: &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-2 md:px-4">
        {/* Results count - mobile */}
        <div className="md:hidden text-xs text-text-muted px-2 py-2">
          {filteredProducts.length} products
        </div>

        {viewMode === "grid" ? (
          <div
            className={`grid ${mobileGridClass} sm:grid-cols-2 ${desktopGridClass} gap-2 md:gap-3 animate-fade-in`}
          >
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-bg-card border border-white/5 rounded-xl overflow-hidden active:scale-95 md:active:scale-100 hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer group"
              >
                {/* Image — square aspect ratio */}
                <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <div className="text-neutral-600 text-xs font-medium">
                    Product Image
                  </div>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info — price first, name below */}
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
          <div className="space-y-2 animate-fade-in max-w-4xl mx-auto">
            {filteredProducts.map((product) => (
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
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary text-sm md:text-base mb-0.5">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs md:text-sm text-text-muted">
                    <span className="capitalize">{product.category}</span>
                    <span className="hidden sm:flex items-center gap-1 text-yellow-500">
                      ★ {product.rating}
                    </span>
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
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-text-muted text-lg mb-2">No products found</div>
            <p className="text-text-muted text-sm">
              Try adjusting your search or category filter.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-4 text-sm text-white underline underline-offset-4 hover:no-underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
}
