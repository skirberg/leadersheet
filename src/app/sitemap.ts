import type { MetadataRoute } from "next"
import { FRAMEWORKS, SESSIONS } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { GAMES } from "@/data/games"
import { allResults, resultPath } from "@/data/results"
import { SITE_URL } from "@/lib/site-url"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/learn/",
    "/frameworks/",
    "/play/",
    "/today/",
    "/today/class/",
    "/practice/",
    "/sheet/",
    "/built/",
    "/brand/",
    ...SESSIONS.map((s) => lessonHref(s)),
    ...FRAMEWORKS.map((f) => `/frameworks/${f.id}/`),
    ...GAMES.map((g) => `/play/${g.id}/`),
    ...allResults().map((r) => resultPath(r.game, r.key)),
  ]
  return paths.map((p) => ({ url: SITE_URL + p, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.7 }))
}
