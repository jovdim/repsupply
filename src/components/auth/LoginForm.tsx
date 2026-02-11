"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  hideTitle?: boolean;
}

export function LoginForm({ onSuccess, redirectTo = "/", hideTitle = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="w-full">
      {!hideTitle && (
        <>
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-text-secondary text-center mb-8 text-sm">
            Sync your favorites and history.
          </p>
        </>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-11 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-text-muted hover:text-white transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full bg-white text-black hover:bg-white/90 border-none transition-all active:scale-[0.98] font-bold"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-text-muted mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-bg-secondary hover:text-accent-light font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
