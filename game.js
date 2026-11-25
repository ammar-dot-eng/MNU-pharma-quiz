(function () {
  "use strict";

  var TIME_MS = 20000;
  var CIRC = 150.8;

  var QUESTIONS = [
    { q: "What are niosomes mainly composed of?", options: ["Proteins and carbohydrates", "Non-ionic surfactants and cholesterol", "DNA and RNA", "Metal nanoparticles"], answer: 1, why: "Niosomes are built from non-ionic surfactants plus cholesterol. No phospholipids — that is what makes them cheaper and more stable than liposomes." },
    { q: "Where are hydrophilic drugs mainly encapsulated in niosomes?", options: ["Aqueous core", "Hydrophobic bilayer", "Outer surface only", "Cholesterol molecules"], answer: 0, why: "Hydrophilic drugs dissolve in water, so they sit in the water-filled aqueous core." },
    { q: "Where are lipophilic drugs generally incorporated in niosomes?", options: ["Aqueous core", "Surfactant bilayer", "External aqueous medium", "Only on the outer surface"], answer: 1, why: "Lipophilic drugs prefer fat, so they nest inside the oily surfactant bilayer." },
    { q: "What is the main role of cholesterol in niosomes?", options: ["Give color to the vesicles", "Act as the drug", "Regulate membrane rigidity and permeability", "Replace the surfactant"], answer: 2, why: "Cholesterol slips between the surfactant molecules and tunes how rigid and leaky the membrane is." },
    { q: "Which type of surfactant is mainly used to prepare niosomes?", options: ["Cationic surfactants", "Anionic surfactants", "Non-ionic surfactants", "No surfactants"], answer: 2, why: "Non-ionic surfactants are the defining ingredient — they self-assemble into bilayers without carrying a charge." },
    { q: "Which technique can be used to prepare niosomes?", options: ["Thin-film hydration", "Tablet compression", "Dry granulation", "Direct encapsulation in hard gelatin capsules"], answer: 0, why: "Thin-film hydration is the classic route: cast a dry film of surfactant and cholesterol, then hydrate it into vesicles." },
    { q: "What is a potential advantage of niosomes as drug carriers?", options: ["They always eliminate drug toxicity", "They can improve drug stability and bioavailability", "They cannot carry hydrophilic drugs", "They require no formulation optimization"], answer: 1, why: "Encapsulation shields the drug, which can improve both stability and bioavailability." },
    { q: "What is a possible limitation of niosomal formulations?", options: ["They cannot form bilayers", "They always contain metal cores", "Vesicle aggregation during storage", "They cannot encapsulate drugs"], answer: 2, why: "Vesicles can aggregate or fuse while sitting in storage, so a formulation needs stabilising." },
    { q: "Why are niosomes being investigated for cancer therapy?", options: ["They can potentially improve anticancer drug delivery", "They directly destroy every cancer cell without drugs", "They replace all chemotherapy treatments", "They guarantee complete cancer recovery"], answer: 0, why: "Niosomes can carry anticancer drugs and may reduce off-target toxicity — promising, though still under study." },
    { q: "Which anticancer drug has been investigated in niosomal delivery systems?", options: ["Paracetamol", "Doxorubicin", "Loratadine", "Omeprazole"], answer: 1, why: "Doxorubicin is the classic anticancer drug studied in niosomal delivery." }
  ];

  var STEPS = [
    "a clean vial",
    "surfactant and cholesterol",
    "cast the thin film",
    "hydrate the film",
    "form the aqueous cores",
    "build the bilayer",
    "set in cholesterol",
    "load the drug",
    "fill the vial",
    "seal and label",
    "finished"
  ];

  var LETTERS = ["A", "B", "C", "D"];
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    score: $("score"), sound: $("sound"), quiz: $("quiz"), results: $("results"),
    meta: $("meta"), question: $("question"), choices: $("choices"),
    feedback: $("feedback"), verdict: $("verdict"), why: $("why"), next: $("next"),
    prog: $("prog"), secs: $("secs"), card: document.querySelector("#quiz .card"),
    resultTitle: $("result-title"), resultSub: $("result-sub"), resultScore: $("result-score"),
    resultCorrect: $("result-correct"), remember: $("remember"), missedList: $("missed-list"),
    share: $("share"), shareNote: $("share-note"), replay: $("replay"), mend: $("mend"),
    assembled: $("assembled"), stepName: $("step-name"), bench: $("bench-svg")
  };

  var S = null, lastMissed = [], muted = false, audio = null;
  var model = { step: 0 };

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function prepare(q) {
    var correctText = q.options[q.answer];
    var wrong = q.options.filter(function (_, i) { return i !== q.answer; });
    var options = shuffle(wrong.concat([correctText]));
    return { source: q, options: options, correct: options.indexOf(correctText) };
  }

  /* ---------- the bench scene ---------- */

  function updateScene() {
    if (!el.bench) return;
    for (var i = 1; i <= 10; i++) el.bench.classList.toggle("step-" + i, model.step >= i);
  }

  function revealModel() {
    if (model.step >= 10) return;
    model.step += 1;
    el.assembled.textContent = model.step;
    el.stepName.textContent = STEPS[model.step];
    updateScene();
  }

  function resetModel() {
    model.step = 0;
    el.assembled.textContent = "0";
    el.stepName.textContent = STEPS[0];
    updateScene();
  }

  /* ---------- sound ---------- */

  function sfx(name) {
    if (muted) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
    } catch (e) { return; }
    var t = audio.currentTime;
    function tone(freq, dur, type, vol, slide) {
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.linearRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t + dur);
    }
    if (name === "right") { tone(660, 0.12, "sine", 0.05); setTimeout(function () { tone(990, 0.16, "sine", 0.04); }, 80); }
    if (name === "wrong") tone(190, 0.22, "sine", 0.05, 130);
  }

  /* ---------- quiz ---------- */

  function startRound(mode) {
    var pool = mode === "missed" ? lastMissed.slice() : QUESTIONS.slice();
    S = {
      mode: mode,
      queue: shuffle(pool).map(prepare),
      idx: 0, score: 0, correct: 0, missed: [],
      answered: false, timeLeft: TIME_MS, timer: null
    };
    el.results.hidden = true;
    el.quiz.hidden = false;
    updateScore();
    renderQuestion();
  }

  function updateScore() { el.score.textContent = S.score.toLocaleString(); }

  function renderQuestion() {
    var item = S.queue[S.idx];
    el.meta.textContent = "Question " + (S.idx + 1) + " of " + S.queue.length;
    el.question.textContent = item.source.q;
    el.choices.innerHTML = "";
    item.options.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "choice";
      var key = document.createElement("span");
      key.className = "key"; key.textContent = LETTERS[i];
      var label = document.createElement("span");
      label.textContent = text;
      b.appendChild(key); b.appendChild(label);
      b.addEventListener("click", function () { answer(i); });
      el.choices.appendChild(b);
    });
    el.feedback.classList.remove("show");
    el.verdict.className = "verdict"; el.verdict.textContent = "";
    el.why.textContent = "";
    el.card.classList.remove("low");
    S.answered = false;
    el.question.focus({ preventScroll: true });
    startTimer();
  }

  function paintDial(ms) {
    el.prog.style.strokeDashoffset = (CIRC * (1 - ms / TIME_MS)).toFixed(1);
    el.secs.textContent = Math.ceil(ms / 1000);
    el.card.classList.toggle("low", ms <= 5000);
  }

  function startTimer() {
    var started = performance.now();
    S.timeLeft = TIME_MS;
    paintDial(TIME_MS);
    clearInterval(S.timer);
    S.timer = setInterval(function () {
      S.timeLeft = Math.max(0, TIME_MS - (performance.now() - started));
      paintDial(S.timeLeft);
      if (S.timeLeft <= 0) { clearInterval(S.timer); answer(-1); }
    }, 100);
  }

  function answer(choice) {
    if (!S || S.answered) return;
    S.answered = true;
    clearInterval(S.timer);
    var item = S.queue[S.idx];
    var correct = choice === item.correct;
    var secondsLeft = Math.max(0, Math.ceil(S.timeLeft / 1000));

    Array.prototype.forEach.call(el.choices.children, function (b, i) {
      b.disabled = true;
      if (i === item.correct) b.classList.add("correct");
      else if (i === choice) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    if (correct) {
      var gained = 100 + 2 * secondsLeft;
      S.score += gained;
      S.correct += 1;
      revealModel();
      el.verdict.textContent = "Right. +" + gained;
      el.verdict.className = "verdict";
      sfx("right");
    } else {
      S.missed.push(item.source);
      el.verdict.textContent = choice === -1 ? "Time's up." : "Not quite.";
      el.verdict.className = "verdict bad";
      sfx("wrong");
    }
    el.why.textContent = item.source.why;
    el.feedback.classList.add("show");
    el.next.textContent = S.idx === S.queue.length - 1 ? "See the results" : "Next question";
    updateScore();
    el.next.focus({ preventScroll: true });
  }

  function nextQuestion() {
    S.idx += 1;
    if (S.idx >= S.queue.length) showResults();
    else renderQuestion();
  }

  function showResults() {
    lastMissed = S.missed.slice();
    var total = S.queue.length;
    el.quiz.hidden = true;
    el.results.hidden = false;

    el.resultTitle.textContent = model.step === 10
      ? "The medicine is made."
      : (S.missed.length === 0 ? "All of those, clear." : "The vial is taking shape.");
    el.resultSub.textContent = "You answered " + S.correct + " of " + total + " correctly" +
      (S.mode === "missed" ? " in the mending pass" : "") + " · " + model.step + " of 10 steps made.";
    el.resultScore.textContent = S.score.toLocaleString();
    el.resultCorrect.textContent = S.correct + "/" + total;

    el.missedList.innerHTML = "";
    S.missed.forEach(function (q) {
      var li = document.createElement("li");
      var t = document.createElement("p"); t.className = "m-q"; t.textContent = q.q;
      var a = document.createElement("p"); a.className = "m-a"; a.textContent = q.options[q.answer];
      var w = document.createElement("p"); w.className = "m-why"; w.textContent = q.why;
      li.appendChild(t); li.appendChild(a); li.appendChild(w);
      el.missedList.appendChild(li);
    });
    el.remember.hidden = S.missed.length === 0;
    el.mend.hidden = S.missed.length === 0;
    el.mend.textContent = "Try the " + S.missed.length + " missed";
    el.shareNote.hidden = true;
    el.resultTitle.tabIndex = -1;
    el.resultTitle.focus({ preventScroll: true });
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    var t = document.createElement("textarea");
    t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(t); done();
  }

  function shareRun() {
    var link = location.origin === "null" ? "" : location.origin + location.pathname;
    var text = "The Niosome Apothecary — " + S.correct + "/" + S.queue.length + " correct, " +
      S.score.toLocaleString() + " points, " + model.step + "/10 steps made." + (link ? " " + link : "");
    copyText(text, function () { el.shareNote.hidden = false; });
    if (navigator.share) {
      try { navigator.share({ title: "The Niosome Apothecary", text: text }).catch(function () {}); } catch (e) {}
    }
  }

  function init() {
    resetModel();
    startRound("full");

    el.next.addEventListener("click", nextQuestion);
    el.replay.addEventListener("click", function () { resetModel(); startRound("full"); });
    el.mend.addEventListener("click", function () { startRound("missed"); });
    el.share.addEventListener("click", shareRun);
    el.sound.addEventListener("click", function () {
      muted = !muted;
      el.sound.setAttribute("aria-pressed", muted ? "false" : "true");
      el.sound.setAttribute("aria-label", muted ? "Sound off" : "Sound on");
    });

    document.addEventListener("keydown", function (e) {
      if (el.quiz.hidden || !S || S.answered) return;
      var k = e.key.toLowerCase();
      var idx = "1234".indexOf(k);
      if (idx < 0) idx = "abcd".indexOf(k);
      if (idx >= 0 && idx < 4) { e.preventDefault(); answer(idx); }
    });

    window.addEventListener("pointerdown", function unlock() {
      try {
        if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === "suspended") audio.resume();
      } catch (e) {}
    }, { once: true });
  }

  init();
})();
