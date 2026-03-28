import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'to.barlorong13.novitee.org',
      },
    ],
  },
};

export default nextConfig;
