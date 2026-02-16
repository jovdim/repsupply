"use client";

import { useEffect, useState } from "react";
import { Package, Users, Tags, Star, ImageIcon, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Store, ArrowLeft } from "lucide-react";
import { getAdminStats, getRecentProducts, type AdminStats } from "@/lib/supabase/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    products: 0,
    users: 0,
    categories: 0,
    yupooStores: 0,
    qcGroups: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [
        statsData,
        recent,
      ] = await Promise.all([
        getAdminStats(),
        getRecentProducts(5),
      ]);

      setStats(statsData);
      setRecentProducts(recent);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="h-8 bg-white/5 rounded w-48 mb-2" />
          <div className="h-4 bg-white/5 rounded w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-neutral-900 border border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="w-10 h-10 bg-white/5 rounded-xl mb-4" />
              <div className="h-3 bg-white/5 rounded w-20 mb-2" />
              <div className="h-7 bg-white/5 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Products", value: stats.products, icon: Package, href: "/admin/products" },
    { label: "Categories", value: stats.categories, icon: Tags, href: "/admin/categories" },
    { label: "Yupoo Stores", value: stats.yupooStores, icon: Store, href: "/admin/yupoo-stores" },
    { label: "Users", value: stats.users, icon: Users, href: "/admin/users" },
    { label: "QC Groups", value: stats.qcGroups, icon: ImageIcon, href: "/admin/qc-images" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
          <p className="text-text-secondary text-sm">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-neutral-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-neutral-400 group-hover:text-white transition-colors">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-white/[0.05] text-neutral-400 group-hover:text-white transition-colors">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Add Product</span>
                <p className="text-[11px] text-neutral-500">Create a new product listing</p>
              </div>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-white/[0.05] text-neutral-400 group-hover:text-white transition-colors">
                <Tags className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Manage Categories</span>
                <p className="text-[11px] text-neutral-500">Edit or add categories</p>
              </div>
            </Link>
            <Link
              href="/admin/qc-images"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-white/[0.05] text-neutral-400 group-hover:text-white transition-colors">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">QC Images</span>
                <p className="text-[11px] text-neutral-500">Upload quality check photos</p>
              </div>
            </Link>
            <Link
              href="/admin/yupoo-stores"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-white/[0.05] text-neutral-400 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Yupoo Stores</span>
                <p className="text-[11px] text-neutral-500">Manage verified sellers</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Recent Products</h2>
            <Link href="/admin/products" className="text-xs text-neutral-500 hover:text-white transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-1">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-white/5 overflow-hidden flex-shrink-0 relative">
                  {product.image && (
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white group-hover:text-neutral-200 transition-colors block truncate">{product.name}</span>
                  <span className="text-xs text-neutral-500">{product.price}</span>
                </div>
                {product.is_featured && (
                  <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full">Featured</span>
                )}
              <span className="text-[11px] text-neutral-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(product.created_at).toLocaleDateString()}
              </span>
              <span className="text-[11px] text-neutral-600 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                <ImageIcon className="w-3 h-3" />
                {product.qc_groups?.[0]?.count || 0}
              </span>
            </Link>
            ))}
            {recentProducts.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-sm">No products yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
