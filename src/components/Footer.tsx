"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-transparent mt-auto backdrop-blur-sm relative z-10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 xl:px-24 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand */}
          <div className="space-y-4 max-w-sm">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-110">
                <Image
                  src="/repsupply.png"
                  alt="RepSupply Logo"
                  width={32}
                  height={32}
                  quality={100}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold font-[var(--font-poetsen-one)] gradient-text">
                REPSUPPLY
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Your trusted source for quality replica products. We curate the
              best finds from Taobao, Weidian, and 1688.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-text-muted hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-text-muted hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-text-muted hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-12 sm:gap-24">
            <div>
                 <h3 className="text-white font-bold mb-4 font-[var(--font-poetsen-one)]">Explore</h3>
                 <ul className="space-y-2">
                    <li><Link href="/products" className="text-text-secondary hover:text-white transition-colors text-sm">Products</Link></li>
                    <li><Link href="/yupoo" className="text-text-secondary hover:text-white transition-colors text-sm">Yupoo Store</Link></li>
                    <li><Link href="/converter" className="text-text-secondary hover:text-white transition-colors text-sm">Link Converter</Link></li>
                 </ul>
            </div>
             <div>
                 <h3 className="text-white font-bold mb-4 font-[var(--font-poetsen-one)]">Legal</h3>
                 <ul className="space-y-2">
                    <li><Link href="/privacy" className="text-text-secondary hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="text-text-secondary hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                 </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} RepSupply. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
