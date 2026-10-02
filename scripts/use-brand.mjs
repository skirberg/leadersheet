// Switch the whole site to another brand preset: node scripts/use-brand.mjs <preset>
// Rewrites the active brand in src/brand/index.ts and src/app/globals.css, then renders its icons.
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"

const preset = process.argv[2]
const dir = `src/brand/presets/${preset}`
for (const f of ["brand.ts", "logo.tsx", "tokens.css", "favicon.svg", "app-icon.svg"]) {
  if (!existsSync(`${dir}/${f}`)) {
    console.error(`Missing ${dir}/${f}. A preset needs brand.ts, logo.tsx, tokens.css, favicon.svg and app-icon.svg.`)
    process.exit(1)
  }
}
const idx = "src/brand/index.ts"
writeFileSync(idx, readFileSync(idx, "utf8").replace(/presets\/[\w-]+\/brand/, `presets/${preset}/brand`).replace(/presets\/[\w-]+\/logo/, `presets/${preset}/logo`))
const css = "src/app/globals.css"
writeFileSync(css, readFileSync(css, "utf8").replace(/@import "\.\.\/brand\/presets\/[\w-]+\/tokens\.css";/, `@import "../brand/presets/${preset}/tokens.css";`))
execFileSync("node", ["scripts/make-icons.mjs", preset], { stdio: "inherit" })
console.log(`Active brand: ${preset}. Next: npm run build && node scripts/make-og.mjs && node scripts/qa.mjs`)
