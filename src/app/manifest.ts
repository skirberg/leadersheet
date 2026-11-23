import type { MetadataRoute } from "next"
import { BRAND } from "@/brand"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: BRAND.description,
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en",
    categories: ["education", "business"],
    display: "standalone",
    background_color: BRAND.themeColor.light,
    theme_color: BRAND.themeColor.light,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Long-press the installed app's icon: the four places people go back to, each with its navigation glyph (npm run icons).
    shortcuts: [
      { name: "Today's call", short_name: "Today", description: "One leadership decision a day", url: "/today/", icons: [{ src: "/icons/shortcut-today.png", sizes: "96x96", type: "image/png" }] },
      { name: "Lessons", url: "/learn/", icons: [{ src: "/icons/shortcut-learn.png", sizes: "96x96", type: "image/png" }] },
      { name: "Play", description: "Quizzes, games and self-checks", url: "/play/", icons: [{ src: "/icons/shortcut-play.png", sizes: "96x96", type: "image/png" }] },
      { name: "Practice", description: "Review what you missed", url: "/practice/", icons: [{ src: "/icons/shortcut-practice.png", sizes: "96x96", type: "image/png" }] },
    ],
    // What the install sheet shows (npm run shots draws them from the built site).
    screenshots: [
      { src: "/screenshots/wide.webp", sizes: "1440x900", type: "image/webp", form_factor: "wide", label: "Learn leadership by doing: the home page" },
      { src: "/screenshots/narrow.webp", sizes: "780x1688", type: "image/webp", form_factor: "narrow", label: "Today's call on a phone" },
    ],
  }
}
