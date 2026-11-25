# The Niosome Apothecary

A cozy ten-question quiz on niosomes, with a live 3D vial being compounded beside it.
Each correct answer advances the medicine one manufacturing step.

## Play locally

Open `index.html` in a browser. No build step, no install. The 3D model loads Three.js
from a pinned CDN; the quiz works without it.

## The quiz

- Ten multiple-choice questions, shuffled each round, 20 seconds each.
- Correct: 100 points plus 2 per second left. The one-line explanation appears after
  every answer, and the vial advances a step.
- The ten steps follow the science: surfactant and cholesterol, the thin film, hydration,
  aqueous cores, the bilayer, cholesterol set into the membrane, drug loaded, filled,
  sealed and labelled, finished.
- Results show score, accuracy, the missed questions with their explanations, and two
  retries: try the missed questions (the vial keeps its progress) or play again (fresh).
- Share copies a result line and opens the system share sheet where available.
- Drag the 3D model to turn it. No progress is stored.

Keyboard: `1`–`4` or `A`–`D` to answer, `Tab`/`Enter` for the rest.

## Deploy to GitHub Pages

This folder is not on GitHub yet. With the [GitHub CLI](https://cli.github.com)
installed and signed in, run from this folder:

```powershell
.\push-to-github.ps1
```

That creates a public repo named `niosome-apothecary`, pushes `main`, and enables Pages.

By hand instead:

1. Create a public repo named `niosome-apothecary` and push this folder to `main`.
2. In the repo: Settings → Pages → Source "Deploy from a branch", branch `main`,
   folder `/ (root)`.
3. The site appears at `https://<user>.github.io/niosome-apothecary/`.

Public is what makes Pages free on GitHub's free plan. Nothing is stored, so there is no
backend to maintain.

## Files

- `index.html` — layout, quiz card, results, the 3D specimen panel.
- `styles.css` — room, parchment, jar, responsive layout.
- `game.js` — questions, timer, scoring, Three.js vial, SFX, sharing.
- `docs/design.md` — the design decisions behind it.
- `push-to-github.ps1` — creates the repo, pushes, and turns on Pages.
