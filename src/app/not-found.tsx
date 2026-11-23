import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/brand"

export const metadata: Metadata = {
  title: "No lesson here",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: { siteName: BRAND.name, images: [{ url: "/og.png", width: 1200, height: 630 }] },
}

export default function NotFound() {
  return (
    <div className="page">
      <div className="span-head grid gap-5">
        <p className="label-mono">404</p>
        <h1 className="text-5xl leading-none">No lesson at this address. There are twenty-four.</h1>
        <div>
          <Button asChild size="lg">
            <Link href="/learn/">See all twenty-four</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
