"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Twitter,
  Instagram,
  Github,
  Youtube,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-110">
                <Image
                  src="/repsupply.png"
                  alt="RepSupply Logo"
                  width={32}
                  height={32}
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
              <a
                href="#"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text-primary font-bold mb-4 font-[var(--font-poetsen-one)]">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/yupoo"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Yupoo Store
                </Link>
              </li>
              <li>
                <Link
                  href="/converter"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Link Converter
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-text-primary font-bold mb-4 font-[var(--font-poetsen-one)]">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Shipping Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/agents"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Agent Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-secondary hover:text-accent-light transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-text-primary font-bold mb-4 font-[var(--font-poetsen-one)]">
              Stay Updated
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Subscribe to our newsletter for the latest drops.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-bg-card/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-bg-secondary w-full"
              />
              <Button size="icon">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} RepSupply. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/terms"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
