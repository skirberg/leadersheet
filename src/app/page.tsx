import { ArrowUpRight } from "lucide-react"
import { HomeFocus, OpenThisWeek } from "@/components/learn/this-week"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroPlayer } from "@/components/film/hero-player"
import { HeroCtas, HeroLine, HomeArcade } from "@/components/play/home-bits"
import { CheckCount, SheetGrid } from "@/components/learn/sheets"
import { C, sheetSummaries } from "@/data/course"

export default function Home() {
  // Only what the cards need goes to the browser, not the whole course.
  const sheets = sheetSummaries()
  return (
    <>
      <section>
        <div className="mx-auto grid max-w-[1240px] justify-items-center gap-6 px-4 pt-14 pb-10 text-center sm:px-6 lg:pt-24">
          <h1 className="max-w-[16ch] text-[44px] leading-[1.08] sm:text-[60px] lg:text-[68px]">
            <HeroLine />
          </h1>
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
            Twelve short, hands-on lessons on how leaders build teams, shape culture and drive change. Free, no sign-up.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <HeroCtas>
              <OpenThisWeek sheets={sheets} />
              <Button asChild size="lg" variant="outline">
                <Link href="/play/">Play a game</Link>
              </Button>
            </HeroCtas>
          </div>
        </div>
        <div className="mx-auto max-w-[820px] px-4 pb-16 sm:px-6 lg:pb-24">
          <HeroPlayer />
        </div>
      </section>

      <div className="mx-auto grid max-w-[980px] gap-20 px-4 sm:px-6">

        <HomeArcade slot="top" />

        <div id="this-week" className="scroll-mt-24 empty:hidden">
          <HomeFocus sheets={sheets} />
        </div>

        <section aria-labelledby="set-h" className="grid gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="set-h" className="text-4xl">Twelve lessons</h2>
            </div>
            <CheckCount sheets={sheets} />
          </div>
          <SheetGrid sheets={sheets} />
        </section>

        <HomeArcade slot="bottom" />

        <section className="grid max-w-[720px] gap-12 pb-4">
          <div className="grid content-start gap-5">
            <div>
              <h2 className="text-4xl">Readings and talks</h2>
            </div>
            <ul className="divide-y divide-border border-b border-border">
              {C.resources.map((r) => (
                <li key={r.u}>
                  <a href={r.u} target="_blank" rel="noopener noreferrer" className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-3">
                    <span className="font-semibold group-hover:underline group-hover:underline-offset-4">{r.t}</span>
                    <ArrowUpRight className="row-span-2 size-4 self-center text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {r.k} · {r.w}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}
