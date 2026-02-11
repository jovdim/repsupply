"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setIsLoading(true);

    // TODO: Integrate with Supabase
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: {
    //     data: { name }
    //   }
    // });

    console.log("Sign up attempt:", { name, email, password });
    setTimeout(() => setIsLoading(false), 1000);
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

        {/* Sign Up Card */}
        <div className="glass rounded-3xl p-8 animate-scale-in">
          <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
            Create Account
          </h1>
          <p className="text-text-muted text-center mb-8">
            Join the community today
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-bg-card/50 border border-white/10 text-text-primary rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-bg-secondary transition-colors placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-bg-card/50 border border-white/10 text-text-primary rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-bg-secondary transition-colors placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-bg-card/50 border border-white/10 text-text-primary rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-bg-secondary transition-colors placeholder:text-text-muted"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Password Requirements */}
              <div className="space-y-1 pt-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-success" : "bg-white/10"}`}
                    >
                      {req.met && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className={req.met ? "text-success" : "text-text-muted"}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
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
              className="w-full"
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-text-muted text-sm">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Sign Up */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="lg" className="w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

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
