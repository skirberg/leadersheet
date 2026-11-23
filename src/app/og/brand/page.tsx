import type { Metadata } from "next"
import { BRAND, LogoMark, Wordmark } from "@/brand"

// Source of the brand kit's logo files (scripts/make-brand-kit.ts reads this page's HTML from the build). It renders the
// active preset's own LogoMark and Wordmark, so the kit is drawn from logo.tsx and never retraced. Not linked, not indexed.
export const metadata: Metadata = { title: "Logo source", robots: { index: false, follow: false } }

export default function BrandSource() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center gap-8 bg-background p-10">
      <div data-art="mark" className="size-40">
        <LogoMark className="size-40" title={BRAND.name} />
      </div>
      <div data-art="wordmark">
        <Wordmark className="h-10" />
      </div>
    </div>
  )
}
