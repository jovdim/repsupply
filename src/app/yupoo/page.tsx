"use client";

import { Search, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getYupooStores, type YupooStore } from "@/lib/supabase/yupoo";



export default function YupooPage() {
  const [stores, setStores] = useState<YupooStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStores() {
      const data = await getYupooStores();
      setStores(data);
      setLoading(false);
    }
    fetchStores();
  }, []);

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen animate-fade-in">
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
        {loading ? (
           <div className="text-center py-20 text-text-muted animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-neutral-600" />
              <p>Loading stores...</p>
           </div>
        ) : filteredStores.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {filteredStores.map((store, index) => (
                <a
                href={store.link}
                target="_blank"
                rel="noopener noreferrer"
                key={store.id}
                className="group relative aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-2xl transition-all cursor-pointer block animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
                >
                {/* Image */}
                 {store.image ? (
                    <Image
                       src={store.image}
                       alt={store.name}
                       fill
                       quality={100}
                       className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                       <span className="text-4xl font-bold text-white/10 uppercase">{store.name.charAt(0)}</span>
                    </div>
                 )}
                
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
