// Screenshots for review and for a portfolio. Run `npm run build` first.
// Writes docs/shots/*.png plus two contact sheets: docs/preview-desktop.png and docs/preview-phone.png.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { launch, sleep } from "./chrome.mjs"
import { serve } from "./serve.mjs"

const SHOTS = [
  { name: "home-light", path: "/", size: [1440, 900], scheme: "light", wait: 3200 },
  { name: "home-dark", path: "/", size: [1440, 900], scheme: "dark", wait: 7600 },
  { name: "sheet-lab-dark", path: "/learn/s3/", size: [1440, 900], scheme: "dark", js: `document.querySelector("#see-it").scrollIntoView(); scrollBy(0,-90); [...document.querySelectorAll("[role=radio]")].find(b=>b.textContent==="Matrix")?.click()` },
  { name: "arcade-light", path: "/play/", size: [1440, 900], scheme: "light", js: `localStorage.setItem("lio-sandbox", JSON.stringify({mode:"play"})); location.reload()` },
  { name: "phone-sheet-dark", path: "/learn/s6/", size: [390, 844], scheme: "dark", mobile: true },
  { name: "phone-game-light", path: "/play/culture/", size: [390, 844], scheme: "light", mobile: true, js: `(async()=>{for(let i=0;i<8;i++){document.querySelector("fieldset button").click();await new Promise(r=>setTimeout(r,80))}})()` },
]

mkdirSync("docs/shots", { recursive: true })
const srv = await serve()
const { page, close } = await launch()
for (const s of SHOTS) {
  await page.size(s.size[0], s.size[1], { dpr: s.mobile ? 3 : 2, mobile: !!s.mobile })
  await page.media({ scheme: s.scheme })
  await page.go(srv.url + s.path, 1500)
  if (s.js) {
    await page.eval(s.js)
    await sleep(1500)
  }
  await sleep(s.wait ?? 1200)
  writeFileSync(`docs/shots/${s.name}.png`, await page.png())
  console.log("shot", s.name)
}
// contact sheets, laid out in the browser
const img = (n) => `data:image/png;base64,${readFileSync(`docs/shots/${n}.png`).toString("base64")}`
const sheet = async (names, cols, w, h, out) => {
  const html = `<!doctype html><body style="margin:0;background:#e6e2da;padding:24px;display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${names
    .map((n) => `<img src="${img(n)}" style="width:100%;display:block;border-radius:10px;box-shadow:0 0 0 1px rgba(0,0,0,.08)">`)
    .join("")}</body>`
  await page.size(w, h)
  await page.media({ scheme: "light" })
  await page.go("data:text/html," + encodeURIComponent(html), 800)
  writeFileSync(out, await page.png())
  console.log("wrote", out)
}
await sheet(["home-light", "home-dark", "sheet-lab-dark", "arcade-light"], 2, 2928, 1848, "docs/preview-desktop.png")
await sheet(["phone-sheet-dark", "phone-game-light"], 2, 828, 896, "docs/preview-phone.png")
await close()
srv.close()
