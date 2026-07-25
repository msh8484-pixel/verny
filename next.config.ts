import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
  async rewrites() {
    // /order → 정적 주문서(public/vorder/index.html). URL은 /order 로 유지.
    return [{ source: "/order", destination: "/vorder/index.html" }];
  },
};

export default nextConfig;
