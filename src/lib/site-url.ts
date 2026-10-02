import { BRAND } from "@/brand"

/** The site's public address: Vercel's production URL when it builds, otherwise the brand's canonical one. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : BRAND.url)
