# Cozy Niosome Quiz — Design

## Intent
A small, cozy, timed multiple-choice quiz on niosomes (the 10 supplied questions) that
entertains and cements the concepts. Deployed as a static page on GitHub Pages.

## Why
The user wants an interactive game, not a plain quiz: cozy motion, a per-question timer,
a visible "something being built" for each correct answer, an end retry button, and no
saved progress.

## Goals
- 10 questions, 20 s soft timer, instant feedback with a one-line explanation.
- Visible build: an apothecary bench gains one unique jar, vial, or brass tool per
  correct answer; a miss leaves a dashed empty ring on the wood.
- End card: the bench, score, accuracy, best streak, a list of missed questions with
  their explanations, and two retry buttons.
- Cozy: warm dark room, parchment label, brass dial, soft motion, no fail state.
- One static, self-contained page deployable to GitHub Pages.
- Retry fully resets; nothing is stored.

## Non-goals
- No accounts, shared leaderboard, or progress across sessions/devices.
- No backend, build step, or dependencies (webfonts aside).
- No audio in v1 (a soft chime can be added later).
- No spaced-repetition scheduling — the retry-missed round is enough.

## Anti-goals
- Feeling like an exam or a stress machine; punishing wrong answers; lives/game-over.
- Anything that needs a server.

## Constraints
- Static only: one `index.html` with inline CSS and JS; the only external requests are
  Google Fonts (Fraunces, Karla).
- Quiz content fixed as supplied, except the ten "why" lines, which we wrote.
- 20 s per question; a timeout counts as a missed question.
- Keyboard answering (1–4 or A–D) and respect for `prefers-reduced-motion`.

## Approaches considered
- Game layer: score-only (too thin), **build-a-scene (picked)**, hearts/lives (rejected:
  punitive, fights the cozy goal).
- Scene: **apothecary bench (picked)** — warm, tactile, and apt to pharmaceutics; glass
  dome niosome diorama (runner-up: most on-theme, colder); greenhouse (the plant idea,
  better drawn).
- Persistence: **none (picked by user)** over localStorage best score.
- Format: **single self-contained file** over a framework app.

## How it plays
- Round: 10 questions; question order and answer positions are shuffled each round.
- Timer: 20 s brass dial draining slowly; a timeout reveals the answer and moves on.
- Scoring: 100 per correct answer + 2 per second remaining (max 40). Every three
  consecutive correct answers adds ×0.5 to the multiplier, capped at ×2.
- Feedback: the correct choice is marked, the one-line why appears, and the player
  continues when ready.
- Bench: ten slots. Correct answers fill the next slot with a unique item, popping in
  with a small wobble and a warm glow; a miss leaves that slot's dashed ring empty.
- End card: bench, score, accuracy, best streak, missed questions with their why lines,
  and two buttons — "Fill the N empty ring(s)" (missed questions only; already-filled
  items stay) and "Play again" (full reset and reshuffle).
- No data is stored anywhere.

## Hosting
GitHub Pages, deployed from `main` at the repository root. Public repo (required for
Pages on the free plan). `push-to-github.ps1` automates repo creation, push, and Pages
enablement; the manual steps are in `README.md`.

## Extending
- Swap or restyle the ten bench items in the `ITEMS` array.
- Change `TIME_MS` for a gentler or sharper timer.
- Add a soft chime on a correct answer; there is deliberately no audio yet.
