import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "TeqBook";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  images: {
    // GitHub Pages does not support the default image optimizer
    unoptimized: true,
  },
  // Serve app under /TeqBook when deployed on GitHub Pages
  basePath: isGitHubPages ? `/${repoName}` : undefined,
  assetPrefix: isGitHubPages ? `/${repoName}/` : undefined,
};

export default nextConfig;
