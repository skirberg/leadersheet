// Lets `node --test` import the site's own modules the way Next.js does: "@/..." paths, imports without an extension
// and JSON files. Pure logic only (scoring, seeding, share text, encoding); anything that needs React or a browser is
// covered by `npm run smoke` instead. Used by `npm test`.
import { registerHooks } from "node:module"
import { readFileSync, statSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { resolve as resolvePath } from "node:path"

const SRC = resolvePath(import.meta.dirname, "../src")
const isFile = (p: string) => {
  try {
    return statSync(p).isFile()
  } catch {
    return false
  }
}

registerHooks({
  resolve(specifier, context, next) {
    let target: string | null = null
    if (specifier.startsWith("@/")) target = resolvePath(SRC, specifier.slice(2))
    else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:"))
      target = resolvePath(fileURLToPath(new URL(".", context.parentURL)), specifier)
    if (target) {
      const hit = [target, ...[".ts", ".tsx", "/index.ts", "/index.tsx"].map((e) => target + e)].find(isFile)
      if (hit) return next(pathToFileURL(hit).href, context)
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.endsWith(".json")) return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")}`, shortCircuit: true }
    return next(url, context)
  },
})
