/*
  The sheet as one image to send: 1080 x 1350 (4:5), the shape of a sheet, which Instagram, LinkedIn and every
  messaging app show whole. Spotify draws Wrapped cards on a server from HTML templates; with no server, the browser
  draws this one on a canvas, in the light theme's tokens (src/brand, generated from the DTCG files) and the site's own fonts, with the mark and wordmark taken
  from the page itself so it stays in step with the brand preset.
*/
import { COLORS } from "@/brand"
import { SESSIONS } from "@/data/course"
import { RESULT_GAMES } from "@/data/results"
import { ROUNDS } from "@/lib/team-math"
import { SHEET_GAMES, gradeCount, gradeOf, type SheetData } from "@/lib/sheet"

export const IMAGE = { w: 1080, h: 1350 }

type Ink = { paper: string; card: string; ink: string; muted: string; rule: string; signal: string; ok: string }

/** The light theme's colors, from the generated tokens, so the image is paper even in dark mode. */
function lightTokens(): Ink {
  const t = COLORS.light
  return { paper: t.background, card: t.card, ink: t.foreground, muted: t["muted-foreground"], rule: t.border, signal: t.signal, ok: t.ok }
}

/** An inline SVG from the page (the mark, the wordmark) as an image, in the given ink. */
function svgImage(svg: SVGSVGElement, w: number, h: number, ink: Ink): Promise<HTMLImageElement> {
  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.setAttribute("width", String(w))
  copy.setAttribute("height", String(h))
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  const text = new XMLSerializer().serializeToString(copy).replaceAll("currentColor", ink.ink).replaceAll("var(--signal)", ink.signal)
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }))
  return new Promise((done, fail) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      done(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      fail(e)
    }
    img.src = url
  })
}

const fontVar = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

export async function drawSheet(d: SheetData, title: string, marks: { mark: SVGSVGElement | null; word: SVGSVGElement | null }) {
  const ink = lightTokens()
  const serif = fontVar("--font-noticia", "Georgia, serif")
  const sans = fontVar("--font-instrument", "system-ui, sans-serif")
  await Promise.all([document.fonts.load(`400 96px ${serif}`), document.fonts.load(`400 32px ${sans}`), document.fonts.load(`600 32px ${sans}`)]).catch(() => {})

  const c = document.createElement("canvas")
  c.width = IMAGE.w
  c.height = IMAGE.h
  const g = c.getContext("2d")!
  g.fillStyle = ink.paper
  g.fillRect(0, 0, IMAGE.w, IMAGE.h)
  g.fillStyle = ink.card
  g.beginPath()
  g.roundRect(60, 60, IMAGE.w - 120, IMAGE.h - 120, 48)
  g.fill()

  const X = 132,
    W = IMAGE.w - 2 * X
  let y = 132
  if (marks.mark) g.drawImage(await svgImage(marks.mark, 76, 76, ink), X, y, 76, 76)
  if (marks.word) {
    const h = 34,
      w = h * 7.375
    g.drawImage(await svgImage(marks.word, w, h, ink), X + 100, y + 21, w, h)
  }

  y += 76 + 110
  g.fillStyle = ink.ink
  g.font = `400 92px ${serif}`
  g.textBaseline = "alphabetic"
  g.fillText(title, X, y, W)

  const facts = [d.passed.length ? `${d.passed.length} of ${SESSIONS.length} lessons passed` : "", d.streak ? `${d.streak} ${d.streak === 1 ? "day" : "days"} in a row` : ""].filter(Boolean)
  y += 64
  g.font = `400 34px ${sans}`
  g.fillStyle = ink.muted
  if (facts.length) g.fillText(facts.join("  ·  "), X, y, W)

  const section = (label: string) => {
    y += 52
    g.fillStyle = ink.rule
    g.fillRect(X, y, W, 2)
    y += 54
    g.font = `500 28px ${sans}`
    g.fillStyle = ink.muted
    g.fillText(label, X, y)
    y += 50
  }
  const room = () => y < IMAGE.h - 200

  if (d.calls.length && room()) {
    section("Calls")
    const step = W / SESSIONS.length,
      r = Math.min(13, step / 2 - 3)
    SESSIONS.forEach((s, i) => {
      const call = d.calls.find((x) => x.sheet === s.id)
      const grade = call && gradeOf(call)
      const cx = X + step * i + step / 2,
        cy = y - 10
      g.beginPath()
      g.arc(cx, cy, r, 0, Math.PI * 2)
      if (grade === "strong") {
        g.fillStyle = ink.ok
        g.fill()
      } else if (grade === "tradeoff") {
        g.fillStyle = ink.ink
        g.fill()
      } else {
        g.lineWidth = 2
        g.strokeStyle = grade === "costly" ? ink.ink : ink.rule
        g.stroke()
        if (grade === "costly") {
          g.beginPath()
          g.moveTo(cx - r / 2, cy - r / 2)
          g.lineTo(cx + r / 2, cy + r / 2)
          g.moveTo(cx + r / 2, cy - r / 2)
          g.lineTo(cx - r / 2, cy + r / 2)
          g.stroke()
        }
      }
    })
    const n = gradeCount(d.calls)
    y += 50
    g.font = `400 34px ${sans}`
    g.fillStyle = ink.ink
    g.fillText(`${n.strong} strong ${n.strong === 1 ? "call" : "calls"}  ·  ${n.tradeoff} ${n.tradeoff === 1 ? "trade-off" : "trade-offs"}  ·  ${n.costly} costly`, X, y, W)
  }
  if (d.daily.made && room()) {
    y += d.calls.length ? 46 : 0
    if (!d.calls.length) section("Calls")
    g.font = `400 30px ${sans}`
    g.fillStyle = ink.muted
    g.fillText(`Today’s call: ${d.daily.made} made, ${d.daily.strong} strong`, X, y, W)
  }

  const styles = SHEET_GAMES.filter((k) => d.styles[k])
  if (styles.length && room()) {
    section("How I lead")
    y -= 4
    for (const k of styles) {
      if (!room()) break
      g.font = `400 30px ${sans}`
      g.fillStyle = ink.muted
      g.fillText(RESULT_GAMES[k].question, X, y, 470)
      g.font = `600 34px ${sans}`
      g.fillStyle = ink.ink
      g.fillText(RESULT_GAMES[k].label(d.styles[k]!), X + 500, y, W - 500)
      y += 50
    }
    y -= 50
  }

  if (d.values && room()) {
    section("What I value")
    g.font = `400 40px ${serif}`
    g.fillStyle = ink.ink
    const words = d.values.five.map((v, i) => `${i + 1} ${v}`)
    let line = ""
    for (const w of words) {
      const next = line ? `${line}   ${w}` : w
      if (g.measureText(next).width > W && line) {
        g.fillText(line, X, y)
        y += 54
        line = w
      } else line = next
    }
    g.fillText(line, X, y)
    y += 50
    g.font = `400 30px ${sans}`
    g.fillStyle = ink.muted
    const seen = d.seen ? `  ·  ${d.seen.people === 1 ? "1 person" : `${d.seen.people} people`} answered the mirror` : ""
    g.fillText(`My week ${d.values.agrees ? "agrees" : "disagrees"}.${seen}`, X, y, W)
  }

  const games = [
    d.games.bias !== undefined ? `Bias blitz ${d.games.bias}` : "",
    d.games.climb !== undefined ? `Kotter climb ${(d.games.climb / 1000).toFixed(1)} s` : "",
    d.games.team !== undefined ? `Team math ${d.games.team} of ${ROUNDS.length}` : "",
  ].filter(Boolean)
  if (games.length && room()) {
    section("Games")
    g.font = `400 34px ${sans}`
    g.fillStyle = ink.ink
    g.fillText(games.join("  ·  "), X, y, W)
  }

  g.font = `400 28px ${sans}`
  g.fillStyle = ink.muted
  g.fillText("leadersheet.io/sheet", X, IMAGE.h - 112)
  g.textAlign = "right"
  g.fillText("Fill in yours", X + W, IMAGE.h - 112)

  return new Promise<Blob>((done, fail) => c.toBlob((b) => (b ? done(b) : fail(new Error("canvas toBlob failed"))), "image/png"))
}
