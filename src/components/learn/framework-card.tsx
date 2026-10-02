import { type Framework, sheetNo } from "@/data/course"
import { cn } from "@/lib/utils"

export function FrameworkCard({ f, className, compact }: { f: Framework; className?: string; compact?: boolean }) {
  return (
    <article id={`fw-${f.id}`} data-fw={f.id} className={cn("corners scroll-mt-24 border border-border bg-card", className)}>
      <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-[17px] leading-tight font-semibold">{f.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{f.by}</p>
        </div>
        <span className="label-mono shrink-0 pt-0.5">{sheetNo(f.s)}</span>
      </header>
      <p className={cn("px-4 pt-3 text-[15px] font-medium", compact && "text-sm")}>{f.one}</p>
      <div className="overflow-x-auto px-4 pt-2 pb-3">
        <table className="w-full border-collapse text-sm">
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
                <td className={cn("py-2 pr-3 font-semibold", r[1] ? "w-[40%]" : "")}>{r[0]}</td>
                {r[1] ? <td className="py-2 text-muted-foreground">{r[1]}</td> : <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
