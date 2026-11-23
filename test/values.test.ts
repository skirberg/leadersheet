// The values card sort keeps its result, and the mirror's answer comes back as a link.
import { test } from "node:test"
import assert from "node:assert/strict"
import { VALUES, addMirrorAnswer, mirrorBackHash, mirrorHash, mirrorMatch, mostSeen, readMirror, readMirrorAnswers, readMirrorBack, readValues } from "../src/data/games.ts"

const picked = VALUES.slice(0, 10)
const ranked = picked.slice(0, 5)
const week = Object.fromEntries(ranked.map((v, i) => [v, i % 4]))

test("a saved result reads back, and storage that does not check out is dropped", () => {
  assert.deepEqual(readValues({ picked, ranked, week, at: "2026-11-20" }), { picked, ranked, week, at: "2026-11-20" })
  assert.equal(readValues(null), null)
  assert.equal(readValues("x"), null)
  assert.equal(readValues({ picked, ranked: ranked.slice(0, 4), week }), null)
  assert.equal(readValues({ picked, ranked: [...ranked.slice(0, 4), "Glory"], week }), null)
  assert.equal(readValues({ picked, ranked: [...ranked.slice(0, 4), VALUES[20]], week }), null, "a ranked value that was not picked")
  assert.equal(readValues({ picked, ranked, week: { ...week, [ranked[0]]: 9 } }), null)
})

test("the back link carries both fives and the name", () => {
  const seen = [VALUES[3], VALUES[9], VALUES[0], VALUES[30], VALUES[31]]
  const back = readMirrorBack(mirrorBackHash(seen, ranked, "Alex Kim"))!
  assert.deepEqual(back, { seen, of: ranked, by: "Alex Kim" })
  assert.equal(mirrorMatch(back), 2)
  assert.equal(readMirrorBack("#seen=abc&of=abcde"), null)
  assert.equal(readMirrorBack("#v=abcde"), null)
  // A send link is not a back link.
  assert.equal(readMirrorBack(mirrorHash(ranked, "Sam")), null)
  assert.ok(readMirror(mirrorHash(ranked, "Sam")))
})

test("answers: newest first, one per person, twelve at most", () => {
  const a = (by: string, i: number) => ({ by, seen: VALUES.slice(i, i + 5), of: ranked, at: "2026-11-20" })
  let list = addMirrorAnswer([], a("Alex", 0))
  list = addMirrorAnswer(list, a("Bo", 1))
  list = addMirrorAnswer(list, a("alex", 2))
  assert.deepEqual(list.map((x) => x.by), ["alex", "Bo"])
  for (let i = 0; i < 20; i++) list = addMirrorAnswer(list, a(`P${i}`, i % 20))
  assert.equal(list.length, 12)
  assert.equal(readMirrorAnswers([{ by: 1 }, a("Cy", 0), "x"]).length, 1)
  assert.deepEqual(mostSeen([a("A", 0), a("B", 1)]).slice(0, 2).map((x) => x.n), [2, 2])
})
