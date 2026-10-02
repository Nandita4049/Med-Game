(function () {
  'use strict';
  window.MEDRESCUE_READY = true;

  var SCORE_KEY = 'medrescue_scores';
  var NAME_KEY = 'medrescue_name';
  var TIME_LIMIT = 15, TOTAL = 10, MAX_LIVES = 3;

  var CASES = [
    { sym: 'Crushing chest pain spreading to the left arm, cold sweat.', vit: 'HR 110 · BP 150/95 · SpO2 94%', opts: ['Aspirin and urgent ECG', 'Antacid tablet', 'Cough syrup', 'Cold pack on chest'], tip: 'Signs of a heart attack: aspirin (if not allergic) and an urgent ECG.' },
    { sym: 'Deep cut on the forearm, bright red blood spurting.', vit: 'HR 120 · BP 100/70 · SpO2 97%', opts: ['Firm direct pressure with a clean bandage', 'Hot compress', 'Give water to drink', 'Rub the wound'], tip: 'Firm direct pressure controls severe bleeding.' },
    { sym: 'Collapsed, not breathing, no pulse.', vit: 'HR 0 · BP — · SpO2 —', opts: ['Start CPR chest compressions', 'Recovery position', 'Give water', 'Wait without acting'], tip: 'No breathing and no pulse: start CPR immediately and call for help.' },
    { sym: 'Clutching throat, cannot speak or cough, turning blue.', vit: 'HR 130 · BP 140/90 · SpO2 80%', opts: ['Back blows and abdominal thrusts', 'Pat the head', 'Give water', 'Lay flat and wait'], tip: 'A fully blocked airway needs back blows and abdominal thrusts.' },
    { sym: 'Red, painful minor burn on the hand from hot oil.', vit: 'HR 92 · BP 120/80 · SpO2 99%', opts: ['Cool running water for 20 minutes', 'Apply butter', 'Press ice directly', 'Burst the blisters'], tip: 'Cool running water reduces burn damage. Never use butter or ice.' },
    { sym: 'Whole body is jerking, unresponsive, seizure in progress.', vit: 'HR 125 · BP 135/85 · SpO2 92%', opts: ['Clear the area and cushion the head', 'Hold the tongue', 'Restrain the limbs', 'Pour water on the face'], tip: 'Protect the head, move hazards away, and never restrain or put objects in the mouth.' },
    { sym: 'Drooping face, slurred speech, one arm weak.', vit: 'HR 88 · BP 175/100 · SpO2 96%', opts: ['Call emergency services and note the time', 'Give aspirin and let them sleep', 'Offer a hot drink', 'Ask them to walk it off'], tip: 'Signs of a stroke (FAST): call emergency services at once and note when it began.' },
    { sym: 'Throat swelling and hives after a peanut snack.', vit: 'HR 135 · BP 80/50 · SpO2 88%', opts: ['Epinephrine auto-injector', 'Antihistamine only', 'Cold drink', 'Let them rest'], tip: 'Anaphylaxis needs epinephrine immediately.' },
    { sym: 'Diabetic patient, shaky, sweaty, confused and drowsy.', vit: 'HR 105 · BP 115/75 · Glucose 48 mg/dL', opts: ['Fast sugar such as juice or glucose', 'Extra insulin', 'Plain water', 'Let them sleep'], tip: 'Low blood sugar needs fast-acting sugar right away.' },
    { sym: 'Fell from a ladder, leg bent at an odd angle, severe pain.', vit: 'HR 108 · BP 125/82 · SpO2 98%', opts: ['Immobilise with a splint', 'Massage the leg', 'Make them walk', 'Pull the leg straight'], tip: 'Immobilise a suspected fracture and avoid moving it.' },
    { sym: 'Marathon runner, hot dry skin, confused, no sweating.', vit: 'HR 140 · Temp 41.2°C · SpO2 95%', opts: ['Move to shade and cool the body', 'Wrap in a warm blanket', 'Give hot tea', 'Keep them running'], tip: 'Heat stroke: cool the body quickly and get emergency help.' },
    { sym: 'Sudden nosebleed that will not stop.', vit: 'HR 84 · BP 118/76 · SpO2 99%', opts: ['Lean forward and pinch the soft nose', 'Tilt the head back', 'Push cotton deep inside', 'Lie flat'], tip: 'Lean forward and pinch the soft part of the nose for 10 minutes.' }
  ];
  var NAMES = ['Aarav', 'Meera', 'Karthik', 'Ananya', 'Rohan', 'Divya', 'Vikram', 'Sneha', 'Arjun', 'Priya', 'Imran', 'Lakshmi'];
  var FACES = ['🧑', '👩', '👨', '🧓', '👧', '👦', '👵', '👴'];

  function $(id) { return document.getElementById(id); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- storage ---------- */
  function loadScores() {
    try {
      var d = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }
  function saveScores(list) {
    try { localStorage.setItem(SCORE_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }
  function getName() {
    var n = $('playerName').value.trim();
    return n || 'Rescuer';
  }

  /* ---------- screens ---------- */
  function show(id) {
    stopTimer();
    var s = document.querySelectorAll('.screen');
    for (var i = 0; i < s.length; i++) s[i].classList.remove('active');
    $(id).classList.add('active');
    if (id === 'menu') updateBest();
    if (id === 'board') renderBoard(-1);
    window.scrollTo(0, 0);
  }
  function updateBest() {
    var l = loadScores();
    var top = l.reduce(function (m, s) { return Math.max(m, s.score); }, 0);
    $('bestScore').textContent = top ? 'Best score on this device: ' + top : '';
  }
  function renderBoard(highlightId) {
    var list = loadScores().sort(function (a, b) { return b.score - a.score; }).slice(0, 10);
    var ol = $('boardList');
    ol.innerHTML = '';
    if (!list.length) {
      var e = document.createElement('li');
      e.className = 'empty';
      e.textContent = 'No scores yet. Finish a rescue to set the first one.';
      ol.appendChild(e);
      return;
    }
    list.forEach(function (s, i) {
      var li = document.createElement('li');
      if (s.id === highlightId) li.className = 'you';
      var rk = document.createElement('span'); rk.className = 'rk'; rk.textContent = '#' + (i + 1);
      var nm = document.createElement('span');
      nm.textContent = s.name;
      var dt = document.createElement('span'); dt.className = 'dt';
      dt.textContent = s.saved + '/' + TOTAL + ' saved · ' + s.date;
      nm.appendChild(dt);
      var sc = document.createElement('span'); sc.className = 'sc'; sc.textContent = s.score;
      li.appendChild(rk); li.appendChild(nm); li.appendChild(sc);
      ol.appendChild(li);
    });
  }

  /* ---------- game state ---------- */
  var g = null, timerId = null;

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function startGame() {
    try { localStorage.setItem(NAME_KEY, getName()); } catch (e) { /* ignore */ }
    g = {
      queue: shuffle(CASES).slice(0, TOTAL),
      names: shuffle(NAMES),
      i: 0, score: 0, lives: MAX_LIVES, streak: 0, saved: 0,
      answered: false, start: 0, current: null
    };
    show('game');
    nextPatient();
  }

  function renderHud() {
    $('hudPatient').textContent = Math.min(g.i + 1, TOTAL) + '/' + TOTAL;
    $('hudScore').textContent = g.score;
    $('hudCombo').textContent = '×' + comboMult();
    var h = '';
    for (var k = 0; k < MAX_LIVES; k++) h += k < g.lives ? '❤️' : '🖤';
    $('hudLives').textContent = h;
  }
  function comboMult() { return Math.min(3, 1 + Math.floor(g.streak / 2)); }

  function nextPatient() {
    if (g.i >= TOTAL || g.lives <= 0) return endGame();
    var c = g.queue[g.i];
    var order = shuffle([0, 1, 2, 3]);
    g.current = { c: c, order: order };
    g.answered = false;
    $('pName').textContent = g.names[g.i % g.names.length] + ', age ' + (18 + Math.floor(Math.random() * 60));
    $('avatar').textContent = FACES[Math.floor(Math.random() * FACES.length)];
    $('pSym').textContent = c.sym;
    $('pVit').textContent = c.vit;
    var box = $('options');
    box.innerHTML = '';
    order.forEach(function (idx, pos) {
      var b = document.createElement('button');
      b.className = 'opt';
      b.type = 'button';
      var n = document.createElement('b'); n.textContent = (pos + 1) + '.';
      b.appendChild(n);
      b.appendChild(document.createTextNode(c.opts[idx]));
      b.addEventListener('click', function () { answer(pos); });
      box.appendChild(b);
    });
    $('feedback').classList.add('hidden');
    renderHud();
    g.start = Date.now();
    updateTimer();
    stopTimer();
    timerId = setInterval(updateTimer, 100);
  }

  function updateTimer() {
    var left = Math.max(0, TIME_LIMIT - (Date.now() - g.start) / 1000);
    var fill = $('timerFill');
    fill.style.width = (left / TIME_LIMIT * 100) + '%';
    fill.className = left < 4 ? 'low' : left < 8 ? 'mid' : '';
    $('timerText').textContent = left.toFixed(1) + 's';
    if (left <= 0 && !g.answered) answer(-1);
  }

  function answer(pos) {
    if (!g || g.answered) return;
    g.answered = true;
    stopTimer();
    var left = Math.max(0, TIME_LIMIT - (Date.now() - g.start) / 1000);
    var correctPos = g.current.order.indexOf(0);
    var btns = $('options').children;
    for (var k = 0; k < btns.length; k++) btns[k].disabled = true;
    btns[correctPos].classList.add('correct');
    var fb = $('feedback');
    var ok = pos === correctPos;
    if (ok) {
      g.streak++;
      var pts = Math.round((100 + left * 10) * comboMult());
      g.score += pts;
      g.saved++;
      fb.className = 'feedback good';
      $('fbText').textContent = 'Patient stabilised! +' + pts + ' points. ' + g.current.c.tip;
    } else {
      g.streak = 0;
      g.lives--;
      if (pos >= 0) btns[pos].classList.add('wrong');
      fb.className = 'feedback bad';
      $('fbText').textContent = (pos < 0 ? 'Time ran out. ' : 'Wrong treatment. ') + g.current.c.tip;
      $('options').classList.remove('shake');
      void $('options').offsetWidth;
      $('options').classList.add('shake');
    }
    g.i++;
    renderHud();
    $('hudPatient').textContent = Math.min(g.i, TOTAL) + '/' + TOTAL;
    var last = g.i >= TOTAL || g.lives <= 0;
    $('btnNext').textContent = last ? 'See results' : 'Next patient';
    $('btnNext').focus();
  }

  function endGame() {
    stopTimer();
    var won = g.lives > 0;
    var acc = Math.round(g.saved / TOTAL * 100);
    var entry = {
      id: Date.now() + '-' + Math.floor(Math.random() * 1e6),
      name: getName(), score: g.score, saved: g.saved,
      date: new Date().toLocaleDateString()
    };
    var all = loadScores();
    all.push(entry);
    all.sort(function (a, b) { return b.score - a.score; });
    all = all.slice(0, 50);
    saveScores(all);
    var rank = all.findIndex(function (s) { return s.id === entry.id; }) + 1;

    $('resIcon').className = 'logo' + (won ? ' win' : '');
    $('resIcon').textContent = won ? '✔' : '✚';
    $('resTitle').textContent = won ? 'Stage 1 complete' : 'Stage 1 failed';
    $('resMsg').textContent = won
      ? (g.saved === TOTAL ? 'Flawless shift. Every patient was saved.' : 'The ward is stable. Well done, ' + entry.name + '.')
      : 'You ran out of lives. Review the tips and try again.';
    $('resScore').textContent = g.score;
    $('resSaved').textContent = g.saved + '/' + TOTAL;
    $('resAcc').textContent = acc + '%';
    $('resRank').textContent = rank > 0 && rank <= 10 ? 'You are #' + rank + ' on the leaderboard.' : 'Score saved. Beat the top 10 to reach the board.';
    lastEntryId = entry.id;
    show('result');
  }
  var lastEntryId = -1;

  /* ---------- events ---------- */
  var ready = false;

  function on(id, evt, fn) {
    var el = $(id);
    if (el) el.addEventListener(evt, fn);
  }

  function init() {
    if (ready) return;
    ready = true;
    try { $('playerName').value = localStorage.getItem(NAME_KEY) || ''; } catch (e) { /* ignore */ }
    updateBest();

    on('btnStart', 'click', startGame);
    on('btnAgain', 'click', startGame);
    on('btnHow', 'click', function () { show('howto'); });
    on('btnBoard', 'click', function () { show('board'); });
    on('btnBoard2', 'click', function () { show('board'); renderBoard(lastEntryId); });
    on('btnNext', 'click', nextPatient);
    on('btnQuit', 'click', function () {
      if (confirm('Quit this rescue? Your progress will be lost.')) show('menu');
    });
    on('btnClear', 'click', function () {
      if (confirm('Clear all saved scores on this device?')) { saveScores([]); renderBoard(-1); }
    });
    var gos = document.querySelectorAll('[data-go]');
    for (var i = 0; i < gos.length; i++) {
      gos[i].addEventListener('click', function (e) { show(e.currentTarget.getAttribute('data-go')); });
    }
    on('playerName', 'keydown', function (e) { if (e.key === 'Enter') startGame(); });

    document.addEventListener('keydown', function (e) {
      if (!$('game').classList.contains('active') || !g) return;
      if (e.target && e.target.tagName === 'INPUT') return;
      if (!g.answered && e.key >= '1' && e.key <= '4') answer(parseInt(e.key, 10) - 1);
      else if (g.answered && (e.key === 'Enter' || e.key === ' ')) {
        if (e.target && e.target.id === 'btnNext') return;
        e.preventDefault(); nextPatient();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
