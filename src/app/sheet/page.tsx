import type { Metadata } from "next"
import { SheetClient } from "./sheet-client"

export const metadata: Metadata = { title: "Frameworks", description: "Every leadership framework on one page." }

export default function SheetPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <h1 className="sr-only">Every framework, one page</h1>
      <SheetClient />
    </div>
  )
}
