"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { Mail, Shield, Calendar } from "lucide-react";

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-8 w-32 bg-white/10 rounded" />;
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-text-secondary">Manage your admin account settings.</p>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl font-bold text-indigo-400">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {user.user_metadata?.full_name || "Admin User"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full w-fit">
              <Shield className="w-3 h-3" />
              Administrator
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <label className="text-xs font-medium text-text-secondary mb-1 block">Email Address</label>
            <div className="flex items-center gap-2 text-white/90">
              <Mail className="w-4 h-4 text-text-muted" />
              {user.email}
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <label className="text-xs font-medium text-text-secondary mb-1 block">Member Since</label>
            <div className="flex items-center gap-2 text-white/90">
              <Calendar className="w-4 h-4 text-text-muted" />
              {new Date(user.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          
           <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <h3 className="text-sm font-bold text-yellow-400 mb-1">Security Note</h3>
            <p className="text-xs text-yellow-400/80">
               To change your password or update profile details, please use the main site&apos;s Profile page. 
               This admin view is read-only for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
