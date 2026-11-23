import { CardLabel, ShareCard, type TitleSize } from "@/components/og/share-card"
import type { Framework, Session } from "@/data/course"
import { frameworkHeading } from "@/lib/seo"
import { cn } from "@/lib/utils"

/*
  A framework page's share card (public/og/framework-<id>.png, drawn by scripts/make-og.ts from /og/framework/<id>/):
  the name people search for, the framework in a line, and its parts, so a shared link shows the framework itself and
  not the lesson it sits in.
*/

/** A part's name, with a leading step number set apart ("1 Establish urgency"); a row that is only a number reads its second cell. */
function part(r: [string, string]) {
  if (/^\d+$/.test(r[0])) return { no: r[0], name: r[1] }
  const m = /^(\d+) (.+)$/.exec(r[0])
  return m ? { no: m[1], name: m[2] } : { no: "", name: r[0] }
}

export function FrameworkShareCard({ f, s }: { f: Framework; s: Session }) {
  const heading = frameworkHeading(f)
  const size: TitleSize = heading.length <= 18 ? "lg" : heading.length <= 30 ? "md" : heading.length <= 44 ? "sm" : "xs"
  // A table of short pairs (management and leadership, follower readiness and style) shows both cells; otherwise the parts.
  const pairs = !!f.head && f.rows.every((r) => r[1] && r[1].length <= 30 && !/^\d+$/.test(r[0]))
  const n = f.rows.length
  // With few parts the card has room for what each one means: up to three, or four that each fit on a line.
  const glossed = !pairs && f.rows.every((r) => r[1] && !/^\d+$/.test(r[0])) && (n <= 3 || (n === 4 && f.rows.every((r) => r[1].length <= 44)))
  const text = n <= 4 ? "text-[24px]" : n <= 6 ? "text-[21px]" : n <= 9 ? "text-[19px]" : "text-[17px]"
  const pad = n <= 6 ? "py-3" : n <= 9 ? "py-2" : "py-1.5"
  return (
    <ShareCard kicker={f.by} title={heading} size={size} line={f.one} foot={`Try it in lesson ${s.n}, ${s.title}`}>
      <div className="grid gap-3">
        <CardLabel>{pairs ? `${f.head![0]} · ${f.head![1].toLowerCase()}` : `${n} parts`}</CardLabel>
        <ol className="grid">
          {f.rows.map((r, i) => {
            const p = part(r)
            return (
              <li key={i} className={cn("grid items-baseline gap-x-4 border-b border-border leading-snug last:border-b-0", text, pad, pairs ? "grid-cols-2" : p.no ? "grid-cols-[1.4em_minmax(0,1fr)]" : "grid-cols-1")}>
                {pairs ? (
                  <>
                    <span className="font-semibold">{r[0]}</span>
                    <span className="text-muted-foreground">{r[1]}</span>
                  </>
                ) : (
                  <>
                    {p.no && <span className="text-muted-foreground tnum">{p.no}</span>}
                    <span className="grid gap-1">
                      <span className="font-semibold">{p.name}</span>
                      {glossed && <span className="text-[19px] leading-snug text-muted-foreground">{r[1]}</span>}
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </ShareCard>
  )
}
