import type { Metadata } from "next"
import { FrameworksClient } from "./frameworks-client"
import { JsonLd } from "@/components/site/json-ld"
import { frameworkHeading, frameworksJsonLd, shareCard } from "@/lib/seo"
import { FRAMEWORKS } from "@/data/course"

export const metadata: Metadata = {
  title: "Leadership frameworks and models, all on one page",
  description: "Every leadership framework from all twenty-four lessons on one page, each with its own page: Kotter’s 8 steps, Goleman’s six styles, psychological safety, Thomas-Kilmann, the bases of power, GROW, BATNA and more.",
  ...shareCard("/og/frameworks.png"),
}

export default function FrameworksPage() {
  return (
    <div className="page">
      <JsonLd data={frameworksJsonLd()} />
      <h1 className="sr-only">Every framework, one page</h1>
      {/* Each card links with the words people search for ("Kotter’s 8 steps of change"), worked out here so the client gets a small map. */}
      <FrameworksClient headings={Object.fromEntries(FRAMEWORKS.map((f) => [f.id, frameworkHeading(f)]))} />
    </div>
  )
}
