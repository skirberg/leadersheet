import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { BRAND } from "@/brand"

export const metadata: Metadata = {
  title: "How it’s built",
  description: `The frameworks, tools and design system behind ${BRAND.name}.`,
}

type Item = { name: string; what: string; url?: string; version?: string }

const STACK: { title: string; items: Item[] }[] = [
  {
    title: "Framework",
    items: [
      { name: "Next.js", version: "16.3", what: "App Router, statically exported. Every page is plain HTML, no server.", url: "https://nextjs.org" },
      { name: "React", version: "19.2", what: "Components and state for the labs, quizzes and games.", url: "https://react.dev" },
      { name: "TypeScript", version: "5.9", what: "Typed content, labs and brand config.", url: "https://www.typescriptlang.org" },
    ],
  },
  {
    title: "Interface",
    items: [
      { name: "Tailwind CSS", version: "4.3", what: "Styling from design tokens.", url: "https://tailwindcss.com" },
      { name: "shadcn/ui", what: "Component recipes, restyled from the brand tokens.", url: "https://ui.shadcn.com" },
      { name: "Radix UI", version: "1.6", what: "Accessible primitives: dialog, tabs, slider, toggle group, checkbox.", url: "https://www.radix-ui.com" },
      { name: "cmdk", version: "1.1", what: "The ⌘K search across sheets, frameworks and games.", url: "https://cmdk.paco.me" },
      { name: "next-themes", version: "0.4", what: "Light and dark mode that follows your system.", url: "https://github.com/pacocoursey/next-themes" },
      { name: "Lucide", what: "Icons.", url: "https://lucide.dev" },
    ],
  },
  {
    title: "Motion",
    items: [
      { name: "Remotion Player", version: "4.0", what: "The hero film and the 16 second recap on every sheet, generated from the content in the browser.", url: "https://www.remotion.dev" },
      { name: "Motion", version: "13.5", what: "Spring layout animations: the sliding nav underline, the phone tab bar, the Study and Play pill and the lab toggles.", url: "https://motion.dev" },
      { name: "NumberFlow", version: "0.6", what: "Scores, timers and counts that roll digit by digit.", url: "https://number-flow.barvian.me" },
      { name: "CSS scroll timelines", what: "Sections rise in as they scroll into view, with no JavaScript; the highlighter swipe and the celebration burst are CSS too. All of it turns off with reduced motion." },
    ],
  },
  {
    title: "Type",
    items: [
      { name: "Bricolage Grotesque", what: "Headlines and text. SIL Open Font License.", url: "https://fonts.google.com/specimen/Bricolage+Grotesque" },
      { name: "Martian Mono", what: "Sheet numbers, dates, scores and labels. SIL Open Font License.", url: "https://fonts.google.com/specimen/Martian+Mono" },
    ],
  },
  {
    title: "Quality",
    items: [
      { name: "axe-core", what: "Automated WCAG 2.1 AA checks on every page, in light and dark, including game and result screens.", url: "https://github.com/dequelabs/axe-core" },
      { name: "Chrome DevTools Protocol", what: "Scripted screenshots at phone and desktop sizes, and overflow checks at 375 px." },
      { name: "Contrast checks", what: "Every color pair in the palette measured against WCAG ratios before it shipped." },
    ],
  },
  {
    title: "Hosting",
    items: [
      { name: "Vercel", what: "Builds the site from GitHub and serves it from the edge.", url: "https://vercel.com" },
      { name: "GitHub", what: "Source code and history.", url: BRAND.repo },
    ],
  },
]

const SYSTEM: [string, string][] = [
  ["Brand presets", "Name, logo, colors and emphasis style live in one folder. Swap the folder and the whole site reskins."],
  ["Two inks", "Paper and ink carry the page. A lime highlighter marks one phrase per view; hot pink marks the one thing to look at in a model."],
  ["Sheets", "Each big idea is a numbered sheet with a title block, like a set of drawings."],
  ["Study and Play", "One switch changes emphasis, never content: Play mode leads with the games."],
  ["Class mode", "The public site is timeless. People taking the class switch on dates and what is due, once."],
]

export default function BuiltPage() {
  return (
    <div className="mx-auto grid max-w-[1000px] gap-12 px-4 pt-10 sm:px-6 lg:pt-14">
      <header className="grid gap-3 border-b border-foreground pb-5">
        <p className="label-mono">Colophon</p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">How it’s built</h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">
          {BRAND.name} is a static site: open source tools, a small design system, and a lot of checking. Built by{" "}
          <a href={BRAND.author.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline-offset-4 hover:underline">
            {BRAND.author.name}
          </a>
          .
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={BRAND.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/88"
          >
            Source code <ArrowUpRight className="size-4" />
          </a>
          <a
            href={BRAND.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-rule/50 bg-card px-4 text-sm font-semibold hover:border-foreground/60"
          >
            GitHub profile <ArrowUpRight className="size-4" />
          </a>
        </div>
      </header>

      <section aria-labelledby="sys-h" className="grid gap-4">
        <h2 id="sys-h" className="text-2xl font-semibold tracking-[-0.015em]">
          The design system
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {SYSTEM.map(([k, v]) => (
            <div key={k} className="corners grid gap-1 border border-border bg-card p-4">
              <dt className="font-semibold">{k}</dt>
              <dd className="text-[15px] text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {STACK.map((g) => (
        <section key={g.title} aria-labelledby={`st-${g.title}`} className="grid gap-3">
          <h2 id={`st-${g.title}`} className="label-mono border-b border-border pb-2">
            {g.title}
          </h2>
          <ul className="divide-y divide-border">
            {g.items.map((it) => (
              <li key={it.name} className="grid gap-1 py-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
                <span className="flex items-baseline gap-2">
                  {it.url ? (
                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
                      {it.name}
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </a>
                  ) : (
                    <span className="font-semibold">{it.name}</span>
                  )}
                  {it.version && <span className="font-mono text-[11px] text-muted-foreground tnum">{it.version}</span>}
                </span>
                <span className="text-[15px] text-muted-foreground">{it.what}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
