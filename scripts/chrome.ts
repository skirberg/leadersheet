// Minimal Chrome DevTools Protocol driver: headless Chrome, real time, no extra packages.
import { spawn } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
].filter((p): p is string => !!p)

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** A DevTools Protocol message: the reply to a command (has id) or an event (has method). Params and results are as Chrome sends them. */
export type CdpMessage = { id?: number; method?: string; params?: any; result?: any; error?: { message: string } }
export type Page = Awaited<ReturnType<typeof launch>>["page"]

export async function launch({ port = Number(process.env.CDP_PORT ?? 9333) } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "cdp-"))
  // Chrome refuses to start as root with its sandbox on (containers and CI often run as root).
  const root = process.getuid?.() === 0 ? ["--no-sandbox"] : []
  const proc = spawn(CANDIDATES[0], ["--headless=new", ...root, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" })
  // A cold Chrome on a busy CI runner can take well over 12 s to open its port (PR #23's first run did), so wait up
  // to 30 s, and say what went wrong instead of failing later on a bare ECONNREFUSED.
  let exited: number | null | undefined
  proc.once("exit", (code) => (exited = code))
  let up = false
  for (let i = 0; i < 150 && exited === undefined; i++) {
    try {
      await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
      up = true
      break
    } catch {
      await sleep(200)
    }
  }
  if (!up) {
    proc.kill("SIGKILL")
    throw new Error(exited !== undefined ? `Chrome exited (code ${exited}) before opening port ${port}` : `Chrome did not open port ${port} within 30 s`)
  }
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json()) as { webSocketDebuggerUrl: string }
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let id = 0
  const pending = new Map<number, (m: CdpMessage) => void>()
  const listeners = new Set<(m: CdpMessage) => void>()
  ws.onmessage = (m) => {
    const d = JSON.parse(String(m.data)) as CdpMessage
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)!(d)
      pending.delete(d.id)
    } else if (d.method) for (const fn of listeners) fn(d)
  }
  const send = (method: string, params: Record<string, unknown> = {}) =>
    new Promise<CdpMessage>((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  await send("Page.enable")
  await send("Runtime.enable")
  const page = {
    send,
    /** Calls fn with every DevTools event (console, exceptions, network); returns a function that stops it. */
    on(fn: (m: CdpMessage) => void) {
      listeners.add(fn)
      return () => void listeners.delete(fn)
    },
    async size(w: number, h: number, { dpr = 1, mobile = false } = {}) {
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile })
    },
    async media({ scheme = "light", reducedMotion = false } = {}) {
      await send("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-color-scheme", value: scheme },
          { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" },
        ],
      })
    },
    /** Opens url, waits for its load event (at most 20 s), then `wait` ms more for the page's code to settle. */
    async go(url: string, wait = 1500) {
      // A fixed wait alone let a busy machine check a page that was still arriving: on 22 November 2026 QA read pages
      // whose skip link had no text yet, whose main was not yet parsed and whose cards were mid-fade.
      let onLoad = (_m: CdpMessage) => {}
      let timer: ReturnType<typeof setTimeout> | undefined
      const loaded = new Promise<void>((r) => {
        onLoad = (m) => void (m.method === "Page.loadEventFired" && r())
        timer = setTimeout(r, 20_000)
      })
      listeners.add(onLoad)
      await send("Page.navigate", { url })
      await loaded
      listeners.delete(onLoad)
      clearTimeout(timer)
      await sleep(wait)
    },
    async eval(expression: string): Promise<any> {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
      return r.result?.result?.value
    },
    async png(clip?: { x: number; y: number; width: number; height: number }) {
      const r = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) })
      return Buffer.from(r.result.data, "base64")
    },
  }
  const close = async () => {
    ws.close()
    const exited = new Promise<void>((r) => proc.once("exit", () => r()))
    proc.kill()
    await Promise.race([exited, sleep(3000)])
    // the temp Chrome profile this script created; Chrome may still be flushing it
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    } catch {}
  }
  return { page, close }
}
