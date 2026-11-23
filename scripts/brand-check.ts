// Fails when anything brand-shaped on the site is out of date or disagrees with itself. Run after `npm run build`.
//   1. Every icon, share card and kit file is exactly what its generator last wrote (sha256 in src/brand/generated.json),
//      and the sources it was drawn from have not changed since (the preset, the share-card page, the banner page).
//   2. Every icon the pages and the web manifest name is a generated file in the build, at the size it claims.
//   3. The kit's mark is the favicon's drawing: LogoMark (logo.tsx) and favicon.svg have not drifted apart.
//   4. The maskable icon keeps its drawing inside the central 80% circle.
//   5. kit.json lists every kit file with the sha256 of the file the site serves, and kit.zip holds exactly those files.
// usage: node scripts/brand-check.ts              (the build in out/)
//        node scripts/brand-check.ts --live <url> (the live site: every file in its kit.json, the icons and the share card)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { activePreset, brandOf, cleanSvg, hexOf, inputsOf, kitFiles, publicPath, readGenerated, readTokens, sha256, sourceArt, zipNames, presetDir } from "./brand-kit-lib.ts"
import { KIT_DIR } from "../src/brand/kit.ts"
import { decodePng, pngSize } from "./png.ts"

const problems: string[] = []
const fail = (s: string) => problems.push(s)
const live = process.argv.indexOf("--live")

if (live > -1) {
  const base = (process.argv[live + 1] ?? "https://leadersheet.io").replace(/\/$/, "")
  const get = async (p: string) => {
    const r = await fetch(base + p, { redirect: "follow" })
    return { status: r.status, body: Buffer.from(await r.arrayBuffer()) }
  }
  const k = await get(`/${KIT_DIR}/kit.json`)
  if (k.status !== 200) fail(`/${KIT_DIR}/kit.json: ${k.status}`)
  else {
    const kit = JSON.parse(k.body.toString())
    const bySha = new Map<string, string>()
    for (const f of [...kit.files, kit.zip]) {
      const r = await get(f.url)
      if (r.status !== 200) fail(`${f.url}: ${r.status}`)
      else if (sha256(r.body) !== f.sha256) fail(`${f.url}: the live file is not the one kit.json lists`)
      bySha.set(f.url, f.sha256)
    }
    // What a browser, a home screen and a link preview actually fetch.
    const home = (await get("/")).body.toString()
    const named = [
      ...[...home.matchAll(/<link rel="(?:icon|apple-touch-icon)" href="([^"?]+)/g)].map((m) => m[1]),
      ...[...home.matchAll(/<meta property="og:image" content="https?:\/\/[^/]+([^"]+)"/g)].map((m) => m[1]),
      ...(JSON.parse((await get("/manifest.webmanifest")).body.toString()).icons as { src: string }[]).map((i) => i.src),
    ]
    for (const u of new Set(named)) if (!bySha.has(u)) fail(`${u}: the site names it but kit.json does not list it`)
    console.log(`${kit.files.length} kit files and the zip checked on ${base} (kit ${kit.version.commit}, ${kit.version.date}); ${new Set(named).size} icons and cards the pages name.`)
  }
} else {
  const preset = activePreset()
  const BRAND = await brandOf(preset)
  const g = readGenerated()

  // 1. Generated files: present, unedited, and drawn from today's sources.
  for (const [p, e] of Object.entries(g)) {
    const f = `public/${p}`
    if (!existsSync(f)) fail(`${p}: recorded in generated.json but missing`)
    else if (sha256(readFileSync(f)) !== e.sha256) fail(`${p}: changed by hand since it was generated`)
  }
  const stale = (what: string, paths: string[], now: string, fix: string) => {
    const old = paths.filter((p) => g[p] && g[p].from !== now)
    const absent = paths.filter((p) => !g[p])
    if (old.length) fail(`${what}: ${old.length} files were drawn from older sources (${old.slice(0, 3).join(", ")}${old.length > 3 ? "…" : ""}). Run ${fix}.`)
    if (absent.length) fail(`${what}: ${absent.length} files were never generated (${absent.slice(0, 3).join(", ")}${absent.length > 3 ? "…" : ""}). Run ${fix}.`)
  }
  stale("icons", ["icon.svg", "favicon.ico", "apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon-1024.png", ...readdirSync("public/icons").filter((f) => f.startsWith("shortcut-")).map((f) => `icons/${f}`)], inputsOf.icons(preset), "npm run icons")
  const cards: [string, string][] = [["/og/", "og.png"]]
  const dirs = (d: string) => readdirSync(d).filter((f) => statSync(join(d, f)).isDirectory())
  for (const id of dirs("out/og/sheet")) cards.push([`/og/sheet/${id}/`, `og/sheet-${id}.png`])
  for (const id of dirs("out/og/framework")) cards.push([`/og/framework/${id}/`, `og/framework-${id}.png`])
  for (const game of dirs("out/og/result")) for (const id of dirs(join("out/og/result", game))) cards.push([`/og/result/${game}/${id}/`, `og/${game}-${id}.png`])
  for (const id of dirs("out/og/card")) cards.push([`/og/card/${id}/`, `og/${id}.png`])
  for (const [route, p] of cards) stale(`share card ${p}`, [p], inputsOf.og(route), "npm run og")
  const kitOwn = kitFiles(BRAND.id).filter((k) => !k.served).map(publicPath)
  stale("brand kit", kitOwn, inputsOf.kit(preset), "npm run brand:kit")
  if (existsSync("public/icon.svg") && readFileSync("public/icon.svg", "utf8") !== readFileSync(`${presetDir(preset)}/favicon.svg`, "utf8")) fail("public/icon.svg is not the preset's favicon.svg")

  // 2. Icons the site names exist in the build, are generated, and are the size they say.
  const home = readFileSync("out/index.html", "utf8")
  const manifest = JSON.parse(readFileSync("out/manifest.webmanifest", "utf8")) as { icons: { src: string; sizes: string; purpose?: string }[] }
  const named: [string, string | null][] = [
    ...[...home.matchAll(/<link rel="(?:icon|apple-touch-icon)" href="([^"?]+)[^"]*"(?: sizes="(\d+x\d+)")?/g)].map((m) => [m[1], m[2] ?? null] as [string, string | null]),
    ...manifest.icons.map((i) => [i.src, i.sizes] as [string, string]),
  ]
  for (const [src, sizes] of named) {
    const f = `out${src}`
    if (!existsSync(f)) {
      fail(`${src}: named by the site but not in the build`)
      continue
    }
    if (!g[src.slice(1)]) fail(`${src}: named by the site but not made by a generator`)
    if (src.endsWith(".png") && sizes) {
      const { width, height } = pngSize(readFileSync(f))
      if (`${width}x${height}` !== sizes) fail(`${src}: is ${width}x${height}, the site says ${sizes}`)
    }
  }
  if (!manifest.icons.some((i) => i.purpose === "maskable")) fail("the web manifest has no maskable icon")

  // 3. The mark the kit is drawn from (LogoMark, as the site renders it) is the favicon's drawing.
  const t = readTokens(preset)
  const norm = (svg: string) => {
    const s = cleanSvg(svg.replace(/var\(--signal\)/g, hexOf(t.light, "signal")))
    return (s.vb + s.inner).replace(/\s+/g, " ").replace(/<(\w+)([^>]*?)\s*\/>/g, "<$1$2/>").toLowerCase()
  }
  if (norm(sourceArt().mark) !== norm(readFileSync(`${presetDir(preset)}/favicon.svg`, "utf8")))
    fail(`LogoMark in ${presetDir(preset)}/logo.tsx and favicon.svg are different drawings: change both, then npm run brand:kit`)

  // 4. Maskable: everything outside the central 80% circle is background.
  const mask = "out/icons/icon-maskable-512.png"
  if (existsSync(mask)) {
    const { width, rgba } = decodePng(readFileSync(mask))
    const bg = rgba.subarray(0, 4)
    let outside = 0
    for (let y = 0; y < width; y++)
      for (let x = 0; x < width; x++) {
        if (Math.hypot(x + 0.5 - width / 2, y + 0.5 - width / 2) <= width * 0.4) continue
        const i = (y * width + x) * 4
        if ([0, 1, 2].some((c) => Math.abs(rgba[i + c] - bg[c]) > 24)) outside++
      }
    if (outside > 0) fail(`${mask}: ${outside} pixels of the drawing sit outside the central 80% circle a launcher may crop to`)
  }

  // 5. kit.json and kit.zip, as served.
  const kj = `out/${KIT_DIR}/kit.json`
  if (!existsSync(kj)) fail(`${kj} missing (the prebuild packs it)`)
  else {
    const kit = JSON.parse(readFileSync(kj, "utf8"))
    const want = new Set(kitFiles(BRAND.id).map((k) => k.path))
    for (const f of kit.files) {
      want.delete(f.path)
      const p = `out${f.url}`
      if (!existsSync(p)) fail(`${f.url}: in kit.json but not in the build`)
      else if (sha256(readFileSync(p)) !== f.sha256) fail(`${f.url}: kit.json lists a different file than the one served`)
    }
    for (const p of want) fail(`${p}: in the kit spec but not in kit.json`)
    const zp = `out${kit.zip.url}`
    if (!existsSync(zp) || sha256(readFileSync(zp)) !== kit.zip.sha256) fail("kit.zip is not the one kit.json lists")
    else {
      const names = zipNames(readFileSync(zp)).map((n) => n.replace(/^[^/]+\//, ""))
      const listed = new Set([...kit.files.map((f: { path: string }) => f.path), "README.txt"])
      if (names.length !== listed.size || names.some((n) => !listed.has(n))) fail("kit.zip does not hold exactly the files kit.json lists")
    }
    const sitemap = existsSync("out/sitemap.xml") ? readFileSync("out/sitemap.xml", "utf8") : ""
    if (!sitemap.includes(`/${KIT_DIR}/<`)) fail(`/${KIT_DIR}/ is not in the sitemap`)
    if (!existsSync(`out/${KIT_DIR}/index.html`)) fail(`/${KIT_DIR}/ page missing from the build`)
    else if (!/href="\/brand\/"/.test(home)) fail(`the home page does not link to /${KIT_DIR}/`)
    console.log(`${Object.keys(g).length} generated files, ${cards.length} share cards, ${named.length} icons the site names, ${kit.files.length} kit files (${(kit.zip.bytes / 1e6).toFixed(1)} MB zip).`)
  }
}

if (problems.length) {
  console.log(problems.join("\n"))
  process.exit(1)
} else console.log("All clear: every icon, share card and kit file is current, and the kit matches what the site serves.")
