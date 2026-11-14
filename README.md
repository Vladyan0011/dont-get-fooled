# Don't Get Fooled!

A browser-only educational game about manipulation in news, ads and social media. The main idea: **every post is selling something — an idea, a feeling or an action.** The player uses each trick themselves, sees how it changes the impression without changing the facts, and gets a "trick card" with advice on what to do.

Built with React, TypeScript and Vite. All examples and numbers are fictional. This is a practice game, not a validated test.

## Structure of the quiz

12 challenges in 3 levels ("traps"), 4 challenges each:

| Level | Challenge | Trick | Interaction |
|---|---|---|---|
| **1. The Feeling Trap** | Q01 Same news, louder words | Loaded words | Edit the headline, watch the emotion meter |
| | Q02 95% or 5%? | Framing | Turn the yogurt packs around |
| | Q03 The missing words | Cropped quote | Move sliders to crop the mayor's quote |
| | Q04 How big is the crowd? | Camera angle | Zoom the camera out |
| **2. The Number Trap** | Q05 Risk doubled! | Relative risk | Switch to a 1,000-person dot grid |
| | Q06 Make it scary | Chart tricks | Axis, period and units controls + drama meter |
| | Q07 The average trick | Misleading average | Let a billionaire into the café |
| | Q08 Twice as big? | Size trick | Poster picture vs honest bars |
| **3. The Action Trap** | Q09 Hurry! Only 2 left | Fake urgency | Live countdown that restarts on reload |
| | Q10 Was 12,990, now 3,990! | Price anchor | Open the 12-week price history |
| | Q11 4.9 stars from 1,980 reviews | Fake crowd | Sort reviews by date |
| | Q12 The family chat | The combo | Tap the manipulative parts of a message |

Some questions lock the answer button until the player tries the interaction (`gate` in `src/content.ts`). The results screen shows the score, a level breakdown, a collection of caught and missed tricks, up to three tips based on the missed tricks, and the STOP checklist: **S**pot the feeling, **T**hink who benefits, **O**pen the full picture, **P**ause before you act.

## Run locally

Use Node.js 22.12+ and npm:

```sh
npm install
npm run dev
```

`npm run build` builds into `dist/`, `npm run preview` serves the build, `npm test` checks content, answer keys, scoring, recommendations and every number used in the explanations.

Progress is stored in `localStorage` on the same device. If storage is unavailable, the quiz still works but cannot resume after a reload. Old saved data from earlier versions is detected and the player is asked to start again.

## Editing content

- `src/content.ts` — questions, options, the correct option index (zero-based), explanations for each option, feedback, trick cards, gates, level names, the Q12 message and the STOP checklist. `validateContent()` checks the structure.
- `src/visualData.ts` — every number used by charts and interactions. Tests in `src/scoring.test.ts` check that explanations match these numbers; update both together.
- `src/mechanics/` — one component per interaction, grouped by level (`feeling.tsx`, `numbers.tsx`, `action.tsx`), shared charts in `charts.tsx`.
- `src/scoring.ts` — score, tiers and personal tips.

If you change the meaning of saved answers (order of questions or options), increase `schemaVersion` and the storage key in `src/storage.ts`, so old results are not counted against new questions.

## Live version

https://vladyan0011.github.io/dont-get-fooled/

It is served by GitHub Pages from the `gh-pages` branch, which contains only the built files. To publish an update:

```sh
npm ci && npm test && npm run build
touch dist/.nojekyll
cd dist && git init -q -b gh-pages && git add -A && git commit -qm "Deploy" \
  && git push -f https://github.com/Vladyan0011/dont-get-fooled.git gh-pages && cd ..
```

## Static deployment (Beget or any static host)

1. Run `npm ci`, `npm test` and `npm run build`.
2. Check the host's current plan, HTTPS and terms, then create a site in your own account.
3. Upload the **contents** of `dist/` to the site's document root (file manager, FTP or SFTP). Do not upload source code or `node_modules`.
4. Open the public URL over HTTPS. The app uses one page and relative asset paths, so no server rewrite rules are needed.
5. Check the full quiz on desktop and mobile, including reload and progress, from Russian networks without VPN.

To update: keep an archive of the previous `dist/`, rebuild, replace the files. To roll back, upload the archived copy. The app has no analytics or tracking; the hosting provider may keep normal request logs.
