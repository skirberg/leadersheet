import type { Metadata } from "next"
import { existsSync, readFileSync } from "node:fs"
import { ArrowDown } from "lucide-react"
import { BRAND, LogoMark, Wordmark } from "@/brand"
import { BANNERS, CLEAR_SPACE, KIT_DIR, LOGO_VARIANTS, MIN_SIZE, VARIANT_USE, type LogoVariant, type MarkVariant } from "@/brand/kit"
import { Button } from "@/components/ui/button"
import { CopyValue } from "@/components/site/copy-value"
import { cn } from "@/lib/utils"
import { shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Brand",
  description: `The ${BRAND.name} mark, name, colours, type and voice, with every file to download.`,
  ...shareCard("/og/brand.png"),
}

/*
  The brand kit, shown. Every file here is generated from the preset (scripts/make-brand-kit.ts) and listed in kit.json,
  which the build packs (scripts/brand-pack.ts); this page reads both at build time, so it never shows a stale size.
*/
type KitEntry = { path: string; url: string; bytes: number; px?: [number, number] }
type Kit = { version: { commit: string; date: string }; files: KitEntry[]; zip: { url: string; bytes: number } }
type Swatch = { role: string; hex: string; rgb: number[]; cmykApprox: number[] }
type Tokens = { light: Record<string, Swatch>; dark: Record<string, Swatch>; contrast: { mode: string; use: string; ratio: number; needs: number; passes: boolean }[] }

const read = <T,>(p: string): T | null => (existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : null)
const kit = read<Kit>(`public/${KIT_DIR}/kit.json`)
const tokens = read<Tokens>(`public/${KIT_DIR}/colors/tokens.json`)
const file = (path: string) => kit?.files.find((f) => f.path === path)
const mb = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`)
const id = BRAND.id
const at = (p: string) => `/${KIT_DIR}/${p}`

// The ground each variant is made for. Fixed colours, not theme colours: a variant's ground is part of the rule.
const light = tokens?.light.card?.hex ?? "#ffffff"
const paper = tokens?.light.background?.hex ?? "#f5f3f1"
const night = tokens?.dark.background?.hex ?? "#0c0e13"
const GROUND: Record<MarkVariant, string> = { color: light, reversed: night, black: paper, white: night, tile: paper }

const NAMES: Record<MarkVariant, string> = { color: "Colour", reversed: "Reversed", black: "Black", white: "White", tile: "Tile" }

function Files({ links }: { links: [string, string][] }) {
  return (
    <p className="flex flex-wrap gap-x-1 text-sm">
      {links.map(([label, href]) => (
        <a key={href} href={href} download className="inline-flex min-h-11 min-w-11 items-center px-1.5 font-semibold underline-offset-4 first:pl-0 hover:underline">
          {label}
        </a>
      ))}
    </p>
  )
}

function Variant({ v, kind }: { v: MarkVariant; kind: "mark" | "lockup" }) {
  const svg = kind === "mark" ? `mark/${id}-mark-${v}.svg` : `logo/${id}-lockup-${v}.svg`
  const png = kind === "mark" ? `mark/${id}-mark-${v}-1024.png` : `logo/${id}-lockup-${v}-2048.png`
  const links: [string, string][] = [
    ["SVG", at(svg)],
    ["PNG", at(png)],
  ]
  if (kind === "lockup") links.push(["Wordmark", at(`logo/${id}-wordmark-${v}.svg`)])
  return (
    <figure className="grid gap-2">
      <div className={cn("grid place-items-center rounded-[28px] ring-1 ring-border ring-inset", kind === "mark" ? "aspect-[4/3]" : "aspect-[2/1]")} style={{ background: GROUND[v] }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={at(svg)} alt={`${BRAND.name} ${kind}, ${NAMES[v].toLowerCase()}`} className={kind === "mark" ? "size-24" : "h-14 w-auto max-w-[80%]"} />
      </div>
      <figcaption className="grid gap-0.5 px-1">
        <span className="font-semibold">{NAMES[v]}</span>
        <span className="text-sm text-muted-foreground">{VARIANT_USE[v]}</span>
        <Files links={links} />
      </figcaption>
    </figure>
  )
}

function Section({ id: sid, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    // base-ui.com's page: the section's name in the rail, the section from column 4 (DESIGN.md, Grid).
    <section aria-labelledby={sid} className="span-wide grid grid-cols-subgrid gap-y-6">
      <h2 id={sid} className="span-rail text-4xl">
        {title}
      </h2>
      <div className={cn("span-main grid min-w-0 gap-6", className)}>{children}</div>
    </section>
  )
}

/** A "don't", drawn with the real mark, and an X in ink (pink is never the error colour). */
function Dont({ caption, children, ground }: { caption: string; children: React.ReactNode; ground?: React.CSSProperties }) {
  return (
    <figure className="grid gap-2">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[28px] ring-1 ring-border ring-inset" style={{ background: light, ...ground }}>
        {children}
        <svg viewBox="0 0 24 24" className="absolute top-3 right-3 size-6 rounded-full p-1" style={{ background: light, color: "#000" }} aria-hidden>
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      </div>
      <figcaption className="px-1 text-sm">{caption}</figcaption>
    </figure>
  )
}

const VOICE: { rule: string; yes: string; no: string; never?: boolean }[] = [
  { rule: "Short and concrete", yes: "Learn leadership by doing.", no: "Unlock your leadership journey.", never: true },
  { rule: "A number gets a label, not a sentence", yes: "0 of 24 lessons passed", no: "You haven’t passed a lesson yet, but every one you finish brings you closer to mastery!" },
  { rule: "Grade honestly, with the reason", yes: "Costly. More money into the course you chose, without asking whether it is still the right one.", no: "Great choice!" },
  { rule: "Say so when nothing leads", yes: "No clear lead. Your answers spread across the map.", no: "You’re a natural Collaborator!" },
  { rule: "Dry, never cute", yes: "No lesson at this address. There are twenty-four.", no: "Oops! Looks like you got lost." },
]

const TYPE: { face: string; use: string; className: string; sample: React.ReactNode; url: string }[] = [
  { face: "Noticia Text", use: "Headlines", className: "font-serif text-4xl", sample: <>Learn <em>leadership</em> by doing</>, url: "https://fonts.google.com/specimen/Noticia+Text" },
  { face: "Instrument Sans", use: "Text, buttons, numbers", className: "text-2xl", sample: "24 hands-on lessons. Free, no sign-up.", url: "https://fonts.google.com/specimen/Instrument+Sans" },
  { face: "Funnel Display", use: "The wordmark, already outlined", className: "", sample: <Wordmark className="h-7" />, url: "https://fonts.google.com/specimen/Funnel+Display" },
  { face: "Martian Mono", use: "Labels in the home drawing", className: "text-xl [font-family:var(--font-martian)]", sample: "Efficiency and depth", url: "https://fonts.google.com/specimen/Martian+Mono" },
]

function Banner({ b, light, dark }: { b: (typeof BANNERS)[number]; light: KitEntry; dark?: KitEntry }) {
  const links: [string, string][] = dark ? [["Light", light.url], ["Dark", dark.url]] : [["PNG", light.url]]
  return (
    <figure className="grid content-start gap-2">
      <div className={cn("overflow-hidden ring-1 ring-border", b.kind === "avatar" ? "rounded-full" : "rounded-2xl")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={light.url} alt={b.use} loading="lazy" width={b.w} height={b.h} className="block h-auto w-full" />
      </div>
      <figcaption className="grid gap-0.5 px-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-semibold">{b.use}</span>
          <span className="font-mono text-xs text-muted-foreground tnum">
            {b.w}×{b.h}
          </span>
        </span>
        <Files links={links} />
      </figcaption>
    </figure>
  )
}

const SWATCHES = ["background", "card", "foreground", "muted-foreground", "border", "signal", "signal-text"]

export default function BrandPage() {
  // One entry per format: the light file, with its dark twin when there is one.
  const formats = BANNERS.filter((b) => b.theme === "light" && file(`social/${b.id}.png`)).map((b) => ({
    b,
    light: file(`social/${b.id}.png`)!,
    dark: file(`social/${b.id}-dark.png`),
  }))
  return (
    <div className="page">
      <header className="span-head grid justify-items-start gap-4">
        <LogoMark className="size-16" />
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">Brand</h1>
        <p className="text-lg text-muted-foreground">The mark, the name, colour, type and voice.</p>
        {kit && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <a href={kit.zip.url} download>
                <ArrowDown className="size-4" /> Download the kit <span className="font-normal opacity-70">{mb(kit.zip.bytes)}</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={at("kit.json")}>kit.json</a>
            </Button>
          </div>
        )}
      </header>

      <Section id="mark-h" title="The mark">
        <div className="grid grid-cols-2 gap-x-(--gutter) gap-y-6 lg:grid-cols-3">
          {(["color", "reversed", "black", "white", "tile"] as MarkVariant[]).map((v) => (
            <Variant key={v} v={v} kind="mark" />
          ))}
        </div>
      </Section>

      <Section id="name-h" title="The name">
        <div className="grid gap-x-(--gutter) gap-y-6 sm:grid-cols-2">
          {LOGO_VARIANTS.map((v: LogoVariant) => (
            <Variant key={v} v={v} kind="lockup" />
          ))}
        </div>
      </Section>

      <Section id="space-h" title="Room and size">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <figure className="grid gap-3">
            <div className="grid place-items-center rounded-[28px] p-6 ring-1 ring-border ring-inset sm:p-10" style={{ background: light }}>
              {/* The clear space, drawn: the tinted band is a quarter of the mark's height on every side. */}
              <div className="relative bg-signal-soft outline-1 outline-dashed outline-signal" style={{ padding: `calc(64px * ${CLEAR_SPACE})` }}>
                <div style={{ background: light }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={at(`logo/${id}-lockup-color.svg`)} alt={`${BRAND.name} lockup with its clear space`} className="block h-16 w-auto max-w-full" />
                </div>
              </div>
            </div>
            <figcaption className="px-1 text-sm text-muted-foreground">Keep a quarter of the mark’s height clear on every side.</figcaption>
          </figure>
          <figure className="grid gap-3">
            <div className="grid content-center gap-5 rounded-[28px] bg-card p-6 sm:p-10">
              {(
                [
                  ["Mark", MIN_SIZE.mark, <LogoMark key="m" className="shrink-0" />],
                  ["Wordmark", MIN_SIZE.wordmark, <Wordmark key="w" />],
                ] as [string, number, React.ReactElement][]
              ).map(([what, px, el]) => (
                <div key={what} className="flex items-center justify-between gap-4">
                  <span className="flex items-center [&_svg]:!h-[var(--h)] [&_svg]:!w-auto" style={{ ["--h" as string]: `${px}px` }}>
                    {el}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground tnum">
                    {what} {px} px
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="px-1 text-sm text-muted-foreground">The smallest it goes, at actual size.</figcaption>
          </figure>
        </div>
      </Section>

      <Section id="dont-h" title="Don’t">
        <div className="grid grid-cols-2 gap-x-(--gutter) gap-y-6 sm:grid-cols-3">
          <Dont caption="Stretch it">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={at(`mark/${id}-mark-color.svg`)} alt="" className="size-16" style={{ transform: "scaleX(1.7)" }} />
          </Dont>
          <Dont caption="Recolour it">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={at(`mark/${id}-mark-color.svg`)} alt="" className="size-20 [filter:hue-rotate(150deg)_saturate(1.4)]" />
          </Dont>
          <Dont caption="Outline it">
            <LogoMark className="size-20 [&_*]:![fill:none] [&_*]:stroke-black [&_*]:[stroke-width:2.5]" />
          </Dont>
          <Dont caption="Straighten the card">
            <LogoMark className="size-20 [&_g]:![transform:none]" />
          </Dont>
          <Dont caption="Put it on a busy picture" ground={{ backgroundImage: `url(${at("social/github-social-1280x640.png")})`, backgroundSize: "260%", backgroundPosition: "78% 55%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={at(`mark/${id}-mark-color.svg`)} alt="" className="size-16" />
          </Dont>
        </div>
      </Section>

      {tokens && (
        <Section id="colour-h" title="Colour">
          <p className="max-w-[56ch] text-muted-foreground">Paper and ink carry the page. Pink marks one thing per view and is never an error.</p>
          <ul className="divide-y divide-border border-y border-border">
            {SWATCHES.filter((n) => tokens.light[n]).map((n) => {
              const l = tokens.light[n]
              const d = tokens.dark[n]
              return (
                <li key={n} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
                  <span className="flex" aria-hidden>
                    <span className="size-11 rounded-l-full ring-1 ring-border ring-inset" style={{ background: l.hex }} />
                    <span className="size-11 rounded-r-full ring-1 ring-border ring-inset" style={{ background: d?.hex }} />
                  </span>
                  <span className="grid">
                    <span className="font-semibold">{l.role}</span>
                    <span className="font-mono text-xs text-muted-foreground tnum">
                      RGB {l.rgb.join(" ")} · CMYK≈ {l.cmykApprox.join(" ")}
                    </span>
                  </span>
                  <span className="col-start-2 flex gap-1 sm:col-start-auto">
                    <CopyValue value={l.hex} label={`${l.role}, light`} />
                    {d && <CopyValue value={d.hex} label={`${l.role}, dark`} className="text-muted-foreground" />}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="text-sm text-muted-foreground">
            Light, then dark. CMYK is an approximation without a print profile.{" "}
            {tokens.contrast.every((c) => c.passes) && <>Every text pair passes WCAG AA in both modes.</>}{" "}
            <a href={at("colors/colors.md")} className="font-semibold text-foreground underline-offset-4 hover:underline">
              All values and ratios
            </a>
          </p>
        </Section>
      )}

      <Section id="type-h" title="Type">
        <ul className="divide-y divide-border border-y border-border">
          {TYPE.map((t) => (
            <li key={t.face} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_calc(3*var(--col)+2*var(--gutter))] sm:items-center sm:gap-x-(--gutter)">
              <span className={cn("leading-tight", t.className)}>{t.sample}</span>
              <span className="grid text-sm">
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
                  {t.face}
                </a>
                <span className="text-muted-foreground">{t.use}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          All four are free under the{" "}
          <a href="https://openfontlicense.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline-offset-4 hover:underline">
            SIL Open Font License
          </a>
          .
        </p>
      </Section>

      <Section id="voice-h" title="Voice">
        <p className="max-w-[56ch] text-muted-foreground">A sharp colleague’s notes. Short, concrete, a little dry.</p>
        <ul className="grid gap-(--gutter) sm:grid-cols-2">
          {VOICE.map((x) => (
            <li key={x.rule} className="grid content-start gap-3 rounded-[28px] bg-card p-5 sm:p-6">
              <span className="font-semibold">{x.rule}</span>
              <p className="font-serif text-xl leading-snug">{x.yes}</p>
              <p className="text-muted-foreground">
                {x.never ? <s data-never="">{x.no}</s> : <s>{x.no}</s>}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="banners-h" title="Banners">
        <div className="grid gap-x-(--gutter) gap-y-8 md:grid-cols-2">
          {formats.filter((f) => f.b.kind === "wide").map((f) => (
            <Banner key={f.b.id} {...f} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-(--gutter) gap-y-8 lg:grid-cols-3">
          {formats.filter((f) => f.b.kind !== "wide").map((f) => (
            <Banner key={f.b.id} {...f} />
          ))}
        </div>
      </Section>

      {kit && (
        <p className="font-mono text-xs text-muted-foreground tnum">
          {kit.files.length} files · kit {kit.version.commit} · {kit.version.date} · SVG is the vector master
        </p>
      )}
    </div>
  )
}
