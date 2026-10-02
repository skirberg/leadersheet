import type { Metadata } from "next"
import { BRAND, LogoMark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"

// Source for public/og.png (scripts/make-og.mjs). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Share card", robots: { index: false, follow: false } }

export default function OgCard() {
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="drafting-grid absolute inset-0" />
      <div className="relative flex h-[630px] w-[1200px] flex-col justify-between p-16">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-4">
            <LogoMark className="size-14" />
            <span className="text-[34px] font-bold tracking-[-0.03em]">{BRAND.name}</span>
          </span>
          <span className="label-mono !text-base">Twelve big ideas · one sheet each</span>
        </div>
        <h1 className="max-w-[15ch] text-[100px] leading-[0.95] font-semibold tracking-[-0.04em] [font-stretch:92%]">
          Leadership, built so you can <Emphasis delay={0}>move it.</Emphasis>
        </h1>
        <p className="label-mono !text-base">Idea · model · frameworks · games · three question check</p>
      </div>
    </div>
  )
}
