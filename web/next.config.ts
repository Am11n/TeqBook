import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isDev = process.env.NODE_ENV === "development";
const repoName = "TeqBook";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages (only in production/build)
  // In dev mode, we don't use static export to allow dynamic routes
  ...(isDev ? {} : { output: "export" }),
  images: {
    // GitHub Pages does not support the default image optimizer
    unoptimized: true,
  },
  // Serve app under /TeqBook when deployed on GitHub Pages
  basePath: isGitHubPages ? `/${repoName}` : undefined,
  assetPrefix: isGitHubPages ? `/${repoName}/` : undefined,
};

export default nextConfig;
