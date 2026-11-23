import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MirrorGame } from "@/components/play/mirror"
import { shareCard } from "@/lib/seo"

// Sent by a person to people who know them, so the preview speaks in their voice. The page means nothing without the
// five in its link, so search engines leave it out (it is not in the sitemap either).
export const metadata: Metadata = {
  title: "What do I value?",
  description: "Pick the five values you see in me, then see my five.",
  robots: { index: false, follow: true },
  ...shareCard("/og/mirror.png"),
}

export default function MirrorPage() {
  return (
    <div className="page">
      <div className="span-wide grid grid-cols-subgrid gap-y-6">
        <div className="span-rail">
          <Link href="/play/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground -my-3 py-3">
            <ArrowLeft className="size-3.5" /> The arcade
          </Link>
        </div>
        <div className="span-main min-w-0 lg:max-w-cols-8">
          <h1 className="sr-only">Values mirror</h1>
          <MirrorGame />
        </div>
      </div>
    </div>
  )
}
