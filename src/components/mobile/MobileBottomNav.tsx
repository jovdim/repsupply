"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Store, Link as LinkIcon, User } from "lucide-react";

export const MobileBottomNav = () => {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "Products",
      href: "/products",
      icon: ShoppingBag,
      current: pathname === "/products",
    },
    {
      name: "Yupoo",
      href: "/yupoo",
      icon: Store,
      current: pathname === "/yupoo",
    },
    {
      name: "Converter",
      href: "/converter",
      icon: LinkIcon,
      current: pathname === "/converter",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: pathname === "/profile",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                item.current
                  ? "text-white bg-white/10 shadow-lg"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
