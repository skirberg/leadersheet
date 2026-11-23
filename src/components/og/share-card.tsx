import { Wordmark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"
import { cn } from "@/lib/utils"

/*
  The share card layout every page card uses (1200 x 630, drawn by scripts/make-og.ts): on the left the wordmark, a
  kicker in the words people search, the title with one phrase in the serif italic, a line, and a foot that says what
  you get; on the right, the page's own content on a white card. The same frame as the Team math and result cards.
*/

/** A title split around its one emphasized phrase: [before, phrase, after]. */
export type Title = [string, string, string]

const SIZES = { xl: "text-[96px]", lg: "text-[84px]", md: "text-[72px]", sm: "text-[60px]", xs: "text-[52px]" } as const
export type TitleSize = keyof typeof SIZES

export function ShareCard({
  kicker,
  title,
  size = "lg",
  line,
  foot,
  narrow,
  panel,
  children,
}: {
  kicker: string
  title: Title | string
  size?: TitleSize
  line?: string
  foot: string
  /** A 500 px text column, for a panel that needs the room (a question and its choices). */
  narrow?: boolean
  panel?: string
  children: React.ReactNode
}) {
  const [pre, word, post] = typeof title === "string" ? [title, "", ""] : title
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className={cn("relative grid h-[630px] w-[1200px] items-center gap-10 p-14", narrow ? "grid-cols-[500px_1fr]" : "grid-cols-[560px_1fr]")}>
        <div className="flex h-full flex-col justify-between">
          <Wordmark className="h-[30px] self-start" />
          <div className="grid gap-5">
            <p className="text-[24px] leading-snug text-muted-foreground">{kicker}</p>
            {/* The leading comes after the size: tailwind-merge drops a leading class that comes before a text size. A "\n" in the title sets its line break. */}
            <p className={cn("font-serif whitespace-pre-line", SIZES[size], "leading-[1.04]")}>
              {pre}
              {word && <Emphasis>{word}</Emphasis>}
              {post}
            </p>
            {line && <p className="text-[24px] leading-snug text-pretty text-muted-foreground">{line}</p>}
          </div>
          <p className="text-[22px] text-muted-foreground">{foot}</p>
        </div>
        <div className={cn("rounded-[40px] bg-card p-8", panel)}>{children}</div>
      </div>
    </div>
  )
}

/** A label at card size, in sentence case: share cards carry no all-caps text (the owner, 22 November 2026). */
export function CardLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[18px] leading-tight font-semibold text-muted-foreground tnum", className)}>{children}</p>
}
