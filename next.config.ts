import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats — AVIF is ~50% smaller than JPEG, WebP ~30% smaller
    formats: ["image/avif", "image/webp"],

    // Cache optimized images for 24 hours (default is 60s)
    minimumCacheTTL: 86400,

    // Precise breakpoints matching the actual layouts used
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "kqtgsaxmkvfceejorcwe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
