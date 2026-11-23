// Your sheet: what it reads from the store, the link that carries it, and the words that go with it.
import { test } from "node:test"
import assert from "node:assert/strict"
import { SHEET_GAMES, decodeSheet, encodeSheet, gradeCount, isEmpty, sheetFrom, sheetShareText, type Stored } from "../src/lib/sheet.ts"
import { SESSIONS } from "../src/data/course.ts"
import { SPREAD } from "../src/data/results.ts"

const empty: Stored = { best: {}, seen: {}, lab: {} }
const full: Stored = {
  best: { s1: 3, s2: 3, s3: 2, s12: 3 },
  seen: { s1: 1, s2: 1, s3: 1, s12: 1, s9: 1 },
  lab: {
    "case-s1": 1,
    "case-s6": 1,
    "case-s7": 0,
    "case-s12": 0,
    "case-s99": 2,
    "case-s2": 42,
    "g-decide": "Consult",
    "g-conflict": SPREAD,
    "g-style": "Not a style",
    "g-values": {
      picked: ["Honesty", "Family", "Growth", "Fun", "Courage", "Health", "Wealth", "Kindness", "Learning", "Purpose"],
      ranked: ["Honesty", "Family", "Growth", "Fun", "Courage"],
      week: { Honesty: 3, Family: 1, Growth: 0, Fun: 0, Courage: 0 },
      at: "2026-11-20",
    },
    "g-mirror": [
      { by: "Alex", seen: ["Honesty", "Courage", "Kindness", "Fun", "Loyalty"], of: ["Honesty", "Family", "Growth", "Fun", "Courage"], at: "2026-11-20" },
      { by: "Bo", seen: ["Honesty", "Family", "Wisdom", "Fun", "Respect"], of: ["Honesty", "Family", "Growth", "Fun", "Courage"], at: "2026-11-20" },
    ],
    "g-bias-best": 14,
    "g-climb-best": 9400,
    "g-team-best": 2,
    // Today's call log: call 1 is lesson 1's case, call 2 is seven lessons on; one strong call, one that is not.
    daily: { 1: { i: 1, sure: 0 }, 2: { i: 0, sure: 2 }, x: { i: 0 }, 3: { i: 99 } },
  },
}

test("an empty store makes an empty sheet", () => {
  const d = sheetFrom(empty)
  assert.ok(isEmpty(d))
  assert.equal(sheetShareText(d), "Leadersheet: learn leadership by doing.")
})

test("the sheet reads only what checks out", () => {
  const d = sheetFrom(full, 4)
  assert.deepEqual(d.passed, ["s1", "s2", "s12"])
  assert.equal(d.opened, 5)
  // Course order (s12 is the last lesson); an unknown lesson and an out-of-range choice are left off.
  assert.deepEqual(d.calls, [{ sheet: "s1", choice: 1 }, { sheet: "s6", choice: 1 }, { sheet: "s7", choice: 0 }, { sheet: "s12", choice: 0 }])
  assert.deepEqual(d.styles, { decide: "Consult", conflict: SPREAD })
  assert.deepEqual(d.values, { five: ["Honesty", "Family", "Growth", "Fun", "Courage"], agrees: true })
  assert.deepEqual(d.seen, { people: 2, top: ["Honesty", "Fun", "Family"] })
  assert.deepEqual(d.games, { bias: 14, climb: 9400, team: 2 })
  assert.equal(d.daily.made, 2, "two calls made; a malformed number and a choice out of range are left off")
  assert.ok(d.daily.strong <= 2)
  assert.equal(d.streak, 4)
  assert.ok(!isEmpty(d))
  const g = gradeCount(d.calls)
  assert.equal(g.strong + g.tradeoff + g.costly, 4)
})

test("a sheet survives the trip through a link", () => {
  const d = sheetFrom(full, 4)
  const hash = encodeSheet(d, "Sam")
  assert.ok(hash.length < 200, `${hash.length} characters`)
  assert.ok(!hash.includes("Alex") && !hash.includes("Bo"), "no names of the people who answered the mirror")
  const back = decodeSheet(hash)!
  assert.equal(back.name, "Sam")
  assert.deepEqual(back.data, d)
})

test("every lesson and every result key round-trips", () => {
  const all: Stored = { best: Object.fromEntries(SESSIONS.map((s) => [s.id, 3])), seen: Object.fromEntries(SESSIONS.map((s) => [s.id, 1])), lab: {} }
  for (const s of SESSIONS) all.lab[`case-${s.id}`] = 0
  const d = sheetFrom(all)
  assert.deepEqual(decodeSheet(encodeSheet(d))!.data, d)
  for (const g of SHEET_GAMES) {
    for (const k of ["Tell", SPREAD]) {
      const one = sheetFrom({ ...empty, lab: { [`g-${g}`]: k } })
      assert.deepEqual(decodeSheet(encodeSheet(one))!.data.styles, one.styles)
    }
  }
})

test("a link edited by hand loses only what no longer checks out", () => {
  assert.equal(decodeSheet("#v=abcde"), null)
  const d = decodeSheet("#sheet=1&p=zzzzzzzzzzzz&c=9x0&q=z&v=aab&m=x&b=-4&k=abc&t=9&d=1.5&n=" + "x".repeat(40))!
  assert.deepEqual(d.data.passed, [])
  assert.deepEqual(d.data.calls, [{ sheet: SESSIONS[2].id, choice: 0 }])
  assert.deepEqual(d.data.styles, {})
  assert.equal(d.data.values, null)
  assert.equal(d.data.seen, null)
  assert.deepEqual(d.data.games, { bias: undefined, climb: undefined, team: undefined })
  assert.deepEqual(decodeSheet("#sheet=1&y=2.5")!.data.daily, { made: 0, strong: 0 }, "more strong calls than calls is refused")
  assert.equal(d.data.streak, 0)
  assert.equal(d.name.length, 24)
})

test("share text says what is on the sheet in a line", () => {
  assert.equal(sheetShareText(sheetFrom(full)), "My sheet on Leadersheet: 3 of 24 lessons passed, 2 strong calls in 4, I decide: Consult.")
  assert.equal(sheetShareText(sheetFrom({ ...empty, lab: { "g-decide": SPREAD } })), "My sheet on Leadersheet: I decide: No single way.")
})
