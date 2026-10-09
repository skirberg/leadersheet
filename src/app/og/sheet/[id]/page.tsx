import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BRAND, LogoMark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"
import { TitleBlock } from "@/components/brand/title-block"
import { SESSIONS, sessionById, sheetNo } from "@/data/course"

// Source for public/og/sheet-<id>.png (scripts/make-og.mjs). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Sheet card", robots: { index: false, follow: false } }
export const dynamicParams = false
export function generateStaticParams() {
  return SESSIONS.map((s) => ({ id: s.id }))
}

export default async function SheetCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = sessionById(id)
  if (!s) notFound()
  const words = s.idea.split(" ")
  const head = words.slice(0, -3).join(" "),
    tail = words.slice(-3).join(" ")
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="drafting-grid absolute inset-0" />
      <div className="relative flex h-[630px] w-[1200px] flex-col justify-between p-14">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <span className="text-[28px] font-bold tracking-[-0.03em]">{BRAND.name}</span>
          </span>
          <TitleBlock
            className="w-[460px] bg-card [&_dd]:!text-[17px] [&_dt]:!text-[12px]"
            cells={[
              { k: "Sheet", v: `${sheetNo(s.n)} of 12` },
              { k: "Part", v: s.part },
            ]}
          />
        </div>
        <div className="grid gap-6">
          <h1 className="max-w-[18ch] text-[84px] leading-[0.96] font-semibold tracking-[-0.035em] [font-stretch:92%]">{s.title}</h1>
          <p className="max-w-[40ch] text-[32px] leading-[1.22] font-medium tracking-[-0.01em]">
            {head} <Emphasis delay={0}>{tail}</Emphasis>
          </p>
        </div>
        <p className="label-mono !text-[15px]">Idea · model · frameworks · three question check</p>
      </div>
    </div>
  )
}
