// Search titles lead with the words people search, fit a search result, and link each game to the framework it plays.
import { test } from "node:test"
import assert from "node:assert/strict"
import { FRAMEWORKS, fwById, sessionById } from "../src/data/course.ts"
import { GAMES } from "../src/data/games.ts"
import { GAME_SEARCH, frameworkDescription, frameworkHeading, frameworkSearchTitle, gamesForFramework } from "../src/lib/search-terms.ts"

// Google cuts a title link near 600 px; the layout adds " · Leadersheet" (14 characters) after it.
const TITLE_MAX = 64

test("every game has a search title and description that fit a search result", () => {
  for (const g of GAMES) {
    const q = GAME_SEARCH[g.id]
    assert.ok(q, `${g.id} has no search title`)
    assert.ok(q.title.length <= TITLE_MAX, `${g.id}: "${q.title}" is ${q.title.length} characters`)
    assert.ok(q.description.length >= 60 && q.description.length <= 170, `${g.id}: description is ${q.description.length} characters`)
    assert.ok(!/[–—]/.test(`${q.title} ${q.description} ${g.search}`), `${g.id}: no en or em dashes`)
    assert.ok(g.search.length <= 21, `${g.id}: the card label "${g.search}" fits a card`)
  }
})

test("a game's framework is a real one, taught in the game's own lesson, and its page links back", () => {
  for (const g of GAMES) {
    const id = GAME_SEARCH[g.id].fw
    if (!id) continue
    const f = fwById(id)
    assert.ok(f, `${g.id}: no framework ${id}`)
    assert.equal(sessionById(g.sheet)?.n, f.s, `${g.id}: ${id} is taught in lesson ${f.s}, the game in ${sessionById(g.sheet)?.n}`)
    assert.ok(gamesForFramework(id).some((x) => x.id === g.id))
  }
  assert.deepEqual(gamesForFramework("goleman-6").map((g) => g.id), ["style"])
})

test("framework pages lead with the searched name", () => {
  assert.equal(frameworkHeading(fwById("kotter-8")!), "Kotter’s 8 steps of change")
  assert.equal(frameworkHeading(fwById("ladder")!), "Ladder of inference")
  for (const f of FRAMEWORKS) {
    const t = frameworkSearchTitle(f)
    assert.ok(t.length <= TITLE_MAX, `${f.id}: "${t}" is ${t.length} characters`)
    assert.ok(frameworkDescription(f).length <= 300)
    assert.ok(frameworkDescription(f).startsWith(frameworkHeading(f)), `${f.id}: the description opens with the heading`)
  }
})
