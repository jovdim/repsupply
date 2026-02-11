"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  Link as LinkIcon,
  Store,
  Blocks,
  LogIn,
  User,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar = () => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const pathname = usePathname();
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsRef.current &&
        !toolsRef.current.contains(event.target as Node)
      ) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    setIsToolsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsToolsOpen(false);
  };

  const navigation = [
    {
      name: "Products",
      href: "/products",
      icon: ShoppingBag,
      current: pathname === "/products",
    },
    {
      name: "Yupoo Store",
      href: "/yupoo",
      icon: Store,
      current: pathname === "/yupoo",
    },
    {
      name: "Link Converter",
      href: "/converter",
      icon: LinkIcon,
      current: pathname === "/converter",
    },
  ];

  const toolsDropdown = [
    {
      name: "Warning Remover",
      href: "https://chromewebstore.google.com/detail/njificdghacbdmdlpajkbojnhjfapplf",
      icon: Blocks,
    },
  ];

  return (
    <nav className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md text-base animate-fade-in-down bg-bg-primary/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-110">
              <Image
                src="/repsupply.png"
                alt="RepSupply Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-lg font-bold text-text-primary hidden sm:block font-[var(--font-poetsen-one)] gradient-text">
              REPSUPPLY
            </span>
            <span className="text-lg font-bold text-text-primary sm:hidden font-[var(--font-poetsen-one)] gradient-text">
              RS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                    item.current
                      ? "text-white bg-white/10 shadow-lg"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <Button
                variant="ghost"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex items-center px-4 py-2 text-text-secondary hover:text-text-primary"
              >
                <span>More Tools</span>
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${
                    isToolsOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {isToolsOpen && (
                <div
                  className="absolute left-0 top-full w-56 rounded-2xl glass border border-white/10 shadow-2xl z-50 animate-fade-in-down"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="p-2">
                    {toolsDropdown.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsToolsOpen(false)}
                          className="flex items-center px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary transition-all hover:bg-white/5"
                        >
                          <Icon className="w-4 h-4 mr-3 text-bg-secondary" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center">
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 border ${
                pathname === "/profile"
                  ? "text-white bg-white/10 shadow-lg border-white/20"
                  : "text-text-primary hover:text-text-secondary hover:bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
