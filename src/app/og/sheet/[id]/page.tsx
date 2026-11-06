import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Wordmark } from "@/brand"
import { SESSIONS, sessionById } from "@/data/course"

// Source for public/og/sheet-<id>.png (scripts/make-og.ts). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Sheet card", robots: { index: false, follow: false } }
export const dynamicParams = false
export function generateStaticParams() {
  return SESSIONS.map((s) => ({ id: s.id }))
}

export default async function SheetCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = sessionById(id)
  if (!s) notFound()
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="flex h-[630px] w-[1200px] flex-col justify-between p-16">
        <div className="flex items-center justify-between">
          <Wordmark className="h-[30px]" />
          <span className="text-[22px] text-muted-foreground">
            Lesson {s.n} of 12 · {s.part}
          </span>
        </div>
        <div className="grid gap-7 rounded-[40px] bg-card p-12">
          <h1 className="text-[80px] leading-[1.02]">{s.title}</h1>
          <p className="max-w-[44ch] text-[30px] leading-[1.3] text-muted-foreground">{s.idea}</p>
        </div>
      </div>
    </div>
  )
}
