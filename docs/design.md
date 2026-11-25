# The Niosome Apothecary — Design

## Intent
A cozy ten-question quiz on niosomes with a live illustrated bench scene beside it: a vial
of niosomal medicine being compounded step by step. Correct answers advance the process.
Static page, GitHub Pages, no backend, no saved progress.

## Why
The earlier pass over-designed the game layer (candle economy, routes, ledgers). The user
wanted a normal quiz again, with one engaging thing to watch: something concrete being
made, related to the quiz content. A 3D pass looked mangled; a hand-drawn SVG scene is
crisper, lighter, and renders everywhere.

## Shape
- Parchment quiz card on the left, an illustrated shadow-box bench on the right.
- 20 seconds per question, four shuffled options, one-line explanation after answering.
- Correct: 100 points + 2 per second left. No lives, no penalties beyond the miss.
- Every correct answer advances the SVG vial one manufacturing step; a miss leaves the
  process where it stands.
- Results: score, accuracy, missed questions with explanations, try-the-missed retry (the
  vial keeps its progress), play again (fresh vial), and Share.

## The ten SVG steps (tied to the quiz)
1. A clean vial.
2. Non-ionic surfactant and cholesterol (Q1, Q5).
3. Cast the thin film (Q6).
4. Hydrate the film (Q6).
5. Aqueous cores form (Q2).
6. Surfactant bilayer forms around the cores (Q3).
7. Cholesterol set into the membrane (Q4).
8. Drug loaded, doxorubicin example (Q10).
9. Filled to the neck, sealed, labelled.
10. Boxed and finished.

## Craft
- Hand-drawn SVG scene: no WebGL, no library, no asset files; CSS transitions and keyframes
  animate the liquid, powder, vesicles, cork, label, box and sparkles.
- Step classes on the SVG root (`step-1`…`step-10`) drive every visual state, so the scene
  works in any browser that renders SVG.
- SFX are short WebAudio tones with a mute toggle. No music, no narrator.
- Keyboard answering, aria-live feedback, reduced-motion support, phone layout with the
  specimen stacked above the card.
- No persistence, no tracking, no audio files.

## Cut
The candle economy, consult ledger, routing, stations, dawn scoring, and the shareable
run hash. One quiz, one model, one result.
