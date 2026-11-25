# The Niosome Apothecary

A cozy, King's-Quest-shaped night in an apothecary. Ten questions on niosomes become ten
objects in one illustrated shop. You have one candle, one night, and one glass vessel to
fill before dawn.

## Play locally

Open `index.html` in a browser. No build step, no install.

## The night

- Click an object in the shop to open its question. The answer bottles are the reagents:
  the right one pours into the glass vessel and shows its explanation.
- **One candle for the whole night** (24 drops). It burns while you think (1 drop per 3
  seconds), pauses while you read, and is worth 25 points per leftover drop at dawn.
- **Consult the ledger** (4 drops, once per question) crosses out one wrong bottle and
  gives a concept nudge.
- Seals mark worth: bronze 100, silver 150, gold 200, and one glowing capstone at 300.
  Order is yours.
- Correct answers earn station points and 4 drops of wax back (up to 24). A miss leaves
  that segment cloudy; the first time the candle dies, a spare stub adds 6 drops. If it
  dies again, the rest of the night finishes untimed in morning light at half value.
- Dawn pays: clear stations + wax left + 300 for a full vessel. Share the result, tend
  the missed stations with your leftover wax, or play another night.

Keyboard: `1`–`4` or `A`–`D` to answer, `H` to consult, `Enter`/`Space` for the rest.

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

- `index.html` — the shop scene, the question slip, and the dawn card.
- `styles.css` — room, candle, bottles, dawn.
- `game.js` — questions, candle economy, scoring, WebAudio SFX, sharing.
- `docs/design.md` — the design decisions behind it.
- `push-to-github.ps1` — creates the repo, pushes, and turns on Pages.
