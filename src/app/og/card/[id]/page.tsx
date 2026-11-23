import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Wordmark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"
import { Ring } from "@/components/play/team-math"
import { DecideChart } from "@/components/play/decide-chart"
import { Sheet } from "@/components/sheet/sheet-view"
import { GAME_CARDS, PAGE_CARDS, PageCard, isPageCard } from "@/components/og/page-cards"
import type { SheetData } from "@/lib/sheet"

// Sources for public/og/<id>.png (scripts/make-og.ts): the share cards of Team math, the decide test and Your sheet,
// and of every other game and shared page (src/components/og/page-cards.tsx). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Share card", robots: { index: false, follow: false } }
export const dynamicParams = false
const CARDS = ["team", "decide", "sheet"] as const
export function generateStaticParams() {
  return [...CARDS, ...GAME_CARDS, ...PAGE_CARDS].map((id) => ({ id }))
}

/* An example sheet for the card: what a sheet looks like a few lessons in. Labeled as the page's own name, not a person's. */
const EXAMPLE: SheetData = {
  passed: ["s1", "s2", "s3"],
  opened: 4,
  calls: [
    { sheet: "s1", choice: 1 },
    { sheet: "s2", choice: 0 },
    { sheet: "s3", choice: 2 },
    { sheet: "s4", choice: 0 },
  ],
  styles: { decide: "Consult", style: "Coaching", conflict: "Collaborating", power: "Expert", listen: "Analytical", culture: "Learning" },
  values: null,
  seen: null,
  games: {},
  daily: { made: 0, strong: 0 },
  streak: 0,
}

export default async function Card({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isPageCard(id)) return <PageCard id={id} />
  if (!(CARDS as readonly string[]).includes(id)) notFound()
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="relative grid h-[630px] w-[1200px] grid-cols-[560px_1fr] items-center gap-10 p-14">
        <div className="flex h-full flex-col justify-between">
          <Wordmark className="h-[30px] self-start" />
          {id === "team" ? (
            <div className="grid gap-5">
              <p className="text-[24px] text-muted-foreground">Team math</p>
              <p className="font-serif text-[60px] leading-[1.08]">
                6 people, 15 lines.
                <br />
                14 people, <Emphasis>91</Emphasis>.
              </p>
              <p className="text-[24px] leading-snug text-muted-foreground">Grow a team, watch the lines multiply, then split it.</p>
            </div>
          ) : id === "decide" ? (
            <div className="grid gap-5">
              <p className="text-[24px] text-muted-foreground">Ten calls, one line</p>
              <p className="font-serif text-[84px] leading-[1.02]">
                How do <Emphasis>you</Emphasis> decide?
              </p>
              <p className="text-[24px] leading-snug text-muted-foreground">From deciding alone to letting the team decide.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              <p className="text-[24px] text-muted-foreground">Calls, results, values</p>
              <p className="font-serif text-[96px] leading-[1.02]">
                Your <Emphasis>sheet</Emphasis>
              </p>
              <p className="text-[24px] leading-snug text-muted-foreground">One page that fills in as you go.</p>
            </div>
          )}
          <p className="text-[22px] text-muted-foreground">{id === "team" ? "Play it · 3 minutes" : id === "decide" ? "Find yours · 3 minute test" : "Print it or send it"}</p>
        </div>
        {id === "sheet" ? (
          <div className="h-[520px] overflow-hidden rounded-[40px]">
            <div className="origin-top-left scale-[0.62]" style={{ width: "161%" }}>
              <Sheet data={EXAMPLE} title="Your sheet" answers={[]} />
            </div>
          </div>
        ) : (
          <div className="rounded-[40px] bg-card p-8">{id === "team" ? <Ring n={14} label="Fourteen people, every pair joined: 91 lines." /> : <DecideChart card />}</div>
        )}
      </div>
    </div>
  )
}
