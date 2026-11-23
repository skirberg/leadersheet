// Builds a clean, public copy of this repository as ONE commit with no history, for publishing.
//
//   node scripts/public-snapshot.ts ../leadersheet-public
//
// It copies the tracked files at HEAD, leaves out the private ones (PRIVATE below), commits them under the
// GitHub no-reply address, and refuses to finish if any file still holds a private marker: a personal email,
// or a pattern from an untracked `.public-deny` file (one regular expression per line; keep the words you
// don't want published out of the public repo itself). Then push the folder to a new, empty public repository.
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

// Tracked files to leave out of a public copy. Private notes no longer live in the repo, so it starts empty.
const PRIVATE: string[] = []
const AUTHOR = { name: "skirberg", email: "163672792+skirberg@users.noreply.github.com" }

const out = resolve(process.argv[2] ?? "../leadersheet-public")
if (existsSync(out) && readdirSync(out).length) {
  console.error(`${out} is not empty. Point at a new folder.`)
  process.exit(1)
}

const deny: RegExp[] = [/[\w.+-]+@(gmail|yahoo|hotmail|outlook|icloud|proton(mail)?)\.\w+/i]
if (existsSync(".public-deny"))
  for (const line of readFileSync(".public-deny", "utf8").split("\n").map((l) => l.trim()))
    if (line && !line.startsWith("#")) deny.push(new RegExp(line, "i"))

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((f) => f && !PRIVATE.includes(f) && existsSync(f))

const hits: string[] = []
for (const f of files) {
  // Read as UTF-8, the deny list's own encoding, so a non-ASCII name such as "Universität" matches. In a
  // binary only runs of eight or more readable characters count (metadata, embedded strings), the way
  // `strings` reads a file: compressed pixels spell short words by chance, and invalid UTF-8 breaks a run.
  // Every file is scanned, whatever its size.
  const bytes = readFileSync(f)
  const text = bytes.toString("utf8")
  const binary = bytes.subarray(0, 8000).includes(0)
  const views = [binary ? (text.match(/[\x20-\x7e -ɏ]{8,}/g) ?? []).join("\n") : text]
  for (const re of deny) if (views.some((t) => re.test(t))) hits.push(`${f}: matches ${re}`)
}
if (hits.length) {
  console.error("Private markers found; nothing was written:\n" + hits.join("\n"))
  process.exit(1)
}

mkdirSync(out, { recursive: true })
for (const f of files) {
  mkdirSync(dirname(join(out, f)), { recursive: true })
  cpSync(f, join(out, f))
}
const git = (...args: string[]) => execFileSync("git", args, { cwd: out, stdio: "pipe", encoding: "utf8" })
git("init", "-q", "-b", "main")
git("add", "-A")
git(
  "-c", `user.name=${AUTHOR.name}`,
  "-c", `user.email=${AUTHOR.email}`,
  "commit", "-q", "-m", "Leadersheet\n\nLearn leadership by doing: twenty-four lessons, each with a model you can move and a decision that moves it. https://leadersheet.io",
)
console.log(`${files.length} files, one commit, in ${out}. Left out: ${PRIVATE.join(", ") || "nothing"}.`)
console.log(`Next: create an empty public repository on GitHub, then from ${out}: git remote add origin <its URL> && git push -u origin main`)
rmSync(join(out, ".public-deny"), { force: true })
