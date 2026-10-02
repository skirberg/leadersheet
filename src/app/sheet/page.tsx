import type { Metadata } from "next"
import { SheetClient } from "./sheet-client"

export const metadata: Metadata = { title: "Frameworks", description: "Every leadership framework on one page." }

export default function SheetPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid gap-2 border-b border-foreground pb-4">
        <p className="label-mono">Frameworks</p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">Every framework, one page</h1>
      </div>
      <SheetClient />
    </div>
  )
}
