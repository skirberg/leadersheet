import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  // Only the pages that draw the share cards stay out. The cards themselves (/og/*.png) must stay open:
  // X and LinkedIn fetch a link's preview image under robots.txt, and a blocked image means a bare link.
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/og/sheet/", "/og/framework/", "/og/result/", "/og/brand/", "/og/card/"] }], sitemap: `${SITE_URL}/sitemap.xml` }
}
