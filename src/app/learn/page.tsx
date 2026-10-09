import type { Metadata } from "next"
import { CheckCount, SheetGrid } from "@/components/learn/sheets"
import { sheetSummaries } from "@/data/course"

export const metadata: Metadata = { title: "The set", description: "Twelve big leadership ideas as interactive sheets." }

export default function LearnIndex() {
  const sheets = sheetSummaries()
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-foreground pb-4">
        <div className="grid gap-2">
          <p className="label-mono">The set</p>
          <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">Twelve sheets</h1>
        </div>
        <CheckCount sheets={sheets} />
      </div>
      <SheetGrid sheets={sheets} />
    </div>
  )
}
