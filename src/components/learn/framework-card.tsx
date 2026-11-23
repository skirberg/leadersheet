import Link from "next/link"
import { type Framework } from "@/data/course"
import { cn } from "@/lib/utils"

/** A row that opens with its step number ("1 Establish urgency") sets the number apart, so it never reads as part of the word. */
function StepName({ name }: { name: string }) {
  const m = /^(\d+) (.+)$/.exec(name)
  if (!m) return <>{name}</>
  return (
    <span className="grid grid-cols-[1rem_minmax(0,1fr)] gap-0.5">
      <span className="font-mono text-xs leading-5 font-medium text-muted-foreground tnum">{m[1]}</span>
      <span>{m[2]}</span>
    </span>
  )
}

/**
 * `rows={false}` leaves the table out, for a lesson whose model already lays out every row. `name` replaces the
 * framework's own name where the card is a link people should be able to read as a search ("Kotter’s 8 steps of change").
 */
export function FrameworkCard({ f, className, compact, href, rows = true, name }: { f: Framework; className?: string; compact?: boolean; href?: string; rows?: boolean; name?: string }) {
  return (
    <article id={`fw-${f.id}`} data-fw={f.id} className={cn("rounded-2xl scroll-mt-24 bg-card", className)}>
      {/* With a link, the whole header (at least 44 px tall) is its touch target: the link's ::after covers it. */}
      <header className={cn("flex min-h-11 items-start justify-between gap-4 border-b border-border px-5 py-3 sm:px-6", href && "relative")}>
        <div className="min-w-0">
          <h3 className="text-xl leading-tight font-semibold">
            {href ? (
              <Link href={href} className="underline-offset-4 after:absolute after:inset-0 after:rounded-t-2xl after:content-[''] hover:underline">
                {name ?? f.name}
              </Link>
            ) : (
              f.name
            )}
          </h3>
          <p className="label-mono mt-1">{f.by}</p>
        </div>
      </header>
      <p className={cn("px-5 pt-3 text-base font-medium sm:px-6", compact && "text-sm", !rows && "pb-4")}>{f.one}</p>
      {rows && <FrameworkTable f={f} className="px-5 pt-2 pb-3 sm:px-6" />}
    </article>
  )
}

/** The framework's rows as a table: the part, then what it means. */
export function FrameworkTable({ f, className }: { f: Framework; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-base">
        {f.head && (
          <thead>
            <tr>
              <th className="label-mono py-2 pr-3 text-left !font-normal">{f.head[0]}</th>
              <th className="label-mono py-2 text-left !font-normal">{f.head[1]}</th>
            </tr>
          </thead>
        )}
        <tbody>
          {f.rows.map((r, i) => (
            <tr key={i} className="border-t border-border/80 align-top">
              <td className={cn("py-2 pr-3 font-semibold", r[1] ? "w-[40%]" : "")}>
                <StepName name={r[0]} />
              </td>
              {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- an empty table cell, not a control */}
              {r[1] ? <td className="py-2">{r[1]}</td> : <td />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
