import type { NextConfig } from "next"

// Static export: `npm run build` writes a plain folder (out/) of HTML that Vercel serves from the edge.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // React Compiler memoizes components and hooks at build time, so state changes (progress, mode,
  // lab sliders) re-render only what reads them.
  reactCompiler: true,
}

export default nextConfig
