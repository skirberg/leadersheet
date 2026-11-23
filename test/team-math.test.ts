// Team math: the counts the game shows and the verdicts it gives.
import { test } from "node:test"
import assert from "node:assert/strict"
import { ROUNDS, added, busiest, lightest, maxPods, pairs, podSizes, splitLines, teamShareText, verdict } from "../src/lib/team-math.ts"
import { CASES } from "../src/data/cases.ts"

test("lines between people are n(n-1)/2", () => {
  assert.deepEqual([3, 6, 12, 14, 20].map(pairs), [3, 15, 66, 91, 190])
  assert.equal(added(14), 13)
})

test("a team splits as evenly as it goes", () => {
  assert.deepEqual(podSizes(14, 3), [5, 5, 4])
  assert.deepEqual(podSizes(20, 6), [4, 4, 3, 3, 3, 3])
  assert.deepEqual(podSizes(5, 9), [1, 1, 1, 1, 1])
  assert.deepEqual(podSizes(9, 0), [9])
  for (const n of [3, 9, 14, 20]) for (let p = 1; p <= maxPods(n); p++) assert.equal(podSizes(n, p).reduce((a, b) => a + b, 0), n)
})

test("split lines match lesson 6's decision case", () => {
  // The case quotes 91 for one team, 29 for pods of five and 23 for pods of three.
  const quoted = CASES.find((c) => c.sheet === "s6")!.choices.map((c) => c.then).join(" ")
  assert.equal(splitLines(14, 1), 91)
  assert.equal(splitLines(14, 3), 29)
  assert.equal(splitLines(14, 5), 23)
  for (const n of ["91", "29", "23"]) assert.ok(quoted.includes(n), `lesson 6 quotes ${n}`)
})

test("the busiest person is a lead of the biggest pod", () => {
  assert.equal(busiest(20, 1), 19)
  assert.equal(busiest(20, 2), 10)
  assert.equal(busiest(20, 4), 7)
  assert.equal(busiest(20, 10), 10)
})

test("the lightest split sits in the middle, not at either end", () => {
  assert.deepEqual(lightest(9), { busiest: 4, pods: [3] })
  assert.deepEqual(lightest(14), { busiest: 6, pods: [3, 4, 5] })
  assert.deepEqual(lightest(20), { busiest: 7, pods: [4, 5] })
  for (const n of ROUNDS) {
    const best = lightest(n)
    assert.ok(!best.pods.includes(1) && !best.pods.includes(maxPods(n)), `team of ${n}: neither one team nor pairs is lightest`)
  }
})

test("verdicts", () => {
  assert.equal(verdict(20, 4), "lightest")
  assert.equal(verdict(20, 3), "close")
  assert.equal(verdict(20, 1), "heavy")
})

test("share text names the last split and the score", () => {
  assert.equal(teamShareText(2, { n: 20, p: 4 }), "I split a team of 20 so nobody keeps up with more than 7 people (2 of 3 as light as it gets). Team math: how many lines does a team keep up?")
  assert.equal(teamShareText(0, undefined), "Team math: how many lines does a team keep up?")
})
