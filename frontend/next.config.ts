import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // iconsax-react v0.0.8 sets icon defaults via the legacy
      // `Icon.defaultProps = {...}`, which React 19 no longer honors for
      // function components — every icon rendered with no explicit `color`
      // prop got an undefined stroke/fill and was invisible. This routes
      // every `import ... from "iconsax-react"` in the app through a shim
      // that restores those defaults, with zero changes needed per file.
      // See src/lib/iconsax-shim.tsx. Turbopack wants these as project-root-
      // relative strings, not OS-absolute paths.
      "iconsax-react": "./src/lib/iconsax-shim.tsx",
      "iconsax-react-original": "./node_modules/iconsax-react",
    },
  },
  async redirects() {
    return [
      { source: "/dashboard/workspace", destination: "/dashboard/northstar/diligence", permanent: true },
      { source: "/dashboard/ingest", destination: "/dashboard/northstar/evidence", permanent: true },
    ];
  },
};

export default nextConfig;
