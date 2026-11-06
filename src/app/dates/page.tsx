import type { Metadata } from "next"
import { C } from "@/data/course"
import { Timeline } from "./timeline"
import { ClassModeToggle } from "@/components/learn/class-only"

export const metadata: Metadata = { title: "Dates", description: "Class mode: the class schedule and what is due before each class." }

export default function DatesPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-10 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid justify-items-center gap-3 pb-2 text-center">
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">The schedule</h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">
          Adds the class schedule and what’s due to every lesson.
        </p>
        <ClassModeToggle className="w-fit" />
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="sch-h" className="grid content-start gap-4">
          <h2 id="sch-h" className="label-mono">
            Twelve classes
          </h2>
          <Timeline />
        </section>
        <aside className="grid content-start gap-10">
          <section aria-labelledby="hr-h" className="rounded-2xl grid gap-3 bg-card p-5">
            <h2 id="hr-h" className="text-xl">
              How the course works
            </h2>
            <ul className="divide-y divide-border">
              {C.rules.map((r) => (
                <li key={r} className="py-3 text-[15px]">
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
