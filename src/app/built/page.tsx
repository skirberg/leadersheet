import type { Metadata } from "next"
import { readFileSync } from "node:fs"
import { ArrowUpRight } from "lucide-react"
import { BRAND } from "@/brand"
import { shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "How it’s built",
  description: `The frameworks, tools and design system behind ${BRAND.name}.`,
  ...shareCard("/og/built.png"),
}

type Item = { name: string; what: string; url?: string; version?: string }

/** The installed version (major.minor), read at build time, so this page never lists a version the site no longer runs. */
const v = (pkg: string) => {
  try {
    return (JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, "utf8")).version as string).split(".").slice(0, 2).join(".")
  } catch {
    return undefined
  }
}

const STACK: { title: string; items: Item[] }[] = [
  {
    title: "Framework",
    items: [
      { name: "Next.js", version: v("next"), what: "Static export. No server, no database.", url: "https://nextjs.org" },
      { name: "React", version: v("react"), what: "Labs, quizzes and games.", url: "https://react.dev" },
      { name: "React Compiler", version: v("babel-plugin-react-compiler"), what: "Memoizes at build time.", url: "https://react.dev/learn/react-compiler" },
      { name: "TypeScript", version: v("typescript"), what: "Content, labs and every script.", url: "https://www.typescriptlang.org" },
    ],
  },
  {
    title: "Interface",
    items: [
      { name: "Design tokens", what: "One file in the W3C format makes the CSS, the types and /tokens.json.", url: "https://www.designtokens.org" },
      { name: "Tailwind CSS", version: v("tailwindcss"), what: "Styling from design tokens.", url: "https://tailwindcss.com" },
      { name: "shadcn/ui", what: "Component recipes.", url: "https://ui.shadcn.com" },
      { name: "Base UI", version: v("@base-ui/react"), what: "Accessible primitives: the dialog, tabs, slider, checkbox and toggles.", url: "https://base-ui.com" },
      { name: "cmdk", version: v("cmdk"), what: "The ⌘K search.", url: "https://cmdk.paco.me" },
      { name: "next-themes", version: v("next-themes"), what: "Follows your device, or your pick.", url: "https://github.com/pacocoursey/next-themes" },
      { name: "Lucide", version: v("lucide-react"), what: "Icons.", url: "https://lucide.dev" },
    ],
  },
  {
    title: "Motion",
    items: [
      { name: "Remotion", version: v("remotion"), what: "Springs for the home page org chart.", url: "https://www.remotion.dev" },
      { name: "Motion", version: v("framer-motion"), what: "Layout animations.", url: "https://motion.dev" },
      { name: "NumberFlow", version: v("@number-flow/react"), what: "Numbers that roll.", url: "https://number-flow.barvian.me" },
      { name: "View transitions", what: "A new page fades in over the last one.", url: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API" },
      { name: "CSS", what: "The rest. Reduced motion turns it off." },
    ],
  },
  {
    title: "Type",
    items: [
      { name: "Funnel Display", what: "Wordmark.", url: "https://fonts.google.com/specimen/Funnel+Display" },
      { name: "Noticia Text", what: "Headlines.", url: "https://fonts.google.com/specimen/Noticia+Text" },
      { name: "Instrument Sans", what: "Body text.", url: "https://fonts.google.com/specimen/Instrument+Sans" },
      { name: "Martian Mono", what: "The home drawing’s labels.", url: "https://fonts.google.com/specimen/Martian+Mono" },
      { name: "Type scale", what: "Measured from Brilliant’s problem player: 12 px labels, 16 px body, 20 px for what you read, a 24 px question." },
    ],
  },
  {
    title: "Checks before each release",
    items: [
      { name: "axe-core", what: "WCAG 2.1 AA on every page, light and dark.", url: "https://github.com/dequelabs/axe-core" },
      { name: "Contrast", what: "Every text colour on every surface, light, dark and high contrast." },
      { name: "Oxlint", version: v("oxlint"), what: "Unused code and broken hook rules.", url: "https://oxc.rs" },
      { name: "Page checks", what: "Every page from 320 to 1280 px." },
      { name: "Behavior tests", what: "Real taps and drags, run again on the live site." },
      { name: "Lighthouse", what: "100 for accessibility, best practices and SEO.", url: "https://developer.chrome.com/docs/lighthouse" },
      { name: "Security headers", what: "Strict CSP and HSTS, tested locally too." },
      { name: "Voice checks", what: "Bans stock marketing words." },
      { name: "Case checks", what: "Every decision lands on a real framework row, and every path through every Rewind conversation ends." },
      { name: "Unit tests", what: "Scoring, share links, the self-checks against their published keys, Burt’s worked example, a share card for every game, and every analytics event written down." },
    ],
  },
  {
    title: "Hosting",
    items: [
      { name: "Vercel", what: "Builds and serves the site. Web Analytics counts visits and a few anonymous actions, with no cookies.", url: "https://vercel.com" },
      { name: "GitHub", what: "Holds the code. The link goes to the maker’s profile.", url: BRAND.author.url },
    ],
  },
]

const SYSTEM: [string, string][] = [
  ["Brand presets", "One folder reskins the whole site."],
  ["Grid", "Twelve columns, 24 px gutters, 1200 px at most; 8 on a tablet, 4 on a phone. Every block starts and ends on a column line. Add ?grid to any address to see it."],
  ["Color", "Warm grey, white cards, one pink accent."],
  ["Lessons", "Idea, model, decision, frameworks, a check that explains every option, game."],
  ["Progress", "Kept in your browser. No accounts."],
]

export default function BuiltPage() {
  return (
    // base-ui.com's page: each group's name in the rail, its rows from column 4 (DESIGN.md, Grid).
    <div className="page">
      <header className="span-head grid justify-items-start gap-3">
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">How it’s built</h1>
        <p className="text-lg text-muted-foreground">Open source tools, a small design system and a lot of checking.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={BRAND.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/88"
          >
            GitHub <ArrowUpRight className="size-4" />
          </a>
        </div>
      </header>

      <section aria-labelledby="sys-h" className="span-wide grid grid-cols-subgrid gap-y-4">
        <h2 id="sys-h" className="span-rail text-2xl">
          The design system
        </h2>
        {/* Rows with hairlines, like the stack below, not boxes; the color row shows the colors instead of naming them. */}
        <dl className="span-main divide-y divide-border border-y border-border lg:max-w-cols-8">
          {SYSTEM.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 cols-label">
              <dt className="font-semibold">{k}</dt>
              {k === "Color" ? (
                <dd className="flex items-center gap-2">
                  <span role="img" aria-label={v} className="flex items-center gap-1.5">
                    {["bg-background", "bg-card", "bg-foreground", "bg-signal"].map((c) => (
                      <span key={c} aria-hidden className={`size-6 rounded-full border border-border ${c}`} />
                    ))}
                  </span>
                </dd>
              ) : (
                <dd className="text-base text-muted-foreground">{v}</dd>
              )}
            </div>
          ))}
        </dl>
      </section>

      {STACK.map((g) => (
        <section key={g.title} aria-labelledby={`st-${g.title}`} className="span-wide grid grid-cols-subgrid gap-y-3">
          <h2 id={`st-${g.title}`} className="span-rail label-mono lg:pt-3.5">
            {g.title}
          </h2>
          <ul className="span-main divide-y divide-border border-y border-border lg:max-w-cols-8">
            {g.items.map((it) => (
              <li key={it.name} className="grid gap-1 py-3 cols-label">
                <span className="flex items-baseline gap-2">
                  {it.url ? (
                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
                      {it.name}
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </a>
                  ) : (
                    <span className="font-semibold">{it.name}</span>
                  )}
                  {it.version && <span className="font-mono text-xs text-muted-foreground tnum">{it.version}</span>}
                </span>
                <span className="text-base text-muted-foreground">{it.what}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
