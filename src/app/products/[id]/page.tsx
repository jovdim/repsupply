"use client";

import { useState, use, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Share2,
  Copy,
  Check,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  ImageIcon,
  Tag,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AgentSelector } from "@/components/product/AgentSelector";
import { Button } from "@/components/ui/Button";
import { getProductById, getAllProductsLight, type ProductFromDB } from "@/lib/supabase/products";
import { addFavorite, removeFavorite, isFavorited as checkIsFavorited } from "@/lib/supabase/favorites";
import { recordView } from "@/lib/supabase/history";
import { useAuth } from "@/components/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const productId = parseInt(id);
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductFromDB | null>(null);
  const [allProducts, setAllProducts] = useState<ProductFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const qcGroupsRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [qcCardIndices, setQcCardIndices] = useState<Record<number, number>>({});

  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [prod, prods] = await Promise.all([
        getProductById(productId),
        getAllProductsLight(),
      ]);
      setProduct(prod);
      setAllProducts(prods);
      setLoading(false);
    }
    fetchData();
  }, [productId]);

  // Check favorite status and record view
  useEffect(() => {
    if (!product || !user) return;

    async function initUserFeatures() {
      const fav = await checkIsFavorited(product!.id);
      setIsFavorited(fav);
      await recordView(product!.id);
    }
    initUserFeatures();
  }, [product, user]);

  const checkScroll = () => {
    if (qcGroupsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = qcGroupsRef.current;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [product?.qcImages?.length]);

  const scrollQcGroups = (direction: "left" | "right") => {
    if (qcGroupsRef.current) {
      qcGroupsRef.current.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 animate-pulse">
            <div className="aspect-square bg-white/5 rounded-2xl" />
            <div className="space-y-4 pt-8">
              <div className="h-4 bg-white/5 rounded w-24" />
              <div className="h-8 bg-white/5 rounded w-64" />
              <div className="h-10 bg-white/5 rounded w-32" />
              <div className="h-20 bg-white/5 rounded w-full" />
              <div className="h-12 bg-white/5 rounded w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Product not found
          </h1>
          <Link
            href="/products"
            className="text-text-secondary hover:text-white transition-colors underline underline-offset-4"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Get recommended products (share category)
  const recommended = allProducts
    .filter((p) => p.categories.some(c => product.categories.includes(c)) && p.id !== product.id)
    .slice(0, 5);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (isFavorited) {
      const success = await removeFavorite(product.id);
      if (success) setIsFavorited(false);
    } else {
      const success = await addFavorite(product.id);
      if (success) setIsFavorited(true);
    }
  };

  const toggleQcCardImage = (groupIdx: number, direction: "prev" | "next", total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setQcCardIndices(prev => {
        const current = prev[groupIdx] || 0;
        const next = direction === "next" 
            ? (current + 1) % total 
            : (current - 1 + total) % total;
        return { ...prev, [groupIdx]: next };
    });
  };

  // Flatten QC images for lightbox navigation
  const allQCImages = product.qcImages.flatMap(group => group.images);

  const openLightbox = (imgSrc: string) => {
    const idx = allQCImages.indexOf(imgSrc);
    setLightboxImage(imgSrc);
    setLightboxIndex(idx);
  };

  const navigateLightbox = (dir: "prev" | "next") => {
    const newIndex =
      dir === "prev"
        ? (lightboxIndex - 1 + allQCImages.length) % allQCImages.length
        : (lightboxIndex + 1) % allQCImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(allQCImages[newIndex]);
  };

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 md:relative md:bg-transparent md:border-none">
        <div className="max-w-6xl mx-auto px-4 py-3 md:pt-24 md:pb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Product Hero */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-16">
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 rounded-2xl overflow-hidden group">
            <Image
              src={product.image}
              alt={product.name}
              fill
              quality={100}
              priority={true}
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-3">
              {product.categories.map((cat) => (
                <span key={cat} className="text-xs font-medium text-text-muted bg-white/5 px-2.5 py-1 rounded-full capitalize flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  {cat}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-3xl md:text-4xl font-bold text-white mb-5">
              {product.price}
            </div>

            {/* Description */}
            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Buy Button */}
            <Button
              size="lg"
              className="w-full md:w-auto rounded-xl text-base mb-4"
              onClick={() => setIsAgentModalOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Buy with Agent
            </Button>

            {/* Share / Copy Link */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {copied ? "Link copied!" : "Share"}
              </button>
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"
                  title="View Original Link"
                >
                  <ExternalLink className="w-4 h-4" />
                  Original
                </a>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${isFavorited ? "text-red-500 hover:text-red-400" : "text-text-muted hover:text-white"}`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* QC Images Section */}
        {product.qcImages.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        QC Photos
                        <span className="text-sm font-normal text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                            {product.qcImages.length} Galleries
                        </span>
                    </h2>
                </div>
            </div>

            <div className="relative group -mx-4 px-4 md:mx-0 md:px-0">
              {/* Desktop Navigation Arrows */}
              <button
                onClick={() => scrollQcGroups("left")}
                className={`hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-all z-20 cursor-pointer ${showLeftFade ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                title="Previous gallery"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              
              <button
                onClick={() => scrollQcGroups("right")}
                className={`hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-all z-20 cursor-pointer ${showRightFade ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                title="Next gallery"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              {/* Fades */}
              <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftFade ? 'opacity-100' : 'opacity-0'}`} />
              <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightFade ? 'opacity-100' : 'opacity-0'}`} />

              <div 
                ref={qcGroupsRef}
                onScroll={checkScroll}
                className="flex overflow-x-auto gap-4 scrollbar-hide pb-4"
              >
                {product.qcImages.map((group, groupIdx) => {
                  const currentIndex = qcCardIndices[groupIdx] || 0;
                  const currentImage = group.images[currentIndex];
                  const totalImages = group.images.length;

                  return (
                    <div key={groupIdx} className="flex-shrink-0 w-48 md:w-56 bg-bg-card border border-white/5 rounded-xl overflow-hidden flex flex-col group/card hover:border-white/20 transition-all">
                      {/* Image Area */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-neutral-800 to-neutral-900">
                          <Image
                              src={currentImage}
                              alt={`${group.folder} photo ${currentIndex + 1}`}
                              fill
                              quality={100}
                              className="object-cover"
                          />
                          
                          {/* Count Badge */}
                          <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-md">
                              {currentIndex + 1} of {totalImages}
                          </div>

                          {/* Navigation Arrows */}
                          {totalImages > 1 && (
                              <>
                                  <button 
                                      onClick={(e) => toggleQcCardImage(groupIdx, "prev", totalImages, e)}
                                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                                  >
                                      <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button 
                                      onClick={(e) => toggleQcCardImage(groupIdx, "next", totalImages, e)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                                  >
                                      <ChevronRight className="w-4 h-4" />
                                  </button>
                              </>
                          )}
                          
                          {/* Enlarge Button */}
                          <button 
                              onClick={() => openLightbox(currentImage)}
                              className="absolute inset-0 z-0"
                          />
                      </div>

                      {/* Metadata Footer */}
                      <div className="p-3 bg-bg-card">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-white group-hover/card:text-indigo-400 transition-colors uppercase tracking-wider">{group.folder}</span>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* You Might Also Like */}
        {recommended.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recommended.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="bg-bg-card border border-white/5 rounded-xl overflow-hidden active:scale-95 md:active:scale-100 hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      quality={100}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="font-bold text-white text-sm md:text-base mb-0.5">
                      {p.price}
                    </div>
                    <h3 className="text-text-muted text-xs md:text-sm line-clamp-1 group-hover:text-white transition-colors">
                      {p.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Nav arrows */}
          {allQCImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative w-[90vw] h-[80vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="QC Photo"
              fill
              className="object-contain"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {allQCImages.length}
          </div>
        </div>
      )}

      {/* Agent Selector Modal */}
      {product.link && (
        <AgentSelector
          productUrl={product.link}
          isOpen={isAgentModalOpen}
          onClose={() => setIsAgentModalOpen(false)}
        />
      )}

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          // Optional: Retry favoriting logic here if desired
        }}
      />
    </div>
  );
}
