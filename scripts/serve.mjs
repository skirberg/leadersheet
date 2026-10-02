// Tiny static server for the exported site in out/. Used by the QA and image scripts.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" }

export function serve(root = "out", port = 4410) {
  const server = createServer(async (req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "")
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
