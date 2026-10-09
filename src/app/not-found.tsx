import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/brand"

export const metadata: Metadata = {
  title: "No sheet here",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: { siteName: BRAND.name, images: [{ url: "/og.png", width: 1200, height: 630 }] },
}

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-[720px] gap-5 px-4 pt-20 sm:px-6">
      <p className="label-mono">Sheet not found · 404</p>
      <h1 className="text-5xl leading-none font-semibold tracking-[-0.03em]">No sheet at this address. The set has twelve.</h1>
      <div>
        <Button asChild size="lg">
          <Link href="/learn/">See all twelve</Link>
        </Button>
      </div>
    </div>
  )
}
