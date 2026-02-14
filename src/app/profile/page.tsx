"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Clock,
  Settings,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { getFavorites } from "@/lib/supabase/favorites";
import { getViewHistory } from "@/lib/supabase/history";
import { createClient } from "@/lib/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"saved" | "history" | "account">("saved");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Data state
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setDataLoading(true);
      const [favs, history] = await Promise.all([
        getFavorites(),
        getViewHistory(20),
      ]);
      setSavedItems(favs);
      setHistoryItems(history);
      setDataLoading(false);
    }
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setNewPassword("");
      setConfirmNewPassword("");
    }
    setPasswordLoading(false);
  };

  // Loading check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 px-4 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-bg-card border border-white/5 backdrop-blur-md rounded-3xl p-8 animate-scale-in">
           <LoginForm redirectTo="/profile" />
        </div>
      </div>
    );
  }

  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/5">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {userName}
            </h1>
            <p className="text-text-secondary text-sm">{userEmail}</p>
            <p className="text-text-muted text-xs mt-1">Joined {joinDate}</p>
          </div>
          <div className="md:ml-auto">
            <Button
              onClick={() => setShowLogoutModal(true)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mb-8">
          {[
            { key: "saved" as const, icon: Heart, label: "Saved" },
            { key: "history" as const, icon: Clock, label: "Recently Viewed" },
            { key: "account" as const, icon: Settings, label: "Account" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "text-white border-b-2 border-white -mb-px"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "saved" && savedItems.length > 0 && (
                <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full">
                  {savedItems.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div>
              {dataLoading ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-bg-card border border-white/5 rounded-xl overflow-hidden animate-pulse"
                    >
                      <div className="aspect-square bg-white/5" />
                      <div className="p-2 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-12" />
                        <div className="h-2 bg-white/5 rounded w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedItems.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted text-lg mb-2">
                    No saved items yet
                  </p>
                  <p className="text-text-muted text-sm mb-6">
                    Browse products and tap the heart to save.
                  </p>
                  <Link href="/products">
                    <Button>
                      Browse Products
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {savedItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      className="bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group cursor-pointer"
                    >
                      <div className="relative aspect-square bg-neutral-900">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          quality={100}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-2">
                        <div className="font-bold text-white text-xs mb-0.5">
                          {item.price}
                        </div>
                        <h3 className="text-text-muted text-[10px] line-clamp-1 group-hover:text-white transition-colors">
                          {item.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recently Viewed Tab */}
          {activeTab === "history" && (
            <div>
              {dataLoading ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-bg-card border border-white/5 rounded-xl overflow-hidden animate-pulse"
                    >
                      <div className="aspect-square bg-white/5" />
                      <div className="p-2 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-12" />
                        <div className="h-2 bg-white/5 rounded w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : historyItems.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted text-lg mb-2">
                    No recently viewed items
                  </p>
                  <p className="text-text-muted text-sm mb-6">
                    Products you view will appear here.
                  </p>
                  <Link href="/products">
                    <Button>
                      Browse Products
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {historyItems.map((item, idx) => (
                    <Link
                      key={`${item.id}-${idx}`}
                      href={`/products/${item.slug}`}
                      className="bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group cursor-pointer relative"
                    >
                      <div className="relative aspect-square bg-neutral-900">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          quality={100}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                         {/* Time overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                           <div className="flex items-center gap-1 text-[10px] text-white/80">
                              <Clock className="w-3 h-3" />
                              <span className="truncate">{item.time}</span>
                           </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-bold text-white text-xs mb-0.5">
                           {item.price}
                        </div>
                        <h3 className="text-text-muted text-[10px] line-clamp-1 group-hover:text-white transition-colors">
                          {item.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white mb-6">
                Change Password
              </h3>

              {passwordMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl border text-sm text-center ${
                    passwordMessage.type === "success"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password (UI Only for now as Supabase handles this via email usually, but adding field as requested) */}
                 <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-11 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-white text-black hover:bg-white/90 border-none font-bold w-full"
                >
                  {passwordLoading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-card border border-white/10 rounded-3xl p-8 max-w-sm w-full animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-2 text-center">Log out?</h3>
            <p className="text-text-secondary text-sm mb-8 text-center">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLogoutModal(false)}
                variant="ghost"
                className="flex-1 bg-white/5 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-white text-black hover:bg-white/90 border-none font-bold"
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
