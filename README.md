# The Niosome Apothecary

A cozy, timed quiz on niosomes. Ten questions; every correct answer sets a jar, vial, or
brass tool on the apothecary bench. Misses leave a dashed ring empty, and the retry can
fill just those.

## Play locally

Open `index.html` in a browser. No build step, no install.

## Rules

- 20 seconds per question.
- Correct: 100 points plus 2 per second left. Every three in a row adds a ×0.5
  multiplier, up to ×2.
- Wrong or timed out: no penalty beyond the lost points — the correct answer and a
  one-line explanation are shown.
- Keyboard: `1`–`4` or `A`–`D` to answer, `Tab` / `Enter` for the rest.

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

- `index.html` — the whole game: markup, styles, questions, and logic.
- `docs/design.md` — the design decisions behind it.
- `push-to-github.ps1` — creates the repo, pushes, and turns on Pages.
