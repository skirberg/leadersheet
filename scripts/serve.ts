// Tiny static server for the exported site in out/. Used by the QA, smoke and image scripts.
// It sends the same response headers as production (the "headers" in vercel.json), so the checks run under
// the real Content-Security-Policy: anything it would block shows up as a page error, not as a surprise live.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { readFileSync } from "node:fs"
import { extname, join, normalize } from "node:path"

const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon", ".zip": "application/zip", ".md": "text/markdown; charset=utf-8" }

type Rule = { source: string; headers: { key: string; value: string }[] }
const RULES: Rule[] = (() => {
  try {
    return (JSON.parse(readFileSync("vercel.json", "utf8")).headers ?? []) as Rule[]
  } catch {
    return []
  }
})()
// Vercel's source patterns are path-to-regexp; the two forms used here are "/(.*)" and literal paths.
const matches = (source: string, path: string) => (source === "/(.*)" ? true : source === path)
// Local checks run over plain http, where these two would send the browser to https and break every request.
const localOnly = (key: string, value: string) =>
  key === "Strict-Transport-Security" ? null : key === "Content-Security-Policy" ? value.replace(/;\s*upgrade-insecure-requests/, "") : value

export function serve(root = "out", port = Number(process.env.SERVE_PORT ?? 4410)): Promise<{ url: string; close: () => void }> {
  const server = createServer(async (req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)).replace(/^(\.\.[/\\])+/, "")
    for (const r of RULES) if (matches(r.source, p)) for (const h of r.headers) {
      const v = localOnly(h.key, h.value)
      if (v != null) res.setHeader(h.key, v)
    }
    let file = join(root, p)
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html")
    } catch {
      file = join(root, "404.html")
      res.statusCode = 404
    }
    try {
      const body = await readFile(file)
      res.setHeader("Content-Type", TYPES[extname(file)] ?? "application/octet-stream")
      res.end(body)
    } catch {
      res.statusCode = 404
      res.end("not found")
    }
  })
  return new Promise((r) => server.listen(port, () => r({ url: `http://localhost:${port}`, close: () => server.close() })))
}
