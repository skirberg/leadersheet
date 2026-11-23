import type { Metadata } from "next"
import { CheckCount, LearnPath } from "@/components/learn/sheets"
import { sheetSummaries } from "@/data/course"
import { JsonLd } from "@/components/site/json-ld"
import { courseJsonLd, shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Twenty-four leadership lessons",
  description: "Twenty-four short, hands-on leadership lessons: emotional intelligence, culture, change, conflict, decisions, listening, feedback, power, trust, ethics, negotiation, networks, crisis and leading yourself. Free, no sign-up.",
  ...shareCard("/og/learn.png"),
}

export default function LearnIndex() {
  const sheets = sheetSummaries()
  return (
    <div className="page">
      <JsonLd data={courseJsonLd()} />
      <header className="span-head grid gap-3">
        <h1 className="text-[40px] leading-[1.05] sm:text-[56px]">Twenty-four lessons</h1>
        <CheckCount sheets={sheets} />
      </header>
      <LearnPath sheets={sheets} />
    </div>
  )
}
