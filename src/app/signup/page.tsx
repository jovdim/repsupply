"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-down">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/repsupply.png" alt="RepSupply" width={48} height={48} className="animate-float" />
              <span className="text-3xl font-bold font-[var(--font-poetsen-one)] gradient-text">REPSUPPLY</span>
            </Link>
          </div>
          <div className="bg-bg-card border border-white/5 backdrop-blur-md rounded-3xl p-8 animate-scale-in text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-text-secondary text-sm mb-8">
              We&apos;ve sent a confirmation link to<br />
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-text-muted text-xs mb-6">
              Click the link in your email to verify your account, then come back here to sign in.
            </p>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-white/90 border-none font-bold">
                Go to Login <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Sign Up Card */}
        <div className="bg-bg-card border border-white/5 backdrop-blur-md rounded-3xl p-8 animate-scale-in">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Create Account
          </h1>
          <p className="text-text-secondary text-center mb-8 text-sm">
            Save finds and track your history.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-text-muted text-sm"
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-1.5 pt-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-[10px] md:text-xs">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? "bg-success" : "bg-white/5"}`}
                  >
                    {req.met && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span
                    className={req.met ? "text-success" : "text-text-muted"}
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 text-xs text-text-muted mt-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  agreedToTerms ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                {agreedToTerms && <Check className="w-3 h-3" />}
              </Button>
              <span className="text-sm text-text-muted">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-bg-secondary hover:text-accent-light"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-bg-secondary hover:text-accent-light"
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              size="lg"
              className="w-full bg-white text-black hover:bg-white/90 border-none transition-all active:scale-[0.98] font-bold"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-text-muted mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-bg-secondary hover:text-accent-light font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
