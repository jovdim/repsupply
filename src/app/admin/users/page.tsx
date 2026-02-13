"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAdminProfiles, invalidateProfileCache, type ProfileFromDB as Profile } from "@/lib/supabase/profiles";
import { invalidateAdminCache } from "@/lib/supabase/admin";
import { Search, Calendar, Heart, Trash2, X, ChevronLeft, ChevronRight, Loader2, User as UserIcon, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const supabase = createClient();

  async function fetchUsers() {
    setLoading(true);
    const data = await getAdminProfiles();
    setProfiles(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      invalidateProfileCache();
      invalidateAdminCache();
      setProfiles(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    }
  }

  const filteredProfiles = profiles.filter((profile) =>
    (profile.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    profile.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Users</h1>
          <p className="text-neutral-400 text-sm">
            {profiles.length} registered users · Manage user access
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-600 focus:ring-0 shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">
            <Loader2 className="inline-block w-6 h-6 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading users...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <p className="text-sm font-medium">
              {search ? "No users match your search." : "No users yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-neutral-400 uppercase text-[10px] font-bold tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-white/[0.02] transition-colors group/row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/5 flex items-center justify-center text-neutral-400 overflow-hidden relative">
                           {profile.avatar_url ? (
                               <Image src={profile.avatar_url} alt={profile.full_name || "User"} fill className="object-cover" />
                           ) : (
                               <UserIcon className="w-5 h-5" />
                           )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {profile.full_name || "Anonymous User"}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            {profile.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-neutral-300">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                            <Heart className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-xs font-bold">{profile.favorites_count || 0}</span>
                            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide ml-0.5">Saved</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        {deleteId === profile.id ? (
                            <div className="flex items-center justify-end gap-2 animate-in slide-in-from-right-5 fade-in duration-200">
                                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider mr-1">Confirm?</span>
                                <button
                                    onClick={() => handleDelete(profile.id)}
                                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="p-2 bg-neutral-800 border border-white/5 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setDeleteId(profile.id)}
                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                                title="Delete user"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <span className="text-xs text-neutral-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredProfiles.length)} of {filteredProfiles.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-white text-black"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
