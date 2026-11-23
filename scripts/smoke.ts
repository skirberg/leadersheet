// Behavior smoke test for the home page, in real time in headless Chrome. It fails on what a clean
// `npm run check` cannot see: a hero that never starts its tour, never pauses or never resumes, cannot be dragged, tapped or keyed, a reduced
// motion view that moves or shows the empty card, search that does not open or go anywhere, a Games first switch
// that does not swap the hero line, a sliding pill or underline that swallows a quick tap, and page errors.
//
//   npm run build && npm run smoke            checks out/ on a local server
//   npm run smoke -- https://leadersheet.io   checks the live site
//
// Analytics never loads, so test visits and clicks are never counted. On Vercel the script comes from a
// random first-party path (leadersheet.io/4d6e15c192ab02dc/script.js), not /_vercel/insights/, so a URL
// pattern alone misses it: the page drops the SDK's script tag before it can load.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { lessonHref } from "../src/lib/paths.ts"
import { launch, sleep } from "./chrome.ts"
import { serve } from "./serve.ts"

const REMOTE = process.argv[2]?.replace(/\/$/, "")
if (!REMOTE && !existsSync("out/index.html")) {
  console.error("No out/ folder: run `npm run build` first, or pass a URL.")
  process.exit(1)
}
// Ports apart from qa.ts (4410, 9333) so both can run at once.
const srv = REMOTE ? null : await serve("out", 4420)
const BASE = REMOTE ?? srv!.url
const ANALYTICS = /\/_vercel\/(speed-)?insights\/|va\.vercel-scripts\.com/

const failures: string[] = []
const check = (ok: boolean, label: string, detail = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${detail ? `  (${detail})` : ""}`)
  if (!ok) failures.push(label)
}

// Lesson addresses come from titles (src/lib/paths.ts). Every old /learn/sN/ address, shared or indexed before the
// change, must redirect to the right lesson, and no two titles may share an address.
console.log("Lesson addresses")
{
  const lessons: { id: string; title: string }[] = JSON.parse(readFileSync("src/data/course.json", "utf8")).sessions
  const redirects: { source: string; destination: string }[] = JSON.parse(readFileSync("vercel.json", "utf8")).redirects
  const hrefs = lessons.map((s) => lessonHref(s))
  check(new Set(hrefs).size === lessons.length, "every lesson has its own address", `${new Set(hrefs).size} of ${lessons.length}`)
  const missing = lessons.filter((s) => ![`/learn/${s.id}`, `/learn/${s.id}/`].every((src) => redirects.some((r) => r.source === src && r.destination === lessonHref(s))))
  check(!missing.length, "every old /learn/sN/ address redirects to its lesson", missing.map((s) => s.id).join(", ") || `${lessons.length * 2} redirects`)
}

const { page, close } = await launch({ port: 9334 })
const errors: string[] = []
const dropped = new Set<string>()
const requests: string[] = []
let where = ""
page.on((m) => {
  const p = m.params
  if (m.method === "Runtime.exceptionThrown") errors.push(`${where}: ${(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).split("\n")[0]}`)
  if (m.method === "Runtime.consoleAPICalled" && p.type === "error") errors.push(`${where}: ${p.args.map((a: { value?: unknown; description?: string }) => a.value ?? a.description).join(" ").slice(0, 200)}`)
  // The blocked analytics requests log a load error of their own; that one is expected.
  if (m.method === "Log.entryAdded" && p.entry.level === "error" && !ANALYTICS.test(p.entry.url ?? "")) errors.push(`${where}: ${p.entry.text} ${p.entry.url ?? ""}`)
  if (m.method === "Runtime.consoleAPICalled" && p.args[0]?.value === "smoke: analytics dropped") dropped.add(p.args[1]?.value)
  if (m.method === "Network.requestWillBeSent") requests.push(p.request.url)
})

const waitFor = async (expression: string, timeout = 8000) => {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    if (await page.eval(expression)) return true
    await sleep(200)
  }
  return false
}
const go = async (path: string) => {
  where = path
  let off = () => {}
  let timer: ReturnType<typeof setTimeout> | undefined
  const loaded = new Promise<void>((r) => {
    off = page.on((m) => m.method === "Page.loadEventFired" && r())
    timer = setTimeout(r, 20000)
  })
  await page.send("Page.navigate", { url: BASE + path })
  await loaded
  off()
  clearTimeout(timer)
}
const keyCodes: Record<string, number> = { Enter: 13, Escape: 27, ArrowRight: 39, ArrowLeft: 37 }
const key = async (k: string, modifiers = 0) => {
  const p: Record<string, unknown> = { key: k, code: k.length === 1 ? `Key${k.toUpperCase()}` : k, modifiers, windowsVirtualKeyCode: keyCodes[k] ?? k.toUpperCase().charCodeAt(0) }
  if (k === "Enter") p.text = "\r"
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", ...p })
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...p })
}
const META = 4
const CTRL = 2
// A real mouse click at the element's center, so hover and pointer handlers run as they do for a visitor.
// It waits until nothing covers the element (the mode pill slides over its neighbour for about 100 ms).
const click = async (expression: string) => {
  const target = `(() => { const el = ${expression}; if (!el) return null; el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; return el.contains(document.elementFromPoint(x, y)) ? { x, y } : null })()`
  if (!(await waitFor(target, 3000))) return false
  await clickAt(await page.eval(target))
  return true
}
const clickAt = async (at: { x: number; y: number }) => {
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at })
  await page.send("Input.dispatchMouseEvent", { type: "mousePressed", ...at, button: "left", clickCount: 1 })
  await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...at, button: "left", clickCount: 1 })
}

// Sliding indicators (Motion layoutId pills and underlines) are empty, absolutely placed spans inside the
// selected button or link. For about 100 ms after a switch one still covers the option it left, and a tap
// there must go through to that option. Every indicator on a page is found this way and tested, so one
// added later is covered without a new check.
const SLIDER = `:is(button, a) > span.absolute:empty`
type Slider = { id: number; tag: string; name: string }
const findSliders = async (): Promise<Slider[]> => {
  // Hydrated controls carry React's props; before that a tap does nothing.
  await waitFor(`[...document.querySelectorAll("${SLIDER}")].every((s) => Object.keys(s.parentElement).some((k) => k.startsWith("__reactProps")))`, 10000)
  return page.eval(`(() => {
    const seen = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    return [...document.querySelectorAll("${SLIDER}")].filter(seen).map((span, i) => {
      const control = span.parentElement
      let group = control.parentElement
      while (group && [...group.querySelectorAll(control.tagName)].filter(seen).length < 2) group = group.parentElement
      if (!group) return null
      group.dataset.smokeSlider = i
      const names = [...group.querySelectorAll(control.tagName)].filter(seen).map((c) => c.innerText.trim().replace(/\\s+/g, " "))
      return { id: i, tag: control.tagName.toLowerCase(), name: (group.closest("[aria-label]")?.getAttribute("aria-label") ?? "") + " (" + names.join(", ") + ")" }
    }).filter(Boolean)
  })()`)
}
// Each indicator gets a fresh load of the page, since testing a nav underline navigates. Ones in the header
// show on every page and are tested once per screen size.
const tested = new Set<string>()
const sweep = async (path: string, screen: string) => {
  await go(path)
  for (const { name } of await findSliders()) {
    if (tested.has(`${screen} ${name}`)) continue
    tested.add(`${screen} ${name}`)
    await go(path)
    const g = (await findSliders()).find((x) => x.name === name)
    const [ok, detail] = g ? await tapBack(`[data-smoke-slider="${g.id}"]`, g.tag) : [false, "gone after a reload"]
    check(ok, `${screen} ${path}: ${name}`, detail)
  }
}
const tapBack = async (group: string, tag: string): Promise<[boolean, string]> => {
  const controls = `[...(document.querySelector('${group}')?.querySelectorAll("${tag}") ?? [])].filter((c) => c.getBoundingClientRect().width > 0)`
  const isOn = (i: number) => `!!${controls}[${i}]?.querySelector(":scope > span.absolute:empty")`
  await page.eval(`document.querySelector('${group}').scrollIntoView({ block: "center" })`)
  // The layout animation code loads after hydration, so the first switch may jump instead of slide: try three times.
  for (let attempt = 0; attempt < 3; attempt++) {
    const [from, to, n] = await page.eval(`(() => { const c = ${controls}, i = c.findIndex((x) => x.querySelector(":scope > span.absolute:empty")); return [i, (i + 1) % c.length, c.length] })()`)
    if (from < 0 || n < 2) return [false, "no selected option"]
    const names = await page.eval(`${controls}.map((c) => c.innerText.trim().replace(/\\s+/g, " "))`)
    // Each frame: where does the indicator overlap the option it left, and what would a tap there hit?
    const slide = page.eval(`new Promise((done) => {
      const end = performance.now() + 2500
      const frame = () => {
        const c = ${controls}, left = c[${from}]
        const bar = c.filter((x) => x !== left).map((x) => x.querySelector(":scope > span.absolute:empty")).find(Boolean)
        if (left && bar) {
          const a = left.getBoundingClientRect(), b = bar.getBoundingClientRect()
          const x0 = Math.max(a.left, b.left), x1 = Math.min(a.right, b.right), y0 = Math.max(a.top, b.top), y1 = Math.min(a.bottom, b.bottom)
          if (x1 - x0 >= 1 && y1 - y0 >= 0.5) {
            // A grid across the covered area, not just its center (a label can sit above the pill there while the padding
            // around it is covered), kept off the rounded corners, which the hit test leaves out.
            const span = (lo, hi) => hi - lo < 3 ? [(lo + hi) / 2] : [0, 1, 2, 3, 4].map((k) => lo + (hi - lo) * (0.15 + 0.175 * k))
            const points = span(x0, x1).flatMap((x) => span(y0, y1).map((y) => ({ x, y })))
            const blocked = points.find((p) => !left.contains(document.elementFromPoint(p.x, p.y)))
            const at = blocked ?? { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }, hit = document.elementFromPoint(at.x, at.y)
            return done({ ...at, through: !blocked, hit: hit?.closest("${tag}")?.innerText.trim().replace(/\\s+/g, " ") || hit?.tagName })
          }
        }
        if (performance.now() > end) return done(null)
        requestAnimationFrame(frame)
      }
      frame()
    })`)
    await click(`${controls}[${to}]`)
    const slid = await slide
    if (!slid) {
      await sleep(500)
      continue
    }
    await clickAt({ x: slid.x, y: slid.y })
    const back = await waitFor(isOn(from), 4000)
    return [slid.through && back, `${names[from]} -> ${names[to]}; a tap on ${names[from]} under the moving indicator ${slid.through ? "goes through" : `hits ${slid.hit}`}${back ? "" : `, ${names[from]} not selected after it`}`]
  }
  return [false, "the indicator never slid"]
}


const HERO = `document.querySelector('[role="group"][aria-label^="An org chart"]')`
// The live hero loads after the page is idle, so its arrival also means the page has hydrated.
const heroMounted = () => waitFor(`(${HERO}?.innerHTML.length ?? 0) > 1000`, 15000)
// The opening tour holds still for 1.5 s between structures, so motion is judged over 3.2 s, not one gap.
const framesSeen = async () => {
  const seen = new Set()
  for (let i = 0; i < 9; i++) {
    if (i) await sleep(400)
    seen.add(await page.eval(`${HERO}?.innerHTML ?? ""`))
  }
  return seen.size
}
// Text the film actually shows. Frame 0 is the empty card: its labels are at opacity 0 or scaled to nothing.
const heroText = () =>
  page.eval(`(() => { const box = ${HERO}; if (!box) return ""; return [...box.querySelectorAll("text")].filter((t) => { let o = 1; for (let n = t; n && n !== box; n = n.parentElement) o *= +getComputedStyle(n).opacity; const r = t.getBoundingClientRect(); return o > 0.5 && r.width > 2 && r.height > 2 }).map((t) => t.textContent.trim()).filter(Boolean).join(" ") })()`)
const h1 = () => page.eval(`document.querySelector("h1")?.innerText.replace(/\\s+/g, " ").trim()`)
const dialogOpen = `!!document.querySelector('[role="dialog"] input')`
const dialogClosed = `!document.querySelector('[role="dialog"]')`
const closeDialog = async () => {
  if (await page.eval(dialogOpen)) {
    await key("Escape")
    await waitFor(dialogClosed, 3000)
  }
}

try {
  await Promise.all([page.send("Log.enable"), page.send("Network.enable")])
  await page.send("Network.setBlockedURLs", { urls: ["*/_vercel/insights/*", "*/_vercel/speed-insights/*", "*va.vercel-scripts.com*"] })
  // @vercel/analytics marks its script tag with data-sdkn; the tag is never added, so the script never loads.
  await page.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `for (const m of ["appendChild", "insertBefore"]) {
      const real = Node.prototype[m]
      Node.prototype[m] = function (node, ...rest) {
        if (node instanceof HTMLScriptElement && node.dataset.sdkn?.startsWith("@vercel/")) return console.debug("smoke: analytics dropped", node.src), node
        return real.call(this, node, ...rest)
      }
    }`,
  })
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true })
  console.log(`\nLeadersheet smoke test against ${BASE}\n\nHero tour, phone 390 x 844`)

  await page.size(390, 844, { dpr: 2, mobile: true })
  await page.media({ scheme: "light" })
  await go("/")
  const mounted = await heroMounted()
  // The film sits in the section under the lesson cards: bring it into view first.
  await page.eval(`${HERO}?.scrollIntoView({ block: "center" })`)
  await sleep(800)
  const playing = mounted ? await framesSeen() : 0
  check(playing > 1, "film moves without a click", mounted ? `${playing} different frames in 3.2 s` : "player never loaded")
  await page.eval(`window.scrollTo(0, document.body.scrollHeight)`)
  await sleep(1000)
  const away = await framesSeen()
  check(mounted && away === 1, "film pauses when scrolled away", `${away} different frames in 3.2 s`)
  await page.eval(`${HERO}?.scrollIntoView({ block: "center" })`)
  await sleep(600)
  const back = await framesSeen()
  check(back > 1, "film resumes when scrolled back", `${back} different frames in 3.2 s`)

  console.log("\nHero you can move, desktop 1280 x 900")
  await page.size(1280, 900)
  await go("/")
  await heroMounted()
  await page.eval(`${HERO}?.scrollIntoView({ block: "center" })`)
  await sleep(600)
  const structure = () => page.eval(`document.querySelector('input[type=range]')?.getAttribute("aria-valuetext")?.split(".")[0]`)
  const pauseBtn = `[...document.querySelectorAll("button")].find((b) => /tour of the four structures/.test(b.getAttribute("aria-label") ?? ""))`
  check(await waitFor(`!!${pauseBtn}`, 3000), "the opening tour has a pause button")
  await click(pauseBtn)
  await sleep(300)
  const held = await framesSeen()
  check(held === 1, "pause stops the tour", `${held} different frames in 3.2 s`)
  const box = await page.eval(`(() => { const r = ${HERO}.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })()`)
  const mouse = (type: string, x: number, y: number) => page.send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1 })
  const y = box.y + box.h * 0.6
  await mouse("mousePressed", box.x + box.w * 0.2, y)
  for (let i = 1; i <= 8; i++) {
    await mouse("mouseMoved", box.x + box.w * (0.2 + i * 0.05), y)
    await sleep(25)
  }
  await mouse("mouseReleased", box.x + box.w * 0.6, y)
  await sleep(1000)
  const dragged = await structure()
  check(dragged === "Matrix" || dragged === "Flat or network", "dragging sideways restructures the chart", `Functional -> ${dragged}`)
  check(!(await page.eval(`!!${pauseBtn}`)), "the pause button leaves once the visitor takes over")
  const fx = box.x + box.w * (222 / 1200), ry = box.y + box.h * (172 / 900)
  await mouse("mousePressed", fx, ry)
  await mouse("mouseReleased", fx, ry)
  await sleep(1200)
  check((await structure()) === "Functional", "a tap on a structure jumps to it", await structure())
  await page.eval(`document.querySelector('input[type=range]').focus()`)
  await key("ArrowRight")
  await sleep(900)
  check((await structure()) === "Divisional", "the arrow keys step through the structures", await structure())

  console.log("\nSearch, desktop 1280 x 900")
  await page.size(1280, 900)
  await go("/")
  await heroMounted()
  await click(`[...document.querySelectorAll("header button")].find((b) => b.innerText.includes("Search"))`)
  check(await waitFor(dialogOpen, 6000), "search opens on click")
  await closeDialog()
  await key("k", META)
  check(await waitFor(dialogOpen, 6000), "search opens on ⌘K")
  await closeDialog()
  await key("k", CTRL)
  check(await waitFor(dialogOpen, 6000), "search opens on Ctrl+K")
  await page.send("Input.insertText", { text: "matrix" })
  await waitFor(`[...document.querySelectorAll("[cmdk-item]")].some((x) => x.offsetParent)`, 3000)
  const first = await page.eval(`[...document.querySelectorAll("[cmdk-item]")].find((x) => x.offsetParent)?.innerText.replace(/\\s+/g, " ").trim()`)
  await key("Enter")
  where = "search result"
  const moved = await waitFor(`location.pathname !== "/" && ${dialogClosed}`, 6000)
  check(moved, "Enter opens the first result", `${first ?? "no results"} -> ${await page.eval("location.pathname + location.hash")}`)

  console.log("\nGames first")
  await go("/")
  await heroMounted()
  const study = await h1()
  await click(`[...document.querySelectorAll('header [role="group"] button')].find((b) => b.innerText.includes("Games first"))`)
  check(await waitFor(`document.querySelector("h1")?.innerText.includes("by playing")`, 3000), "Games first swaps the hero line", `${study} -> ${await h1()}`)
  await click(`[...document.querySelectorAll("main a")].find((a) => a.getAttribute("href") === "#lessons")`)
  check(await waitFor(`location.hash === "#lessons" && document.getElementById("lessons")?.getBoundingClientRect().top < innerHeight / 2`, 3000), "its The lessons button lands on the lessons")
  await click(`[...document.querySelectorAll('header [role="group"] button')].find((b) => b.innerText.includes("Lessons first"))`)
  check(await waitFor(`document.querySelector("h1")?.innerText.includes("by doing")`, 3000), "Lessons first swaps it back", await h1())

  console.log("\nSliding indicators: a quick tap goes through to the option they are leaving")
  // Every page in the sitemap, so an indicator added anywhere is found. Header ones are tested once.
  const pages = await fetch(`${BASE}/sitemap.xml`).then((r) => (r.ok ? r.text() : "")).then((x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)).catch(() => [])
  check(pages.length > 0, "sitemap.xml lists the pages to sweep", `${pages.length} pages`)
  await page.size(1280, 900)
  for (const path of pages) await sweep(path, "desktop")
  await page.size(390, 844, { dpr: 2, mobile: true })
  await sweep("/", "phone")

  console.log("\nReduced motion, phone, dark")
  await page.size(390, 844, { dpr: 2, mobile: true })
  await page.media({ scheme: "dark", reducedMotion: true })
  await go("/")
  const rmMounted = await heroMounted()
  const still = rmMounted ? await framesSeen() : 0
  const shown = await heroText()
  check(still === 1 && shown.length > 0, "reduced motion holds a drawn still", rmMounted ? `${still} different frames in 3.2 s; shows "${shown.slice(0, 60)}"` : "player never loaded")

  // Every icon a page declares must load as the type it claims, and the two files browsers and apps fetch
  // without reading the page (/favicon.ico, /apple-touch-icon.png) must exist. Icons are found from each
  // page's own link tags, so one added later is covered without a new check.
  console.log("\nValues card sort")
  const { valuesGap } = await import("../src/data/games.ts")
  const five = ["A", "B", "C", "D", "E"]
  check(valuesGap(five, { A: 3, B: 1, C: 0, D: 0, E: 0 }).length === 0, "a week that follows the ranking has no gap")
  check(valuesGap(five, { A: 0, B: 3, C: 3, D: 0, E: 0 }).join() === "A", "a top value that a lower one beats in the week is the gap")
  await go("/play/values/")
  const chips = `[...document.querySelectorAll("section ul button")]`
  const tap = (i: number) => page.eval(`${chips}[${i}].click()`)
  const step = (label: string) => page.eval(`[...document.querySelectorAll("section button")].find((b) => b.textContent.trim().startsWith(${JSON.stringify(label)})).click()`)
  await waitFor(`${chips}.length === 32`)
  for (let i = 0; i < 10; i++) await tap(i)
  await sleep(150)
  await step("Next")
  await waitFor(`${chips}.length === 10`)
  for (let i = 0; i < 5; i++) await tap(i)
  await sleep(150)
  await step("Back")
  await waitFor(`${chips}.length === 32`)
  // Swap a ranked value for one that was not picked: its rank must go with it.
  await tap(0)
  await tap(12)
  await sleep(150)
  await step("Next")
  await waitFor(`${chips}.length === 10`)
  const ranks = await page.eval(`${chips}.filter((b) => b.getAttribute("aria-pressed") === "true").length`)
  const next = await page.eval(`[...document.querySelectorAll("section button")].find((b) => b.textContent.trim().startsWith("Next")).disabled`)
  check(ranks === 4 && next === true, "a value dropped from the ten loses its rank", `${ranks} ranked, Next ${next ? "disabled" : "enabled"}`)

  // The values mirror: a link carries someone's five; a friend picks five and sees how many match.
  console.log("\nValues mirror")
  const { mirrorHash, readMirror } = await import("../src/data/games.ts")
  const mine = ["Curiosity", "Courage", "Family", "Growth", "Honesty"]
  const roundTrip = readMirror(mirrorHash(mine, "Sam Lee"))
  check(roundTrip?.five.join() === mine.join() && roundTrip?.name === "Sam Lee", "a mirror link carries the five in order and the name")
  check(readMirror("#v=abcd") === null && readMirror("#v=aabcd") === null, "a cut or doubled mirror link is refused")
  await go("/play/mirror/" + mirrorHash(mine, "Sam"))
  const mirrorChips = `[...document.querySelectorAll("section ul button")]`
  const loadedMirror = await waitFor(`${mirrorChips}.length === 32`)
  for (const v of ["Curiosity", "Courage", "Fun", "Wealth", "Health"]) await page.eval(`${mirrorChips}.find((b) => b.textContent.trim() === ${JSON.stringify(v)}).click()`)
  await sleep(150)
  await page.eval(`[...document.querySelectorAll("section button")].find((b) => b.textContent.includes("Sam’s five")).click()`)
  const compared = await waitFor(`document.querySelector("main").innerText.includes("2 of 5")`)
  check(loadedMirror && compared, "a friend's five are compared with the sender's", compared ? "2 of 5 match" : "no comparison shown")

  // A missing address under a section renders the 404 page; it must hydrate cleanly (it threw React #418 when the tab
  // bar marked the section from the address bar).
  console.log("\nMissing addresses")
  for (const path of ["/learn/no-such-lesson/", "/frameworks/no-such-framework/", "/play/no-such-game/"]) {
    const before = errors.length
    await go(path)
    const shows = await waitFor(`document.querySelector("h1")?.innerText.includes("No lesson at this address")`, 8000)
    await sleep(800)
    // The page's own 404 status is logged as a failed load; that one is the point, not an error.
    const own = (e: string) => e.includes("status of 404") && e.includes(BASE + path)
    const mine = errors.splice(before).filter((e) => !own(e))
    errors.push(...mine)
    check(shows && mine.length === 0, `${path} shows the 404 with no page errors`, mine.join("; ").slice(0, 160))
  }

  const lab = (k: string) => page.eval(`(JSON.parse(localStorage.getItem("leadersheet-progress") || "{}").lab || {})[${JSON.stringify(k)}]`)
  const btn = (label: string) => `[...document.querySelectorAll("main button")].find((b) => b.innerText.trim().startsWith(${JSON.stringify(label)}))`
  const mainText = (t: string) => `document.querySelector("main")?.innerText.includes(${JSON.stringify(t)})`
  // The quizzes are in the HTML before React is listening: a tap or key before hydration does nothing. Wait for it.
  // Hydrated means React has the buttons, and its effects have run: key listeners on window are attached in an
  // effect after hydration, so a key sent in the same moment is lost (the decide test lost its first answer that way).
  const hydrated = async (selector: string) => {
    const ok = await waitFor(`(() => { const els = [...document.querySelectorAll(${JSON.stringify(selector)})]; return els.length > 0 && els.every((el) => Object.keys(el).some((k) => k.startsWith("__reactProps"))) })()`, 12000)
    await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50))))`)
    return ok
  }
  // The store writes to localStorage in an effect after the screen updates, so wait for a saved value, not one read.
  const savedLab = async (k: string, ok: (v: unknown) => boolean) => {
    const end = Date.now() + 4000
    let v = await lab(k)
    while (!ok(v) && Date.now() < end) {
      await sleep(150)
      v = await lab(k)
    }
    return v
  }

  // Team math: the bet, the reveal, the drag (by keyboard here), and three splits. The slider is Base UI's: each thumb
  // is a native range input, which is what takes focus and keys.
  console.log("\nTeam math")
  await page.size(390, 844, { dpr: 2, mobile: true })
  await go("/play/team/")
  await hydrated("main button")
  await click(btn("30"))
  check(await waitFor(mainText("Not 30: 66"), 6000), "the bet is answered: twelve people have 66 lines")
  await page.eval(`document.querySelector('input[type="range"]').focus()`)
  for (let i = 0; i < 8; i++) await key("ArrowRight")
  check(await waitFor(mainText("190 lines"), 3000), "the team grows to twenty: 190 lines")
  await click(btn("Now split a team"))
  for (const [round, steps] of [[1, 2], [2, 2], [3, 3]]) {
    await hydrated('input[type="range"]')
    await page.eval(`document.querySelector('input[type="range"]').focus()`)
    for (let i = 0; i < steps; i++) await key("ArrowRight")
    await click(btn("Split it here"))
    const shown = await waitFor(mainText("for the busiest one to keep up with"), 3000)
    check(shown, `team ${round}: the split shows the busiest person's lines`)
    await click(btn(round < 3 ? "Next team" : "See how you did"))
  }
  check(await waitFor(mainText("3 of 3"), 3000), "three splits as light as they get score 3 of 3")
  const teamBest = await savedLab("g-team-best", (v) => v === 3)
  check(teamBest === 3, "the best round is kept for the sheet", String(teamBest))

  // How do you decide?: ten calls, a result that names a way only when one leads, lessons that help.
  console.log("\nHow do you decide?")
  await go("/play/decide/")
  await hydrated("main fieldset button")
  for (let i = 0; i < 10; i++) {
    await key("1")
    await waitFor(i < 9 ? mainText(`${i + 2} of 10`) : mainText("Lessons that help"), 3000)
  }
  check(await waitFor(mainText("Lessons that help"), 4000), "ten calls give a result with lessons that help")
  const way = await savedLab("g-decide", (v) => ["Tell", "Sell", "Consult", "Join", "Spread"].includes(v as string))
  check(["Tell", "Sell", "Consult", "Join", "Spread"].includes(way), "the result is kept for the sheet", String(way))
  // Ten presses in one go, before React can re-render between them (a slow phone, a quick thumb): each must count once.
  await go("/play/decide/")
  await hydrated("main fieldset button")
  await page.eval(`for (let i = 0; i < 10; i++) dispatchEvent(new KeyboardEvent("keydown", { key: String((i % 4) + 1) }))`)
  check(await waitFor(mainText("Lessons that help"), 4000), "ten answers given faster than the screen redraws all count, once each")

  // The values card sort keeps its result and the mirror invite after you leave.
  console.log("\nValues kept")
  await go("/play/values/")
  await waitFor(`${chips}.length === 32`)
  await hydrated("section ul button")
  for (let i = 0; i < 10; i++) await tap(i * 3)
  await sleep(150)
  await step("Next")
  await waitFor(`${chips}.length === 10`)
  for (let i = 0; i < 5; i++) await tap(i)
  await sleep(150)
  await step("Next")
  await waitFor(`document.querySelectorAll("main fieldset").length === 5`)
  await page.eval(`[...document.querySelectorAll("main fieldset")].forEach((f, i) => f.querySelectorAll("button")[[3, 0, 2, 1, 0][i]].click())`)
  await sleep(150)
  await step("See the gap")
  await waitFor(mainText("Your week"))
  await go("/play/")
  await go("/play/values/")
  check(await waitFor(`${mainText("Your week")} && ${mainText("Ask people what they see in you")}`, 6000), "after leaving, the result and the mirror invite are still there")

  // Your sheet: everything above lands on it; a mirror answer comes back to it; it travels as a link.
  console.log("\nYour sheet")
  const { mirrorBackHash } = await import("../src/data/games.ts")
  const mine5: string[] = (await lab("g-values"))?.ranked ?? []
  const seen5 = [mine5[0], mine5[1], "Fun", "Wealth", "Health", "Wisdom"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  await go("/sheet/" + mirrorBackHash(seen5, mine5, "Sam"))
  check(await waitFor(mainText("On your sheet: what Sam sees in you"), 6000), "a mirror answer opened from its link lands on the sheet")
  check((await page.eval("location.hash")) === "", "the answer's link is cleared from the address bar")
  const filled = await waitFor(`(() => { const t = document.querySelector("#sheet")?.innerText ?? ""; return /3 of 3/.test(t) && /How do you decide\\?\\s+(Tell|Sell|Consult|Join|No single way)/.test(t) && /week (agrees|disagrees)/.test(t) && t.includes("Sam sees") })()`, 6000)
  check(filled, "the sheet shows Team math, the test, the values and the mirror", filled ? "" : (await page.eval(`document.querySelector("#sheet")?.innerText ?? "no sheet"`)).replace(/\s+/g, " ").slice(0, 200))
  await page.send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {})
  await click(btn("Send my sheet"))
  await waitFor(`!!${btn("Link copied")} || !!${btn("Sent")} || !!document.querySelector('input[aria-label="Sheet link"]')`, 4000)
  const given = await page.eval(`document.querySelector('input[aria-label="Sheet link"]')?.value || navigator.clipboard.readText().catch(() => "")`)
  const url = /https?:\S+/.exec(given ?? "")?.[0] ?? ""
  check(url.includes("/sheet/#sheet=1"), "Send my sheet gives a link that carries the sheet", url.slice(0, 90))
  // Read as an image, the way Save image and the share sheet use it (the CSP lets images, not fetch, read blob: URLs).
  const img = await waitFor(`!!document.querySelector('a[download="leadersheet-sheet.png"]')`, 6000)
  const size = img ? await page.eval(`new Promise((done) => { const i = new Image(); i.onload = () => done(i.naturalWidth + "x" + i.naturalHeight); i.onerror = () => done("failed to load"); i.src = document.querySelector('a[download="leadersheet-sheet.png"]').href })`) : ""
  check(size === "1080x1350", "the sheet is drawn as one 1080 x 1350 image to send", size)
  if (url) {
    // From another page: a hash change alone is not a page load.
    await go("/practice/")
    await go(new URL(url).pathname + new URL(url).hash)
    check(await waitFor(`document.querySelector("#sheet h1")?.innerText === "A sheet" && document.querySelector("#sheet").innerText.includes("3 of 3")`, 6000), "the link opens the same sheet, read-only")
  }
  await go("/practice/")
  await go("/sheet/#kotter-8")
  check(await waitFor(`location.pathname === "/frameworks/kotter-8/"`, 6000), "an old /sheet/#framework link still reaches the framework")

  console.log("\nToday's call")
  const { callIndex, callNumber, FIRST_CALL } = await import("../src/data/daily.ts")
  const { CASES } = await import("../src/data/cases.ts")
  const callCase = (n: number) => CASES[callIndex(n, CASES.length)]
  // a year of calls: every number has a case, every case comes up once in each run of the deck, and a day change
  // (daylight saving included) moves the number by one
  const year = Array.from({ length: 366 }, (_, k) => callCase(k + 1))
  const firstRound = new Set(year.slice(0, CASES.length).map((c) => c.sheet))
  check(year.every(Boolean) && firstRound.size === CASES.length, "a year of daily calls, every case once per round", `${firstRound.size} of ${CASES.length} in the first ${CASES.length} days`)
  const days = [0, 1, 100, 140, 365].map((k) => { const d = new Date(FIRST_CALL); d.setDate(d.getDate() + k); d.setHours(23, 30); return callNumber(d) })
  check(days.join() === "1,2,101,141,366", "call numbers follow the calendar day, late at night and across clock changes", days.join(", "))
  // Painted before any bundle: with the site's JavaScript blocked, the page still shows the day's case (and only that one).
  await page.send("Network.enable")
  await page.send("Network.setBlockedURLs", { urls: ["*/_next/static/chunks/*.js"] })
  await go("/today/")
  const painted = await page.eval(`(() => { const shown = [...document.querySelectorAll("[data-call]")].filter((e) => !e.hidden); return shown.length === 1 && shown[0].innerText.includes(${JSON.stringify(callCase(callNumber(new Date())).ask)}) && /^No\\. \\d+ · /.test(shown[0].querySelector("[data-call-no]").textContent) })()`)
  await page.send("Network.setBlockedURLs", { urls: [] })
  check(painted, "today's case is on the page before any JavaScript bundle runs")
  await go("/today/")
  const opts = `[...document.querySelectorAll('[aria-labelledby="today-ask"] button')]`
  const loadedCall = await waitFor(`${opts}.length >= 2`, 8000)
  await page.eval(`${opts}[0].click()`)
  const askedSure = await waitFor(`[...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Sure")`)
  await page.eval(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Sure").click()`)
  // the reveal: every call keeps its place and takes its mark; yours says what follows, another opens on a tap, and the
  // framework's rail has a mark for every call
  const todayCase = callCase(callNumber(new Date()))
  const others = todayCase.choices.slice(1)
  const revealed = await waitFor(`(() => { const t = document.querySelector("main").innerText; return t.includes(${JSON.stringify(todayCase.choices[0].then)}) && ${JSON.stringify(others.map((o) => o.says))}.every((x) => t.includes(x)) })()`)
  const why = `document.getElementById("today-why-1")`
  const closed = await waitFor(`!!${why} && ${why}.hidden`)
  await page.eval(`document.querySelector('[aria-controls="today-why-1"]').click()`)
  const opened = await waitFor(`!${why}.hidden && ${why}.innerText.includes(${JSON.stringify(others[0].then.slice(0, 40))})`)
  const railed = await waitFor(`(() => { const r = document.querySelector('main figure [role="img"]'); return !!r && r.getAttribute("aria-label").includes("yours") && r.getAttribute("aria-label").split(";").length === ${todayCase.choices.length} })()`)
  check(loadedCall && askedSure && revealed && closed && opened && railed, "today's call asks how sure, then marks every call, opens why on a tap and draws where each lands", railed ? "revealed" : opened ? "no rail" : revealed ? "why does not open" : "no reveal")
  await go("/today/")
  const kept = await waitFor(`document.querySelector("main").innerText.includes("Next call in")`, 8000)
  check(kept, "the day's call is kept after a reload")

  console.log("\nPage changes")
  // A move to another page runs one view transition (the content crossfades); loading a page and everything else on it
  // runs none, so a game's steps and the motion engine arriving never hold a tap.
  await go("/")
  await page.eval(`(() => { window.__vt = 0; const o = document.startViewTransition?.bind(document); if (o) document.startViewTransition = (a) => { window.__vt++; return o(a) } })()`)
  await sleep(1500)
  const atLoad = await page.eval("window.__vt")
  await click(`[...document.querySelectorAll('header a[href="/learn/"], nav a[href="/learn/"]')].find((a) => a.getBoundingClientRect().width > 0)`)
  const navigated = await waitFor(`location.pathname === "/learn/"`)
  const ran = await page.eval("window.__vt")
  check(navigated && atLoad === 0 && ran === 1, "a page change runs one view transition, and loading a page runs none", `${atLoad} on load, ${ran} after the move`)

  console.log("\nReview")
  const { reschedule, dueOf, localDay } = await import("../src/lib/review.ts")
  // the schedule: a miss is back tomorrow; right answers on the day push it to 3, 7 and 21 days, then it is learned
  const t0 = "2026-11-20"
  let r = reschedule(undefined, false, t0)
  const path = [r?.due]
  for (const day of ["2026-11-21", "2026-11-24", "2026-12-01", "2026-12-22"]) { r = reschedule(r ?? undefined, true, day); path.push(r === null ? "learned" : r?.due) }
  check(path.join() === "2026-11-21,2026-11-24,2026-12-01,2026-12-22,learned", "a miss comes back 1, 3, 7 and 21 days later, then it is learned", path.join(" → "))
  const early = reschedule({ box: 1, due: "2026-11-24" }, true, "2026-11-22")
  const again = reschedule({ box: 2, due: "2026-12-01" }, false, "2026-12-01")
  check(early?.due === "2026-11-24" && again?.box === 0 && again?.due === "2026-12-02", "a right answer before its day changes nothing; a miss starts it over")
  check(dueOf({ a: { box: 0, due: "2026-11-21" }, b: { box: 1, due: "2026-11-30" } }, "2026-11-25").join() === "a", "only what is due shows up")
  // on the page: a question due today puts Review first and asks it
  const today = localDay()
  await go("/practice/")
  await page.eval(`localStorage.setItem("leadersheet-progress", JSON.stringify({ mode: "study", best: {}, miss: ["s1-0"], seen: {}, lab: {}, days: [], review: { "s1-0": { box: 0, due: ${JSON.stringify(today)} } } }))`)
  await go("/practice/")
  const reviewFirst = await waitFor(`[...document.querySelectorAll('[role="tab"]')].some((t) => t.getAttribute("aria-selected") === "true" && t.textContent.includes("Review · 1"))`, 8000)
  const asked = await waitFor(`document.querySelector('[role="tabpanel"]')?.innerText.includes("1 of 1")`)
  check(reviewFirst && asked, "a question due today opens Practice on Review and asks it", reviewFirst ? (asked ? "asked" : "tab only") : "not first")
  await go("/")
  const homeSays = await waitFor(`document.querySelector("main").innerText.includes("1 question is back for review")`, 8000)
  check(homeSays, "the home page says a question is back for review")
  await page.eval(`localStorage.removeItem("leadersheet-progress")`)

  console.log("\nWhy not, and how sure")
  // every wrong option in every lesson check says why it is wrong; the right one says why it is right
  const course = JSON.parse(readFileSync("src/data/course.json", "utf8")) as { sessions: { id: string; checks: { o: string[]; a: number; why: string; not?: string[] }[] }[] }
  const unexplained = course.sessions.flatMap((s) =>
    s.checks.flatMap((q, k) => (q.not?.length === q.o.length && q.why && q.not.every((n, j) => (j === q.a ? n === "" : n.trim().length > 0)) ? [] : [`${s.id}-${k}`]))
  )
  check(unexplained.length === 0, "every wrong option in every check has a line saying why", unexplained.join(", ") || `${course.sessions.length * 3} questions`)
  // in a lesson: pick, say how sure, then every option shows its line; a sure miss and a right guess both come back
  const q0 = course.sessions[0].checks[0]
  const optBtn = (text: string) => `[...document.querySelectorAll('[role="group"] button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)})`
  const sureBtn = (text: string) => `[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)})`
  await go("/learn/leader-as-architect/")
  const wrong = q0.o.find((_, j) => j !== q0.a)!
  // hydrated controls carry React's props; before that a tap does nothing
  const ready1 = await waitFor(`(() => { const b = ${optBtn(wrong)}; return !!b && Object.keys(b).some((k) => k.startsWith("__reactProps")) })()`, 10000)
  await page.eval(`${optBtn(wrong)}.click()`)
  const asksSure = await waitFor(`!!${sureBtn("Sure")}`)
  await page.eval(`${sureBtn("Sure")}.click()`)
  const wrongLine = q0.not![q0.o.indexOf(wrong)]
  const explained = await waitFor(`(() => { const t = document.querySelector("main").innerText; return /not quite/i.test(t) && /you were sure/i.test(t) && t.includes(${JSON.stringify(wrongLine)}) && t.includes(${JSON.stringify(q0.why)}) && /why not the others/i.test(t) })()`)
  check(ready1 && asksSure && explained, "a lesson check asks how sure, then explains the answer picked and the right one", explained ? "explained" : asksSure ? "no explanation" : "no confidence step")
  // every other option keeps its line one tap away
  const rest = q0.o.findIndex((_, j) => j !== q0.a && q0.o[j] !== wrong)
  const restLine = q0.not![rest]
  const folded = await waitFor(`!document.querySelector("main").innerText.includes(${JSON.stringify(restLine)})`)
  await page.eval(`[...document.querySelectorAll('button[aria-expanded]')].find((b) => b.textContent.includes(${JSON.stringify(q0.o[rest])}))?.click()`)
  const unfolded = await waitFor(`document.querySelector("main").innerText.includes(${JSON.stringify(restLine)})`)
  check(folded && unfolded, "the other options say why not on a tap", unfolded ? "opens" : folded ? "does not open" : "not folded")
  const q1 = course.sessions[0].checks[1]
  await page.eval(`${optBtn(q1.o[q1.a])}.click()`)
  await waitFor(`!!${sureBtn("Guessing")}`)
  await page.eval(`${sureBtn("Guessing")}.click()`)
  const guessed = await waitFor(`/right, on a guess/i.test(document.querySelector("main").innerText)`)
  const stored = await waitFor(`(() => { const s = JSON.parse(localStorage.getItem("leadersheet-progress") || "{}"); return !!s.review?.["s1-0"] && !!s.review?.["s1-1"] && !(s.miss || []).includes("s1-1") && s.lab?.calib?.[0]?.join() === "0,1" && s.lab?.calib?.[2]?.join() === "1,1" })()`)
  check(guessed && stored, "a right guess comes back for review without counting as a miss; confidence is tallied", stored ? "stored" : "not stored")
  await go("/practice/")
  const tally = await waitFor(`/right when sure/i.test(document.querySelector("main").innerText)`, 8000)
  check(tally, "Practice shows how often you were right when you said sure")
  await page.eval(`localStorage.removeItem("leadersheet-progress")`)

  console.log("\nYour call")
  // a lesson's case: what follows opens under the pick, the rail marks the row it uses, and another pick moves both
  {
    const lessonCase = CASES.find((x) => x.sheet === "s11")!
    const caseBtn = (i: number) => `document.querySelectorAll('section[aria-labelledby="your-call"] [role="group"] > div > button')[${i}]`
    await go("/learn/feedback/")
    // every option wired, then two frames so the effects that listen have attached (one wired button was not enough: a
    // first tap now and then went unanswered on a slow run)
    await hydrated('section[aria-labelledby="your-call"] [role="group"] > div > button')
    const rail = `(document.querySelector('section[aria-labelledby="your-call"] figure [role="img"]')?.getAttribute("aria-label") ?? "")`
    await page.eval(`${caseBtn(0)}.click()`)
    const first = await waitFor(`document.querySelector("main").innerText.includes(${JSON.stringify(lessonCase.choices[0].then)}) && ${rail}.includes("yours")`)
    const before = await page.eval(rail)
    await page.eval(`${caseBtn(2)}.click()`)
    const moved = await waitFor(`(() => { const t = document.querySelector("main").innerText; return t.includes(${JSON.stringify(lessonCase.choices[2].then)}) && !t.includes(${JSON.stringify(lessonCase.choices[0].then)}) && ${rail} !== ${JSON.stringify(before)} })()`)
    check(first && moved, "a lesson's call opens what follows under the pick and marks its row on the rail; another pick moves it", moved ? "moved" : first ? "did not move" : "no result")
    await page.eval(`localStorage.removeItem("leadersheet-progress")`)
  }

  console.log("\nDiagnose your job")
  const { JDS_ITEMS, jdsScore } = await import("../src/data/jds.ts")
  // scoring: each characteristic is three items, one of them reversed; all fours is 4 on each and an MPS of 64, and
  // answering 7 to everything gives 5 on each (7, 7 and the reversed 8 - 7), so a reversed item that is not reversed shows
  const perDim = [0, 1, 2, 3, 4].map((d) => JDS_ITEMS.filter((it) => it.dim === d).map((it) => (it.part === 2 && it.rev ? "r" : String(it.part))).sort().join(""))
  const fours = jdsScore(Array(15).fill(4)), sevens = jdsScore(Array(15).fill(7))
  check(JDS_ITEMS.length === 15 && perDim.every((s) => s === "12r"), "every characteristic has a part-one item, a statement and a reversed statement", perDim.join(" "))
  check(Math.round(fours.mps) === 64 && sevens.dims.every((v) => Math.abs(v - 5) < 1e-9) && Math.round(sevens.mps) === 125, "scoring matches the published key", `${Math.round(fours.mps)}, ${Math.round(sevens.mps)}`)
  await go("/play/job/")
  const startBtn = `[...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Start"))`
  await waitFor(`(() => { const b = ${startBtn}; return !!b && Object.keys(b).some((k) => k.startsWith("__reactProps")) })()`, 10000)
  await page.eval(`${startBtn}.click()`)
  // answer 6 on every part-one item and "Mostly accurate" (6) on every statement
  for (let k = 0; k < 15; k++) {
    const on = await waitFor(`[...document.querySelectorAll("fieldset button")].length === 7`, 4000)
    if (!on) break
    await page.eval(`[...document.querySelectorAll("fieldset button")][5].click()`)
    await sleep(320)
  }
  const result = await waitFor(`/motivating potential score/i.test(document.querySelector("main").innerText) && document.querySelector("main").innerText.includes("typical 4.9")`, 6000)
  check(result, "the survey runs to a result against the typical job")
  await page.eval(`[...document.querySelectorAll("a")].find((a) => a.textContent.includes("lesson 10"))?.click()`)
  const placed = await waitFor(`(() => { const s = JSON.parse(localStorage.getItem("leadersheet-progress") || "{}"); return Array.isArray(s.lab?.jcm) && s.lab.jcm.length === 5 && s.lab?.["g-job"]?.a?.length === 15 })()`, 6000)
  check(placed, "the result is kept and can be put into lesson 10's model")
  await page.eval(`localStorage.removeItem("leadersheet-progress")`)

  console.log("\nRewind")
  // play the conversation, take a weak line, rewind it, then finish on the strong lines: the best ending, and the rewind counted
  const { TALKS } = await import("../src/data/rewind.ts")
  const talk = TALKS[0]
  await go("/play/rewind/")
  const startTalk = `[...document.querySelectorAll("button")].find((b) => b.textContent.includes("Start the conversation"))`
  await waitFor(`(() => { const b = ${startTalk}; return !!b && Object.keys(b).some((k) => k.startsWith("__reactProps")) })()`, 10000)
  await page.eval(`${startTalk}.click()`)
  const lineBtn = (says: string) => `[...document.querySelectorAll('[aria-labelledby="rewind-turn"] button')].find((b) => b.textContent.includes(${JSON.stringify(says.slice(0, 40))}))`
  const weak = talk.turns[0].lines.find((l) => l.grade === "costly")!
  await waitFor(`!!${lineBtn(weak.says)}`)
  await page.eval(`${lineBtn(weak.says)}.click()`)
  const marked = await waitFor(`document.querySelector('[role="log"]').innerText.includes(${JSON.stringify(weak.reply)}) && /costly/i.test(document.querySelector('[role="log"]').innerText)`, 5000)
  await page.eval(`[...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label")?.startsWith("Rewind to your line 1")).click()`)
  const rewound = await waitFor(`!document.querySelector('[role="log"]').innerText.includes(${JSON.stringify(weak.reply)}) && !!${lineBtn(talk.turns[0].lines[0].says)}`, 3000)
  check(marked && rewound, "a line is answered and marked, and rewinding it takes it back", rewound ? "rewound" : marked ? "not rewound" : "not marked")
  for (const turn of talk.turns) {
    const strong = turn.lines.find((l) => l.grade === "strong")!
    await waitFor(`!!${lineBtn(strong.says)}`, 5000)
    await page.eval(`${lineBtn(strong.says)}.click()`)
  }
  const ended = await waitFor(`document.querySelector("main").innerText.includes(${JSON.stringify(talk.endings[0].title)}) && document.querySelector("main").innerText.includes("4 of 4 lines strong, 1 rewind")`, 8000)
  check(ended, "the strong lines reach the best ending, with the rewind counted")
  // a say-back only repeats what was asked: after the vague line at turn 3, Alex cannot quote deadlines nobody set
  await page.eval(`[...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Rewind to your line 3 and try another").click()`)
  const vague = talk.turns[2].lines.find((l) => l.says.startsWith("Just try to be more careful"))!
  await waitFor(`!!${lineBtn(vague.says)}`, 3000)
  await page.eval(`${lineBtn(vague.says)}.click()`)
  const fourth = talk.turns[3].lines.find((l) => l.grade === "strong")!
  await waitFor(`!!${lineBtn(fourth.says)}`, 5000)
  await page.eval(`${lineBtn(fourth.says)}.click()`)
  const honest = await waitFor(`document.querySelector('[role="log"]').innerText.includes(${JSON.stringify(fourth.replyIf!.notStrong)})`, 5000)
  check(honest, "a say-back repeats only what was asked: after the vague line, no deadlines")
  await page.eval(`localStorage.removeItem("leadersheet-progress")`)

  console.log("\nClass mode")
  // a room's run of one lesson's case: count a first vote, a second vote, then the reveal shows the shift and every grade
  await go("/today/class/?case=s11")
  const roomBtn = (label: string) => `[...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(${JSON.stringify(label)}) || b.getAttribute("aria-label") === ${JSON.stringify(label)})`
  const loadedRoom = await waitFor(`(() => { const b = ${roomBtn("Next")}; return !!b && Object.keys(b).some((k) => k.startsWith("__reactProps")) && document.querySelector("main").innerText.includes("You manage Sam") })()`, 10000)
  await page.eval(`${roomBtn("Next")}.click()`)
  for (let k = 0; k < 3; k++) await page.eval(`${roomBtn("One more for A")}.click()`)
  await page.eval(`${roomBtn("One more for C")}.click()`)
  await page.eval(`${roomBtn("Next")}.click()`)
  const talking = await waitFor(`document.querySelector("main").innerText.includes("Find someone who chose differently")`)
  await page.eval(`${roomBtn("Next")}.click()`)
  for (let k = 0; k < 4; k++) await page.eval(`${roomBtn("One more for C")}.click()`)
  // a click leaves focus on a button; the arrow keys must still move the steps (a presenter clicks, then uses a remote)
  await page.eval(`${roomBtn("One more for C")}.focus()`)
  await key("ArrowRight")
  const shift = await waitFor(`document.querySelector("main").innerText.includes("The strong call: 25% on the first vote, 100% after talking.") && /strong call/i.test(document.querySelector("main").innerText)`)
  check(loadedRoom && talking && shift, "class mode runs vote, talk, revote and reveals the shift to the strong call", shift ? "25% → 100%" : talking ? "no reveal" : loadedRoom ? "no talk step" : "did not load")

  console.log("\nResilience scale")
  // six statements to a score on PhenX's line: agreeing with everything scores 3.00, normal
  await go("/play/bounce/")
  await hydrated("main button")
  await page.eval(`[...document.querySelectorAll("main button")].find((b) => b.innerText.trim().startsWith("Start")).click()`)
  for (let k = 0; k < 6; k++) {
    await waitFor(`[...document.querySelectorAll("main fieldset button")].length === 5`, 4000)
    await page.eval(`[...document.querySelectorAll("main fieldset button")][4].click()`)
    await sleep(320)
  }
  const bounced = await waitFor(`/brief resilience scale/i.test(document.querySelector("main").innerText) && document.querySelector("main").innerText.includes("3.00") && document.querySelector("main").innerText.includes("In the normal range.")`, 6000)
  const bounceKept = await savedLab("g-bounce", (v) => Array.isArray((v as { a?: number[] })?.a) && (v as { a: number[] }).a.length === 6)
  check(bounced && !!bounceKept, "six statements give a score on the normal range, kept for later", bounced ? "3.00, normal" : "no result")

  console.log("\nNetwork map")
  // three names, two who know each other: Burt's constraint for that network is 61 (unit tests check the formula)
  await go("/play/network/")
  await hydrated("main button")
  await page.eval(`[...document.querySelectorAll("main button")].find((b) => b.innerText.trim().startsWith("Start")).click()`)
  await waitFor(`!!document.querySelector("#net-name")`, 4000)
  for (const name of ["Ana", "Ben", "Cy"]) {
    await page.eval(`(() => { const i = document.querySelector("#net-name"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ${JSON.stringify(name)}); i.dispatchEvent(new Event("input", { bubbles: true })); })()`)
    await waitFor(`!document.querySelector('main form button[type="submit"]').disabled`, 2000)
    await page.eval(`document.querySelector('main form button[type="submit"]').click()`)
    await waitFor(`document.querySelectorAll('[aria-label="People on your map"] li').length >= ${["Ana", "Ben", "Cy"].indexOf(name) + 1}`, 2000)
  }
  await page.eval(`[...document.querySelectorAll("main button")].find((b) => b.innerText.includes("who knows whom")).click()`)
  await waitFor(`!!document.querySelector('[aria-labelledby="net-ask"] button')`, 3000)
  await page.eval(`[...document.querySelectorAll('[aria-labelledby="net-ask"] button')].find((b) => b.innerText.trim() === "Ben").click()`)
  await page.eval(`[...document.querySelectorAll("main button")].find((b) => b.innerText.includes("Next person")).click()`)
  await waitFor(`[...document.querySelectorAll("main button")].some((b) => b.innerText.includes("See my network"))`, 3000)
  await page.eval(`[...document.querySelectorAll("main button")].find((b) => b.innerText.includes("See my network")).click()`)
  const mapped = await waitFor(`/network constraint/i.test(document.querySelector("main").innerText) && document.querySelector("main").innerText.includes("3 people in 2 groups")`, 6000)
  const score = await page.eval(`(document.querySelector('[role="status"]')?.innerText.match(/Network constraint (\\d+)/) || [])[1]`)
  const sentNames = await page.eval(`JSON.stringify(performance.getEntriesByType("resource").map((r) => r.name)).includes("Ana")`)
  check(mapped && score === "61" && !sentNames, "three contacts, two who know each other: constraint 61, two groups, no name sent anywhere", `constraint ${score}`)
  await page.eval(`localStorage.removeItem("leadersheet-progress")`)

  // The owner, 22 November 2026: no page scrolls sideways. Every page at 320 px, the narrowest phone the site supports,
  // and the screens a tap opens: neither the document nor the body is wider than the screen, and a sideways scroll
  // does not move the page. The screen is the document's client width: on a phone a wider page makes innerWidth grow
  // to fit it (the page zooms out), so innerWidth would hide the very thing this checks. qa.ts checks the same rule on
  // every page at its other widths.
  console.log("\nSideways scroll, phone 320 x 720")
  await page.size(320, 720, { mobile: true })
  const WIDE = `(() => { const w = document.documentElement.clientWidth, wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth); scrollTo(9999, scrollY); const x = scrollX; scrollTo(0, scrollY); return wide > w || x > 0 ? wide + " px wide, moves " + x + " px" : "" })()`
  const sitePaths: string[] = []
  if (REMOTE) {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitePaths.push(new URL(m[1]).pathname)
  } else
    (function walk(dir: string) {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f)
        if (statSync(p).isDirectory()) {
          if (!f.startsWith("_") && !(dir === "out" && f === "og")) walk(p)
        } else if (f === "index.html") sitePaths.push(dir === "out" ? "/" : `/${relative("out", dir).replace(/\\/g, "/")}/`)
      }
    })("out")
  const widePages: string[] = []
  for (const p of sitePaths) {
    await go(p)
    await sleep(400)
    const w = await page.eval(WIDE)
    if (w) widePages.push(`${p} ${w}`)
  }
  check(!widePages.length, "no page is wider than a 320 px screen", widePages.slice(0, 4).join("; ") || `${sitePaths.length} pages`)
  const tapped: string[] = []
  await go("/today/")
  if (await waitFor(`document.querySelectorAll('[aria-labelledby="today-ask"] button').length >= 2`, 8000)) {
    await page.eval(`document.querySelectorAll('[aria-labelledby="today-ask"] button')[1].click()`)
    await waitFor(`[...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Fairly sure")`)
    await page.eval(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Fairly sure").click()`)
    await waitFor(mainText("Next call in"))
    tapped.push(`today's result: ${(await page.eval(WIDE)) || "fits"}`)
  } else tapped.push("today's result: did not load")
  await go("/play/decide/")
  await hydrated("main fieldset button")
  for (let i = 0; i < 10; i++) {
    await key(String((i % 4) + 1))
    await sleep(120)
  }
  tapped.push(`decide result: ${(await waitFor(mainText("Lessons that help"), 4000)) ? (await page.eval(WIDE)) || "fits" : "no result"}`)
  await go("/play/style/")
  await hydrated("main fieldset button")
  for (let i = 0; i < 6; i++) {
    await key(String((i % 3) + 1))
    await sleep(450)
  }
  await sleep(600)
  tapped.push(`style quiz result: ${(await page.eval(WIDE)) || "fits"}`)
  check(tapped.every((t) => t.endsWith("fits")), "today's result, a test result and a quiz result fit a 320 px screen", tapped.filter((t) => !t.endsWith("fits")).join("; ") || "3 results")
  // Every lesson's decision, every choice: the framework rail names the row a call lands on, and a long name once
  // widened the rail past the screen (59 of 150 calls at 320 px, 22 November 2026). Today's call draws the same rail.
  const CHOICES = `document.querySelectorAll('section[aria-labelledby="your-call"] [role=group] button')`
  const wideCalls: string[] = []
  let calls = 0
  for (const p of sitePaths.filter((x) => /^\/learn\/[^/]+\/$/.test(x))) {
    await go(p)
    if (!(await hydrated('section[aria-labelledby="your-call"] [role=group] button'))) {
      wideCalls.push(`${p} did not load`)
      continue
    }
    const n: number = await page.eval(`${CHOICES}.length`)
    for (let i = 0; i < n; i++) {
      await page.eval(`${CHOICES}[${i}].click()`)
      await sleep(250)
      const w = await page.eval(WIDE)
      calls++
      if (w) wideCalls.push(`${p} choice ${i + 1}: ${w}`)
    }
  }
  check(calls > 0 && !wideCalls.length, "every lesson's call, every choice, fits a 320 px screen", wideCalls.slice(0, 4).join("; ") || `${calls} choices`)
  await page.eval(`localStorage.removeItem("leadersheet-progress")`)

  console.log("\nIcons")
  const ICON_TYPES: Record<string, RegExp> = { ico: /icon/, svg: /svg/, png: /png/ }
  const icons = new Set(["/favicon.ico", "/apple-touch-icon.png"])
  for (const path of ["/", "/learn/leadership-through-culture/", "/no-such-sheet/"]) {
    const html = await (await fetch(BASE + path)).text()
    const hrefs = [...html.matchAll(/<link rel="(?:icon|shortcut icon|apple-touch-icon)" href="([^"]+)"/g)].map((m) => m[1])
    check(
      ["\\.ico", "\\.svg", "apple-touch-icon"].every((k) => hrefs.some((h) => new RegExp(k).test(h))),
      `${path} declares an .ico, an .svg and an apple touch icon`,
      hrefs.join(", ")
    )
    hrefs.forEach((h) => icons.add(h))
  }
  for (const href of icons) {
    const url = new URL(href, BASE)
    const r = await fetch(url)
    const body = Buffer.from(await r.arrayBuffer())
    const type = r.headers.get("content-type") ?? ""
    let ok = r.ok && body.length > 100 && (ICON_TYPES[url.pathname.split(".").pop() ?? ""]?.test(type) ?? false)
    let detail = `${r.status} ${type} ${body.length} B`
    if (ok && url.pathname.endsWith(".ico")) {
      const sizes = body.readUInt16LE(2) === 1 ? Array.from({ length: body.readUInt16LE(4) }, (_, i) => body[6 + 16 * i] || 256) : []
      ok = [16, 32].every((s) => sizes.includes(s))
      detail += `, sizes ${sizes.join("/") || "none"}`
    }
    check(ok, `icon ${url.pathname} loads`, detail)
  }

  console.log("\nPage health")
  check(errors.length === 0, "no console errors or exceptions", errors.slice(0, 3).join("; "))
  const dirs = [...dropped].map((src) => src.slice(0, src.lastIndexOf("/") + 1))
  const sent = requests.filter((u) => ANALYTICS.test(u) || dirs.some((d) => u.startsWith(d)))
  check(dropped.size > 0 && sent.length === 0, "analytics never loaded", dropped.size ? `script tag dropped (${dirs.join(", ")}), ${sent.length} requests` : "no analytics script tag seen: the guard no longer recognises it")
} finally {
  await close()
  srv?.close()
}

console.log(failures.length ? `\n${failures.length} check(s) failed.\n` : "\nAll checks passed.\n")
process.exit(failures.length ? 1 : 0)
