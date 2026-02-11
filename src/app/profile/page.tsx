"use client";

import { useState, useEffect } from "react";
import {
  User,
  Settings,
  LogOut,
  Heart,
  ListMusic,
  Package,
  History,
  Save,
  X,
  Bookmark,
  Plus,
  FolderOpen,
  ExternalLink,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

// Mock Data
const collections = [
  {
    id: 1,
    name: "Summer Haul 2024",
    items: 12,
    image: "/test-product-images/img1.avif",
  },
  {
    id: 2,
    name: "Shoe Rotation",
    items: 5,
    image: "/test-product-images/img2.avif",
  },
];

const savedFinds = [
  {
    id: 1,
    name: "Nike Dunk Low Panda",
    price: "¥299",
    image: "/test-product-images/img1.avif",
    agent: "CNFans",
  },
  {
    id: 2,
    name: "Essentials Hoodie",
    price: "¥189",
    image: "/test-product-images/img2.avif",
    agent: "Mulebuy",
  },
];

const history = [
  {
    id: 4,
    name: "Jaded London Cargos",
    price: "¥259",
    image: "/test-product-images/img4.avif",
    time: "2h ago",
  },
  {
    id: 5,
    name: "Represent Hoodie",
    price: "¥219",
    image: "/test-product-images/img5.avif",
    time: "5h ago",
  },
  {
    id: 6,
    name: "Gallery Dept Jeans",
    price: "¥329",
    image: "/test-product-images/img1.avif",
    time: "1d ago",
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "finds" | "collections" | "history"
  >("finds");
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mock User State
  const [user, setUser] = useState({
    name: "Demo User",
    bio: "Affiliate Member • Joined March 2024",
    avatar: null,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-24 md:pt-24">
      {/* Mobile Header - Sticky */}
      <div className="md:hidden sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md p-4 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-xl font-bold font-[var(--font-poetsen-one)]">
          My Profile
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Info - Responsive */}
        <div
          className={`flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12 ${isMobile ? "text-center items-center mt-6" : ""}`}
        >
          {/* User Info */}
          <div
            className={`flex items-start gap-6 ${isMobile ? "flex-col items-center w-full" : "flex-1"}`}
          >
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
              <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                <User className="w-8 h-8 text-neutral-400" />
              </div>
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSaveProfile}
                className="flex-1 max-w-md animate-fade-in w-full"
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <input
                    type="text"
                    value={user.bio}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-secondary"
                  />
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Button type="submit" size="sm">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
                  {user.name}
                </h1>
                <p className="text-text-muted mb-4 text-sm md:text-base">
                  {user.bio}
                </p>
                <div
                  className={`flex gap-3 ${isMobile ? "justify-center" : ""}`}
                >
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Settings className="w-4 h-4" /> Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-bg-card border border-white/5 p-3 md:p-4 rounded-xl text-center min-w-[90px] md:min-w-[100px]">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                124
              </div>
              <div className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">
                Saved
              </div>
            </div>
            <div className="bg-bg-card border border-white/5 p-3 md:p-4 rounded-xl text-center min-w-[90px] md:min-w-[100px]">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                12
              </div>
              <div className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">
                Lists
              </div>
            </div>
            <div className="bg-bg-card border border-white/5 p-3 md:p-4 rounded-xl text-center min-w-[90px] md:min-w-[100px]">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                A+
              </div>
              <div className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">
                Tier
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-white/5 pb-0 max-sm:gap-4 max-sm:justify-between">
          <button
            onClick={() => setActiveTab("finds")}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "finds" ? "text-white" : "text-text-muted hover:text-white"}`}
          >
            Saved Finds
            {activeTab === "finds" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "collections" ? "text-white" : "text-text-muted hover:text-white"}`}
          >
            Collections
            {activeTab === "collections" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "history" ? "text-white" : "text-text-muted hover:text-white"}`}
          >
            History
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === "finds" && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {savedFinds.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                >
                  <div className="aspect-[4/5] relative bg-neutral-900">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-white">
                        {item.price}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-text-muted border border-white/10 px-1.5 py-0.5 rounded  hidden md:inline-block">
                        {item.agent}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="aspect-[4/5] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-text-muted hover:text-white hover:border-white/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Save New Find</span>
              </button>
            </div>
          )}

          {activeTab === "collections" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="group bg-bg-card border border-white/5 rounded-2xl p-4 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex gap-2 mb-4 h-48">
                    <div className="w-2/3 relative rounded-lg overflow-hidden bg-neutral-900">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-1/3 flex flex-col gap-2">
                      <div className="flex-1 relative rounded-lg overflow-hidden bg-white/5"></div>
                      <div className="flex-1 relative rounded-lg overflow-hidden bg-white/5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-text-primary group-hover:text-white transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {collection.items} items
                      </p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                      <FolderOpen className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {collections.length === 0 && (
                <div className="col-span-full text-center py-8 text-text-muted text-sm">
                  No collections yet. Start saving items!
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-bg-card border border-white/5 rounded-xl hover:border-white/20 transition-colors cursor-pointer group"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-900">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-text-muted">
                      Views • {item.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-white mb-2">
                      {item.price}
                    </span>
                    <button className="text-xs text-text-muted group-hover:text-white flex items-center gap-1 justify-end transition-colors">
                      <span className="hidden sm:inline">View Again</span>{" "}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Footer Links */}
        <div className="mt-12 md:hidden space-y-2">
          <Link
            href="/terms"
            className="block p-3 bg-bg-card rounded-xl text-sm text-text-secondary hover:text-white transition-colors text-center"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="block p-3 bg-bg-card rounded-xl text-sm text-text-secondary hover:text-white transition-colors text-center"
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
