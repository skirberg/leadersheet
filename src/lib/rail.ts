/*
  The words a framework rail and a result's screen-reader line are made of, kept free of React so the tests can check
  them for every case (test/rail.test.ts).
*/
import type { Framework } from "@/data/course"

/* Frameworks whose two columns are two sides of one row (management and leadership), not a name and a gloss. */
export const PAIRED = new Set(["kotter-lm", "ties", "trampoline"])

/** A row as a name and a short gloss: "Organizing and staffing" / "Leadership: Aligning people". */
export function rowParts(f: Pick<Framework, "id" | "rows" | "head">, row: number): { name: string; gloss: string } {
  const r = f.rows[row]
  if (!r) return { name: "", gloss: "" }
  if (/^\d+$/.test(r[0])) return { name: r[1], gloss: `Point ${r[0]} of ${f.rows.length}` }
  if (f.head && PAIRED.has(f.id)) return { name: r[0], gloss: r[1] ? `${f.head[1]}: ${r[1]}` : "" }
  return { name: r[0], gloss: r[1] }
}

/** The chosen row in a sentence, for screen readers and share text: "Step 1: Establish urgency. Error: not enough urgency." */
export function rowLine(id: string, head: [string, string] | undefined, r: [string, string]) {
  if (head && PAIRED.has(id)) return `${head[0]}: ${r[0]}. ${head[1]}: ${r[1]}.`
  if (/^\d+$/.test(r[0])) return `Point ${r[0]} on the line: ${r[1]}.`
  const step = /^(\d+) (.+)$/.exec(r[0])
  const name = step ? `${id === "ladder" ? "Rung" : "Step"} ${step[1]}: ${step[2]}` : r[0]
  if (!r[1]) return `${name}.`
  return step ? `${name}. ${r[1]}.` : `${name}: ${r[1]}.`
}
