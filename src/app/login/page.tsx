"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
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

        {/* Login Card */}
        <div className="bg-bg-card border border-white/5 backdrop-blur-md rounded-3xl p-8 animate-scale-in">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
