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
    <dl
      className={cn(
        "grid grid-cols-2 border-t border-l border-rule/60 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none",
        className
      )}
    >
      {cells.map((c) => (
        <div
          key={c.k}
          className={cn("min-w-0 border-r border-b border-rule/60 px-3 py-2", c.wide && "col-span-2 sm:col-span-1")}
        >
          <dt className="label-mono !text-[10px]">{c.k}</dt>
          <dd className="mt-0.5 truncate font-mono text-[13px] font-medium tnum">{c.v}</dd>
        </div>
      ))}
    </dl>
  )
}
