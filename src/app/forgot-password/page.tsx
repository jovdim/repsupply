"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/repsupply.png"
              alt="RepSupply"
              width={48}
              height={48}
              className="animate-float"
            />
            <span className="text-3xl font-bold font-[var(--font-poetsen-one)] gradient-text">
              REPSUPPLY
            </span>
          </Link>
        </div>

        {/* Reset Card */}
        <div className="bg-bg-card border border-white/5 backdrop-blur-md rounded-3xl p-8 animate-scale-in">
          {!isSent ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center text-xs text-text-muted hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                Back to Login
              </Link>

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Forgot Password?
              </h1>
              <p className="text-text-secondary text-center mb-8 text-sm">
                Enter your email to reset.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    Email Address
                  </label>
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
                      Reset Password
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Check your email
              </h2>
              <p className="text-text-secondary text-sm mb-8">
                We&apos;ve sent password reset instructions to <br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <Button onClick={() => setIsSent(false)} variant="ghost" className="text-text-muted hover:text-white">
                Try different email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
