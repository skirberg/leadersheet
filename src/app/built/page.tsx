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
      { name: "Next.js", version: "16.4", what: "App Router, statically exported. Every page is plain HTML, no server and no database.", url: "https://nextjs.org" },
      { name: "React", version: "19.3", what: "Components and state for the labs, quizzes and games. Progress stays in your browser.", url: "https://react.dev" },
      { name: "React Compiler", version: "1.0", what: "Memoizes components at build time, so a slider or a score re-renders only what reads it.", url: "https://react.dev/learn/react-compiler" },
      { name: "TypeScript", version: "7.0", what: "Content, labs, brand config and every build and test script, checked by the native compiler in about two seconds.", url: "https://www.typescriptlang.org" },
    ],
  },
  {
    title: "Interface",
    items: [
      { name: "Tailwind CSS", version: "4.3", what: "Styling from design tokens.", url: "https://tailwindcss.com" },
      { name: "shadcn/ui", what: "Component recipes, restyled from the brand tokens.", url: "https://ui.shadcn.com" },
      { name: "Radix UI", version: "1.8", what: "Accessible primitives: dialog, tabs, slider, toggle group, checkbox.", url: "https://www.radix-ui.com" },
      { name: "cmdk", version: "1.1", what: "The ⌘K search across sheets, frameworks and games. It loads the first time you open it.", url: "https://cmdk.paco.me" },
      { name: "next-themes", version: "0.4", what: "Light and dark mode that follows your system, or your pick.", url: "https://github.com/pacocoursey/next-themes" },
      { name: "Lucide", version: "1.61", what: "Icons.", url: "https://lucide.dev" },
    ],
  },
  {
    title: "Motion",
    items: [
      { name: "Remotion Player", version: "4.0", what: "The hero film and the 16 second recap on every sheet, drawn from the content in the browser. The hero loads once the page is idle; a recap plays when you ask.", url: "https://www.remotion.dev" },
      { name: "Motion", version: "14.6", what: "Spring layout animations: the sliding nav underline, the phone tab bar, the Study and Play pill and the lab toggles. Loaded after the page is ready.", url: "https://motion.dev" },
      { name: "NumberFlow", version: "0.6", what: "Scores, timers and counts that roll digit by digit.", url: "https://number-flow.barvian.me" },
      { name: "CSS", what: "Sections rise in on scroll timelines, the highlighter swipes, cards give a little under your finger, and progress bars slide, all without JavaScript. Reduced motion turns it off." },
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
    title: "On your phone",
    items: [
      { name: "Taps", what: "No gray flash, no wait for a double tap, and labels you can't select by accident." },
      { name: "Search", what: "Text is 16 px on touch screens, so the page never zooms when the keyboard opens." },
      { name: "Edges", what: "The header and the tab bar clear the notch and the home bar; the status bar matches light or dark, even when you switch by hand." },
      { name: "Install", what: "Add it to your home screen and it opens like an app, with its own icon." },
    ],
  },
  {
    title: "Sharing",
    items: [
      { name: "Share cards", what: "26 preview images, made at build time: one for the site, one for each sheet and one for each quiz result. A shared link shows the card." },
      { name: "Result pages", what: "Every quiz result has its own page, so the next person lands one tap from the same quiz." },
      { name: "Search engines", what: "A canonical address on every page, a sitemap, and an icon set for every browser, bookmark and search result." },
    ],
  },
  {
    title: "Quality",
    items: [
      { name: "axe-core", what: "WCAG 2.1 AA checks on every page in light and dark, game and result screens included.", url: "https://github.com/dequelabs/axe-core" },
      { name: "Page checks", what: "Every page at 375, 768, 1024 and 1280 px, in light and dark: 504 checks for crashes, sideways scroll and accessibility before each release." },
      { name: "Behavior tests", what: "The hero film plays and pauses, reduced motion holds still, search finds and opens, the modes switch, a quick tap on a sliding tab lands, every icon loads, and nothing logs an error. They run again on the live site after each release." },
      { name: "Lighthouse", what: "100 for accessibility, best practices and SEO on a phone.", url: "https://developer.chrome.com/docs/lighthouse" },
      { name: "Contrast checks", what: "Every color pair in the palette measured against WCAG ratios, in light and dark." },
    ],
  },
  {
    title: "Hosting",
    items: [
      { name: "Vercel", what: "Builds every push from GitHub and serves the site from the edge at leadersheet.io. Web Analytics counts page views and a few anonymous actions (a check finished, a lab used, a game played, a share, a mode switched) with no cookies.", url: "https://vercel.com" },
      { name: "GitHub", what: "Source code and history.", url: BRAND.repo },
    ],
  },
]

const SYSTEM: [string, string][] = [
  ["Brand presets", "Name, logo, colors, icons and emphasis style live in one folder. Swap the folder and the whole site reskins."],
  ["Two inks", "Paper and ink carry the page. A lime highlighter marks one phrase per view; hot pink marks the one thing to look at in a model."],
  ["Sheets", "Each big idea is a numbered sheet with a title block, like a set of drawings."],
  ["Study and Play", "One switch changes emphasis, never content: Play mode leads with the games."],
  ["Class mode", "The public site is timeless. People taking the class switch on dates and what is due, once."],
  ["Made to share", "Every quiz result is a page with its own card, so the link does the explaining."],
]

export default function BuiltPage() {
  return (
    <div className="mx-auto grid max-w-[1000px] gap-12 px-4 pt-10 sm:px-6 lg:pt-14">
      <header className="grid gap-3 border-b border-foreground pb-5">
        <p className="label-mono">Colophon</p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">How it’s built</h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">A static site: open source tools, a small design system, and a lot of checking.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={BRAND.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/88"
          >
            Source code <ArrowUpRight className="size-4" />
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
