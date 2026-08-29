import type { NextConfig } from "next";

/**
 * GitHub Pages serves a project site from `https://<user>.github.io/<repo>/`,
 * so every route and asset URL has to carry that prefix or it 404s. The deploy
 * workflow passes it in from `actions/configure-pages`; `next dev` and the
 * Docker build leave it unset, so local URLs stay at "/".
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true, // Required: GitHub Pages lacks built-in Image Optimization
  },
};

export default nextConfig;
