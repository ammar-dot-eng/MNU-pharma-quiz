# The Niosome Apothecary — Design

## Intent
A cozy, King's-Quest-shaped night in an apothecary. Ten questions on niosomes become ten
objects in one illustrated shop. The player has one candle, one night, and one glass
vessel to fill before dawn. Static page, GitHub Pages, no backend, no saved progress.

## Why
The first build was a quiz with a progress meter: every question was the same single
action. This revamp adds priced decisions, a shared resource, exploration, and a
constructed artifact. The apothecary look and warm tone stay. No narrator, no music;
short synthesized SFX.

## The night
A knock at midnight: the healer's apprentice needs a niosome remedy before dawn. The shop
is one illustrated scene with ten clickable stations (the ten questions, assigned to
stations in a fresh shuffle each run). Each station carries a brass worth tag. A glass
vessel on the counter is the progress meter and the final artifact.

## Loop
1. Click a station. A parchment slip opens with the question and four wax-sealed bottles.
2. The chosen bottle pours into the vessel; the why-line opens. Correct: the segment
   clears, takes its concept tag, and tips 4 drops of wax back into the candle. Wrong or
   timed out: the segment stays cloudy, the right bottle and why-line are shown, no tip.
3. Back to the shop; choose the next station freely.

## Decisions
- **One candle, whole night.** 24 drops; 1 drop per 3 s while a slip is open and
  unanswered; paused for reading feedback. Leftover drops are worth 25 points each at
  dawn. Early dawdling starves the late, high-value stations.
- **Consult the ledger.** 4 drops, once per station: strikes one wrong bottle and shows a
  concept nudge (never the answer). A loss on what you know, cheap insurance on the
  capstone.
- **Route.** Worth tags: Dusk stations 100, Midnight 150, Before Dawn 200, capstone 300.
  Order is the player's.
- **Spare stub.** The first time the candle dies, +6 drops once. The second time, the
  remaining stations finish untimed in morning light at half value; every explanation is
  still shown, nothing is skipped.

## Learning
The correct bottle is the reagent for that concept; the vessel is a labelled revision
sheet at dawn. Cloudy segments mark gaps and are re-asked by the mending retry. Every
answer opens its explanation and pauses the candle, so reading is never taxed.

## Dawn
Score = sum of clear station worth + leftover drops x25 + 300 if every segment is clear.
The vessel is a focusable diagram: each segment replays its question, answer, why, and
state. Buttons: Tend the missed stations (keeps filled segments, candle seeded by
leftover wax, minimum 6) and Another night. A Share button copies a result line (and uses
the system share sheet where available); a run encoded in the URL hash opens a read-only
dawn card.

## Craft
- `index.html` — markup, illustrated SVG scene, vessel.
- `styles.css` — room, candle, slip, bottles, dawn.
- `game.js` — state, questions, timer, scoring, SFX (WebAudio), share.
- Accessibility: full keyboard map (1-4/A-D answer, H consult, Enter next), visible focus,
  aria-live for drops/verdicts, reduced motion, phone layout.
- No persistence, no tracking, no audio files.

## Cut from the design panel
Loose/Bind meters, beam multiplier, seals ladder, commissions, dexterity pouring, and the
stacked economies. One currency, one priced decision, plus routing.
