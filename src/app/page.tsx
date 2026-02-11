"use client";

import {
  Flame,
  Search,
  ArrowRight,
  Truck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getFeaturedProducts, type ProductFromDB } from "@/lib/supabase/products";


const categories = [
  { name: "Shoes", image: "/test-product-images/img1.avif" },
  { name: "Hoodies", image: "/test-product-images/img2.avif" },
  { name: "T-Shirts", image: "/test-product-images/img3.avif" },
  { name: "Pants", image: "/test-product-images/img4.avif" },
  { name: "Jackets", image: "/test-product-images/img5.avif" },
  { name: "Accessories", image: "/test-product-images/img1.avif" },
];

const agents = [
  { name: "AllChinaBuy", logo: "/agent-images/allchinabuy.webp" },
  { name: "CNFans", logo: "/agent-images/cnfans.webp" },
  { name: "Mulebuy", logo: "/agent-images/mulebuy.webp" },
  { name: "ACBuy", logo: "/agent-images/acbuy.webp" },
  { name: "Superbuy", logo: "/agent-images/superbuy.webp" },
  { name: "Sugargoo", logo: "/agent-images/sugargoo.webp" },
  { name: "OrientDig", logo: "/agent-images/orientdig.webp" },
  { name: "Hoobuy", logo: "/agent-images/hoobuy.webp" },
  { name: "Oopbuy", logo: "/agent-images/oopbuy.webp" },
  { name: "Kakobuy", logo: "/agent-images/kakobuy.webp" },
];

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<ProductFromDB[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const data = await getFeaturedProducts(12);
      setFeaturedProducts(data);
      setLoadingProducts(false);
    }
    fetchFeatured();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What are replicas and how do they work?",
      answer:
        "Replicas are high-quality reproductions of designer fashion items. We connect you with trusted agents who source authentic-looking pieces at affordable prices from overseas manufacturers.",
    },
    {
      question: "How do I know if an agent is trustworthy?",
      answer:
        "Check community reviews, QC photos, and reputation. Established agents like CNFans, Mulebuy, and ACBuy have proven track records with thousands of successful transactions.",
    },
    {
      question: "What's the quality like compared to originals?",
      answer:
        "Top-tier replicas (1:1) are virtually indistinguishable from originals in materials, stitching, and finish. Always request QC photos before purchasing.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "International shipping typically takes 2-4 weeks. Express options are available for faster delivery. Track your packages through agent dashboards.",
    },
    {
      question: "What if I receive a defective item?",
      answer:
        "Most agents offer return policies and replacements. Document everything with photos and contact their support. Community members can help with dispute resolution.",
    },
    {
      question: "Is this legal and safe?",
      answer:
        "Replica shopping is legal in most countries for personal use. We focus on education and connecting you with reputable sources for safe, reliable transactions.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO SECTION - Grand & Centered */}
      <div className="relative pt-32 pb-4 md:pt-40 md:pb-6 px-4 text-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-500px h-500px bg-white/5 blur-[100px] rounded-full pointer-events-none" />

        <h1 className="relative text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold font-[var(--font-poetsen-one)] tracking-tight mb-4">
          REPSUPPLY
        </h1>
        <p className="relative text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Reps redefined, Quality find.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="relative flex items-center bg-bg-card border border-white/10 rounded-2xl shadow-lg">
              <div className="pl-4 pr-2">
                <Search className="w-5 h-5 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 bg-transparent border-none outline-none py-4 text-text-primary placeholder:text-text-muted text-base"
              />
            </div>

            {/* TRENDING SEARCHES */}
            <div className="mt-6 relative flex items-center gap-2">
              <button
                onClick={() => {
                  const container = document.querySelector(".trending-scroll");
                  if (container)
                    container.scrollBy({ left: -200, behavior: "smooth" });
                }}
                className="hidden lg:flex w-7 h-7 rounded-lg bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />
              </button>
              <div className="relative flex-1 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
                <div className="trending-scroll flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-2">
                  {[
                    "Nike",
                    "Supreme",
                    "Jordan",
                    "Yeezy",
                    "Chrome Hearts",
                    "Bape",
                    "Stussy",
                    "Palace",
                    "Off-White",
                    "Stone Island",
                    "Fear of God",
                    "Travis Scott",
                    "Louis Vuitton",
                    "Gucci",
                    "Balenciaga",
                    "Moncler",
                    "Canada Goose",
                    "The North Face",
                    "Carhartt",
                    "Represent",
                  ].map((term) => (
                    <span
                      key={term}
                      className="bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-text-secondary hover:text-white cursor-pointer transition-all duration-200 text-sm border border-white/10 whitespace-nowrap flex-shrink-0"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  const container = document.querySelector(".trending-scroll");
                  if (container)
                    container.scrollBy({ left: 200, behavior: "smooth" });
                }}
                className="hidden lg:flex w-7 h-7 rounded-lg bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="mb-8 md:mb-16 px-4 md:max-w-7xl md:mx-auto py-4 md:py-8">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {loadingProducts ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-bg-card border border-white/5 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-16" />
                  <div className="h-3 bg-white/5 rounded w-24" />
                </div>
              </div>
            ))
          ) : (
          featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-bg-card border border-white/5 rounded-xl overflow-hidden active:scale-95 md:active:scale-100 hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                <div className="text-neutral-600 text-xs font-medium">
                  Product Image
                </div>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  quality={100}
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="font-bold text-white text-base mb-1">
                  {product.price}
                </div>
                <h3 className="text-text-muted text-sm line-clamp-1 group-hover:text-white transition-colors">
                  {product.name}
                </h3>
              </div>
            </Link>
          ))
          )}
        </div>

        {/* VIEW ALL PRODUCTS */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" className="rounded-3xl">
              View All Products <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

   {/* SHOP BY CATEGORY */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 mb-8 md:mb-16">
        <h2 className="text-lg md:text-2xl font-semibold text-[var(--color-text-heading)] text-center mb-6 md:mb-8 uppercase tracking-wider">
          Browse Categories
        </h2>
        <div className="relative">
          {/* Fade effects for scroll indication on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none md:hidden" />

          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide pb-2 md:pb-0 px-2 md:px-0">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="group relative flex-shrink-0 w-24 md:w-auto aspect-square rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-bg-card cursor-pointer transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  quality={100}
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 group-hover:via-black/10 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm md:text-lg font-bold text-white tracking-wide drop-shadow-lg group-hover:scale-110 transition-transform duration-300 text-center px-2">
                    {cat.name}
                  </span>
                </div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl md:rounded-2xl" />
              </div>
            ))}
          </div>

          {/* Scroll Buttons - Right side on Mobile */}
          <div className="flex justify-end mt-1 md:hidden">
            <div className="flex gap-2">
              <button
                className="w-8 h-8 bg-white/3 backdrop-blur-sm border border-white/3 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                onClick={() => {
                  const container = document.querySelector(".overflow-x-auto");
                  if (container)
                    container.scrollBy({ left: -120, behavior: "smooth" });
                }}
              >
                <ChevronLeft className="w-4 h-4 text-white/40" />
              </button>
              <button
                className="w-8 h-8 bg-white/3 backdrop-blur-sm border border-white/3 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                onClick={() => {
                  const container = document.querySelector(".overflow-x-auto");
                  if (container)
                    container.scrollBy({ left: 120, behavior: "smooth" });
                }}
              >
                <ChevronRight className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORTED AGENTS */}
      <div className="py-8 md:py-16 mb-8 md:mb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg md:text-2xl font-semibold text-[var(--color-text-heading)] text-center mb-10 uppercase tracking-wider">
            Supported Agents
          </h2>
          <div className="relative overflow-hidden">
            {/* Fade effects for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />

            {/* Scrolling container */}
            <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
              {/* Sets of agents for continuous loop */}
              {[...Array(4)].map((_, setIndex) => (
                <div key={setIndex} className="flex flex-shrink-0">
                  {agents.map((agent, index) => (
                    <div
                      key={`${agent.name}-${setIndex}-${index}`}
                      className="flex-shrink-0 mx-3 md:mx-3 group flex items-center gap-2"
                    >
                      <div className="relative w-8 h-8 md:w-10 md:h-10 opacity-40 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0">
                        <Image
                          src={agent.logo}
                          alt={agent.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative text-sm md:text-xl font-bold font-[var(--font-poetsen-one)] text-white/40 group-hover:text-white transition-all duration-300 cursor-default transform group-hover:scale-105 whitespace-nowrap uppercase tracking-tighter">
                          {agent.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

   

      {/* HOT PRODUCTS */}
      <div className="px-4 md:max-w-7xl md:mx-auto py-8 md:py-16 mb-8 md:mb-16">
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text-heading)] text-center mb-8 md:mb-12 uppercase tracking-wider">
          Best Sellers
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 mb-16">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-bg-card border border-white/5 rounded-xl overflow-hidden active:scale-95 md:active:scale-100 hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer group"
            >
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
              </div>
              <div className="p-4">
                <div className="font-bold text-white text-base mb-1">
                  {product.price}
                </div>
                <h3 className="text-text-muted text-sm line-clamp-1 group-hover:text-white transition-colors">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW ALL - At Bottom */}
        <div className="text-center">
          <Link href="/products">
            <Button size="lg" className="rounded-3xl">
              View All Products <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="py-8 md:py-16 mb-8 md:mb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text-heading)] text-center mb-8 md:mb-12 uppercase tracking-wider">
              FAQ
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200 group"
                >
                  <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 transition-transform duration-200 flex-shrink-0 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-4">
                    <p className="text-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-text-secondary mb-6">
              Have more questions? Join our community for real-time support.
            </p>
          </div>
        </div>
      </div>

      {/* NEED HELP */}
      <div className="py-8 md:py-16 mb-8 md:mb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text-heading)] text-center mb-8 md:mb-12 uppercase tracking-wider">
              Need Help?
            </h2>

            <div className="flex flex-col items-center text-center">
              {/* Discord Logo */}
              <div className="w-20 h-20 bg-bg-card rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-lg">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-[var(--color-text-heading)] uppercase tracking-wider mb-6">
                Join Our Discord Community
              </h3>

              <p className="text-text-secondary text-lg leading-relaxed mb-6 max-w-lg">
                Connect with thousands of fashion enthusiasts. Get real-time
                updates on restocks, share your finds, get QC help, and discover
                the best deals from trusted agents.
              </p>

              <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-md">
                Whether you're new to reps or a seasoned collector, our
                community is here to help you find authentic pieces and avoid
                fakes.
              </p>

              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl px-8 py-3 text-lg font-medium backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                Join Discord Server
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
