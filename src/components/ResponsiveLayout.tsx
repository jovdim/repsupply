"use client";

import { Navbar } from "@/components/desktop/Navbar";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { Footer } from "@/components/Footer";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Main Content with padding for mobile nav and top bar */}
      <main className="pt-14 pb-20 lg:pt-0 lg:pb-0">{children}</main>
      <Footer />
    </>
  );
};
