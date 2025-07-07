import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed to enable SSR/ISR and dynamic routes
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
