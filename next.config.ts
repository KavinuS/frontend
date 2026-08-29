import type { NextConfig } from "next";

/**
 * Deliberately left at the defaults — this app is server-rendered.
 *
 * `output: "export"` was tried here for GitHub Pages and removed: a static
 * export has no runtime, so it cannot run the Server Actions in app/actions/,
 * the OAuth callback in app/auth/callback/route.ts, or the httpOnly session
 * cookie in app/lib/session.ts. Next fails the build outright on the first of
 * those. The deploy target is a Node host instead — Vercel via
 * .github/workflows/deploy.yml, or `next start` in the Dockerfile under
 * docker compose.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
