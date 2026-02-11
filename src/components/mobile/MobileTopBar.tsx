"use client";

import Link from "next/link";
import Image from "next/image";

export const MobileTopBar = () => {
  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-center h-14 px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 flex items-center justify-center">
            <Image
              src="/repsupply.png"
              alt="RepSupply Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="text-lg font-bold text-text-primary font-[var(--font-poetsen-one)] gradient-text">
            REPSUPPLY
          </span>
        </Link>
      </div>
    </nav>
  );
};
