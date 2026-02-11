"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Integrate with Supabase
    // const { error } = await supabase.auth.resetPasswordForEmail(email);

    console.log("Reset password for:", email);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
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
        <div className="glass rounded-3xl p-8 animate-scale-in">
          {!isSent ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center text-text-muted hover:text-text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>

              <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
                Forgot Password?
              </h1>
              <p className="text-text-muted text-center mb-8">
                Enter your email and we&apos;ll send you instructions to reset
                your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">
                    Email Address
                  </label>
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Instructions
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Check your email
              </h2>
              <p className="text-text-muted mb-8">
                We&apos;ve sent password reset instructions to <br />
                <span className="text-text-primary font-medium">{email}</span>
              </p>
              <Button onClick={() => setIsSent(false)} variant="ghost">
                Try different email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
