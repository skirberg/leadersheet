import { ArrowUpRight } from "lucide-react"
import { OpenThisWeek } from "@/components/learn/this-week"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroPlayer } from "@/components/film/hero-player"
import { HeroCards } from "@/components/learn/hero-cards"
import { HeroCtas, HeroLine, HomeArcade } from "@/components/play/home-bits"
import { CheckCount, SheetGrid } from "@/components/learn/sheets"
import { StreakLine } from "@/components/learn/streak"
import { TodayLink } from "@/components/play/todays-call"
import { ReviewDue } from "@/components/learn/review-due"
import { C, sheetSummaries } from "@/data/course"
import { JsonLd } from "@/components/site/json-ld"
import { siteJsonLd } from "@/lib/seo"

export default function Home() {
  // Only what the cards need goes to the browser, not every lesson in full.
  const sheets = sheetSummaries()
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      {/* The opening is centred on the middle columns; every section after it is a label in columns 1 to 3 and its
          content from column 4, so the page reads down one edge (DESIGN.md, Grid). */}
      <section>
        <div className="page pb-10 text-center">
          <div className="span-center grid justify-items-center gap-6 lg:pt-8">
            <h1 className="max-w-[16ch] text-[44px] leading-[1.08] sm:text-[60px] lg:text-[68px]">
              <HeroLine />
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">24 hands-on lessons. Free, no sign-up.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <HeroCtas>
                <OpenThisWeek sheets={sheets} />
                <Button asChild size="lg" variant="outline">
                  <Link href="/play/">Play a game</Link>
                </Button>
              </HeroCtas>
            </div>
            <TodayLink />
            <ReviewDue />
            <StreakLine />
          </div>
        </div>
        <HeroCards />
      </section>

      <section className="bg-card">
        <div className="page items-center pb-(--section)">
          <h2 className="span-rail text-[34px] leading-[1.15] sm:text-[40px]">Move the model, see what changes</h2>
          <div className="span-main rounded-[28px] bg-background p-2">
            <HeroPlayer />
          </div>
        </div>
      </section>

      <div className="page">
        <HomeArcade slot="top" />

        <section id="lessons" aria-labelledby="set-h" className="span-wide grid scroll-mt-24 grid-cols-subgrid gap-y-6">
          <div className="span-rail grid content-start gap-3">
            <h2 id="set-h" className="text-4xl">
              The lessons
            </h2>
            <CheckCount sheets={sheets} />
          </div>
          <div className="span-main">
            <SheetGrid sheets={sheets} />
          </div>
        </section>

        <HomeArcade slot="bottom" />

        <section aria-labelledby="read-h" className="span-wide grid grid-cols-subgrid gap-y-5">
          <h2 id="read-h" className="span-rail text-4xl">
            Readings and talks
          </h2>
          <ul className="span-read divide-y divide-border border-b border-border lg:border-t">
            {C.resources.map((r) => (
              <li key={r.u}>
                <a href={r.u} target="_blank" rel="noopener noreferrer" className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-3">
                  <span className="font-semibold group-hover:underline group-hover:underline-offset-4">{r.t}</span>
                  <ArrowUpRight className="row-span-2 size-4 self-center text-muted-foreground" />
                  {/* Under "Readings and talks" a reading needs no label; a video says so. */}
                  <span className="text-sm text-muted-foreground">{r.k === "Reading" ? r.w : `${r.k} · ${r.w}`}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
