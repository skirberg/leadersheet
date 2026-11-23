// Everything around a feature stays current without anyone asking: a new game fails these until it has its own share
// card (npm run og), a link in the README and the README's count; every icon and screenshot the app names exists; and every
// analytics event is listed in docs/PLAN.md, so what we count stays written down.
import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { CASES } from "../src/data/cases.ts"
import { FRAMEWORKS, SESSIONS } from "../src/data/course.ts"
import { GAMES } from "../src/data/games.ts"

const readme = readFileSync("README.md", "utf8")

test("every game has its own share card", () => {
  for (const g of GAMES) assert.ok(existsSync(`public/og/${g.id}.png`), `${g.id}: no public/og/${g.id}.png; run npm run build && npm run og`)
  for (const id of ["today", "today-class", "sheet", "play", "practice", "learn", "frameworks"]) assert.ok(existsSync(`public/og/${id}.png`), `${id}: no share card`)
})

test("the README links every game and its counts are right", () => {
  for (const g of GAMES) assert.ok(readme.includes(`leadersheet.io/play/${g.id}/`), `${g.id}: the README does not link /play/${g.id}/`)
  const n = /\*\*(\d+) quizzes, games and self-checks\*\*/.exec(readme)?.[1]
  assert.equal(Number(n), GAMES.length, `the README says ${n} games; there are ${GAMES.length}`)
  assert.equal(Number(/\*\*(\d+) lessons\*\*/.exec(readme)?.[1]), SESSIONS.length, "the README's count of lessons is off")
  assert.equal(Number(/\*\*(\d+) frameworks\*\*/.exec(readme)?.[1]), FRAMEWORKS.length, "the README's count of frameworks is off")
  const [, cases, choices] = /\*\*(\d+) decision cases, (\d+) choices\*\*/.exec(readme) ?? []
  assert.equal(Number(cases), CASES.length, `the README says ${cases} decision cases; there are ${CASES.length}`)
  assert.equal(Number(choices), CASES.reduce((a, c) => a + c.choices.length, 0), "the README's count of choices is off")
  const moves = /In (\d+) lessons your choice moves the model/.exec(readme)?.[1]
  assert.equal(Number(moves), CASES.filter((c) => c.moves).length, "the README's count of cases that move the model is off")
})

test("every icon and screenshot the app's manifest names exists", () => {
  const manifest = readFileSync("src/app/manifest.ts", "utf8")
  const srcs = [...manifest.matchAll(/src: "(\/[^"]+)"/g)].map((m) => m[1])
  assert.ok(srcs.some((s) => s.startsWith("/icons/shortcut-")), "the manifest's shortcuts have lost their own icons")
  for (const s of srcs) assert.ok(existsSync(`public${s}`), `${s} is missing; run ${s.startsWith("/screenshots/") ? "npm run shots" : "npm run icons"}`)
})

test("every analytics event is listed in the plan", () => {
  const plan = readFileSync("docs/PLAN.md", "utf8")
  const sent = new Set<string>()
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : /\.tsx?$/.test(e.name) ? [`${dir}/${e.name}`] : []))
  for (const f of walk("src")) for (const m of readFileSync(f, "utf8").matchAll(/(?:track\(|\bevent=)"([^"]+)"/g)) sent.add(m[1])
  assert.ok(sent.size > 10, `found only ${sent.size} events; the pattern no longer matches how events are sent`)
  for (const e of sent) assert.ok(plan.includes(`| \`${e}\` |`), `"${e}" is sent but not listed under "What we count" in docs/PLAN.md`)
})
