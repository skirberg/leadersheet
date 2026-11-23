// Today's call paints its case before any bundle runs: a few lines of script pick the visitor's day's case from the
// ones the page holds hidden. The script copies callNumber and callIndex, so it must agree with them on every day.
import { test } from "node:test"
import assert from "node:assert/strict"
import { CASES } from "../src/data/cases.ts"
import { FIRST_CALL, callIndex, callNumber, callScript } from "../src/data/daily.ts"

type Picked = { index: number; hidden: boolean; line: string }
/** Runs the page's script on a given local date and time, against a stand-in for the page. */
function runAt(when: Date): Picked {
  const RealDate = Date
  const picked: Picked = { index: -1, hidden: true, line: "" }
  const line = {
    set textContent(v: string) {
      picked.line = v
    },
  }
  const el = {
    set hidden(v: boolean) {
      picked.hidden = v
    },
    querySelector: () => line,
  }
  class At extends RealDate {
    constructor(...a: ConstructorParameters<typeof Date> | []) {
      super(...((a.length ? a : [when.getTime()]) as [number]))
    }
  }
  const g = globalThis as unknown as { Date: DateConstructor; document?: unknown }
  g.Date = At as unknown as DateConstructor
  g.document = { querySelector: (sel: string) => ((picked.index = Number(/data-call="(\d+)"/.exec(sel)?.[1])), el) }
  try {
    new Function(callScript(CASES.length))()
  } finally {
    g.Date = RealDate
    delete g.document
  }
  return picked
}

test("the painted case is the live call's case, every day for two years, morning and late at night", () => {
  for (let k = -3; k < 731; k++) {
    for (const hour of [0, 7, 23]) {
      const d = new Date(FIRST_CALL)
      d.setDate(d.getDate() + k)
      d.setHours(hour, hour === 23 ? 59 : 1)
      const n = callNumber(d)
      const got = runAt(d)
      assert.equal(got.index, callIndex(n, CASES.length), `${d.toString()}: case`)
      assert.equal(got.hidden, false)
      assert.ok(got.line.startsWith(`No. ${n} · `), `${d.toString()}: "${got.line}"`)
    }
  }
})
