"use client";

import {
  ExternalLink,
  Search,
  Filter,
  Star,
  Eye,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";

const yupooStores = [
  {
    id: 1,
    name: "TopShoeFactory",
    specialty: "Sneakers & Shoes",
    rating: 4.9,
    reviews: 2340,
    image: "/test-product-images/img1.avif",
    products: 856,
    verified: true,
    link: "https://topshoefactory.x.yupoo.com/",
  },
  {
    id: 2,
    name: "FashionReps Seller",
    specialty: "Streetwear & Hoodies",
    rating: 4.8,
    reviews: 1890,
    image: "/test-product-images/img2.avif",
    products: 1243,
    verified: true,
    link: "https://fashionreps.x.yupoo.com/",
  },
  // Add more sellers as needed...
];

const featuredItems = [
  {
    id: 1,
    name: "Nike Dunk Low Panda",
    price: "¥299",
    seller: "TopShoeFactory",
    image: "/test-product-images/img1.avif",
    views: 12400,
  },
  {
    id: 2,
    name: "Essentials Hoodie",
    price: "¥189",
    seller: "FashionReps",
    image: "/test-product-images/img2.avif",
    views: 8900,
  },
  {
    id: 3,
    name: "Chrome Hearts Tee",
    price: "¥159",
    seller: "DesignerHub",
    image: "/test-product-images/img3.avif",
    views: 7600,
  },
  {
    id: 4,
    name: "Voltage Cargos",
    price: "¥259",
    seller: "StreetStyle",
    image: "/test-product-images/img4.avif",
    views: 5400,
  },
];

export default function YupooPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-bold font-[var(--font-poetsen-one)] mb-4">
            <span className="gradient-text">Yupoo Store</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Browse verified Yupoo sellers and find quality reps from trusted
            sources
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-1">
          <div className="glass rounded-2xl p-2 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search sellers or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted py-3"
              />
            </div>
            <Button className="px-6 py-3">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Verified Sellers */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary font-[var(--font-poetsen-one)] mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-success" /> Verified Sellers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yupooStores.map((store, index) => (
              <a
                href={store.link}
                target="_blank"
                rel="noopener noreferrer"
                key={store.id}
                className={`group glass rounded-2xl overflow-hidden card-hover animate-fade-in-up stagger-${(index % 6) + 1} block`}
              >
                <div className="relative h-32 bg-gradient-to-br from-bg-secondary/20 to-bg-card">
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    className="object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                  />
                  {store.verified && (
                    <span className="absolute top-3 right-3 bg-success text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      Verified
                    </span>
                  )}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-text-primary font-bold text-lg group-hover:text-accent-light transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-text-muted text-sm">
                        {store.specialty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{store.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="text-sm">
                      <span className="text-text-muted">
                        {store.products} products
                      </span>
                      <span className="text-text-muted mx-2">•</span>
                      <span className="text-text-muted">
                        {store.reviews} reviews
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl text-center">
              <Smartphone className="w-8 h-8 text-accent-light mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2 text-text-primary">
                Mobile First
              </h3>
              <p className="text-text-secondary text-sm">
                Optimized for browsing on any device
              </p>
            </div>
            <div className="glass p-6 rounded-2xl text-center">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2 text-text-primary">
                Verified Sellers
              </h3>
              <p className="text-text-secondary text-sm">
                Every seller is manually vetted by our team
              </p>
            </div>
            <div className="glass p-6 rounded-2xl text-center">
              <Eye className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2 text-text-primary">
                Direct Links
              </h3>
              <p className="text-text-secondary text-sm">
                No ads, just direct links to seller albums
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
