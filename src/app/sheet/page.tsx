import type { Metadata } from "next"
import { SheetClient } from "./sheet-client"

export const metadata: Metadata = { title: "Frameworks", description: "Every leadership framework on one page." }

export default function SheetPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid justify-items-center gap-3 pb-2 text-center">
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">Every framework, one page</h1>
      </div>
      <SheetClient />
    </div>
  )
}
