import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  eslint: { ignoreDuringBuilds: true }, // This will ignore ESLint errors during the build process

  typescript: { ignoreBuildErrors: true }, // This will ignore Typescript errors during the build process
};

export default nextConfig;
