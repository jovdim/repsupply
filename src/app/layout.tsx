import type { Metadata } from "next";
import { Poetsen_One } from "next/font/google";
import "./globals.css";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/components/AuthProvider";

const poetsenOne = Poetsen_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poetsen-one",
});

export const metadata: Metadata = {
  title: "RepSupply - Reps Refined, Quality Finds",
  description: "Source for quality reps products",
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
        <AuthProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
