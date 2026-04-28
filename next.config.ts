import type { NextConfig } from "next";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/tiktak/:path*",
        destination: `${apiBaseUrl}/api/tiktak/:path*`,
      },
    ];
  },
};

export default nextConfig;
