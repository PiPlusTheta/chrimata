import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/dashboard/queue", permanent: true },
      { source: "/dashboard/workspace", destination: "/dashboard/diligence", permanent: true },
      { source: "/dashboard/ingest", destination: "/dashboard/evidence", permanent: true },
    ];
  },
};

export default nextConfig;
