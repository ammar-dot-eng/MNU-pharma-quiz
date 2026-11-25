(function () {
  "use strict";

  var START_CANDLE = 24, BURN_MS = 3000, TIP = 4, CONSULT_COST = 4, SPARE = 6, WAX_VALUE = 25, BONUS = 300;

  var QUESTIONS = [
    { q: "What are niosomes mainly composed of?", options: ["Proteins and carbohydrates", "Non-ionic surfactants and cholesterol", "DNA and RNA", "Metal nanoparticles"], answer: 1, worth: 100, nudge: "What separates a niosome from a liposome?", why: "Niosomes are built from non-ionic surfactants plus cholesterol. No phospholipids — that is what makes them cheaper and more stable than liposomes." },
    { q: "Where are hydrophilic drugs mainly encapsulated in niosomes?", options: ["Aqueous core", "Hydrophobic bilayer", "Outer surface only", "Cholesterol molecules"], answer: 0, worth: 100, nudge: "Where does water-soluble cargo wait?", why: "Hydrophilic drugs dissolve in water, so they sit in the water-filled aqueous core." },
    { q: "Where are lipophilic drugs generally incorporated in niosomes?", options: ["Aqueous core", "Surfactant bilayer", "External aqueous medium", "Only on the outer surface"], answer: 1, worth: 100, nudge: "Where would something oily rather sit?", why: "Lipophilic drugs prefer fat, so they nest inside the oily surfactant bilayer." },
    { q: "What is the main role of cholesterol in niosomes?", options: ["Give color to the vesicles", "Act as the drug", "Regulate membrane rigidity and permeability", "Replace the surfactant"], answer: 2, worth: 150, nudge: "What does cholesterol tune in the membrane?", why: "Cholesterol slips between the surfactant molecules and tunes how rigid and leaky the membrane is." },
    { q: "Which type of surfactant is mainly used to prepare niosomes?", options: ["Cationic surfactants", "Anionic surfactants", "Non-ionic surfactants", "No surfactants"], answer: 2, worth: 150, nudge: "Which surfactants self-assemble without a charge?", why: "Non-ionic surfactants are the defining ingredient — they self-assemble into bilayers without carrying a charge." },
    { q: "Which technique can be used to prepare niosomes?", options: ["Thin-film hydration", "Tablet compression", "Dry granulation", "Direct encapsulation in hard gelatin capsules"], answer: 0, worth: 150, nudge: "Which method starts with a dried film?", why: "Thin-film hydration is the classic route: cast a dry film of surfactant and cholesterol, then hydrate it into vesicles." },
    { q: "What is a potential advantage of niosomes as drug carriers?", options: ["They always eliminate drug toxicity", "They can improve drug stability and bioavailability", "They cannot carry hydrophilic drugs", "They require no formulation optimization"], answer: 1, worth: 150, nudge: "What benefit comes from shielding the drug?", why: "Encapsulation shields the drug, which can improve both stability and bioavailability." },
    { q: "What is a possible limitation of niosomal formulations?", options: ["They cannot form bilayers", "They always contain metal cores", "Vesicle aggregation during storage", "They cannot encapsulate drugs"], answer: 2, worth: 200, nudge: "What can vesicles do to each other in storage?", why: "Vesicles can aggregate or fuse while sitting in storage, so a formulation needs stabilising." },
    { q: "Why are niosomes being investigated for cancer therapy?", options: ["They can potentially improve anticancer drug delivery", "They directly destroy every cancer cell without drugs", "They replace all chemotherapy treatments", "They guarantee complete cancer recovery"], answer: 0, worth: 200, nudge: "What might better delivery do for treatment?", why: "Niosomes can carry anticancer drugs and may reduce off-target toxicity — promising, though still under study." },
    { q: "Which anticancer drug has been investigated in niosomal delivery systems?", options: ["Paracetamol", "Doxorubicin", "Loratadine", "Omeprazole"], answer: 1, worth: 300, nudge: "Name the classic anthracycline studied here.", why: "Doxorubicin is the classic anticancer drug studied in niosomal delivery." }
  ];

  var STATIONS = ["the red jar", "the teal jar", "the amber jar", "the hanging herbs", "the ledger", "the mortar", "the brass scale", "the basket", "the still", "the drawer"];
  var BOTTLE_COLORS = ["#d9a441", "#79b3a6", "#d78f8f", "#a99bd1"];
  var LETTERS = ["A", "B", "C", "D"];

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    candle: $("candle"), drops: $("drops"), wax: $("wax"), flame: $("flame"),
    score: $("score"), sound: $("sound"), scene: $("scene"), shop: document.querySelector(".shop"),
    overlay: $("overlay"), qmeta: $("qmeta"), qworth: $("qworth"), qtext: $("qtext"),
    choices: $("choices"), consult: $("consult"), note: $("candle-note"),
    feedback: $("feedback"), verdict: $("verdict"), why: $("why"), next: $("next"),
    dawn: $("dawn"), dawnTitle: $("dawn-title"), dawnSub: $("dawn-sub"), dawnKicker: $("dawn-kicker"),
    finalScore: $("final-score"), breakdown: $("breakdown"), remember: $("remember"), missedList: $("missed-list"),
    share: $("share"), shareNote: $("share-note"), replay: $("replay"), mend: $("mend"),
    sharedNote: $("shared-note"), playOwn: $("play-own")
  };

  var S = null, lastRun = null, muted = false, audio = null, nav = null;

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

  function tier(worth) { return worth === 300 ? "4" : worth === 200 ? "3" : worth === 150 ? "2" : "1"; }

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
    if (name === "open") tone(392, 0.07, "triangle", 0.03);
    if (name === "right") { tone(660, 0.12, "sine", 0.05); setTimeout(function () { tone(990, 0.16, "sine", 0.04); }, 80); }
    if (name === "wrong") tone(190, 0.22, "sine", 0.05, 130);
    if (name === "spare") { tone(320, 0.1, "triangle", 0.04, 520); }
    if (name === "dawn") { tone(523, 0.3, "sine", 0.04); setTimeout(function () { tone(784, 0.5, "sine", 0.03); }, 180); }
  }

  function buildNav() {
    if (nav) return;
    nav = document.createElement("div");
    nav.className = "stations";
    nav.setAttribute("aria-label", "Stations");
    STATIONS.forEach(function (name, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "station"; b.textContent = name;
      b.addEventListener("click", function () { openStation(i); });
      nav.appendChild(b);
    });
    el.shop.appendChild(nav);
  }

  function buildRound() {
    var order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    S = {
      candle: START_CANDLE, clearWorth: 0, spareUsed: false, morning: false,
      assignments: STATIONS.map(function (label, i) {
        var q = prepare(QUESTIONS[order[i]]);
        return { station: i, q: q, state: "open", seg: null };
      }),
      current: null, answered: false, consultUsed: false, missed: [],
      timer: null, last: 0, burnAcc: 0
    };
    document.querySelectorAll(".hs").forEach(function (h, i) {
      h.classList.remove("done", "cloudy");
      h.dataset.tier = tier(S.assignments[i].q.source.worth);
    });
    document.querySelectorAll(".seg").forEach(function (s) { s.classList.remove("filled", "cloudy"); });
    el.feedback.classList.remove("show");
    el.overlay.hidden = true;
    el.dawn.hidden = true;
    el.shareNote.hidden = true;
    updateGauges();
    renderNav();
  }

  function renderNav() {
    if (!nav) return;
    Array.prototype.forEach.call(nav.children, function (b, i) {
      var a = S.assignments[i];
      b.classList.toggle("done", a.state === "clear");
      b.classList.toggle("cloudy", a.state === "cloudy");
      b.dataset.tier = tier(a.q.source.worth);
    });
  }

  function updateGauges() {
    var pct = Math.max(0, Math.min(1, S.candle / START_CANDLE));
    el.wax.style.height = (pct * 100) + "%";
    el.drops.textContent = S.candle;
    el.candle.setAttribute("aria-label", S.candle + " drops of wax left");
    el.flame.style.display = S.candle > 0 ? "" : "none";
    el.score.textContent = S.clearWorth.toLocaleString();
  }

  function openStation(i) {
    if (!S || !el.overlay.hidden || !el.dawn.hidden) return;
    var a = S.assignments[i];
    if (a.state !== "open") return;
    S.current = i; S.answered = false; S.consultUsed = false;
    var q = a.q;
    el.qmeta.textContent = STATIONS[i].charAt(0).toUpperCase() + STATIONS[i].slice(1);
    el.qworth.textContent = "Dawn worth " + q.source.worth + (S.morning ? " · morning light" : "");
    el.qtext.textContent = q.source.q;
    el.choices.innerHTML = "";
    q.options.forEach(function (text, idx) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "bottle";
      var key = document.createElement("span"); key.className = "key"; key.textContent = LETTERS[idx];
      var flask = document.createElement("span"); flask.className = "flask";
      flask.style.setProperty("--c", BOTTLE_COLORS[idx % BOTTLE_COLORS.length]);
      var label = document.createElement("span"); label.textContent = text;
      b.appendChild(key); b.appendChild(flask); b.appendChild(label);
      b.addEventListener("click", function () { answer(idx, false); });
      el.choices.appendChild(b);
    });
    el.consult.disabled = S.morning || S.candle < CONSULT_COST;
    el.consult.hidden = S.morning;
    el.consult.textContent = "Consult the ledger · " + CONSULT_COST + " drops";
    el.note.textContent = S.morning ? "Morning light. No candle burns." : "The candle burns while you think.";
    el.feedback.classList.remove("show");
    el.verdict.textContent = ""; el.why.textContent = "";
    el.overlay.hidden = false;
    el.qtext.tabIndex = -1;
    el.qtext.focus({ preventScroll: true });
    startBurn();
    sfx("open");
  }

  function currentQuestion() { return S.assignments[S.current].q; }

  function startBurn() {
    stopBurn();
    if (S.morning || S.candle <= 0) return;
    S.last = performance.now(); S.burnAcc = 0;
    S.timer = setInterval(function () {
      if (!S || S.answered || el.overlay.hidden) return;
      var now = performance.now();
      if (document.hidden) { S.last = now; return; }
      S.burnAcc += now - S.last; S.last = now;
      while (S.burnAcc >= BURN_MS) {
        S.burnAcc -= BURN_MS;
        burnOne();
        if (!S || S.answered || S.morning) return;
      }
    }, 100);
  }

  function stopBurn() { if (S && S.timer) { clearInterval(S.timer); S.timer = null; } }

  function burnOne() {
    if (S.candle > 0) S.candle--;
    updateGauges();
    if (S.candle > 0) return;
    if (!S.spareUsed) {
      S.spareUsed = true; S.candle = SPARE;
      el.note.textContent = "The old drawer yields a spare stub. +6 drops.";
      updateGauges(); sfx("spare");
    } else {
      S.morning = true;
      stopBurn();
      el.note.textContent = "The candle gutters.";
      answer(-1, true);
    }
  }

  function answer(choice, candleDied) {
    if (!S || S.answered) return;
    S.answered = true; stopBurn();
    var a = S.assignments[S.current], q = a.q;
    var correct = choice === q.correct;
    var buttons = Array.prototype.slice.call(el.choices.children);
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (i === q.correct) b.classList.add("correct");
      else if (i === choice) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    if (correct) {
      var gain = Math.round(q.source.worth * (S.morning ? 0.5 : 1));
      S.clearWorth += gain;
      S.candle = Math.min(START_CANDLE, S.candle + TIP);
      a.state = "clear";
      el.choices.children[q.correct].classList.remove("wrong");
      addSegment(false, a);
      document.querySelector('.hs[data-i="' + S.current + '"]').classList.add("done");
      el.verdict.textContent = "Right. +" + gain + " points and " + TIP + " drops of wax.";
      el.verdict.className = "verdict";
      sfx("right");
    } else {
      a.state = "cloudy";
      S.missed.push(q);
      addSegment(true, a);
      document.querySelector('.hs[data-i="' + S.current + '"]').classList.add("cloudy");
      el.verdict.textContent = candleDied ? "The candle gutters." : (choice === -1 ? "The candle must have slipped." : "Not quite.");
      el.verdict.className = "verdict bad";
      sfx("wrong");
    }
    el.why.textContent = q.source.why;
    el.feedback.classList.add("show");
    var left = remainingOpen();
    el.next.textContent = left > 0 ? "Back to the shop" : "See the dawn";
    updateGauges();
    renderNav();
    el.next.focus({ preventScroll: true });
  }

  function addSegment(cloudy, a) {
    var segs = document.querySelectorAll(".seg");
    for (var i = 0; i < segs.length; i++) {
      if (!segs[i].classList.contains("filled") && !segs[i].classList.contains("cloudy")) {
        segs[i].classList.add(cloudy ? "cloudy" : "filled");
        a.seg = i;
        return;
      }
    }
  }

  function remainingOpen() {
    return S.assignments.filter(function (a) { return a.state === "open"; }).length;
  }

  function consult() {
    if (!S || S.answered || S.consultUsed || S.morning || S.candle < CONSULT_COST) return;
    S.consultUsed = true;
    S.candle -= CONSULT_COST;
    var q = currentQuestion();
    var buttons = Array.prototype.slice.call(el.choices.children);
    var wrongIdx = [];
    buttons.forEach(function (b, i) { if (i !== q.correct && !b.classList.contains("struck")) wrongIdx.push(i); });
    var pick = wrongIdx[Math.floor(Math.random() * wrongIdx.length)];
    if (pick !== undefined) buttons[pick].classList.add("struck");
    el.consult.disabled = true;
    el.note.textContent = "The ledger asks: " + q.source.nudge;
    updateGauges();
    sfx("open");
  }

  function nextStation() {
    el.overlay.hidden = true;
    S.current = null;
    if (remainingOpen() === 0) showDawn();
  }

  function showDawn() {
    stopBurn();
    var clear = S.assignments.filter(function (a) { return a.state === "clear"; }).length;
    var missedCount = S.missed.length;
    var total = S.clearWorth + S.candle * WAX_VALUE + (clear === 10 ? BONUS : 0);
    lastRun = { score: total, candle: S.candle, clear: clear, missed: missedCount, morning: S.morning };

    el.dawnKicker.textContent = "Dawn";
    el.dawnTitle.textContent = clear === 10 ? "The vessel is whole." : (S.morning ? "Morning light through pale glass." : "The healer lifts the vessel.");
    el.dawnSub.textContent = clear + " of 10 stations clear" + (S.morning ? " · the candle went out" : "") + ".";
    el.finalScore.textContent = total.toLocaleString();

    el.breakdown.innerHTML = "";
    var lines = [
      "<b>" + S.clearWorth.toLocaleString() + "</b> from clear stations",
      "<b>" + S.candle + " × " + WAX_VALUE + "</b> for wax left"
    ];
    if (clear === 10) lines.push("<b>+" + BONUS + "</b> for a full vessel");
    lines.forEach(function (html) {
      var li = document.createElement("li"); li.innerHTML = html; el.breakdown.appendChild(li);
    });

    el.missedList.innerHTML = "";
    S.missed.forEach(function (q) {
      var li = document.createElement("li");
      var t = document.createElement("p"); t.className = "m-q"; t.textContent = q.source.q;
      var a = document.createElement("p"); a.className = "m-a"; a.textContent = q.source.options[q.source.answer];
      var w = document.createElement("p"); w.className = "m-why"; w.textContent = q.source.why;
      li.appendChild(t); li.appendChild(a); li.appendChild(w); el.missedList.appendChild(li);
    });
    el.remember.hidden = missedCount === 0;
    el.mend.hidden = missedCount === 0;
    el.mend.textContent = "Tend the " + missedCount + (missedCount === 1 ? " missed station" : " missed stations");
    el.share.hidden = false; el.replay.hidden = false; el.shareNote.hidden = true;
    el.sharedNote.hidden = true;
    el.dawn.hidden = false;
    el.dawnTitle.tabIndex = -1;
    el.dawnTitle.focus({ preventScroll: true });
    sfx("dawn");
  }

  function mendRound() {
    var seed = Math.min(START_CANDLE, Math.max(6, S.candle));
    var keptWorth = 0;
    S.assignments.forEach(function (a) {
      if (a.state === "clear") { keptWorth += a.q.source.worth; return; }
      if (a.state === "cloudy") {
        document.querySelectorAll(".seg")[a.seg].classList.remove("cloudy");
        var h = document.querySelector('.hs[data-i="' + a.station + '"]');
        h.classList.remove("cloudy");
        a.state = "open"; a.seg = null;
      }
    });
    S.clearWorth = keptWorth;
    S.missed = [];
    S.morning = false;
    S.candle = seed;
    S.spareUsed = true;
    el.dawn.hidden = true;
    updateGauges();
    renderNav();
  }

  function shareRun() {
    if (!lastRun) return;
    var link = location.origin + location.pathname + "#night=" +
      lastRun.score + "," + lastRun.candle + "," + lastRun.clear + "," + lastRun.missed + "," + (lastRun.morning ? 1 : 0);
    var text = "The Niosome Apothecary — " + lastRun.clear + "/10 clear, " + lastRun.candle +
      " drops of wax left, " + lastRun.score.toLocaleString() + " points. " + link;
    copyText(text, function () { el.shareNote.hidden = false; });
    if (navigator.share) {
      try { navigator.share({ title: "The Niosome Apothecary", text: text }).catch(function () {}); } catch (e) {}
    }
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

  function showShared(hash) {
    el.dawnKicker.textContent = "A night at the apothecary";
    el.dawnTitle.textContent = "Someone else's dawn.";
    el.dawnSub.textContent = hash.clear + " of 10 stations clear" + (hash.morning ? " · the candle went out" : "") + ".";
    el.finalScore.textContent = hash.score.toLocaleString();
    el.breakdown.innerHTML = "<li><b>" + hash.candle + "</b> drops of wax left at dawn</li>";
    el.remember.hidden = true;
    el.mend.hidden = true; el.share.hidden = true; el.replay.hidden = true;
    el.shareNote.hidden = true;
    el.sharedNote.hidden = false;
    el.dawn.hidden = false;
  }

  function readShared() {
    var m = location.hash.match(/^#night=(\d+),(\d+),(\d+),(\d+),([01])$/);
    return m ? { score: +m[1], candle: +m[2], clear: +m[3], missed: +m[4], morning: m[5] === "1" } : null;
  }

  function playOwn() {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    buildRound();
  }

  function restart() { buildRound(); }

  function init() {
    buildNav();
    buildRound();
    var shared = readShared();
    if (shared) showShared(shared);

    document.querySelectorAll(".hs").forEach(function (h) {
      var i = +h.dataset.i;
      h.addEventListener("click", function () { openStation(i); });
      h.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStation(i); }
      });
    });

    el.consult.addEventListener("click", consult);
    el.next.addEventListener("click", nextStation);
    el.share.addEventListener("click", shareRun);
    el.replay.addEventListener("click", restart);
    el.mend.addEventListener("click", mendRound);
    el.playOwn.addEventListener("click", playOwn);
    el.sound.addEventListener("click", function () {
      muted = !muted;
      el.sound.setAttribute("aria-pressed", muted ? "false" : "true");
      el.sound.setAttribute("aria-label", muted ? "Sound off" : "Sound on");
    });

    document.addEventListener("keydown", function (e) {
      if (el.overlay.hidden || !S || S.answered) return;
      var k = e.key.toLowerCase();
      var idx = "1234".indexOf(k);
      if (idx < 0) idx = "abcd".indexOf(k);
      if (idx >= 0 && idx < 4) { e.preventDefault(); answer(idx, false); }
      if (k === "h") { e.preventDefault(); consult(); }
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && S) S.last = performance.now();
    });

    window.addEventListener("pointerdown", function unlock() {
      try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }, { once: true });
  }

  init();
})();
