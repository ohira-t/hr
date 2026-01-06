import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // 静的エクスポート時のみ有効化（開発中は無効）
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
