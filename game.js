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
    assembled: $("assembled"), stepName: $("step-name"), wrap: $("canvas-wrap")
  };

  var S = null, lastMissed = [], muted = false, audio = null;

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

  /* ---------- 3D: compounding a vial of niosomal medicine ---------- */

  var model = {
    step: 0, stepAt: 0, group: null, scene: null, camera: null, renderer: null,
    reduced: false, dragging: false, lastX: 0, clock: null, elapsed: 0,
    liquid: null, liquidMat: null, liquidH: 0, parts: [], stopper: null,
    label: null, box: null, glow: null, powder: null, film: null, cores: []
  };

  function ease(t) { return t * t * (3 - 2 * t); }
  function easeOutBack(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  function part(mesh, revealAt, maxOpacity, grow) {
    mesh.visible = false;
    var m = mesh.material;
    m.transparent = true; m.opacity = 0;
    model.parts.push({ mesh: mesh, at: revealAt, max: maxOpacity, t: 0, mat: m, grow: grow !== false });
  }

  function initModel() {
    model.reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof THREE === "undefined") { failModel("The 3D view could not load."); return; }
    try {
      model.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      model.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      el.wrap.appendChild(model.renderer.domElement);
    } catch (e) { failModel("This browser cannot show the 3D model."); return; }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.25, 6.1);
    model.scene = scene; model.camera = camera;

    scene.add(new THREE.AmbientLight(0xfff1d6, 0.6));
    var key = new THREE.DirectionalLight(0xffe1b0, 1.05); key.position.set(3, 5, 6); scene.add(key);
    var rim = new THREE.PointLight(0x6fd3c3, 0.8, 16); rim.position.set(-4, 0, 3); scene.add(rim);
    model.glow = new THREE.PointLight(0xffc46a, 0.1, 7); model.glow.position.set(0, 0.2, 1.2); scene.add(model.glow);

    var group = new THREE.Group();
    scene.add(group); model.group = group;

    var glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe8e4, transparent: true, opacity: 0.15, roughness: 0.08, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false });
    var vial = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.9, 40, 1, true), glassMat);
    group.add(vial);
    var bottom = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), glassMat);
    bottom.rotation.x = -Math.PI / 2; bottom.position.y = -0.95; group.add(bottom);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.18, 28, 1, true), glassMat);
    neck.position.y = 1.02; group.add(neck);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 10, 28), new THREE.MeshStandardMaterial({ color: 0xb98a4c, roughness: 0.35, metalness: 0.7 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = 1.11; group.add(rim);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.55, 0.08, 36), new THREE.MeshStandardMaterial({ color: 0x6f4527, roughness: 0.7 }));
    base.position.y = -0.99; group.add(base);
    var plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.1, 40), new THREE.MeshStandardMaterial({ color: 0x4d3220, roughness: 0.8 }));
    plinth.position.y = -1.09; group.add(plinth);
    var brass = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.02, 8, 40), new THREE.MeshStandardMaterial({ color: 0xc9a15a, roughness: 0.35, metalness: 0.8 }));
    brass.rotation.x = Math.PI / 2; brass.position.y = -0.94; group.add(brass);

    model.liquidMat = new THREE.MeshStandardMaterial({ color: 0x6fb8a8, emissive: 0x2b6b5e, emissiveIntensity: 0.3, transparent: true, opacity: 0.45, roughness: 0.3, depthWrite: false });
    model.liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 1, 36), model.liquidMat);
    model.liquid.position.y = -0.9; model.liquid.scale.y = 0.0001; group.add(model.liquid);

    model.powder = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.8 }));
    model.powder.position.y = -0.8; part(model.powder, 1, 1); group.add(model.powder);

    model.film = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.02, 8, 36), new THREE.MeshStandardMaterial({ color: 0xe0c48c, roughness: 0.6 }));
    model.film.rotation.x = Math.PI / 2; model.film.position.y = -0.62; part(model.film, 2, 0.9); group.add(model.film);

    var vesicleSpots = [[-0.13, -0.6, 0.06], [0.14, -0.48, -0.08], [-0.04, -0.36, 0.13], [0.1, -0.24, -0.04], [0.0, -0.12, 0.04]];
    vesicleSpots.forEach(function (p) {
      var v = new THREE.Group();
      v.position.set(p[0], p[1], p[2]);
      var coreMat = new THREE.MeshStandardMaterial({ color: 0xffce7a, emissive: 0xffb85c, emissiveIntensity: 0.5, roughness: 0.4 });
      var core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), coreMat);
      part(core, 4, 0.95); v.add(core);
      var shellMat = new THREE.MeshStandardMaterial({ color: 0x79c7b8, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
      var shell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 18), shellMat);
      part(shell, 5, 0.32); v.add(shell);
      for (var b = 0; b < 5; b++) {
        var th = b * Math.PI * 2 / 5, ph = (b % 2 ? 1 : -1) * 0.7;
        var bead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc9a15a, emissive: 0x8a5a12, emissiveIntensity: 0.3 }));
        bead.position.set(Math.cos(th) * Math.cos(ph) * 0.16, Math.sin(ph) * 0.16, Math.sin(th) * Math.cos(ph) * 0.16);
        part(bead, 6, 1, false); v.add(bead);
      }
      model.cores.push({ group: v, core: coreMat });
      group.add(v);
    });

    model.stopper = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.26, 24), new THREE.MeshStandardMaterial({ color: 0xa9744f, roughness: 0.85 }));
    model.stopper.position.y = 2.6; model.stopper.visible = false; group.add(model.stopper);

    model.label = new THREE.Mesh(new THREE.CylinderGeometry(0.515, 0.515, 0.62, 36, 1, true), new THREE.MeshStandardMaterial({ color: 0xf3e6c8, roughness: 0.9, side: THREE.DoubleSide }));
    model.label.position.y = -0.12; part(model.label, 9, 0.96, false); group.add(model.label);
    var labelBand = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 36, 1, true), new THREE.MeshStandardMaterial({ color: 0xb98a4c, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }));
    labelBand.position.y = 0.26; part(labelBand, 9, 0.96, false); group.add(labelBand);

    model.box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.5), new THREE.MeshStandardMaterial({ color: 0xd9c3a0, roughness: 0.9 }));
    model.box.position.set(2.5, -0.82, -0.1); model.box.visible = false; group.add(model.box);
    var lid = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.54), new THREE.MeshStandardMaterial({ color: 0xb98a4c, roughness: 0.6 }));
    lid.position.y = 0.28; model.box.add(lid);

    function resize() {
      var w = el.wrap.clientWidth || 356, h = el.wrap.clientHeight || 445;
      model.renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el.wrap);
    else window.addEventListener("resize", resize);

    var dom = model.renderer.domElement;
    dom.addEventListener("pointerdown", function (e) {
      model.dragging = true; model.lastX = e.clientX;
      try { dom.setPointerCapture(e.pointerId); } catch (err) {}
    });
    dom.addEventListener("pointermove", function (e) {
      if (!model.dragging) return;
      group.rotation.y += (e.clientX - model.lastX) * 0.009;
      model.lastX = e.clientX;
    });
    dom.addEventListener("pointerup", function () { model.dragging = false; });
    dom.addEventListener("pointercancel", function () { model.dragging = false; });

    model.clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      var dt = Math.min(model.clock.getDelta(), 0.05);
      model.elapsed += dt;
      if (!model.dragging && !model.reduced) group.rotation.y += dt * 0.28;

      var liqTarget = model.step >= 8 ? 1.55 : model.step >= 3 ? 1.15 : 0;
      model.liquidH += (liqTarget - model.liquidH) * Math.min(1, dt * (model.reduced ? 20 : 3));
      model.liquid.scale.y = Math.max(0.0001, model.liquidH);
      model.liquid.position.y = -0.9 + model.liquidH / 2;

      var warm = model.step >= 7;
      var targetColor = warm ? 0xd9a441 : 0x6fb8a8;
      model.liquidMat.color.lerp(new THREE.Color(targetColor), Math.min(1, dt * 2));
      model.liquidMat.emissiveIntensity += ((warm ? 0.7 : 0.3) - model.liquidMat.emissiveIntensity) * Math.min(1, dt * 2);

      model.parts.forEach(function (p) {
        var visible = model.step >= p.at;
        p.mesh.visible = visible;
        if (!visible || p.t >= 1) return;
        p.t = Math.min(1, p.t + dt * (model.reduced ? 30 : 2.8));
        var e = ease(p.t);
        p.mat.opacity = p.max * p.t;
        if (p.grow) p.mesh.scale.setScalar(0.45 + 0.55 * e);
      });

      if (model.powder) model.powder.visible = model.step >= 1 && model.step < 3;
      if (model.film) model.film.visible = model.step >= 2 && model.step < 3;

      model.cores.forEach(function (c) {
        var target = model.step >= 7 ? 1.4 : 0.5;
        c.core.emissiveIntensity += (target - c.core.emissiveIntensity) * Math.min(1, dt * 2);
      });

      if (model.step >= 9) {
        model.stopper.visible = true;
        var ps = Math.min(1, (model.elapsed - model.stepAt) / 0.7);
        model.stopper.position.y = 2.6 + (1.11 - 2.6) * easeOutBack(ps);
      }
      if (model.step >= 10) {
        model.box.visible = true;
        var pb = Math.min(1, (model.elapsed - model.stepAt) / 0.9);
        model.box.position.x = 2.5 + (1.45 - 2.5) * easeOutBack(pb);
      }
      model.glow.intensity += ((model.step >= 7 ? 0.9 : 0.1) - model.glow.intensity) * Math.min(1, dt * 2);

      model.renderer.render(scene, camera);
    }
    tick();
  }

  function failModel(message) {
    var p = document.createElement("p");
    p.className = "no-webgl"; p.textContent = message;
    el.wrap.appendChild(p);
  }

  function revealModel() {
    if (model.step >= 10) return;
    model.step += 1;
    model.stepAt = model.elapsed;
    el.assembled.textContent = model.step;
    el.stepName.textContent = STEPS[model.step];
  }

  function resetModel() {
    model.step = 0; model.stepAt = model.elapsed;
    model.liquidH = 0;
    model.parts.forEach(function (p) { p.t = 0; p.mat.opacity = 0; p.mesh.visible = false; });
    model.cores.forEach(function (c) { c.core.emissiveIntensity = 0.5; });
    if (model.stopper) { model.stopper.visible = false; model.stopper.position.y = 2.6; }
    if (model.box) { model.box.visible = false; model.box.position.x = 2.5; }
    el.assembled.textContent = "0";
    el.stepName.textContent = STEPS[0];
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
    el.resultSub.textContent = "You answered " + S.correct + " of " + total + " correctly · " +
      model.step + " of 10 steps made.";
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
    initModel();
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
