"use client";

import { useState, use } from "react";
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

// Same product data (in a real app this would be a shared store/db)
// Updated to use categories: string[]
const allProducts = [
  {
    id: 1,
    name: "Nike Dunk Low Panda",
    price: "¥299",
    categories: ["shoes", "best sellers"],
    image: "/test-product-images/img1.avif",
    link: "https://weidian.com/item.html?itemID=123",
    description:
      "Premium quality Nike Dunk Low in the iconic Panda colorway. Features a clean black and white leather upper with excellent stitching and proper shape. One of the most popular rep finds in the community.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img1.avif",
          "/test-product-images/img2.avif",
          "/test-product-images/img3.avif",
          "/test-product-images/img4.avif",
        ],
      },
      {
        folder: "Group 2",
        images: [
          "/test-product-images/img5.avif",
          "/test-product-images/img1.avif",
          "/test-product-images/img3.avif",
        ],
      },
    ],
  },
  {
    id: 2,
    name: "FOG Essentials Hoodie",
    price: "¥189",
    categories: ["hoodies", "streetwear"],
    image: "/test-product-images/img2.avif",
    link: "https://item.taobao.com/item.htm?id=456",
    description:
      "Fear of God Essentials oversized hoodie with front logo. Heavyweight cotton blend with a soft fleece interior. True to retail sizing.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img2.avif",
          "/test-product-images/img4.avif",
          "/test-product-images/img5.avif",
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Chrome Hearts Tee",
    price: "¥159",
    categories: ["t-shirts", "luxury"],
    image: "/test-product-images/img3.avif",
    link: "https://detail.1688.com/offer/789.html",
    description:
      "Chrome Hearts signature horseshoe graphic tee. Premium cotton with accurate print quality and correct tag details.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img3.avif",
          "/test-product-images/img1.avif",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Jaded London Cargos",
    price: "¥259",
    categories: ["pants", "streetwear"],
    image: "/test-product-images/img4.avif",
    link: "https://weidian.com/item.html?itemID=101112",
    description:
      "Jaded London parachute cargo pants with premium hardware. Multiple colorways available. Streetwear essential.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img4.avif",
          "/test-product-images/img5.avif",
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Represent Hoodie",
    price: "¥219",
    categories: ["hoodies", "streetwear"],
    image: "/test-product-images/img5.avif",
    link: "https://weidian.com/item.html?itemID=131415",
    description:
      "Represent Owners Club hoodie with embroidered branding. Heavy 450gsm cotton with ribbed trims. Very close to retail quality.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img5.avif",
          "/test-product-images/img2.avif",
          "/test-product-images/img3.avif",
        ],
      },
      {
        folder: "Group 2",
        images: [
          "/test-product-images/img1.avif",
          "/test-product-images/img4.avif",
        ],
      },
    ],
  },
  {
    id: 6,
    name: "Gallery Dept Jeans",
    price: "¥329",
    categories: ["pants", "luxury"],
    image: "/test-product-images/img1.avif",
    link: "https://weidian.com/item.html?itemID=161718",
    description:
      "Gallery Dept paint-splattered distressed jeans. Unique hand-finished details on each pair. Premium denim quality.",
    qcImages: [
      {
        folder: "Group 1",
        images: ["/test-product-images/img1.avif", "/test-product-images/img3.avif"],
      },
    ],
  },
  {
    id: 7,
    name: "Jordan 4 Retro",
    price: "¥399",
    categories: ["shoes", "best sellers"],
    image: "/test-product-images/img2.avif",
    link: "https://weidian.com/item.html?itemID=192021",
    description:
      "Air Jordan 4 Retro with proper netting, shape, and materials. Top-tier batch with correct tongue height and heel tab.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img2.avif",
          "/test-product-images/img5.avif",
          "/test-product-images/img4.avif",
          "/test-product-images/img1.avif",
        ],
      },
    ],
  },
  {
    id: 8,
    name: "Trapstar Jacket",
    price: "¥289",
    categories: ["jackets", "streetwear"],
    image: "/test-product-images/img3.avif",
    link: "https://weidian.com/item.html?itemID=222324",
    description:
      "Trapstar Irongate puffer jacket with detachable hood. Accurate branding and quality hardware. Warm and well-constructed.",
    qcImages: [
      {
        folder: "Group 1",
        images: ["/test-product-images/img3.avif", "/test-product-images/img2.avif"],
      },
    ],
  },
  {
    id: 9,
    name: "Stussy Tee",
    price: "¥129",
    categories: ["t-shirts", "streetwear"],
    image: "/test-product-images/img4.avif",
    link: "https://item.taobao.com/item.htm?id=252627",
    description:
      "Classic Stussy 8-ball graphic tee. Soft cotton blend with accurate sizing and print quality.",
    qcImages: [
      {
        folder: "Group 1",
        images: ["/test-product-images/img4.avif", "/test-product-images/img5.avif"],
      },
    ],
  },
  {
    id: 10,
    name: "Carhartt Double Knee",
    price: "¥269",
    categories: ["pants", "workwear"],
    image: "/test-product-images/img5.avif",
    link: "https://item.taobao.com/item.htm?id=282930",
    description:
      "Carhartt WIP double knee work pants. Heavy-duty canvas with reinforced knees. Comes in multiple washes.",
    qcImages: [
      {
        folder: "Group 1",
        images: ["/test-product-images/img5.avif", "/test-product-images/img1.avif"],
      },
    ],
  },
  {
    id: 11,
    name: "Bape Shark Hoodie",
    price: "¥450",
    categories: ["hoodies", "streetwear"],
    image: "/test-product-images/img1.avif",
    link: "https://item.taobao.com/item.htm?id=313233",
    description:
      "A Bathing Ape shark full-zip hoodie with WGM embroidery. Correct teeth print alignment and tag details.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img1.avif",
          "/test-product-images/img2.avif",
          "/test-product-images/img3.avif",
        ],
      },
    ],
  },
  {
    id: 12,
    name: "Yeezy Slides",
    price: "¥110",
    categories: ["shoes", "summer"],
    image: "/test-product-images/img3.avif",
    link: "https://weidian.com/item.html?itemID=343536",
    description:
      "Adidas Yeezy Slides with proper foam compound and shape. Ultra-comfortable with accurate sole texture.",
    qcImages: [
      {
        folder: "Group 1",
        images: [
          "/test-product-images/img3.avif",
          "/test-product-images/img4.avif",
          "/test-product-images/img1.avif",
        ],
      },
      {
        folder: "Group 2",
        images: [
          "/test-product-images/img5.avif",
          "/test-product-images/img1.avif",
          "/test-product-images/img2.avif",
        ],
      },
      {
        folder: "Group 3",
        images: [
          "/test-product-images/img3.avif",
          "/test-product-images/img4.avif",
        ],
      },
      {
        folder: "Group 4",
        images: [
          "/test-product-images/img1.avif",
          "/test-product-images/img3.avif",
          "/test-product-images/img5.avif",
        ],
      },
      {
        folder: "Group 5",
        images: [
          "/test-product-images/img5.avif",
          "/test-product-images/img2.avif",
        ],
      },
      {
        folder: "Group 6",
        images: [
          "/test-product-images/img1.avif",
          "/test-product-images/img3.avif",
          "/test-product-images/img4.avif",
        ],
      },
      {
        folder: "Group 7",
        images: [
          "/test-product-images/img2.avif",
          "/test-product-images/img5.avif",
        ],
      },
      {
        folder: "Group 8",
        images: [
          "/test-product-images/img4.avif",
          "/test-product-images/img1.avif",
          "/test-product-images/img3.avif",
        ],
      },
      {
        folder: "Group 9",
        images: ["/test-product-images/img2.avif", "/test-product-images/img5.avif"],
      },
      {
        folder: "Group 10",
        images: ["/test-product-images/img1.avif", "/test-product-images/img4.avif"],
      },
      {
        folder: "Group 11",
        images: ["/test-product-images/img3.avif", "/test-product-images/img2.avif"],
      },
      {
        folder: "Group 12",
        images: ["/test-product-images/img5.avif", "/test-product-images/img1.avif"],
      },
    ],
  },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const productId = parseInt(id);
  const product = allProducts.find((p) => p.id === productId);

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // Track current image index for each QC group card
  const [qcCardIndices, setQcCardIndices] = useState<Record<number, number>>({});

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

  // Recently Viewed (Mock - generally would be different from recommended)
  const recentlyViewed = allProducts
    .filter((p) => p.id !== product.id && !recommended.find((r) => r.id === p.id))
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
    // Removed bg-bg-primary to reveal grid background
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
          <div className="relative aspect-square bg-white/5 border border-white/5 rounded-2xl overflow-hidden group">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
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
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${isFavorited ? "text-red-500 hover:text-red-400" : "text-text-muted hover:text-white"}`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* QC Images Section - Card Layout with In-Card Navigation */}
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
                {/* Horizontal Scroll Controls could go here if list is long */}
            </div>

            <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {product.qcImages.map((group, groupIdx) => {
                const currentIndex = qcCardIndices[groupIdx] || 0;
                const currentImage = group.images[currentIndex];
                const totalImages = group.images.length;

                return (
                  <div key={groupIdx} className="flex-shrink-0 w-48 md:w-56 bg-white/5 border border-white/5 rounded-xl overflow-hidden flex flex-col group/card hover:border-white/20 transition-all">
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-black/20">
                        <Image
                            src={currentImage}
                            alt={`${group.folder} photo ${currentIndex + 1}`}
                            fill
                            className="object-cover"
                        />
                        
                        {/* Count Badge */}
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-md">
                            {currentIndex + 1} of {totalImages}
                        </div>

                        {/* Navigation Arrows (Show on hover or always on mobile?) */}
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
                        
                        {/* Enlarge Button (Clicking image works too in this model via outer div if we wanted, but let's add a button) */}
                        <button 
                            onClick={() => openLightbox(currentImage)}
                            className="absolute inset-0 z-0"
                        />
                    </div>

                    {/* Metadata Footer - Simplified */}
                    <div className="p-3 bg-white/[0.02]">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-white group-hover/card:text-indigo-400 transition-colors">{group.folder}</span>
                        </div>
                    </div>
                  </div>
                );
              })}
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
                  className="bg-white/5 border border-white/5 rounded-xl overflow-hidden active:scale-95 md:active:scale-100 hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
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
      <AgentSelector
        productUrl={product.link}
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
    </div>
  );
}
