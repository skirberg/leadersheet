import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Wordmark } from "@/brand"
import { BANNERS, bannerById } from "@/brand/kit"
import { Emphasis } from "@/components/brand/emphasis"
import { CARD_FACE_CLASS, CardFace, cardTilt } from "@/components/learn/hero-cards"
import { cn } from "@/lib/utils"

// Source for the kit's social images, public/brand/social/<id>.png (scripts/make-brand-kit.ts). The headline is the
// home page's, and the cards are the home page's own lesson cards. Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Banner", robots: { index: false, follow: false } }
export const dynamicParams = false
export function generateStaticParams() {
  return BANNERS.filter((b) => b.kind !== "avatar").map((b) => ({ art: b.id }))
}

// A home-page card is 184 x 248 with 16 px between cards; the tilt and stagger add about 64 px of height.
const CARD_W = 184
const GAP = 16
const strip = (n: number) => ({ w: n * CARD_W + (n - 1) * GAP + 40, h: 248 + 64 })

function Cards({ cards, w, h }: { cards: number[]; w: number; h: number }) {
  const s = strip(cards.length)
  const k = Math.min(w / s.w, h / s.h)
  return (
    <div className="relative shrink-0" style={{ width: w, height: h }} aria-hidden>
      {/* Centred on the box, then scaled about its own centre, so a strip wider than the box still lands in it. */}
      <ol className="absolute top-1/2 left-1/2 flex [perspective:1400px]" style={{ gap: GAP, transform: `translate(-50%, -50%) scale(${k})` }}>
        {cards.map((i) => (
          <li key={i} className="shrink-0" style={{ transform: cardTilt(i), transformStyle: "preserve-3d" }}>
            <div className={CARD_FACE_CLASS}>
              <CardFace i={i} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

const Headline = ({ size, className }: { size: number; className?: string }) => (
  <h1 className={cn("leading-[1.04]", className)} style={{ fontSize: size }}>
    Learn <Emphasis>leadership</Emphasis> by doing
  </h1>
)

export default async function BannerArt({ params }: { params: Promise<{ art: string }> }) {
  const { art } = await params
  const b = bannerById(art)
  if (!b || b.kind === "avatar") notFound()
  const [x, y, w, h] = b.safe
  const [head, mark] = b.type
  return (
    <div className={cn("fixed inset-0 z-[100] bg-background text-foreground", b.theme === "dark" && "dark")}>
      <div className="relative overflow-hidden bg-background" style={{ width: b.w, height: b.h }}>
        {b.kind === "wide" ? (
          <div className="absolute flex items-center" style={{ left: x, top: y, width: w, height: h, gap: w * 0.04 }}>
            <div className="grid shrink-0 content-center" style={{ width: w * 0.4, gap: mark * 0.9 }}>
              <div className="flex self-start" style={{ height: mark }}>
                <Wordmark className="h-full" />
              </div>
              <Headline size={head} className="max-w-[12ch]" />
            </div>
            <Cards cards={b.cards} w={w * 0.56} h={h} />
          </div>
        ) : (
          <div className="absolute grid content-center justify-items-center text-center" style={{ left: x, top: y, width: w, height: h, gap: mark * 1.6 }}>
            <div className="flex" style={{ height: mark }}>
              <Wordmark className="h-full" />
            </div>
            <Headline size={head} className="max-w-[10ch]" />
            <Cards cards={b.cards} w={w} h={h * 0.5} />
          </div>
        )}
      </div>
    </div>
  )
}
