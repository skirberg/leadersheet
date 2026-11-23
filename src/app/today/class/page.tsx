import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClassMode } from "@/components/play/class-mode"
import { shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Today's call, with a room",
  description:
    "Run one leadership decision with a class or team on a projector: everyone votes alone, talks to someone who chose differently, votes again, then sees the reveal. No accounts, nothing stored.",
  alternates: { canonical: "/today/class/" },
  ...shareCard("/og/today-class.png"),
}

export default function ClassPage() {
  return (
    // The room's screen uses every column: it is read from the back of a room (DESIGN.md, Grid).
    <div className="page">
      <div className="span-wide grid grid-cols-subgrid gap-y-4">
        <div className="span-head grid gap-4">
          <Link href="/today/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Today&apos;s call
          </Link>
          <h1 className="text-[32px] leading-[1.08] sm:text-[40px]">With a room</h1>
        </div>
        <div className="span-wide min-w-0">
          <ClassMode />
        </div>
      </div>
    </div>
  )
}
