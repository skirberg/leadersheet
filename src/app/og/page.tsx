import type { Metadata } from "next"
import { Wordmark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"

// Source for public/og.png (scripts/make-og.ts). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Share card", robots: { index: false, follow: false } }

export default function OgCard() {
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="flex h-[630px] w-[1200px] flex-col items-center justify-center gap-9 p-16 text-center">
        <Wordmark className="h-[34px]" />
        <h1 className="max-w-[14ch] text-[104px] leading-[1.02]">
          Learn <Emphasis>leadership</Emphasis> by doing
        </h1>
        <p className="max-w-[40ch] text-[28px] leading-snug text-muted-foreground">
          Twelve short, hands-on lessons on how leaders build teams, shape culture and drive change.
        </p>
      </div>
    </div>
  )
}
