// Screenshots for review and for a portfolio. Run `npm run build` first.
// Writes docs/shots/*.png plus two contact sheets: docs/preview-desktop.png and docs/preview-phone.png.
import { copyFileSync, mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { launch, sleep } from "./chrome.ts"
import { serve } from "./serve.ts"

type Shot = { name: string; path: string; size: [number, number]; scheme: "light" | "dark"; mobile?: boolean; wait?: number; js?: string }
const SHOTS: Shot[] = [
  { name: "home-light", path: "/", size: [1440, 900], scheme: "light", wait: 3200 },
  { name: "home-dark", path: "/", size: [1440, 900], scheme: "dark", wait: 7600 },
  { name: "sheet-lab-dark", path: "/learn/leading-through-design/", size: [1440, 900], scheme: "dark", js: `document.querySelector("#see-it").scrollIntoView(); scrollBy(0,-90); [...document.querySelectorAll("[role=radio]")].find(b=>b.textContent==="Matrix")?.click()` },
  // a check answered: the question, then the feedback banner with the reason for every option
  { name: "check-light", path: "/learn/feedback/", size: [1440, 900], scheme: "light", js: `(async()=>{const w=(ms)=>new Promise(r=>setTimeout(r,ms));document.querySelector("button.choice.items-center").click();await w(250);[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Sure").click();await w(400);[...document.querySelectorAll(".feedback")].find((e)=>/right|not quite/i.test(e.innerText)).scrollIntoView({block:"center"})})()` },
  { name: "arcade-light", path: "/play/", size: [1440, 900], scheme: "light", js: `localStorage.setItem("leadersheet-progress", JSON.stringify({mode:"play"})); location.reload()` },
  { name: "phone-sheet-dark", path: "/learn/teaming/", size: [390, 844], scheme: "dark", mobile: true },
  { name: "phone-game-light", path: "/play/culture/", size: [390, 844], scheme: "light", mobile: true, js: `(async()=>{for(let i=0;i<8;i++){document.querySelector("fieldset button").click();await new Promise(r=>setTimeout(r,80))}})()` },
  { name: "phone-today-light", path: "/today/", size: [390, 844], scheme: "light", mobile: true },
  // the network map's result for an example network (names stay in the browser; these are made up)
  { name: "phone-network-light", path: "/play/network/", size: [390, 844], scheme: "light", mobile: true, js: `localStorage.setItem("leadersheet-progress", JSON.stringify({mode:"study",lab:{"g-network":{names:["Priya","Marco","Jen","Tomás","Lee","Dana"],pairs:[[0,1],[0,2],[1,2],[3,4],[4,5]]}}})); location.reload()` },
]

mkdirSync("docs/shots", { recursive: true })
const srv = await serve()
const { page, close } = await launch()
for (const s of SHOTS) {
  await page.size(s.size[0], s.size[1], { dpr: s.mobile ? 3 : 2, mobile: !!s.mobile })
  await page.media({ scheme: s.scheme })
  await page.go(srv.url + s.path, 1500)
  // The site opens light whatever the system says, so a dark shot sets the saved theme and loads again.
  await page.eval(`localStorage.setItem("theme", "${s.scheme}"); location.reload()`)
  await sleep(1500)
  if (s.js) {
    await page.eval(s.js)
    await sleep(1500)
  }
  await sleep(s.wait ?? 1200)
  writeFileSync(`docs/shots/${s.name}.png`, await page.png())
  console.log("shot", s.name)
}
// contact sheets, laid out in the browser
const img = (n: string) => `data:image/png;base64,${readFileSync(`docs/shots/${n}.png`).toString("base64")}`
const sheet = async (names: string[], cols: number, w: number, h: number, out: string) => {
  const html = `<!doctype html><body style="margin:0;background:#e6e2da;padding:24px;display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${names
    .map((n) => `<img src="${img(n)}" style="width:100%;display:block;border-radius:10px;box-shadow:0 0 0 1px rgba(0,0,0,.08)">`)
    .join("")}</body>`
  await page.size(w, h)
  await page.media({ scheme: "light" })
  await page.go("data:text/html," + encodeURIComponent(html), 800)
  writeFileSync(out, await page.png())
  console.log("wrote", out)
}
await sheet(["home-light", "check-light", "sheet-lab-dark", "arcade-light"], 2, 2928, 1848, "docs/preview-desktop.png")
await sheet(["phone-today-light", "phone-sheet-dark", "phone-network-light"], 3, 1242, 896, "docs/preview-phone.png")
// the README's opening picture is the home page as it is today
copyFileSync("docs/shots/home-light.png", "docs/readme/hero.png")
// the app's install sheet (src/app/manifest.ts): the home page wide, Today's call on a phone
const sharp = (await import("sharp")).default
mkdirSync("public/screenshots", { recursive: true })
await sharp("docs/shots/home-light.png").resize(1440, 900).webp({ quality: 82 }).toFile("public/screenshots/wide.webp")
await sharp("docs/shots/phone-today-light.png").resize(780, 1688).webp({ quality: 82 }).toFile("public/screenshots/narrow.webp")
console.log("wrote public/screenshots/wide.webp, narrow.webp")
await close()
srv.close()
