"use client";

import { useState, use } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ImageIcon,
  Star,
  Tag,
  Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { AgentSelector } from "@/components/product/AgentSelector";
import { Button } from "@/components/ui/Button";

// Same product data (in a real app this would be a shared store/db)
const allProducts = [
  {
    id: 1,
    name: "Nike Dunk Low Panda",
    price: "¥299",
    category: "shoes",
    image: "/test-product-images/img1.avif",
    link: "https://weidian.com/item.html?itemID=123",
    rating: 4.9,
    description:
      "Premium quality Nike Dunk Low in the iconic Panda colorway. Features a clean black and white leather upper with excellent stitching and proper shape. One of the most popular rep finds in the community.",
    qcImages: [
      {
        folder: "QC Batch 1 — Jan 2026",
        images: [
          "/test-product-images/img1.avif",
          "/test-product-images/img2.avif",
          "/test-product-images/img3.avif",
          "/test-product-images/img4.avif",
        ],
      },
      {
        folder: "QC Batch 2 — Feb 2026",
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
    category: "hoodies",
    image: "/test-product-images/img2.avif",
    link: "https://item.taobao.com/item.htm?id=456",
    rating: 4.8,
    description:
      "Fear of God Essentials oversized hoodie with front logo. Heavyweight cotton blend with a soft fleece interior. True to retail sizing.",
    qcImages: [
      {
        folder: "QC Photos — Default",
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
    category: "t-shirts",
    image: "/test-product-images/img3.avif",
    link: "https://detail.1688.com/offer/789.html",
    rating: 4.7,
    description:
      "Chrome Hearts signature horseshoe graphic tee. Premium cotton with accurate print quality and correct tag details.",
    qcImages: [
      {
        folder: "QC Gallery",
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
    category: "pants",
    image: "/test-product-images/img4.avif",
    link: "https://weidian.com/item.html?itemID=101112",
    rating: 4.8,
    description:
      "Jaded London parachute cargo pants with premium hardware. Multiple colorways available. Streetwear essential.",
    qcImages: [
      {
        folder: "QC Photos",
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
    category: "hoodies",
    image: "/test-product-images/img5.avif",
    link: "https://weidian.com/item.html?itemID=131415",
    rating: 4.9,
    description:
      "Represent Owners Club hoodie with embroidered branding. Heavy 450gsm cotton with ribbed trims. Very close to retail quality.",
    qcImages: [
      {
        folder: "QC Batch 1",
        images: [
          "/test-product-images/img5.avif",
          "/test-product-images/img2.avif",
          "/test-product-images/img3.avif",
        ],
      },
      {
        folder: "QC Batch 2",
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
    category: "pants",
    image: "/test-product-images/img1.avif",
    link: "https://weidian.com/item.html?itemID=161718",
    rating: 4.6,
    description:
      "Gallery Dept paint-splattered distressed jeans. Unique hand-finished details on each pair. Premium denim quality.",
    qcImages: [
      {
        folder: "QC Photos",
        images: ["/test-product-images/img1.avif", "/test-product-images/img3.avif"],
      },
    ],
  },
  {
    id: 7,
    name: "Jordan 4 Retro",
    price: "¥399",
    category: "shoes",
    image: "/test-product-images/img2.avif",
    link: "https://weidian.com/item.html?itemID=192021",
    rating: 4.8,
    description:
      "Air Jordan 4 Retro with proper netting, shape, and materials. Top-tier batch with correct tongue height and heel tab.",
    qcImages: [
      {
        folder: "QC Gallery",
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
    category: "jackets",
    image: "/test-product-images/img3.avif",
    link: "https://weidian.com/item.html?itemID=222324",
    rating: 4.5,
    description:
      "Trapstar Irongate puffer jacket with detachable hood. Accurate branding and quality hardware. Warm and well-constructed.",
    qcImages: [
      {
        folder: "QC Photos",
        images: ["/test-product-images/img3.avif", "/test-product-images/img2.avif"],
      },
    ],
  },
  {
    id: 9,
    name: "Stussy Tee",
    price: "¥129",
    category: "t-shirts",
    image: "/test-product-images/img4.avif",
    link: "https://item.taobao.com/item.htm?id=252627",
    rating: 4.7,
    description:
      "Classic Stussy 8-ball graphic tee. Soft cotton blend with accurate sizing and print quality.",
    qcImages: [
      {
        folder: "QC Photos",
        images: ["/test-product-images/img4.avif", "/test-product-images/img5.avif"],
      },
    ],
  },
  {
    id: 10,
    name: "Carhartt Double Knee",
    price: "¥269",
    category: "pants",
    image: "/test-product-images/img5.avif",
    link: "https://item.taobao.com/item.htm?id=282930",
    rating: 4.8,
    description:
      "Carhartt WIP double knee work pants. Heavy-duty canvas with reinforced knees. Comes in multiple washes.",
    qcImages: [
      {
        folder: "QC Photos",
        images: ["/test-product-images/img5.avif", "/test-product-images/img1.avif"],
      },
    ],
  },
  {
    id: 11,
    name: "Bape Shark Hoodie",
    price: "¥450",
    category: "hoodies",
    image: "/test-product-images/img1.avif",
    link: "https://item.taobao.com/item.htm?id=313233",
    rating: 4.6,
    description:
      "A Bathing Ape shark full-zip hoodie with WGM embroidery. Correct teeth print alignment and tag details.",
    qcImages: [
      {
        folder: "QC Gallery",
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
    category: "shoes",
    image: "/test-product-images/img3.avif",
    link: "https://weidian.com/item.html?itemID=343536",
    rating: 4.9,
    description:
      "Adidas Yeezy Slides with proper foam compound and shape. Ultra-comfortable with accurate sole texture.",
    qcImages: [
      {
        folder: "QC Photos — Bone",
        images: [
          "/test-product-images/img3.avif",
          "/test-product-images/img4.avif",
        ],
      },
      {
        folder: "QC Photos — Onyx",
        images: [
          "/test-product-images/img5.avif",
          "/test-product-images/img1.avif",
        ],
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
  const [activeQCFolder, setActiveQCFolder] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Get recommended products (same category, exclude current)
  const recommended = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);
  // Fill remaining slots from other products
  const moreProducts = allProducts
    .filter(
      (p) => p.id !== product.id && !recommended.find((r) => r.id === p.id)
    )
    .slice(0, 5 - recommended.length);
  const youMightLike = [...recommended, ...moreProducts].slice(0, 5);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const currentQCImages = product.qcImages[activeQCFolder]?.images || [];

  const openLightbox = (imgSrc: string, index: number) => {
    setLightboxImage(imgSrc);
    setLightboxIndex(index);
  };

  const navigateLightbox = (dir: "prev" | "next") => {
    const newIndex =
      dir === "prev"
        ? (lightboxIndex - 1 + currentQCImages.length) % currentQCImages.length
        : (lightboxIndex + 1) % currentQCImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(currentQCImages[newIndex]);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Back Navigation */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 md:relative md:bg-transparent md:border-none">
        <div className="max-w-6xl mx-auto px-4 py-3 md:pt-24 md:pb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm"
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
          <div className="relative aspect-square bg-bg-card border border-white/5 rounded-2xl overflow-hidden group">
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
              <span className="text-xs font-medium text-text-muted bg-white/5 px-2.5 py-1 rounded-full capitalize flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                {product.category}
              </span>
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500" />
                {product.rating}
              </span>
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
              >
                <ExternalLink className="w-4 h-4" />
                View Original
              </a>
            </div>

            {/* Affiliate notice */}
            <div className="mt-6 flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <Info className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                This is an affiliated product. Clicking &quot;Buy with Agent&quot;
                will redirect you to an external shopping agent where you can
                purchase this item.
              </p>
            </div>
          </div>
        </div>

        {/* QC Images Section */}
        {product.qcImages.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-5 h-5 text-text-muted" />
              <h2 className="text-xl md:text-2xl font-bold text-white">
                QC Photos
              </h2>
              <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                {product.qcImages.length}{" "}
                {product.qcImages.length === 1 ? "gallery" : "galleries"}
              </span>
            </div>

            {/* Folder Tabs */}
            {product.qcImages.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                {product.qcImages.map((qc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQCFolder(idx)}
                    className={`text-sm font-medium whitespace-nowrap px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeQCFolder === idx
                        ? "bg-white text-black"
                        : "bg-bg-card border border-white/5 text-text-secondary hover:bg-white/5"
                    }`}
                  >
                    {qc.folder}
                  </button>
                ))}
              </div>
            )}

            {/* Single folder name */}
            {product.qcImages.length === 1 && (
              <p className="text-sm text-text-muted mb-4">
                {product.qcImages[0].folder}
              </p>
            )}

            {/* QC Image Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {currentQCImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => openLightbox(img, idx)}
                  className="relative aspect-square bg-bg-card border border-white/5 rounded-lg overflow-hidden group cursor-pointer hover:border-white/20 transition-all"
                >
                  <Image
                    src={img}
                    alt={`QC Photo ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* You Might Also Like */}
        {youMightLike.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
              {youMightLike.map((p) => (
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

        {/* Product Details / Extra Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="bg-bg-card border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">
              Shipping Info
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ships through your selected agent. Typical delivery: 2-4 weeks
              depending on shipping method. Express options available.
            </p>
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">
              QC Process
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              After purchasing through an agent, you&apos;ll receive QC photos
              before the item ships. Request HD photos if available.
            </p>
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">
              Returns Policy
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Return policies vary by agent and seller. Check your
              agent&apos;s return policy before purchasing. Most agents offer
              a 3-day inspection period.
            </p>
          </div>
        </div>
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
          {currentQCImages.length > 1 && (
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
            {lightboxIndex + 1} / {currentQCImages.length}
          </div>
        </div>
      )}

      <Footer />

      {/* Agent Selector Modal */}
      <AgentSelector
        productUrl={product.link}
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
    </div>
  );
}
