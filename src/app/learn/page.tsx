import type { Metadata } from "next"
import { CheckCount, SheetGrid } from "@/components/learn/sheets"

export const metadata: Metadata = { title: "The set", description: "Twelve big leadership ideas as interactive sheets." }

export default function LearnIndex() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-foreground pb-4">
        <div className="grid gap-2">
          <p className="label-mono">The set</p>
          <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">Twelve sheets</h1>
          <p className="max-w-[56ch] text-lg text-muted-foreground">Twelve big ideas, one sheet each. Pass a sheet’s three question check to sign it off.</p>
        </div>
        <CheckCount />
      </div>
      <SheetGrid />
    </div>
  )
}
