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
].filter(Boolean)

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function launch({ port = 9333 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "cdp-"))
  const proc = spawn(CANDIDATES[0], ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" })
  for (let i = 0; i < 60; i++) {
    try {
      await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
      break
    } catch {
      await sleep(200)
    }
  }
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let id = 0
  const pending = new Map()
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data)
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d)
      pending.delete(d.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  await send("Page.enable")
  await send("Runtime.enable")
  const page = {
    send,
    async size(w, h, { dpr = 1, mobile = false } = {}) {
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
    async go(url, wait = 1500) {
      await send("Page.navigate", { url })
      await sleep(wait)
    },
    async eval(expression) {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
      return r.result?.result?.value
    },
    async png(clip) {
      const r = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) })
      return Buffer.from(r.result.data, "base64")
    },
  }
  const close = async () => {
    ws.close()
    const exited = new Promise((r) => proc.once("exit", r))
    proc.kill()
    await Promise.race([exited, sleep(3000)])
    // the temp Chrome profile this script created; Chrome may still be flushing it
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    } catch {}
  }
  return { page, close }
}
