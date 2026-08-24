import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Required: GitHub Pages lacks built-in Image Optimization
  },
};

export default nextConfig;
