import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔧 ESLINT & TypeScript (Temporarily ignore during development)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ⚛️ EXPERIMENTAL FEATURES (React 19 + Next.js 15)
  experimental: {
    // 🚀 React Compiler (React 19)
    reactCompiler: true,

    // 🎯 Server Actions (Next.js 15)
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // 🚀 TURBOPACK (Next.js 15 - Stable)
  turbopack: {
    // 🎯 Module resolution - Prevent chunk loading issues
    resolveAlias: {
      // Ensure consistent module resolution
      "@/shared/ui/layouts/AdminLayout":
        "./src/shared/ui/layouts/AdminLayout.tsx",
    },

    // 📦 Custom loaders
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // 📊 COMPILER OPTIMIZATIONS
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 🌅 IMAGE OPTIMIZATION
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "clistenesbucket.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // 📱 SECURITY HEADERS
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
        // 🔧 Development: Prevent aggressive caching
        ...(process.env.NODE_ENV === "development"
          ? [
              {
                key: "Cache-Control",
                value: "no-store, must-revalidate",
              },
            ]
          : []),
      ],
    },
  ],
};

export default nextConfig;
