import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Martian_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProgressProvider } from "@/lib/store"
import { CommandMenuProvider } from "@/components/site/command-menu"
import { SiteFooter, SiteHeader } from "@/components/site/header"
import { currentSession } from "@/data/course"
import { BRAND } from "@/brand"
import { MotionProvider } from "@/components/motion/motion-provider"

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
})
const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
})

import { SITE_URL } from "@/lib/site-url"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND.title,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    title: BRAND.name,
    description: BRAND.description,
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: BRAND.themeColor.dark },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The build date picks a starting session; the browser's date replaces it after load.
  const buildCurrent = currentSession()
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${martian.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MotionProvider>
          <TooltipProvider delayDuration={200}>
            <ProgressProvider buildCurrent={buildCurrent}>
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
          </TooltipProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
