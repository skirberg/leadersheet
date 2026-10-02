import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Martian_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProgressProvider } from "@/lib/store"
import { CommandMenuProvider } from "@/components/site/command-menu"
import { SiteFooter, SiteHeader } from "@/components/site/header"
import { currentSession } from "@/data/course"

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

// Absolute base for share images. Vercel sets the production URL during its build.
const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)

export const metadata: Metadata = {
  metadataBase: site ? new URL(site) : undefined,
  title: {
    default: "Leadership Sandbox · Every LiO idea, built to play with",
    template: "%s · Leadership Sandbox",
  },
  description:
    "Twelve sessions of Leadership in Organizations as interactive sheets: the idea, a model you can move, the frameworks and a three-question check.",
  openGraph: {
    title: "Leadership Sandbox",
    description: "Every Leadership in Organizations idea, built to play with.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f5ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1423" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The build date picks a starting session; the browser's date replaces it after load.
  const buildCurrent = currentSession()
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${martian.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
