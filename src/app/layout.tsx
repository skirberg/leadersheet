import type { Metadata, Viewport } from "next"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { Funnel_Display, Instrument_Sans, Martian_Mono, Noticia_Text } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { ProgressProvider } from "@/lib/store"
import { CommandMenuProvider } from "@/components/site/command-menu"
import { SiteFooter, SiteHeader } from "@/components/site/header"
import { GridOverlay } from "@/components/site/grid-overlay"
import { BRAND } from "@/brand"
import { MotionProvider } from "@/components/motion/motion-provider"
import { PageTransition } from "@/components/motion/page-transition"
import { ThemeColor } from "@/components/site/theme-color"

// Funnel Display and Funnel Sans (NORD ID and Kristian Möller, SIL Open Font License):
// the wordmark is drawn from Funnel Display, so the headlines are too.
const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  display: "swap",
})
// Brilliant sets headlines in CoFo Robert, a Clarendon-style slab serif, and text in CoFo Sans (both paid).
// The closest open matches, compared side by side: Noticia Text (JM Solé) and Instrument Sans
// (Rodrigo Fuenzalida and Jordan Egstad), both SIL Open Font License.
const serif = Noticia_Text({
  variable: "--font-noticia",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
})
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
})
const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
})

import { SITE_URL } from "@/lib/site-url"
import { Analytics } from "@vercel/analytics/next"

/**
 * Browsers keep a tab icon for a long time, so the icon addresses carry a version: the hash of the icon files themselves,
 * read at build time. A new drawing (scripts/make-icons.ts) gets a new address with nobody remembering to bump it.
 */
const ICONS_V = createHash("sha256")
  .update(["public/favicon.ico", "public/icon.svg", "public/apple-touch-icon.png"].map((f) => readFileSync(f)).reduce((a, b) => Buffer.concat([a, b])))
  .digest("hex")
  .slice(0, 10)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND.title,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  // Files from scripts/make-icons.ts, all drawn from src/brand/presets/<preset>/favicon.svg and app-icon.svg.
  // The .ico is for Safari, bookmarks, search results and link previews; browsers that read SVG take icon.svg.
  // ICONS_V changes the address whenever the drawing does, so a returning visitor gets the new one.
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICONS_V}`, sizes: "32x32" },
      { url: `/icon.svg?v=${ICONS_V}`, type: "image/svg+xml" },
    ],
    apple: [{ url: `/apple-touch-icon.png?v=${ICONS_V}`, sizes: "180x180" }],
  },
  alternates: { canonical: "./" },
  openGraph: {
    url: "./",
    siteName: BRAND.name,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  appleWebApp: { title: BRAND.shortName, statusBarStyle: "default" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: BRAND.themeColor.dark },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${funnelDisplay.variable} ${serif.variable} ${instrument.variable} ${martian.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {/* Focus rings are for keyboard users: a tap or click marks the page as pointer-driven until a key moves focus. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "addEventListener('pointerdown',function(){document.documentElement.dataset.pointer=''},true);addEventListener('keydown',function(e){if(e.key==='Tab'||e.key.indexOf('Arrow')===0)delete document.documentElement.dataset.pointer},true)",
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ThemeColor />
          <MotionProvider>
            <ProgressProvider>
              <CommandMenuProvider>
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
                >
                  Skip to content
                </a>
                <SiteHeader />
                <main id="main" className="flex-1">
                  <PageTransition>{children}</PageTransition>
                </main>
                <SiteFooter />
                <GridOverlay />
              </CommandMenuProvider>
            </ProgressProvider>
          </MotionProvider>
        </ThemeProvider>
        {/* Vercel Web Analytics: anonymous page views and a few custom events, no cookies. */}
        <Analytics />
      </body>
    </html>
  )
}
