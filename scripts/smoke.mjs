// Behavior smoke test for the home page, in real time in headless Chrome. It fails on what a clean
// `npm run check` cannot see: a hero film that never starts, never pauses or never resumes, a reduced
// motion view that moves or shows the empty card, search that does not open or go anywhere, a Play mode
// that does not swap the hero line, a sliding pill or underline that swallows a quick tap, class mode without this week's work, and page errors.
//
//   npm run build && npm run smoke            checks out/ on a local server
//   npm run smoke -- https://leadersheet.io   checks the live site
//
// Analytics never loads, so test visits and clicks are never counted. On Vercel the script comes from a
// random first-party path (leadersheet.io/4d6e15c192ab02dc/script.js), not /_vercel/insights/, so a URL
// pattern alone misses it: the page drops the SDK's script tag before it can load.
import { existsSync } from "node:fs"
import { launch, sleep } from "./chrome.mjs"
import { serve } from "./serve.mjs"

const REMOTE = process.argv[2]?.replace(/\/$/, "")
if (!REMOTE && !existsSync("out/index.html")) {
  console.error("No out/ folder: run `npm run build` first, or pass a URL.")
  process.exit(1)
}
// Ports apart from qa.mjs (4410, 9333) so both can run at once.
const srv = REMOTE ? null : await serve("out", 4420)
const BASE = REMOTE ?? srv.url
const ANALYTICS = /\/_vercel\/(speed-)?insights\/|va\.vercel-scripts\.com/

const failures = []
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${detail ? `  (${detail})` : ""}`)
  if (!ok) failures.push(label)
}

const { page, close } = await launch({ port: 9334 })
const errors = []
const dropped = new Set()
const requests = []
let where = ""
page.on((m) => {
  const p = m.params
  if (m.method === "Runtime.exceptionThrown") errors.push(`${where}: ${(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).split("\n")[0]}`)
  if (m.method === "Runtime.consoleAPICalled" && p.type === "error") errors.push(`${where}: ${p.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200)}`)
  // The blocked analytics requests log a load error of their own; that one is expected.
  if (m.method === "Log.entryAdded" && p.entry.level === "error" && !ANALYTICS.test(p.entry.url ?? "")) errors.push(`${where}: ${p.entry.text} ${p.entry.url ?? ""}`)
  if (m.method === "Runtime.consoleAPICalled" && p.args[0]?.value === "smoke: analytics dropped") dropped.add(p.args[1]?.value)
  if (m.method === "Network.requestWillBeSent") requests.push(p.request.url)
})

const waitFor = async (expression, timeout = 8000) => {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    if (await page.eval(expression)) return true
    await sleep(200)
  }
  return false
}
const go = async (path) => {
  where = path
  let off, timer
  const loaded = new Promise((r) => {
    off = page.on((m) => m.method === "Page.loadEventFired" && r())
    timer = setTimeout(r, 20000)
  })
  await page.send("Page.navigate", { url: BASE + path })
  await loaded
  off()
  clearTimeout(timer)
}
const keyCodes = { Enter: 13, Escape: 27 }
const key = async (k, modifiers = 0) => {
  const p = { key: k, code: k.length === 1 ? `Key${k.toUpperCase()}` : k, modifiers, windowsVirtualKeyCode: keyCodes[k] ?? k.toUpperCase().charCodeAt(0) }
  if (k === "Enter") p.text = "\r"
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", ...p })
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...p })
}
const META = 4
const CTRL = 2
// A real mouse click at the element's center, so hover and pointer handlers run as they do for a visitor.
// It waits until nothing covers the element (the mode pill slides over its neighbour for about 100 ms).
const click = async (expression) => {
  const target = `(() => { const el = ${expression}; if (!el) return null; el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; return el.contains(document.elementFromPoint(x, y)) ? { x, y } : null })()`
  if (!(await waitFor(target, 3000))) return false
  await clickAt(await page.eval(target))
  return true
}
const clickAt = async (at) => {
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at })
  await page.send("Input.dispatchMouseEvent", { type: "mousePressed", ...at, button: "left", clickCount: 1 })
  await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...at, button: "left", clickCount: 1 })
}

// Sliding indicators (Motion layoutId pills and underlines) are empty, absolutely placed spans inside the
// selected button or link. For about 100 ms after a switch one still covers the option it left, and a tap
// there must go through to that option. Every indicator on a page is found this way and tested, so one
// added later is covered without a new check.
const SLIDER = `:is(button, a) > span.absolute:empty`
const findSliders = async () => {
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
const tested = new Set()
const sweep = async (path, screen) => {
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
const tapBack = async (group, tag) => {
  const controls = `[...(document.querySelector('${group}')?.querySelectorAll("${tag}") ?? [])].filter((c) => c.getBoundingClientRect().width > 0)`
  const isOn = (i) => `!!${controls}[${i}]?.querySelector(":scope > span.absolute:empty")`
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


const HERO = `document.querySelector('[role="img"][aria-label^="Animated drawing"]')`
// The player loads after the page is idle, so its arrival also means the page has hydrated.
const heroMounted = () => waitFor(`(${HERO}?.innerHTML.length ?? 0) > 1000`, 15000)
// The film holds still for up to 2 s between structures, so motion is judged over 3.2 s, not one gap.
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
  console.log(`\nLeadersheet smoke test against ${BASE}\n\nHero film, phone 390 x 844`)

  await page.size(390, 844, { dpr: 2, mobile: true })
  await page.media({ scheme: "light" })
  await go("/")
  const mounted = await heroMounted()
  const playing = mounted ? await framesSeen() : 0
  check(playing > 1, "film moves without a click", mounted ? `${playing} different frames in 3.2 s` : "player never loaded")
  await page.eval(`window.scrollTo(0, document.body.scrollHeight)`)
  await sleep(1000)
  const away = await framesSeen()
  check(mounted && away === 1, "film pauses when scrolled away", `${away} different frames in 3.2 s`)
  await page.eval(`window.scrollTo(0, 0)`)
  await sleep(600)
  const back = await framesSeen()
  check(back > 1, "film resumes when scrolled back", `${back} different frames in 3.2 s`)

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

  console.log("\nPlay mode")
  await go("/")
  await heroMounted()
  const study = await h1()
  await click(`[...document.querySelectorAll('header [role="group"] button')].find((b) => b.innerText.includes("Play"))`)
  check(await waitFor(`document.querySelector("h1")?.innerText.includes("play it.")`, 3000), "Play mode swaps the hero line", `${study} -> ${await h1()}`)
  await click(`[...document.querySelectorAll('header [role="group"] button')].find((b) => b.innerText.includes("Study"))`)
  check(await waitFor(`document.querySelector("h1")?.innerText.includes("move it.")`, 3000), "Study mode swaps it back", await h1())

  console.log("\nClass mode")
  await go("/?class")
  // label-mono sets text-transform: uppercase, so innerText reads "THIS WEEK"; compare without case.
  const thisWeek = await waitFor(`/this week/i.test(document.getElementById("this-week")?.innerText ?? "")`, 8000)
  const week = await page.eval(`(() => {
    const box = document.getElementById("this-week")
    const list = (label) => [...(box?.querySelectorAll(".label-mono") ?? [])].find((p) => p.textContent.trim().toLowerCase() === label)?.nextElementSibling?.querySelectorAll("li").length ?? 0
    return { title: document.getElementById("tw-h")?.innerText.trim(), due: list("due before class"), readings: list("readings") }
  })()`)
  check(thisWeek && week.title && week.due > 0 && week.readings > 0, "?class shows This week with its due list and readings", `${week.title ?? "no sheet"}: ${week.due} due, ${week.readings} readings`)
  await go("/?class=off")
  check(await waitFor(`/start here|pick up where/i.test(document.getElementById("this-week")?.innerText ?? "")`, 8000), "?class=off turns it back off")

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
