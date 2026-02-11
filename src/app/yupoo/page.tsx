"use client";

import { Search, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Simplified Yupoo Store Data
const yupooStores = [
  {
    id: 1,
    name: "TopShoeFactory",
    image: "/test-product-images/img1.avif",
    link: "https://topshoefactory.x.yupoo.com/",
  },
  {
    id: 2,
    name: "FashionReps Seller",
    image: "/test-product-images/img2.avif",
    link: "https://fashionreps.x.yupoo.com/",
  },
  {
    id: 3,
    name: "DesignerHub",
    image: "/test-product-images/img3.avif",
    link: "https://designerhub.x.yupoo.com/",
  },
  {
    id: 4,
    name: "StreetStyle",
    image: "/test-product-images/img4.avif",
    link: "https://streetstyle.x.yupoo.com/",
  },
  {
    id: 5,
    name: "LuxuryReps",
    image: "/test-product-images/img5.avif",
    link: "https://luxuryreps.x.yupoo.com/",
  },
  {
    id: 6,
    name: "SneakerKing",
    image: "/test-product-images/img1.avif", // Reuse existing image for demo
    link: "https://sneakerking.x.yupoo.com/",
  },
  {
    id: 7,
    name: "HypeBeast",
    image: "/test-product-images/img2.avif",
    link: "https://hypebeast.x.yupoo.com/",
  },
  {
    id: 8,
    name: "RepLife",
    image: "/test-product-images/img3.avif",
    link: "https://replife.x.yupoo.com/",
  },
];

export default function YupooPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = yupooStores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header Container */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 pt-4 pb-4 md:pt-24 md:static md:bg-transparent md:border-none md:p-0">
         <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 xl:px-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold font-[var(--font-poetsen-one)] text-white mb-2">
                    Yupoo Stores
                    </h1>
                    <p className="text-text-secondary text-sm md:text-base max-w-2xl">
                    Browse verified Yupoo albums directly.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="glass rounded-xl p-1.5 flex items-center gap-2 w-full md:w-80">
                    <div className="flex-1 flex items-center gap-2 px-3">
                        <Search className="w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted py-1.5"
                        />
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 xl:px-24 pb-20">
        {filteredStores.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {filteredStores.map((store, index) => (
                <a
                href={store.link}
                target="_blank"
                rel="noopener noreferrer"
                key={store.id}
                className="group relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer block animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
                >
                {/* Image */}
                    <Image
                      src={store.image}
                      alt={store.name}
                      fill
                      quality={100}
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* External Link Icon - Centered & Prominent on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white transform scale-90 group-hover:scale-100 transition-transform">
                        <ExternalLink className="w-6 h-6" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="text-white font-bold text-sm md:text-xl truncate transition-colors">
                    {store.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider group-hover:text-white/80 transition-colors">
                        <span>Visit Store</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>
                </div>
                </a>
            ))}
            </div>
        ) : (
            <div className="text-center py-20 text-text-muted">
                No stores found matching "{searchQuery}"
            </div>
        )}
      </div>


    </div>
  );
}
