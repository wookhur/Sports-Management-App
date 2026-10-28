/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The official bitácora export reads the school's workbook from disk.
  outputFileTracingIncludes: {
    "/api/teams/[id]/export": ["./src/data/bitacora/**"],
  },
};

export default nextConfig;
