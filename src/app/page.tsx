import Link from "next/link"
import { ArrowUpRight, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroPlayer } from "@/components/film/players"
import { OpenThisWeek, ThisWeek } from "@/components/learn/this-week"
import { HeroCtas, HeroLine, HomeArcade } from "@/components/play/home-bits"
import { CheckCount, SheetGrid } from "@/components/learn/sheets"
import { C, FRAMEWORKS, sheetNo } from "@/data/course"

export default function Home() {
  return (
    <>
      {/* Hero: the drafting table */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="drafting-grid drafting-grid-fade pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pt-16 lg:pb-20">
          <div className="grid gap-6">
            <p className="label-mono rise">Leadership in Organizations · 12 sheets</p>
            <h1 className="rise text-[44px] leading-[0.98] font-semibold tracking-[-0.035em] [font-stretch:92%] sm:text-[64px] lg:text-[76px]" style={{ ["--delay" as string]: "60ms" }}>
              <HeroLine />
            </h1>
            <p className="rise max-w-[50ch] text-lg leading-snug text-muted-foreground sm:text-xl" style={{ ["--delay" as string]: "120ms" }}>
              Twelve classes, twelve sheets. Each one gives you the idea, a model you can move, the frameworks, and a three question check. Then the games.
            </p>
            <div className="rise flex flex-wrap items-center gap-2" style={{ ["--delay" as string]: "180ms" }}>
              <HeroCtas>
                <OpenThisWeek />
                <Button asChild size="lg" variant="outline">
                  <Link href="/play/">Play</Link>
                </Button>
              </HeroCtas>
              <span className="ml-2 hidden items-center gap-1.5 font-mono text-xs text-muted-foreground lg:inline-flex">
                <Command className="size-3.5" />K to search everything
              </span>
            </div>
          </div>
          <HeroPlayer className="rise" />
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] gap-20 px-4 pt-12 sm:px-6 lg:pt-16">
        <HomeArcade slot="top" />

        <div id="this-week" className="scroll-mt-24">
          <ThisWeek />
        </div>

        <section aria-labelledby="set-h" className="grid gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-foreground pb-3">
            <div>
              <p className="label-mono">The set</p>
              <h2 id="set-h" className="mt-1 text-3xl font-semibold tracking-[-0.02em]">Twelve sheets</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pass a sheet’s three question check to sign it off.</p>
            </div>
            <CheckCount />
          </div>
          <SheetGrid />
        </section>

        <HomeArcade slot="bottom" />

        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-5">
            <div className="flex items-end justify-between gap-3 border-b border-foreground pb-3">
              <div>
                <p className="label-mono">Index</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{FRAMEWORKS.length} frameworks</h2>
              </div>
              <Link href="/sheet/" className="text-sm font-semibold underline-offset-4 hover:underline">
                Cheat sheet
              </Link>
            </div>
            <ul className="flex flex-wrap gap-2">
              {FRAMEWORKS.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/learn/s${f.s}/#fw-${f.id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm transition-colors hover:border-foreground/70"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground tnum">{sheetNo(f.s)}</span>
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-5">
            <div className="border-b border-foreground pb-3">
              <p className="label-mono">Sources</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em]">Readings and talks</h2>
            </div>
            <ul className="divide-y divide-border border-b border-border">
              {C.resources.map((r) => (
                <li key={r.u}>
                  <a href={r.u} target="_blank" rel="noopener noreferrer" className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-3">
                    <span className="font-semibold group-hover:underline group-hover:underline-offset-4">{r.t}</span>
                    <ArrowUpRight className="row-span-2 size-4 self-center text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      <span className="label-mono mr-1.5 !text-[10px]">{r.k}</span>
                      {r.w}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">HBR articles may need a library login.</p>
          </div>
        </section>
      </div>
    </>
  )
}
