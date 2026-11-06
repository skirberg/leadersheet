import { cn } from "@/lib/utils"

/** The title block from an architect's drawing sheet. Every session is a sheet. */
export function TitleBlock({
  cells,
  className,
}: {
  cells: { k: string; v: React.ReactNode; wide?: boolean }[]
  className?: string
}) {
  return (
    <dl className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted-foreground", className)}>
      {cells.map((c) => (
        <div key={c.k} className="flex items-center gap-2 after:content-['·'] last:after:content-none">
          <dt className="sr-only">{c.k}</dt>
          <dd className="tnum">{c.v}</dd>
        </div>
      ))}
    </dl>
  )
}
