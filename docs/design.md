# The Niosome Apothecary — Design

## Intent
A cozy ten-question quiz on niosomes with a live 3D object beside it: a vial of niosomal
medicine being compounded step by step. Correct answers advance the process. Static page,
GitHub Pages, no backend, no saved progress.

## Why
The earlier pass over-designed the game layer (candle economy, routes, ledgers). The user
wanted a normal quiz again, with one engaging thing to watch: something concrete being
made, related to the quiz content.

## Shape
- Parchment quiz card on the left, a sealed glass specimen panel on the right.
- 20 seconds per question, four shuffled options, one-line explanation after answering.
- Correct: 100 points + 2 per second left. No lives, no penalties beyond the miss.
- Every correct answer advances the 3D vial one manufacturing step; a miss leaves the
  process where it stands.
- Results: score, accuracy, missed questions with explanations, try-the-missed retry (the
  vial keeps its progress), play again (fresh vial), and Share.
- The model can be dragged to turn it.

## The ten 3D steps (tied to the quiz)
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
- Three.js r149 (classic build, pinned on jsDelivr) so `index.html` also works over
  `file://`; the quiz continues if WebGL is unavailable.
- All model geometry is procedural (cylinder, sphere, torus, cone, box); no asset files.
- SFX are short WebAudio tones with a mute toggle. No music, no narrator.
- Keyboard answering, aria-live feedback, reduced-motion support, phone layout with the
  specimen stacked above the card.
- No persistence, no tracking, no audio files.

## Cut
The candle economy, consult ledger, routing, stations, dawn scoring, and the shareable
run hash. One quiz, one model, one result.
