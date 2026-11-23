import type { Metadata } from "next"
import { Arcade } from "@/components/play/arcade"
import { SheetLink } from "@/components/sheet/sheet-link"
import { shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Leadership quizzes, games and self-checks",
  description: "Free leadership quizzes, games and published self-checks: style quizzes, a values sort, the Job Diagnostic Survey, the Brief Resilience Scale and a network map.",
  ...shareCard("/og/play.png"),
}

export default function PlayPage() {
  return (
    <div className="page">
      <h1 className="sr-only">Leadership quizzes, games and self-checks</h1>
      <div className="span-wide">
        <Arcade Title="h2" />
      </div>
      <div className="span-head">
        <SheetLink />
      </div>
    </div>
  )
}
