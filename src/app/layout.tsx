import type { Metadata, Viewport } from "next"
import { Funnel_Display, Instrument_Sans, Martian_Mono, Noticia_Text } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { ProgressProvider } from "@/lib/store"
import { CommandMenuProvider } from "@/components/site/command-menu"
import { SiteFooter, SiteHeader } from "@/components/site/header"
import { SCHEDULE, currentSession } from "@/data/course"
import { BRAND } from "@/brand"
import { MotionProvider } from "@/components/motion/motion-provider"
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND.title,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  // Files from scripts/make-icons.mjs. The .ico is for Safari, bookmarks, search results and link
  // previews; browsers that read SVG take icon.svg, which follows light and dark mode.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
  // The build date picks a starting session; the browser's date replaces it after load.
  const { id, n, date } = currentSession()
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ThemeColor />
          <MotionProvider>
            <ProgressProvider schedule={SCHEDULE} buildCurrent={{ id, n, date }}>
              <CommandMenuProvider>
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
                >
                  Skip to content
                </a>
                <SiteHeader />
                <main id="main" className="flex-1">
                  {children}
                </main>
                <SiteFooter />
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
