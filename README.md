# Leadership Sandbox

Every Leadership in Organizations idea, built so you can move it. Twelve sessions as interactive sheets: the idea, a model to play with, the frameworks, a three question check, and a 16 second recap film.

Next.js 16, Tailwind 4, shadcn/ui on Radix, Remotion Player. Static export: no server, no database, progress saved in each visitor's browser.

## Put it online

**Quickest:** drag this folder (or `Leadership Sandbox Site.zip`) onto vercel.com/drop while signed into your personal Vercel account, and pick the personal Hobby team when asked. Vercel sees Next.js and builds it in about a minute.

**Long term:** push this repo to a personal GitHub repository and import it at vercel.com/new under the personal Hobby team. Every push then goes live at the same link, with full history. If the site was first made with Drop, connect the repo in that project's Settings, Git.

Keep this project off the Tickerz GitHub and Vercel accounts.

## Run it on this Mac

```bash
npm install
npm run dev
```

`npm run build` writes the finished site to `out/`.

## Where things live

- `src/data/course.json`: all session content, quizzes, frameworks and readings
- `src/data/labs.ts`: the text inside each lab
- `src/components/labs/`: the 20 interactive labs
- `src/components/film/`: the Remotion hero film and session recap film
- `src/data/games.ts` and `src/components/play/`: the arcade (two quizzes, two timed games) and the Study and Play switch
- `src/app/globals.css`: brand tokens; reasoning in `DESIGN.md`

Unofficial student study companion. Summaries are for learning; read the originals.
