"use client";

import { useState } from "react";
import { User, Settings, Heart, History, LogOut, Save, ExternalLink, Lock, AlertTriangle, Mail, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Mock Data
const savedFinds = [
  { id: 1, name: "Nike Dunk Low Panda", price: "¥299", image: "/test-product-images/img1.avif" },
  { id: 2, name: "Essentials Hoodie", price: "¥189", image: "/test-product-images/img2.avif" },
  { id: 3, name: "Chrome Hearts Tee", price: "¥159", image: "/test-product-images/img3.avif" },
  { id: 4, name: "Voltage Cargos", price: "¥259", image: "/test-product-images/img4.avif" },
  { id: 5, name: "Stussy 8 Ball", price: "¥99", image: "/test-product-images/img5.avif" },
  { id: 6, name: "Jordan 1 Mocha", price: "¥420", image: "/test-product-images/img1.avif" },
];

const historyItems = [
  { id: 5, name: "Represent Hoodie", price: "¥219", image: "/test-product-images/img5.avif", time: "2h ago" },
  { id: 6, name: "Gallery Dept Jeans", price: "¥329", image: "/test-product-images/img1.avif", time: "5h ago" },
  { id: 7, name: "Stussy Tee", price: "¥99", image: "/test-product-images/img2.avif", time: "1d ago" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"saved" | "history" | "account">("saved");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // User State
  const [user, setUser] = useState({
    name: "Demo User",
    email: "demo@repsupply.com",
    avatar: null as string | null,
    joined: "March 2024",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleLogout = () => {
    // In a real app, this would clear session/cookies and redirect
    window.location.href = "/";
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    alert("Profile Updated Successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
        alert("Passwords do not match!");
        return;
    }
    alert("Password Changed Successfully!");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-warning">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-bold text-white">Confirm Logout</h3>
                </div>
                <p className="text-text-secondary text-sm mb-6">
                    Are you sure you want to log out of your account?
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
                    <Button 
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 xl:px-24 pt-24 md:pt-32 pb-8">
        <div className="flex items-end justify-between border-b border-white/5 pb-8">
            <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                    {user.avatar ? (
                         <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white/20" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-poetsen-one)] text-white mb-1">
                        {user.name}
                    </h1>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                    </div>
                </div>
            </div>
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLogoutConfirm(true)}
                className="text-text-muted hover:text-white hover:bg-white/5"
            >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 xl:px-24 mb-8">
        <div className="flex gap-8 border-b border-white/5">
            <button
                onClick={() => setActiveTab("saved")}
                className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "saved" ? "text-white" : "text-text-muted hover:text-white"}`}
            >
                <Heart className="w-4 h-4" />
                Saved ({savedFinds.length})
                {activeTab === "saved" && <div className="absolute bottom-0 left-0 w-full h-px bg-white" />}
            </button>
             <button
                onClick={() => setActiveTab("history")}
                className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "history" ? "text-white" : "text-text-muted hover:text-white"}`}
            >
                <History className="w-4 h-4" />
                Recently Viewed
                {activeTab === "history" && <div className="absolute bottom-0 left-0 w-full h-px bg-white" />}
            </button>
             <button
                onClick={() => setActiveTab("account")}
                className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "account" ? "text-white" : "text-text-muted hover:text-white"}`}
            >
                <Settings className="w-4 h-4" />
                Account
                {activeTab === "account" && <div className="absolute bottom-0 left-0 w-full h-px bg-white" />}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 xl:px-24 min-h-[50vh]">
        {activeTab === "saved" && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 animate-fade-in">
                {savedFinds.map((item) => (
                     <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        className="group relative bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer block"
                    >
                        <div className="aspect-square relative bg-gradient-to-br from-neutral-800 to-neutral-900">
                            <Image src={item.image} alt={item.name} fill quality={100} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-3">
                            <div className="font-bold text-white text-sm mb-0.5">{item.price}</div>
                            <div className="text-text-secondary text-xs truncate group-hover:text-white transition-colors">{item.name}</div>
                        </div>
                    </Link>
                ))}
                 {/* Add New Placeholder */}
                 <Link href="/products" className="aspect-[4/5] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-text-muted hover:text-white hover:border-white/30 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-xl leading-none pl-0.5 pt-0.5">+</span>
                    </div>
                    <span className="text-xs font-medium">Browse</span>
                </Link>
            </div>
        )}

        {activeTab === "history" && (
             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 animate-fade-in">
                 {historyItems.map((item) => (
                     <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        className="group relative bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer block"
                     >
                        <div className="aspect-square relative bg-gradient-to-br from-neutral-800 to-neutral-900">
                            <Image src={item.image} alt={item.name} fill quality={100} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            {/* Time Badge */}
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-medium text-text-secondary flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {item.time}
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="font-bold text-white text-sm mb-0.5">{item.price}</div>
                            <div className="text-text-secondary text-xs truncate group-hover:text-white transition-colors">{item.name}</div>
                        </div>
                    </Link>
                 ))}
             </div>
        )}

        {activeTab === "account" && (
            <div className="max-w-md mx-auto animate-fade-in">
                {/* Change Password */}
                <div className="bg-bg-card border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Lock className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Security</h2>
                    </div>
                    
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
                                <Lock className="w-3 h-3" />
                                Current Password
                            </label>
                            <input 
                                type="password" 
                                value={passwordForm.current}
                                onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 outline-none transition-colors"
                            />
                        </div>

                         <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">New Password</label>
                            <input 
                                type="password" 
                                value={passwordForm.new}
                                onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 outline-none transition-colors"
                            />
                        </div>

                         <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordForm.confirm}
                                onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 outline-none transition-colors"
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                             <Button type="submit" size="sm" className="bg-white text-black hover:bg-white/90 border-none transition-all active:scale-95">
                                Update Password
                             </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>

      <div className="mt-auto pt-24">
      </div>
    </div>
  );
}
