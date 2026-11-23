# What is open and what is not

**Open (MIT, see [LICENSE](LICENSE)):** the source code: components, labs as code, scripts, configuration and the brand-preset system.

**Not open, all rights reserved (c) 2026 [skirberg](https://github.com/skirberg):**

- The Leadersheet name, logo, wordmark, app icons and the brand presets' artwork (`src/brand/presets/*/logo.tsx`, `*.svg`, `public/icons/`, `public/*.png`, `public/favicon.ico`).
- The written content: lesson ideas and summaries, decision cases and their grades, check questions, prompts, quiz items and result texts (`src/data/`), and the share cards (`public/og/`).
- The screenshots and films in `docs/`.

You may link to any page, quote short passages with a link back, and share result cards as they are. Please don't republish the content or ship a copy of the site under its name or look. If you fork the code to build something of your own, replace `src/data/` and the brand preset (`npm run brand <your-preset>`; see [docs/BRAND-KIT.md](docs/BRAND-KIT.md)).

**Third parties:**

- The readings belong to their authors and publishers. Leadersheet summarizes them for learning and links to the originals ([docs/SOURCES.md](docs/SOURCES.md)). Framework names such as the Thomas-Kilmann Conflict Mode Instrument, Situational Leadership and GROW belong to their owners; Leadersheet's quizzes are not those instruments.
- Fonts: Noticia Text, Instrument Sans, Funnel Display and Martian Mono, under the SIL Open Font License 1.1.
- Icons: Lucide, under the ISC license.
