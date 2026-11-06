import type { Metadata } from "next"
import { CheckCount, SheetGrid } from "@/components/learn/sheets"
import { sheetSummaries } from "@/data/course"

export const metadata: Metadata = { title: "Twelve lessons", description: "Twelve short, hands-on lessons in leadership." }

export default function LearnIndex() {
  const sheets = sheetSummaries()
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid justify-items-center gap-3 pb-2 text-center">
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">Twelve lessons</h1>
        <CheckCount sheets={sheets} />
      </div>
      <SheetGrid sheets={sheets} />
    </div>
  )
}
