import type { Metadata } from "next";
import { Poetsen_One } from "next/font/google";
import "./globals.css";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { ScrollToTop } from "@/components/ScrollToTop";

const poetsenOne = Poetsen_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poetsen-one",
});

export const metadata: Metadata = {
  title: "RepSupply - Reps Refined, Quality Finds",
  description: "Your trusted source for quality replica products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poetsenOne.variable} antialiased`}>
        {/* Grid Background */}
        <div className="grid-background" />
        <ResponsiveLayout>{children}</ResponsiveLayout>
        <ScrollToTop />
      </body>
    </html>
  );
}
