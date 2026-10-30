// =============================================
//  バトベイ  画面と操作
// =============================================
(function () {
  const $ = id => document.getElementById(id);
  const T = I18N.t;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
  BB.toast = t => { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(BB.toast.tm); BB.toast.tm = setTimeout(() => el.classList.remove('show'), 1900); };
  let room = null;
  BB.now = () => (room ? room.now() : Date.now());

  // ---------- 音（すべて合成） ----------
  let ac = null, bus = null, nbuf = null, master = null, muted = (() => { try { return localStorage.getItem('bb_mute') === '1'; } catch (e) { return false; } })();
  const A = () => {
    try {
      if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); const c = ac.createDynamicsCompressor(); c.threshold.value = -16; c.knee.value = 8; c.ratio.value = 5; c.attack.value = 0.002; c.release.value = 0.15; const mg = ac.createGain(); mg.gain.value = muted ? 0 : 1; c.connect(mg); mg.connect(ac.destination); bus = c; master = mg;
        nbuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {} return ac;
  };
  function tone(f, d, type = 'triangle', v = 0.07, delay = 0, f2) { const a = A(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.02); }
  function noise(d, v = 0.15, f = 1200, hp, delay = 0) { const a = A(); if (!a) return; const t = a.currentTime + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); fl.type = hp ? 'highpass' : 'lowpass'; fl.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.buffer = nbuf; s.connect(fl); fl.connect(g); g.connect(bus); s.start(t, Math.random() * 0.5, d + 0.05); }
  // 金属のひびき（ずれた倍音をかさねる）
  function metal(base, d, v, delay = 0) {
    const a = A(); if (!a) return; const t = a.currentTime + delay, g = a.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(bus);
    for (const [r, amp] of [[1, 1], [2.76, 0.55], [5.4, 0.32], [8.93, 0.18]]) { const o = a.createOscillator(), og = a.createGain(); o.type = 'sine'; o.frequency.value = base * r * (1 + (Math.random() - 0.5) * 0.012); og.gain.setValueAtTime(amp, t); og.gain.exponentialRampToValueAtTime(0.0001, t + d / (1 + r * 0.35)); o.connect(og); og.connect(g); o.start(t); o.stop(t + d + 0.05); }
  }
  const boom = (d, v, delay = 0) => { tone(120, d, 'sine', v, delay, 36); tone(70, d * 0.8, 'triangle', v * 0.6, delay, 30); };
  const snd = {
    hit: tier => {
      if (tier <= 1) { metal(2300 + Math.random() * 700, 0.13, 0.045); noise(0.035, 0.1, 5200, true); }
      else if (tier === 2) { metal(1450 + Math.random() * 350, 0.32, 0.085); noise(0.08, 0.28, 3600, true); tone(190, 0.08, 'sine', 0.08, 0, 90); }
      else if (tier === 3) { metal(880 + Math.random() * 220, 0.95, 0.12); metal(1980, 0.4, 0.05, 0.004); noise(0.16, 0.45, 2600, true); boom(0.28, 0.2); }
      else { boom(0.75, 0.38); noise(0.12, 0.55, 6000, true); noise(0.55, 0.5, 850); metal(600 + Math.random() * 80, 1.5, 0.15); metal(1240, 0.9, 0.07, 0.02); }
    },
    grind: () => { noise(0.07, 0.11, 2800, true); tone(2600 + Math.random() * 1200, 0.05, 'sawtooth', 0.012); },
    rail: () => { tone(420, 0.4, 'sawtooth', 0.025, 0, 1900); noise(0.3, 0.06, 3200, true); },
    wall: s => { noise(0.1, Math.min(0.3, 0.1 + s * 0.08), 700); tone(140, 0.08, 'sine', 0.06, 0, 70); },
    burst: () => { boom(0.9, 0.4); noise(0.6, 0.55, 2400); metal(520, 1.2, 0.12); [880, 660, 440].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0.1 + i * 0.08)); },
    out: () => { noise(0.45, 0.32, 900); tone(700, 0.5, 'triangle', 0.08, 0, 120); boom(0.4, 0.2); }, stop: () => tone(420, 0.6, 'triangle', 0.07, 0, 90),
    count: () => tone(660, 0.12, 'square', 0.06), go: () => { tone(990, 0.35, 'square', 0.07); noise(0.3, 0.2, 3000, true); },
    skill: () => { tone(300, 0.35, 'sawtooth', 0.06, 0, 1600); tone(600, 0.3, 'sine', 0.06, 0.05, 2400); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.08, i * 0.11)), lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', 0.08, i * 0.16)),
    pick: () => tone(880, 0.06, 'square', 0.04), land: () => { noise(0.15, 0.25, 600); tone(150, 0.15, 'sine', 0.1, 0, 60); },
    heart: () => { tone(62, 0.14, 'sine', 0.3, 0, 42); tone(58, 0.14, 'sine', 0.22, 0.2, 40); },
    final: () => { tone(330, 0.5, 'square', 0.05, 0, 165); tone(220, 0.7, 'sawtooth', 0.04, 0.12, 110); },
    tap: () => tone(1500 + Math.random() * 300, 0.04, 'triangle', 0.025),
    crit: () => { boom(0.6, 0.35); metal(1320, 1.1, 0.13); metal(660, 1.3, 0.1, 0.01); noise(0.25, 0.4, 5000, true); tone(400, 0.35, 'sawtooth', 0.05, 0, 2400); },
    miss: () => { tone(180, 0.25, 'square', 0.05, 0, 90); },
    crack: lv => { metal(3200 - lv * 400, 0.18, 0.05 + lv * 0.02); noise(0.05, 0.2, 7000, true); },
    crowd: v => { noise(0.9, 0.08 * v, 1600); noise(0.7, 0.05 * v, 2600, false, 0.1); }

  };
  // ---------- 試合中の音楽（その場で作る） ----------
  const bgm = (() => {
    const BPM = 150, ST = 60 / BPM / 4, PROG = [45, 41, 43, 40], MEL = [69, null, 72, null, 76, null, 74, 72, 71, null, 72, null, 74, null, 76, null];
    let on = false, md = 'battle', step = 0, nextT = 0, tm = 0;
    const f = m => 440 * Math.pow(2, (m - 69) / 12);
    function play(t, s) {
      const bar = Math.floor(s / 16), k = s % 16, root = PROG[bar % 4], fin = md === 'final';
      const a = A(); if (!a) return; const d = t - a.currentTime;
      if (k % 4 === 0) tone(150, 0.14, 'sine', fin ? 0.16 : 0.12, d, 45);
      if (k % 8 === 4 && !fin) noise(0.12, 0.09, 5500, true, d);
      if (k % 2 === 0) noise(0.03, fin ? 0.05 : 0.035, 9000, true, d);
      if (k % 2 === 0) tone(f(root - 12 + (k % 8 === 6 ? 12 : 0)), ST * 1.6, 'sawtooth', 0.035, d, f(root - 12) * 0.999);
      if (fin) { if (k % 2 === 1) tone(f(root + 24 + [0, 3, 7, 12][(k >> 1) % 4]), ST * 0.8, 'square', 0.012, d); }
      else if (bar % 2 === 1 && MEL[k]) tone(f(MEL[k] + (bar % 4 === 3 ? 2 : 0)), ST * 1.8, 'square', 0.018, d);
    }
    function tick() { const a = A(); if (!a || !on) return; while (nextT < a.currentTime + 0.15) { play(nextT, step++); nextT += ST; } }
    return {
      start() { const a = A(); if (!a || on) return; on = true; md = 'battle'; step = 0; nextT = a.currentTime + 0.05; clearInterval(tm); tm = setInterval(tick, 40); },
      mode(m) { md = m; }, stop() { on = false; clearInterval(tm); }
    };
  })();
  $('btn-snd').onclick = () => { muted = !muted; try { localStorage.setItem('bb_mute', muted ? '1' : '0'); } catch (e) {} if (master) master.gain.value = muted ? 0 : 1; $('snd-name').textContent = T(muted ? 'snd_off' : 'snd_on'); };
  $('snd-name').textContent = T(muted ? 'snd_off' : 'snd_on');
  // 回転の音（自分のコマ）
  let hum = null;
  function humSet(w) {
    const a = A(); if (!a) return;
    if (!hum && w > 0) { const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'triangle'; f.type = 'bandpass'; f.Q.value = 3; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(bus); o.start(); o2.start(); hum = { o, o2, g, f }; }
    if (!hum) return; const t = a.currentTime, r = Math.min(1, w / BB.W0);
    hum.o.frequency.setTargetAtTime(60 + r * 260, t, 0.08); hum.o2.frequency.setTargetAtTime(120 + r * 520, t, 0.08); hum.f.frequency.setTargetAtTime(300 + r * 1400, t, 0.1); hum.g.gain.setTargetAtTime(w > 0 ? 0.012 + r * 0.03 : 0, t, 0.1);
  }
  function humStop() { if (hum) { try { hum.o.stop(); hum.o2.stop(); } catch (e) {} hum = null; } }
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  // ---------- 3D ----------
  const R = new BB.Render($('view'));
  addEventListener('resize', () => R.resize());
  const QN = q => T('q_' + (q === 'hi' || q === 'lo' ? q : 'auto'));
  $('q-name').textContent = QN(R.quality);
  $('btn-q').onclick = () => { const order = ['auto', 'hi', 'lo'], q = order[(order.indexOf(R.quality) + 1) % 3]; R.setQuality(q); $('q-name').textContent = QN(q); BB.toast(T('q_toast', { q: QN(q) })); setTimeout(() => location.reload(), 700); };

  // ---------- 自分のコマ ----------
  let myTop = null, level = 'normal';
  function refreshTitle() {
    BB.drawTopIcon(myTop, $('t-prev'));
    $('t-name').textContent = myTop ? (myTop.name || T('noname_top')) : T('no_top');
    $('btn-make').textContent = myTop ? T('edit_top') : T('make_top');
    $('t-id').innerHTML = myTop && myTop.id ? T('id_c') + myTop.id + '<button id="t-id-copy">' + T('copy') + '</button>' : '';
    const cb = $('t-id-copy'); if (cb) cb.onclick = () => copyText(myTop.id, cb);
    if (myTop && myTop.id) checkMyId(myTop.id);
    attract();
  }
  async function copyText(t, b) { try { await navigator.clipboard.writeText(t); if (b) { const o = b.textContent; b.textContent = T('copied2'); setTimeout(() => { b.textContent = o; }, 1500); } } catch (e) { BB.toast(T('id_c') + t); } }
  const idChecked = {};
  async function checkMyId(id) {
    if (!(id in idChecked)) idChecked[id] = await BB.Store.exists(id);
    if (idChecked[id] !== false || !myTop || myTop.id !== id) return;
    const msg = await BB.Store.goneMsg(id).catch(() => '');
    $('t-id').innerHTML = '<s>' + T('id_c') + id + '</s><br><span class="gone">' + esc(msg.replace(/（.*）|\s*\(.*\)/, '')) + '</span><button id="t-id-new">' + T('id_again') + '</button>';
    $('t-id-new').onclick = () => { myTop.id = ''; BB.saveTop(myTop); openSave(myTop, { done: refreshTitle }); };
  }
  BB.loadTop().then(t => { myTop = t; refreshTitle(); });
  document.addEventListener('langchange', () => { $('q-name').textContent = QN(R.quality); $('snd-name').textContent = T(muted ? 'snd_off' : 'snd_on'); if (mode === 'title') { BB.drawTopIcon(myTop, $('t-prev')); $('t-name').textContent = myTop ? (myTop.name || T('noname_top')) : T('no_top'); $('btn-make').textContent = myTop ? T('edit_top') : T('make_top'); } });

  // コマをつくる：描く → 設定 → （ID）
  function makeTop(after, opt = {}) {
    show('editor');
    const toSetup = (t, info) => {
      show('setup');
      BB.Setup.open(t, info.an, t2 => {
        if (opt.raku) return opt.raku(t2);
        const old = myTop; myTop = t2; if (old && old !== t2) BB.freeTop(old);
        const dirty = info.dirty || BB.Editor.dirty || !t2.id;
        if (dirty) { if (t2.id) t2.par = t2.id; t2.id = ''; }
        BB.saveTop(t2); BB.Pool.add(t2, 'self');
        const go = () => { refreshTitle(); if (after) after(); else show('title'); };
        if (!t2.id) openSave(t2, { done: go }); else go();
      }, t2 => { BB.Editor.open(t2, toSetup); show('editor'); }, opt.setupUntil ? { until: opt.setupUntil } : {});
    };
    BB.Editor.open(opt.fresh ? null : myTop, toSetup, opt.until ? { until: opt.until } : {});
  }
  $('btn-make').onclick = () => { snd.pick(); makeTop(); };
  $('ed-back').onclick = () => { show('title'); refreshTitle(); };
  $('btn-howto').onclick = () => $('ov-howto').classList.add('show');
  $('btn-howto-close').onclick = () => $('ov-howto').classList.remove('show');
  document.querySelectorAll('#title .btn.lv').forEach(b => b.addEventListener('click', () => {
    snd.pick(); level = b.dataset.level;
    if (!myTop) { BB.toast(T('make_first')); makeTop(() => startCpu()); return; }
    startCpu();
  }));

  // ---------- 試合 ----------
  // V：画面に出す試合のようす（CPU戦・0番の人は M から、1番の人・観戦は届いたようすから）
  let mode = 'title', mine = 0, M = null, V = null, cpu = null, cpuPlan = null, tops = [null, null], ans = [null, null], names = [T('you'), 'CPU'], lastEv = 0, sendT = 0;
  let aim = 0, holdT = null, power = 0, released = false, voted = false, myVotes = [], lastAimSent = 0, shake = 0, slow = 0, freeze = 0, rakuTop = null, punch = null, finalOn = false, heartT = 0, cpuCheerT = 0, tapN = 0, tapSendT = 0, tapTimes = [];
  function setTops(ts, nm) {
    for (const i of [0, 1]) { if (tops[i] && tops[i] !== myTop && tops[i] !== ts[i]) BB.freeTop(tops[i]); }
    tops = ts; names = nm;
    ans = tops.map(t => (t.an = BB.analyze(t)));
    for (const i of [0, 1]) { R.buildTop(i, tops[i], ans[i]); BB.drawTopIcon(tops[i], $('h-prev' + i)); }
  }
  const simTops = () => tops.map((t, i) => ({ prof: ans[i].prof, st: BB.stats(t, ans[i]) }));
  function beginMatch(opt) {
    stopAttract(); R.clearFx();
    mode = opt.mode; mine = opt.mine; lastEv = 0; V = { ph: 'vote', until: performance.now() + BB.MATCH.T_VOTE, sc: [0, 0], rd: 0, st: null, v: [false, false] };
    V.battle = new BB.Battle(simTops(), 'std');
    if (opt.host) M = new BB.Match(simTops(), BB.now()); else M = null;
    const left = mine === 1 ? 1 : 0;   // 自分を左に
    for (const i of [0, 1]) { const side = i === left ? 0 : 1; $('h-name' + side).textContent = names[i] || '？'; BB.drawTopIcon(tops[i], $('h-prev' + side)); }
    $('watch-tag').hidden = mode !== 'watch'; $('cheer-bar').hidden = mode !== 'watch';
    R.ringColor = mode === 'watch' ? ['#33c7ff', '#ff6b7a'] : mine === 0 ? ['#33c7ff', '#ff6b7a'] : ['#ff6b7a', '#33c7ff']; setFinal(false); comboShow(0);
    $('ov-result').classList.remove('show');
    show('battle'); openVote();
    if (mode === 'cpu') { cpu = new BB.Cpu(level, 1); const ks = BB.MATCH.KEYS.slice().sort(() => BB.rand() - 0.5); M.vote(1, ks.slice(0, 2)); }
  }
  async function startCpu(forced) {
    leaveRoom();
    const pool = BB.Pool.list(); let s = forced || null;
    const k = Math.floor(BB.rand() * (pool.length + 2));
    if (!s && k >= 2) { try { s = await BB.unpackTop(pool[k - 2].s); s.name = s.name || T('rival'); } catch (e) {} }
    if (!s) { const key = k === 1 ? ['easy', 'normal', 'hard'][Math.floor(BB.rand() * 3)] : level; s = BB.samples(key)[key]; }
    setTops([myTop, s], [myTop.name || T('you'), T('cpu_name', { name: s.name || T('noname'), lv: T(level) })]);
    if (myTop.id) BB.Store.touch(myTop.id);
    beginMatch({ mode: 'cpu', mine: 0, host: true });
  }

  // スタジアムの投票
  function stageIcon(cv, key) {
    const x = cv.getContext('2d'), w = cv.width, L = BB.LOOK[key], S = BB.STAGES[key]; x.clearRect(0, 0, w, w);
    const g = x.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); g.addColorStop(0, '#fff'); g.addColorStop(0.15, L.tint); g.addColorStop(1, '#000');
    x.fillStyle = '#c9ced8'; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 2, 0, 7); x.fill();
    x.fillStyle = g; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 2 - Math.max(3, L.wall * 40), 0, 7); x.fill();
    x.fillStyle = '#0b0d14'; for (const [c, ww] of S.pockets) { x.save(); x.translate(w / 2, w / 2); x.rotate(c * Math.PI / 180); x.fillRect(w / 2 - 9, -ww / 4, 9, ww / 2); x.restore(); }
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1.5; for (const r of [0.2, 0.33]) { x.beginPath(); x.arc(w / 2, w / 2, w * r, 0, 7); x.stroke(); }
  }
  function openVote() {
    voted = false; myVotes = [];
    $('vote-list').innerHTML = BB.MATCH.KEYS.map(k => `<button data-k="${k}"><canvas width="96" height="96"></canvas><b>${T('stg_' + k)}</b><small>${T('stgd_' + k)}</small><span class="votes"></span></button>`).join('');
    $('vote-list').querySelectorAll('button').forEach(b => stageIcon(b.querySelector('canvas'), b.dataset.k));
    $('btn-vote').disabled = true; $('btn-vote').hidden = mode === 'watch'; $('vote-msg').textContent = mode === 'watch' ? T('vote_watch') : '';
    $('ov-vote').classList.add('show');
    R.buildStage('std'); for (const i of [0, 1]) R.tops[i] && (R.tops[i].root.visible = false);
  }
  $('vote-list').onclick = e => {
    const b = e.target.closest('button[data-k]'); if (!b || voted || mode === 'watch') return; snd.pick();
    const k = b.dataset.k, i = myVotes.indexOf(k);
    if (i >= 0) myVotes.splice(i, 1); else { myVotes.push(k); if (myVotes.length > 2) myVotes.shift(); }
    $('vote-list').querySelectorAll('button').forEach(x => x.classList.toggle('on', myVotes.includes(x.dataset.k)));
    $('btn-vote').disabled = myVotes.length !== 2;
  };
  $('btn-vote').onclick = () => {
    if (myVotes.length !== 2 || voted) return; voted = true; snd.pick();
    if (M) M.vote(mine, myVotes.slice()); else room && room.sendCmd({ k: 'vote', v: myVotes.slice() });
    $('btn-vote').disabled = true; $('vote-msg').textContent = T('vote_wait');
  };
  function showStagePick(e) {
    const t = e.tally || {};
    $('vote-list').querySelectorAll('button').forEach(b => { b.querySelector('.votes').textContent = '★'.repeat(t[b.dataset.k] || 0); b.classList.toggle('win', b.dataset.k === e.stage); });
    $('vote-msg').textContent = T(e.tie ? 'stage_tie' : 'stage_go', { s: T('stg_' + e.stage) });
    $('btn-vote').hidden = true;
    setTimeout(() => { $('ov-vote').classList.remove('show'); $('btn-vote').hidden = false; }, 1900);
    R.buildStage(e.stage); for (const i of [0, 1]) if (R.tops[i]) R.tops[i].root.visible = true;
  }

  // 向き（左右にドラッグ）と、長押しで回す
  const cv = $('view');
  let drag = null;
  cv.addEventListener('pointerdown', e => { if (V && (V.ph === 'aim' || V.ph === 'count') && mode !== 'watch') drag = { x: e.clientX, a: aim }; else tapCheer(e); });
  addEventListener('pointermove', e => {
    if (!drag) return; const k = mine === 1 ? -1 : 1;
    aim = Math.max(-1, Math.min(1, drag.a + (e.clientX - drag.x) / 160 * k));
    if (M) M.setAim(mine, aim); else if (room && performance.now() - lastAimSent > 150) { lastAimSent = performance.now(); room.sendCmd({ k: 'aim', a: Math.round(aim * 100) / 100 }); }
  });
  addEventListener('pointerup', () => { if (drag && room && !M) room.sendCmd({ k: 'aim', a: Math.round(aim * 100) / 100 }); drag = null; });
  const hold = $('b-hold');
  hold.addEventListener('pointerdown', e => { e.preventDefault(); if (released || !V || V.ph !== 'count' || mode === 'watch') return; holdT = performance.now(); hold.classList.add('on'); A(); });
  const rel = () => {
    if (holdT == null || released) return; hold.classList.remove('on');
    released = true; const p = power, at = BB.now(); holdT = null;
    if (M) M.release(mine, { power: p, at }); else room && room.sendCmd({ k: 'rel', p: Math.round(p * 1000) / 1000, at });
    const j = BB.judge(at, V.goAtS || at); judgeMsg(j.timing, p);
  };
  hold.addEventListener('pointerup', rel); hold.addEventListener('pointercancel', rel); hold.addEventListener('pointerleave', rel);
  addEventListener('keydown', e => { if (e.code === 'Space' && !e.repeat) { if (V && V.ph === 'battle') useSkill(); else hold.dispatchEvent(new PointerEvent('pointerdown')); } });
  addEventListener('keyup', e => { if (e.code === 'Space') rel(); });
  function judgeMsg(t, p) {
    const msg = t === 'early' ? ['j_early', 'red'] : t === 'perfect' ? ['j_perfect', 'cyan'] : t === 'late' ? ['j_late', 'red'] : p > 1.02 ? ['j_over', 'red'] : p < 0.5 ? ['j_weak', ''] : ['j_good', 'cyan'];
    big(T(msg[0]), msg[1], 900);
  }
  function useSkill() { if (!V || V.ph !== 'battle' || mode === 'watch') return; if (M) M.skill(mine); else room && room.sendCmd({ k: 'skill' }); }
  $('b-skill').onclick = useSkill;

  // 大きい文字
  let bigTm = 0;
  function big(t, cls, ms) { const el = $('big'); el.innerHTML = t; el.className = 'big show ' + (cls || ''); clearTimeout(bigTm); if (ms) bigTm = setTimeout(() => el.classList.remove('show'), ms); }
  // 起きたことの表示と音
  const WHY = w => T('why_' + w);
  function handle(e) {
    const side = i => (i === mine ? 'cyan' : 'red'), nm = i => names[i] || '？';
    if (e.type === 'stage') showStagePick(e);
    else if (e.type === 'round') { big('ROUND ' + e.round, '', 1300); $('h-round').textContent = 'ROUND ' + e.round; released = false; power = 0; aim = 0; holdT = null; V.cn = 0; hold.classList.remove('on'); stopReplay(); snaps = []; R.clearFx(); for (const i of [0, 1]) { if (R.tops[i]) { R.buildTop(i, tops[i], ans[i]); } } humStop(); setFinal(false); comboShow(0); }
    else if (e.type === 'count') { }
    else if (e.type === 'go') { big(T('go'), '', 800); snd.go(); bgm.start(); leader = -1; callAt = 0; }
    else if (e.type === 'land') { snd.land(); shake = Math.max(shake, 0.14); }
    else if (e.type === 'launch') { }
    else if (e.type === 'hit') {
      const tier = e.tier || 1, y = BB.surfY(V.st || 'std', Math.hypot(e.x, e.y)) + 0.07;
      R.spark(e.x, y, e.y, e.s, tier >= 3, tier); snd.hit(tier);
      shake = Math.max(shake, [0, 0.07, 0.18, 0.38, 0.7][tier]);
      if (tier >= 3) snd.crowd(tier >= 4 ? 1 : 0.5);
      if (tier >= 3) { punch = { x: e.x, z: e.y, t: tier >= 4 ? 0.55 : 0.32, T: tier >= 4 ? 0.55 : 0.32, k: tier >= 4 ? 1 : 0.6 }; freeze = Math.max(freeze, tier >= 4 ? 0.11 : 0.06); }
      if (tier >= 4) { flash(); buzz(70); slow = Math.max(slow, 0.75); } else buzz(tier === 3 ? 30 : tier === 2 ? 12 : 5);
      if (tier >= 2) popAt(e.x, y + 0.12, e.y, T('hit' + tier), 't' + tier);
      comboShow(e.combo || 0);
    }
    else if (e.type === 'grind') { const y = BB.surfY(V.st || 'std', Math.hypot(e.x, e.y)) + 0.06; R.grind(e.x, y, e.y); snd.grind(); shake = Math.max(shake, 0.05); if (Math.random() < 0.18) popAt(e.x, y + 0.1, e.y, T('grind'), 'grd'); }
    else if (e.type === 'rail') { snd.rail(); R.railGlow = 1; }
    else if (e.type === 'wall') { snd.wall(e.s || 1); shake = Math.max(shake, 0.1); }
    else if (e.type === 'final') { setFinal(true); snd.final(); bgm.mode('final'); call(T('final_call'), 'red', true); }
    else if (e.type === 'crit') {
      const y = BB.surfY(V.st || 'std', Math.hypot(e.x, e.y)) + 0.07;
      R.spark(e.x, y, e.y, 4, true, 4); snd.crit(); snd.crowd(1.2); flash(); buzz(80); shake = Math.max(shake, 0.85); freeze = Math.max(freeze, 0.13); slow = Math.max(slow, 0.5);
      punch = { x: e.x, z: e.y, t: 0.6, T: 0.6, k: 1.15 };
      popAt(e.x, y + 0.2, e.y, T('crit_pop'), 'crit'); call(e.i === mine && mode !== 'watch' ? T('crit_me') : T('crit_of', { name: esc(nm(e.i)) }), side(e.i), true);
    }
    else if (e.type === 'miss') { if (e.i === mine && mode !== 'watch') { snd.miss(); popAt(e.x, 0.15, e.y, T('miss_pop'), 'miss'); call(T('miss_call'), 'red'); } }
    else if (e.type === 'crack') {
      snd.crack(e.lv); popAt(e.x, 0.12, e.y, T(e.lv >= 3 ? 'crack3' : 'crack1'), 'crk');
      if (e.lv >= 2) call(e.i === mine && mode !== 'watch' ? T('danger_me') : T('danger_of', { name: esc(nm(e.i)) }), e.i === mine ? 'red' : 'cyan', true);
    }
    else if (e.type === 'skill') { snd.skill(); big(T('sk_' + e.skill) + T('excl') + '<small>' + esc(nm(e.i)) + '</small>', side(e.i), 1100); }
    else if (e.type === 'refl') big(T('sk_refl') + T('excl'), side(e.i), 900);
    else if (e.type === 'burst') { snd.burst(); snd.crowd(1.5); shake = 0.9; slow = 1.2; freeze = 0.12; flash(); buzz(140); setFinal(false); }
    else if (e.type === 'out') { snd.out(); snd.crowd(1.3); shake = 0.5; slow = 0.9; freeze = 0.1; setFinal(false); }
    else if (e.type === 'stop') { snd.stop(); setFinal(false); }
    else if (e.type === 'roundEnd') {
      humStop(); setFinal(false); comboShow(0); bgm.stop(); R.critRing(false);
      if (e.why === 'burst' || e.why === 'out') { const buf = snaps.slice(); clearTimeout(replayTm); replayTm = setTimeout(() => startReplay(buf, e.winner), 1300); }
      const w = e.winner, me = w === mine;
      big(WHY(e.why) + (w >= 0 ? '<small>' + T('plus_pts', { name: esc(nm(w)), n: e.pts }) + '</small>' : ''), w < 0 ? '' : mode === 'watch' ? 'cyan' : me ? 'cyan' : 'red', 2200);
      if (w >= 0 && mode !== 'watch') (me ? snd.win : snd.lose)();
    }
    else if (e.type === 'over') { bgm.stop(); finish(e.winner, e.score); }
  }

  // 画面が白く光る
  function flash() { const f = $('flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
  // ぶつかった所に、文字がとびだす
  function popAt(x, y, z, text, cls) {
    const p = R.toScreen(x, y, z); if (!p.ok) return;
    const el = document.createElement('div'); el.className = 'pop ' + cls; el.textContent = text;
    el.style.left = Math.max(60, Math.min(innerWidth - 60, p.x)) + 'px'; el.style.top = Math.max(90, p.y) + 'px';
    $('fx-layer').appendChild(el); setTimeout(() => el.remove(), 800);
    const L = $('fx-layer').querySelectorAll('.pop'); if (L.length > 6) L[0].remove();
  }
  // れんだ
  let comboTm = 0;
  function comboShow(n) {
    const el = $('combo'); clearTimeout(comboTm);
    if (n < 3) { if (!n) el.classList.remove('show'); else comboTm = setTimeout(() => el.classList.remove('show'), 1100); return; }
    el.innerHTML = n + '<small>' + T('combo') + '</small>'; el.classList.add('show'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    comboTm = setTimeout(() => el.classList.remove('show'), 1100);
  }
  // スピン勝負（ふたりとも回転が3割を切った）
  const spinLbl = [0, 1].map(() => { const d = document.createElement('div'); d.className = 'spin-lbl'; d.hidden = true; $('fx-layer').appendChild(d); return d; });
  function setFinal(on) {
    finalOn = on; $('vig').classList.toggle('on', on); $('final-tag').classList.toggle('on', on); heartT = 0;
    if (!on) spinLbl.forEach(d => { d.hidden = true; });
  }
  // 実況（上に出る短い文字）
  let callAt = 0, callTm = 0, leader = -1;
  function call(t, cls, force) {
    const n = performance.now(); if (!force && n - callAt < 2600) return; callAt = n;
    const el = $('call'); el.innerHTML = t; el.className = 'call show ' + (cls || ''); clearTimeout(callTm); callTm = setTimeout(() => el.classList.remove('show'), 1700);
  }
  // 決着のリプレイ（最後の1.6秒を、ゆっくり・低いカメラで）
  let snaps = [], replay = null, replayTm = 0;
  function snapNow(B) { snaps.push({ t: B.t, f: B.f.map(f => ({ x: f.x, y: f.y, ang: f.ang, w: f.w, state: f.state, wob: f.wob, danger: f.danger, vx: f.vx, vy: f.vy, outV: f.outV })) }); if (snaps.length > 240) snaps.shift(); }
  function startReplay(buf, winner) {
    if (!V || V.ph !== 'end' || buf.length < 4) return;
    let k = buf.length - 1; while (k > 0 && buf[k].f.some(f => f.state !== 'spin')) k--;
    const tEnd = buf[k].t, list = buf.filter(q => q.t >= tEnd - 1.3 && q.t <= tEnd + 0.35); if (list.length < 3) return;
    for (const i of [0, 1]) { R.buildTop(i, tops[i], ans[i]); R.tops[i].y = -1; } R.clearFx();
    replay = { list, t0: list[0].t, t: list[0].t, loser: 1 - winner, done: false, fired: false, tEnd };
    $('replay-tag').hidden = false; $('big').classList.remove('show');
  }
  function stopReplay() { clearTimeout(replayTm); if (replay) { replay = null; $('replay-tag').hidden = true; } }
  function stepReplay(rdt, t) {
    const r = replay; r.t += rdt * 0.33;
    const L = r.list; let a = L[0], b = L[L.length - 1];
    for (let k = 0; k < L.length - 1; k++) if (L[k + 1].t >= r.t) { a = L[k]; b = L[k + 1]; break; }
    const q = b.t > a.t ? Math.min(1, Math.max(0, (r.t - a.t) / (b.t - a.t))) : 0;
    for (const i of [0, 1]) {
      const fa = a.f[i], fb = b.f[i], st = q < 0.5 ? fa.state : fb.state;
      const f = { x: fa.x + (fb.x - fa.x) * q, y: fa.y + (fb.y - fa.y) * q, ang: fa.ang, w: fa.w, state: st, wob: fa.wob, danger: fa.danger, vx: fb.vx, vy: fb.vy, outV: fb.outV };
      R.sync(i, f, rdt * 0.33, t);
    }
    if (!r.fired && r.t >= r.tEnd) { r.fired = true; flash(); snd.crit(); shake = 0.6; }
    if (r.t >= L[L.length - 1].t) { const fin = L[L.length - 1]; stopReplay(); for (const i of [0, 1]) { R.buildTop(i, tops[i], ans[i]); R.tops[i].y = -1; } }
    // 低いカメラで、負けたコマの近くから
    const lf = (b.f[r.loser] || b.f[0]), ang = 0.8 + (r.t - r.t0) * 0.6;
    const tp = new THREE.Vector3(lf.x + Math.cos(ang) * 0.75, 0.22, lf.y + Math.sin(ang) * 0.75);
    if (!r.cam) { r.cam = 1; camP.copy(tp); camL.set(lf.x, -0.05, lf.y); }
    camP.lerp(tp, Math.min(1, rdt * 3)); camL.lerp(new THREE.Vector3(lf.x, -0.05, lf.y), Math.min(1, rdt * 4));
    R.camera.position.copy(camP); if (shake > 0) { R.camera.position.x += (Math.random() - 0.5) * shake * 0.06; shake = Math.max(0, shake - rdt * 2.5); } R.camera.lookAt(camL);
  }
  // 会心のねらい（ぶつかる直前）
  const nearNow = () => { if (!V || !V.battle || V.ph !== 'battle') return null; return M && M.battle ? M.battle.near : BB.Battle.nearOf(V.battle.f); };
  const localBt = () => (V.bt || 0) + (performance.now() - (V.btAt || performance.now())) / 1000 * (V.ts == null ? 1 : V.ts);
  // 応援（バトル中に画面をタップ）
  function tapCheer(e) {
    if (!V || V.ph !== 'battle' || mode === 'watch') return;
    const me = V.battle && V.battle.f[mine]; if (!me || me.state !== 'spin') return;
    const n = performance.now(); tapTimes = tapTimes.filter(t => n - t < 1000); if (tapTimes.length >= 8) return; tapTimes.push(n);
    const r = document.createElement('div'); r.className = 'tap-ring'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; $('fx-layer').appendChild(r); setTimeout(() => r.remove(), 460);
    if (me.gauge < 1 && !me.used) { const p = document.createElement('div'); p.className = 'tap-plus'; p.textContent = T('cheer_plus'); p.style.left = e.clientX + 'px'; p.style.top = (e.clientY - 30) + 'px'; $('fx-layer').appendChild(p); setTimeout(() => p.remove(), 620); }
    snd.tap(); buzz(4);
    if (nearNow()) { if (M) M.crit(mine, null); else if (room) room.sendCmd({ k: 'cr', t: Math.round(localBt() * 1000) / 1000 }); }
    if (M) M.cheer(mine, 1, BB.now()); else tapN++;
  }

  // ---------- 毎フレーム ----------
  let last = performance.now(), fpsN = 0, fpsT = 0;
  const camP = new THREE.Vector3(0, 2.6, 2.6), camL = new THREE.Vector3(0, -0.1, 0);
  function frame(now) {
    requestAnimationFrame(frame);
    const rdt = Math.min(0.05, (now - last) / 1000); last = now;
    let dt = slow > 0 ? rdt * 0.32 : rdt; if (slow > 0) slow -= rdt;
    if (freeze > 0) { freeze -= rdt; dt = 0; }
    // おまかせ画質：重ければ次から「かるい」
    if (R.quality === 'auto' && mode !== 'title') { fpsN++; fpsT += rdt; if (fpsN === 150) { if (fpsT / fpsN > 0.045) { R.setQuality('lo'); BB.toast(T('q_auto_low')); } } }
    if (mode === 'title') { if (!$('title').classList.contains('active')) return; attractStep(rdt); R.fx(rdt); camOrbit(now / 1000, rdt); R.render(); return; }
    if (!V) { R.render(); return; }
    // 計算（CPU戦・0番の人）
    if (M) {
      const sn = BB.now();
      if (mode === 'cpu' && cpuPlan && !cpuPlan.done && M.goAt && sn >= cpuPlan.at) { cpuPlan.done = true; M.release(1, { power: cpuPlan.power, at: sn }); }
      if (mode === 'cpu' && M.phase === 'count' && !cpuPlan) { const L = BB.cpuLaunch(level), off = { early: -300, perfect: 90, good: 420, late: 800 + L.delay * 1000 }[L.timing]; cpuPlan = { power: L.power, at: M.goAt + off }; M.setAim(1, L.aim); }
      if (M.phase !== 'count' && M.phase !== 'battle') cpuPlan = null;
      const steps = Math.max(1, Math.round(rdt * 60));
      for (let k = 0; k < steps; k++) { M.step(1 / 60, sn); if (mode === 'cpu' && cpu && M.battle && M.phase === 'battle') { const o = cpu.update(M.battle, 1 / 60); if (o && o.skill) M.skill(1); cpuCheerT += 1 / 60; if (cpuCheerT > 1 / ({ easy: 2, normal: 3, hard: 4 }[level] || 3)) { cpuCheerT = 0; M.cheer(1, 1, sn); } } }
      const p = M.pack(sn); fromPack(p, now);
      V.battle = M.battle || V.battle;
      for (const e of M.events) handle(e);
      if (mode === 'online' && room) { sendT -= rdt; if (sendT <= 0 || M.events.length) { sendT = 0.066; room.sendState(Object.assign({ m: room.round, e: M.events.map(e => e) }, p)); } }
      M.events = [];
    } else if (V.battle) {
      // 届いたようすのあいだは、なめらかに
      const sdt = rdt * (V.ts == null ? 1 : V.ts);
      for (const f of V.battle.f) if (f.state === 'spin') { f.x += f.vx * sdt; f.y += f.vy * sdt; f.ang += f.w * sdt; }
      tapSendT -= rdt; if (tapN && tapSendT <= 0 && room) { tapSendT = 0.35; room.sendCmd({ k: 'ch', n: Math.min(4, tapN) }); tapN = 0; }
    }
    // ラウンドの各段階
    const ph = V.ph, nowS = BB.now();
    $('launch').hidden = !(ph === 'aim' || ph === 'count') || mode === 'watch' || released;
    $('aim-tip').hidden = !(ph === 'aim' || ph === 'count') || mode === 'watch' || released;
    if (ph === 'count' && V.goAtS) {
      const left = V.goAtS - nowS, n = Math.ceil(left / 1000 - 0.0001);
      if (n !== V.cn && n >= 1 && n <= 3) { V.cn = n; big(String(n), '', 700); snd.count(); }
    }
    if (holdT != null) { power = Math.min(1.3, (performance.now() - holdT) / 1150); $('g-fill').style.width = (power / 1.3 * 100) + '%'; }
    else if (!released) $('g-fill').style.width = '0%';
    if ((ph === 'count' || ph === 'battle') && !released && V.goAtS && nowS > V.goAtS + 1400 && holdT == null && mode !== 'watch') { released = true; judgeMsg('late', 0.55); }
    if (holdT != null && V.goAtS && nowS > V.goAtS + 1500) rel();
    // スキルボタン
    const sb = $('b-skill'), me = V.battle && V.battle.f[mine];
    sb.hidden = !(ph === 'battle' && me && me.state !== 'wait') || mode === 'watch';
    $('tap-hint').hidden = sb.hidden || !me || me.state !== 'spin' || (V.battle.t || 0) > 12;
    if (!sb.hidden) { const gq = me.used ? 0 : me.gauge; $('sk-ring').style.strokeDashoffset = 276.5 * (1 - gq); sb.classList.toggle('ready', !me.used && gq >= 1); sb.classList.toggle('used', !!me.used); $('sk-name').textContent = T('sk_' + tops[mine].skill); }
    // コマ
    const t = now / 1000;
    if (replay) { stepReplay(rdt, t); R.fx(dt); R.render(); return; }
    if (V.battle) {
      const B = V.battle;
      if (ph === 'battle' || ph === 'end') snapNow(B);
      // 会心の輪
      const nr = ph === 'battle' && mode !== 'watch' ? nearNow() : null;
      R.critRing(!!nr, nr ? nr.x : 0, nr ? nr.y : 0, nr ? nr.tc / 0.6 : 1);
      // 実況：どちらが押しているか
      if (ph === 'battle' && B.t > 4 && B.f[0].state === 'spin' && B.f[1].state === 'spin') {
        const u0 = Math.abs(B.f[0].w) / BB.W0, u1 = Math.abs(B.f[1].w) / BB.W0, ld = u0 - u1 > 0.12 ? 0 : u1 - u0 > 0.12 ? 1 : -1;
        if (ld >= 0 && ld !== leader) { leader = ld; call(T('pushing', { name: esc(names[ld] || '？') }), mode === 'watch' ? '' : ld === mine ? 'cyan' : 'red'); }
      }
      for (const i of [0, 1]) {
        const f = B.f[i];
        if (ph === 'intro' || ph === 'aim' || ph === 'count' || ph === 'vote') { const sx = i ? 0.58 : -0.58; f.x = sx; f.y = 0; f.state = 'wait'; R.sync(i, f, dt, t); }
        else R.sync(i, f, dt, t);
      }
      if (me && mode !== 'watch') humSet(me.state === 'spin' ? Math.abs(me.w) : 0);
      // スピン勝負：心臓の音と、残りの回転（％）
      if (B.final && !finalOn && ph === 'battle' && B.f[0].state === 'spin' && B.f[1].state === 'spin') setFinal(true);
      if (finalOn) {
        heartT -= rdt; if (heartT <= 0) { heartT = 0.8; snd.heart(); }
        for (const i of [0, 1]) {
          const f = B.f[i], d = spinLbl[i], R0 = R.tops[i]; if (!R0 || f.state !== 'spin') { d.hidden = true; continue; }
          const p = R.toScreen(R0.root.position.x, R0.root.position.y + 0.16, R0.root.position.z); d.hidden = !p.ok;
          d.style.left = Math.max(34, Math.min(innerWidth - 34, p.x)) + 'px'; d.style.top = Math.max(130, Math.min(innerHeight - 20, p.y)) + 'px'; d.textContent = Math.round(Math.abs(f.w) / BB.W0 * 100) + '%'; d.className = 'spin-lbl ' + (mode === 'watch' ? (i ? 'op' : 'me') : i === mine ? 'me' : 'op');
        }
      }
      // HUD
      const left = mine === 1 ? 1 : 0;
      for (const i of [0, 1]) { const side = i === left ? 0 : 1, f = B.f[i]; $('h-spin' + side).style.width = (f.state === 'spin' ? Math.min(100, Math.abs(f.w) / BB.W0 * 100) : f.state === 'wait' ? 100 : 0) + '%'; $('h-pips' + side).innerHTML = [0, 1, 2].map(k => `<i class="${k < (V.sc[i] || 0) ? 'on' : ''}"></i>`).join(''); }
    }
    aimArrow(ph);
    R.fx(dt);
    camBattle(t, rdt, ph);
    R.render();
  }
  requestAnimationFrame(frame);
  // 届いたようす（または M.pack）→ V
  function fromPack(p, now) {
    if (p.ph !== V.ph) {
      if (p.ph === 'count') V.cn = 0;
      if (p.ph === 'battle' && V.ph !== 'battle') { $('launch').hidden = true; }
    }
    V.ph = p.ph; V.ts = p.ts; V.bt = p.bt; V.btAt = now; V.until = now + (p.u || 0); V.goAtS = p.g != null ? BB.now() + p.g : null; V.sc = p.sc; V.rd = p.rd; V.v = p.v; V.r = p.r;
    if (p.st && p.st !== V.st) { V.st = p.st; if (!M) { R.buildStage(p.st); } }
    if (p.ph === 'vote' && !M && mode !== 'watch') { const vt = Math.max(0, (V.until - now) / BB.MATCH.T_VOTE); $('vote-bar').style.width = (vt * 100) + '%'; }
    if (M && p.ph === 'vote') $('vote-bar').style.width = Math.max(0, (V.until - now) / BB.MATCH.T_VOTE * 100) + '%';
  }
  // 打ち出す向きの矢印
  const arrow = (() => { const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: '#33c7ff', transparent: true, opacity: 0.85, depthWrite: false }); const body = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.05), m); body.position.x = 0.21; const head = new THREE.Mesh(new THREE.CircleGeometry(0.06, 3), m); head.position.x = 0.44; g.add(body, head); g.children.forEach(c => { c.rotation.x = -Math.PI / 2; }); g.visible = false; R.world.add(g); return g; })();
  function aimArrow(ph) {
    const on = (ph === 'aim' || ph === 'count') && mode !== 'watch' && !released;
    arrow.visible = on; if (!on) return;
    const sx = mine ? 0.58 : -0.58, base = Math.atan2(0, -sx), a = base + aim * 0.9;
    arrow.position.set(sx, 0.36, 0); arrow.rotation.y = -a;
  }
  // カメラ
  function camOrbit(t, dt) { const r = 3.1, y = 2.1; camP.lerp(new THREE.Vector3(Math.cos(t * 0.15) * r, y, Math.sin(t * 0.15) * r), Math.min(1, dt * 2)); camL.lerp(new THREE.Vector3(0, -0.15, 0), Math.min(1, dt * 2)); R.camera.position.copy(camP); R.camera.lookAt(camL); }
  function camBattle(t, dt, ph) {
    const asp = R.camera.aspect, far = asp < 1 ? 1 / asp : 1, side = mine === 1 ? 1 : -1;
    let tp, tl;
    if (ph === 'vote' || ph === 'intro') { tp = new THREE.Vector3(Math.cos(t * 0.2) * 2.4 * far, 1.9 * far, Math.sin(t * 0.2) * 2.4 * far); tl = new THREE.Vector3(0, -0.1, 0); }
    else if (ph === 'aim' || ph === 'count') { tp = new THREE.Vector3(side * 1.55 * Math.min(far, 1.5), 0.95 + 0.4 * far, 0.95 * far); tl = new THREE.Vector3(-side * 0.15, 0, 0); }
    else {
      const B = V.battle, a = B.f[0], b = B.f[1], live = B.f.filter(f => f.state === 'spin' || f.state === 'stop' || f.state === 'burst');
      const mx = live.length ? live.reduce((s, f) => s + f.x, 0) / live.length : 0, mz = live.length ? live.reduce((s, f) => s + f.y, 0) / live.length : 0;
      // 2つのコマが画面に入るように、引きの距離を決める（たて長の画面では、はばが足りないので遠くから）
      const cx = mx * 0.6, cz = mz * 0.6, th = Math.tan(19 * Math.PI / 180), tw = th * asp;
      let ex = 0, ez = 0; for (const f of live) { ex = Math.max(ex, Math.abs(f.x - cx)); ez = Math.max(ez, Math.abs(f.y - cz)); }
      const mg = 0.34, need = Math.max((ex + mg) / tw, (ez * 0.8 + mg) / th, 1.7);
      const d = Math.min(asp < 1 ? 7.2 : 4.2, need * (finalOn ? 0.8 : 1)), el = finalOn ? 0.62 : 0.8;
      tp = new THREE.Vector3(cx, d * el, cz + d * Math.sqrt(1 - el * el)); tl = new THREE.Vector3(cx, -0.08, cz);
      if (ph === 'end' && V.r && V.r.winner >= 0) { const l = B.f[1 - V.r.winner]; tp.lerp(new THREE.Vector3(l.x * 0.8, 1.0, l.y * 0.8 + 1.1), 0.45); tl.lerp(new THREE.Vector3(l.x, -0.05, l.y), 0.5); }
    }
    const out_ = tp.lengthSq() > camP.lengthSq() + 0.05;   // 引くときは速く
    camP.lerp(tp, Math.min(1, dt * (out_ && ph === 'battle' ? 4.5 : 2.2))); camL.lerp(tl, Math.min(1, dt * 3));
    R.camera.position.copy(camP);
    // ぐっと寄る（強い一撃）
    if (punch && punch.t > 0 && ph === 'battle') {
      const q = punch.t / punch.T, e = Math.sin(Math.min(1, (1 - q) * 4) * Math.PI / 2) * q, hp = new THREE.Vector3(punch.x, 0.05, punch.z);
      R.camera.position.lerp(hp, 0.32 * punch.k * e); punch.t -= dt || 0.016;
    }
    if (shake > 0) { R.camera.position.x += (Math.random() - 0.5) * shake * 0.08; R.camera.position.y += (Math.random() - 0.5) * shake * 0.08; shake = Math.max(0, shake - dt * 2.5); }
    R.camera.lookAt(camL);
  }
  // タイトルの後ろで、見本どうしが戦っている
  let AT = null;
  function attract() {
    if (mode !== 'title') return;
    stopAttract();
    const S = BB.samples(), a = myTop ? BB.cloneTop(myTop) : S.hard, b = S.normal, aa = BB.analyze(a), ab = BB.analyze(b);
    R.buildStage('std'); R.buildTop(0, a, aa); R.buildTop(1, b, ab);
    const B = new BB.Battle([{ prof: aa.prof, st: BB.stats(a, aa) }, { prof: ab.prof, st: BB.stats(b, ab) }], 'std');
    B.launch(0, { power: 0.88, timing: 'good', aim: 0.4 }); B.launch(1, { power: 0.9, timing: 'good', aim: -0.3 });
    AT = { B, tops: [a, b, S.easy], t: 0, end: 0 };
  }
  function stopAttract() { if (AT) { for (const t of AT.tops) if (t !== myTop) BB.freeTop(t); AT = null; } }
  function attractStep(dt) {
    if (!AT) return; const B = AT.B; AT.t += dt;
    if (!B.over) { B.step(dt); for (const e of B.events) { if (e.type === 'hit') R.spark(e.x, BB.surfY('std', Math.hypot(e.x, e.y)) + 0.07, e.y, e.s * 0.7, false, Math.min(3, e.tier || 1)); else if (e.type === 'grind') R.grind(e.x, BB.surfY('std', Math.hypot(e.x, e.y)) + 0.06, e.y); else if (e.type === 'rail') R.railGlow = 1; } B.events = []; }
    else if ((AT.end += dt) > 2.5) { attract(); return; }
    for (const i of [0, 1]) R.sync(i, B.f[i], dt, AT.t);
  }

  // ---------- 決着 ----------
  function finish(w, score) {
    humStop();
    setTimeout(() => {
      const watch = mode === 'watch', me = w === mine;
      $('res-title').textContent = watch ? T('win_of', { name: names[w] || '？' }) : me ? T('win') : T('lose'); $('res-title').className = me || watch ? 'win' : 'lose';
      $('res-sub').textContent = `${names[0]} ${score[0]} － ${score[1]} ${names[1]}`;
      for (const i of [0, 1]) { BB.drawTopIcon(tops[i], $('r' + i)); $('rn' + i).textContent = names[i] || '？'; }
      $('btn-keep').disabled = false; $('btn-keep').textContent = watch ? T('keep_both') : T('keep_one');
      $('btn-again').hidden = watch; $('btn-again').disabled = false; $('again-msg').textContent = watch ? T('auto_watch') : '';
      $('btn-reedit').hidden = mode !== 'cpu'; $('btn-savedraw').hidden = !(rakuTop && mode === 'online'); $('btn-savedraw').disabled = false;
      $('ov-result').classList.add('show');
      me || watch ? snd.win() : snd.lose();
    }, 1800);
  }
  $('btn-keep').onclick = () => {
    let ok = BB.Pool.add(tops[1 - mine], 'rival'); if (mode === 'watch') ok = BB.Pool.add(tops[mine], 'rival') && ok;
    $('btn-keep').disabled = true; $('btn-keep').textContent = ok ? T('keep_done') : T('save_fail');
  };
  $('btn-again').onclick = () => {
    if (mode === 'cpu') { $('ov-result').classList.remove('show'); return startCpu(); }
    if (room) { room.rematch(); $('btn-again').disabled = true; $('again-msg').textContent = T('wait_rematch'); }
  };
  $('btn-reedit').onclick = () => { $('ov-result').classList.remove('show'); endBattle(); makeTop(() => startCpu()); };
  function endBattle() { stopReplay(); bgm.stop(); R.critRing(false); M = null; V = null; cpu = null; cpuPlan = null; humStop(); R.clearFx(); arrow.visible = false; for (const i of [0, 1]) R.dropTop(i); }
  function toTitle() {
    leaveRoom(); endBattle(); mode = 'title'; rakuTop = null; BB.Editor.stop(); BB.Setup.stop(); clearInterval(dwTm);
    for (const o of ['ov-result', 'ov-vote', 'ov-drawwait', 'ov-reveal', 'ov-online']) $(o).classList.remove('show');
    show('title'); refreshTitle();
  }
  $('btn-title').onclick = toTitle; $('btn-quit').onclick = toTitle;

  // ---------- あいことば対戦 ----------
  function leaveRoom() { if (room) { room.leave(); room = null; } $('watchers').hidden = true; }
  let want = 'normal', dwTm = 0;
  $('mode-pick').onclick = e => { const b = e.target.closest('button'); if (!b) return; want = b.dataset.mode; $('mode-pick').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); };
  const lobby = w => { $('online-form').hidden = w; $('online-wait').hidden = !w; };
  function openOnline(code) { lobby(false); $('online-err').textContent = ''; try { $('in-name').value = localStorage.getItem('bb-name') || (myTop && myTop.name) || ''; } catch (e) {} if (code) $('in-code').value = code; $('ov-online').classList.add('show'); }
  $('btn-online').onclick = () => { snd.pick(); openOnline(); };
  $('btn-online-close').onclick = () => { leaveRoom(); $('ov-online').classList.remove('show'); };
  $('btn-copy').onclick = async () => { const url = location.origin + location.pathname + '?room=' + encodeURIComponent(room ? room.code : ''); try { await navigator.clipboard.writeText(url); $('btn-copy').textContent = T('copied'); } catch (e) { prompt(T('send_link'), url); } setTimeout(() => { $('btn-copy').textContent = T('copy_link'); }, 2000); };
  $('btn-join').onclick = joinOnline;
  const NOTOP = () => T('no_top_room');
  async function joinOnline() {
    const code = BB.cleanCode($('in-code').value), name = $('in-name').value.trim().slice(0, 8) || T('noname');
    if (!code) { $('online-err').textContent = T('err_code_short'); return; }
    try { localStorage.setItem('bb-name', name); } catch (e) {}
    $('online-err').textContent = ''; $('btn-join').disabled = true; $('btn-join').textContent = T('connecting');
    try {
      const db = await BB.getDb(); leaveRoom();
      const r = new BB.Room(db, code, name, myTop ? BB.packTop(myTop, 0.6) : null, {
        onPeople: p => { if (room !== r) return; if (!r.watching && !p.names[1 - r.slot]) $('wait-msg').textContent = T('waiting'); },
        onMode: m => { if (room !== r) return; showMode(r); if (m === 'normal' && !myTop && !r.watching) { leaveRoom(); lobby(false); $('online-err').textContent = NOTOP(); } },
        onWatchers: n => { if (room !== r) return; $('watchers').hidden = !n; $('watchers').textContent = T('watch_n', { n }); },
        onDraw: g => { if (room === r) startDraw(g); },
        onStart: g => { if (room === r) onlineStart(g); },
        onState: s => { if (room === r) onState(s); },
        onCmd: c => { if (room !== r || !M || !c) return; if (c.k === 'vote') M.vote(1, c.v); else if (c.k === 'aim') M.setAim(1, c.a); else if (c.k === 'rel') M.release(1, { power: c.p, at: c.at }); else if (c.k === 'skill') M.skill(1); else if (c.k === 'ch') M.cheer(1, +c.n || 0, BB.now()); else if (c.k === 'cr') M.crit(1, +c.t); },
        onCheer: v => { if (room === r) cheerPop(v); },
        onLeft: () => { if (room !== r) return; if (V && V.ph !== 'over') { BB.toast(T('left')); toTitle(); } else { $('btn-again').hidden = true; $('again-msg').textContent = T('left'); } }
      }, want);
      room = r;
      const res = await r.join();
      if (!res.watching && res.mode === 'normal' && !myTop) { leaveRoom(); throw new Error(NOTOP()); }
      lobby(true); showMode(r); $('wait-msg').textContent = res.watching ? T('watch_in2') : T('waiting');
    } catch (e) { $('online-err').textContent = e.message || T('err_conn'); leaveRoom(); }
    $('btn-join').disabled = false; $('btn-join').textContent = T('join');
  }
  function showMode(r) { $('wait-code').textContent = T('code_mode', { c: r.code, m: T(r.mode === 'raku' ? 'raku' : 'mode_now') }); }
  // らくがきバトル：60秒で描く → 20秒で設定
  function startDraw(g) {
    for (const o of ['ov-online', 'ov-result', 'ov-reveal', 'ov-vote']) $(o).classList.remove('show');
    endBattle(); stopAttract(); rakuTop = null;
    if (g.slot < 0) { mode = 'watch'; drawWait(g.setupEnd, T('dw_watch'), T('dw_watch_msg'), true); return; }
    mode = 'online'; BB.toast(T('draw60'));
    show('editor');
    const submit = t => { rakuTop = t; t.id = ''; t.name = t.name || g.names[g.slot] || ''; if (room) room.submitDraw(BB.packTop(t, 0.6)); drawWait(g.setupEnd, T('dw_done'), T('waiting'), false); };
    BB.Editor.open(null, (t, info) => { show('setup'); BB.Setup.open(t, info.an, submit, null, { until: g.setupEnd }); }, { until: g.drawEnd });
  }
  function drawWait(until, title, msg, cheer) {
    $('dw-title').textContent = title; $('dw-msg').textContent = msg; $('dw-cheer').hidden = !cheer; $('ov-drawwait').classList.add('show');
    clearInterval(dwTm); const tick = () => { $('dw-timer').textContent = Math.max(0, Math.ceil((until - BB.now()) / 1000)); }; tick(); dwTm = setInterval(tick, 250);
  }
  $('dw-quit').onclick = toTitle;
  function reveal(ts, nm, after) {
    $('ov-drawwait').classList.remove('show'); clearInterval(dwTm);
    const rv = document.querySelector('.reveal'); rv.classList.remove('open');
    for (const i of [0, 1]) { BB.drawTopIcon(ts[i], $('rv' + i)); $('rvn' + i).textContent = nm[i] || '？'; }
    $('rv-say').textContent = T('rv_ready'); $('ov-reveal').classList.add('show'); snd.count();
    setTimeout(() => { rv.classList.add('open'); $('rv-say').textContent = T('rv_go'); snd.go(); }, 1300);
    setTimeout(() => { $('ov-reveal').classList.remove('show'); after(); }, 3600);
  }
  async function onlineStart(g) {
    BB.Editor.stop(); BB.Setup.stop();
    const ts = await Promise.all(g.tops.map(s => (s ? BB.unpackTop(s) : Promise.resolve(null))));
    if (!room) return;
    const nm = g.names.map(n => n || '？');
    for (let i = 0; i < 2; i++) if (!ts[i]) { ts[i] = BB.newTop(); BB.fillMin(ts[i]); }
    $('ov-online').classList.remove('show'); $('ov-drawwait').classList.remove('show');
    const go = () => {
      setTops(ts, nm);
      if (!g.raku && myTop && myTop.id && !g.watching) BB.Store.touch(myTop.id);
      beginMatch({ mode: g.watching ? 'watch' : 'online', mine: g.watching ? 0 : g.slot, host: g.slot === 0 });
    };
    if (g.raku) reveal(ts, nm, go); else go();
  }
  // 1番の人・観戦：届いたようす
  function onState(str) {
    if (M || !V) return;
    let s; try { s = JSON.parse(str); } catch (e) { return; }
    if (!room || s.m !== room.round) return;
    const now = performance.now();
    fromPack(s, now);
    if (s.b) { V.battle.unpack(s.b); }
    for (const e of s.e || []) { if (e.id <= lastEv) continue; lastEv = e.id; handle(e); }
    if (s.ph !== 'vote' && $('ov-vote').classList.contains('show') && !V.st) {}
  }
  // 応援
  const CHEER = ['👏', '🔥', '😂', '😱', '💪', '✨']; let cheerAt = 0;
  for (const id of ['cheer-bar', 'dw-cheer']) $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !room) return; const n = performance.now(); if (n - cheerAt < 600) return; cheerAt = n; room.cheer(+b.dataset.e); });
  const cheerLayer = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:30'; document.body.appendChild(d); return d; })();
  function cheerPop(v) { const el = document.createElement('div'); el.className = 'cheer-pop'; el.innerHTML = '<span>' + (CHEER[v.e] || '👏') + '</span><small>' + esc(String(v.n || '').slice(0, 8)) + '</small>'; el.style.left = (8 + Math.random() * 78) + '%'; cheerLayer.appendChild(el); setTimeout(() => el.remove(), 2300); }
  $('btn-savedraw').onclick = () => { if (rakuTop) openSave(rakuTop, { raku: true, done: () => { $('btn-savedraw').disabled = true; $('btn-savedraw').textContent = T('saved'); } }); };

  // ---------- ID ----------
  let saveCtx = null;
  function openSave(t, opt) {
    saveCtx = { t, opt: opt || {} }; BB.drawTopIcon(t, $('sv-prev'));
    $('sv-form').hidden = false; $('sv-done').hidden = true; $('sv-err').textContent = ''; $('sv-author').value = BB.Store.author(); $('sv-pub').checked = false;
    $('sv-mine-l').hidden = !saveCtx.opt.raku; $('sv-mine').checked = true; $('sv-skip').textContent = T(saveCtx.opt.raku ? 'sv_nosave' : 'sv_skip');
    $('sv-title').textContent = T(saveCtx.opt.raku ? 'sv_title_raku' : 'sv_title'); $('ov-save').classList.add('show');
  }
  function closeSave() { $('ov-save').classList.remove('show'); const c = saveCtx; saveCtx = null; if (c && c.opt.done) c.opt.done(); }
  $('sv-skip').onclick = closeSave; $('sv-close').onclick = closeSave;
  $('sv-ok').onclick = async () => {
    if (!saveCtx) return; const { t, opt } = saveCtx, author = $('sv-author').value.trim().slice(0, 8); BB.Store.setAuthor(author);
    $('sv-ok').disabled = true; $('sv-ok').textContent = T('sv_saving'); $('sv-err').textContent = '';
    try {
      const id = await BB.Store.save(t, { author, pub: $('sv-pub').checked, par: t.par });
      t.id = id; t.author = author || T('noname'); delete t.par;
      if (opt.raku && $('sv-mine').checked) { const old = myTop; myTop = BB.cloneTop(t); if (old) BB.freeTop(old); BB.Pool.add(myTop, 'self'); }
      if (myTop && (myTop === t || myTop.id === id)) BB.saveTop(myTop);
      if (mode === 'title') refreshTitle();
      $('sv-id').textContent = id; $('sv-form').hidden = true; $('sv-done').hidden = false;
    } catch (e) { $('sv-err').textContent = (e && e.message) || T('sv_fail'); }
    $('sv-ok').disabled = false; $('sv-ok').textContent = T('sv_ok');
  };
  $('sv-copy').onclick = () => copyText($('sv-id').textContent, $('sv-copy'));
  $('btn-find').onclick = () => {
    $('find-err').textContent = ''; $('in-id').value = ''; const L = BB.Store.mine();
    $('my-ids').innerHTML = L.length ? '<p>' + T('my_ids') + '</p>' + L.slice(0, 8).map(e => `<button data-id="${e.id}"><span>${esc(e.name || T('noname_top'))}${e.pub ? T('pub_mark') : ''}</span><b>${e.id}</b></button>`).join('') : '';
    $('ov-find').classList.add('show'); markGone();
  };
  async function markGone() { for (const b of $('my-ids').querySelectorAll('button[data-id]')) { if ((await BB.Store.exists(b.dataset.id)) === false) { b.classList.add('gone'); b.querySelector('span').insertAdjacentHTML('beforeend', '<em>' + T('deleted') + '</em>'); } } }
  $('my-ids').onclick = e => { const b = e.target.closest('button[data-id]'); if (b) { $('in-id').value = b.dataset.id; findGo(); } };
  $('btn-find-close').onclick = () => $('ov-find').classList.remove('show');
  $('in-id').addEventListener('input', () => { const v = BB.cleanId($('in-id').value); if (v !== $('in-id').value) $('in-id').value = v; });
  $('in-id').addEventListener('keydown', e => { if (e.key === 'Enter') findGo(); });
  $('btn-find-go').onclick = findGo;
  async function findGo() {
    const id = BB.cleanId($('in-id').value);
    if (!BB.isId(id)) { $('find-err').textContent = T('id_bad'); return; }
    $('find-err').textContent = ''; $('btn-find-go').disabled = true;
    try { openChar(await BB.Store.load(id)); } catch (e) { $('find-err').textContent = e.message || T('not_found'); }
    $('btn-find-go').disabled = false;
  }
  let cur = null;
  function openChar(r) {
    if (cur && cur.ch !== myTop) BB.freeTop(cur.ch);
    cur = r; const m = r.meta; BB.drawTopIcon(r.ch, $('cd-prev'));
    $('cd-name').textContent = m.name || T('noname_top'); $('cd-meta').textContent = T('cd_meta', { id: m.id, a: m.author || T('noname'), n: m.uses }) + '\n' + T('cd_meta2', { ax: T('ax_' + r.ch.axis), spin: T(r.ch.spin === 'L' ? 'spin_l0' : 'spin_r0'), sk: T('sk_' + r.ch.skill) });
    $('cd-err').textContent = ''; $('cd-keep').disabled = false; $('cd-keep').textContent = T('cd_keep');
    const own = BB.Store.owns(m.id); $('cd-report').hidden = !m.pub || own; $('cd-report').disabled = BB.Store.reported(m.id); $('cd-report').textContent = BB.Store.reported(m.id) ? T('reported') : T('report'); $('cd-del').hidden = !own; $('cd-del').textContent = T('del_top');
    $('ov-char').classList.add('show');
  }
  function closeChar(keep) { $('ov-char').classList.remove('show'); if (!keep && cur && cur.ch !== myTop) BB.freeTop(cur.ch); cur = null; }
  $('cd-close').onclick = () => closeChar();
  $('cd-use').onclick = () => { if (!cur) return; const old = myTop; myTop = cur.ch; if (old && old !== myTop) BB.freeTop(old); BB.saveTop(myTop); BB.Store.touch(cur.meta.id); closeChar(true); for (const o of ['ov-find', 'ov-gal']) $(o).classList.remove('show'); refreshTitle(); BB.toast(T('use_done', { name: myTop.name || T('noname_top') })); };
  $('cd-lv').onclick = e => { const b = e.target.closest('button[data-level]'); if (!b || !cur) return; if (!myTop) { $('cd-err').textContent = T('cd_need'); return; } level = b.dataset.level; const t = cur.ch; BB.Store.touch(cur.meta.id); closeChar(true); for (const o of ['ov-find', 'ov-gal']) $(o).classList.remove('show'); startCpu(t); };
  $('cd-keep').onclick = () => { if (!cur) return; const ok = BB.Pool.add(cur.ch, 'rival'); $('cd-keep').disabled = true; $('cd-keep').textContent = ok ? T('keep_done2') : T('save_fail'); };
  $('cd-copy').onclick = () => cur && copyText(cur.meta.id, $('cd-copy'));
  $('cd-report').onclick = async () => { const b = $('cd-report'); if (!cur) return; if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = T('report_sure'); setTimeout(() => { delete b.dataset.sure; if (!b.disabled) b.textContent = T('report'); }, 3000); return; } delete b.dataset.sure; try { await BB.Store.report(cur.meta.id); b.disabled = true; b.textContent = T('report_done'); } catch (e) { $('cd-err').textContent = T('report_fail'); } };
  $('cd-del').onclick = async () => { const b = $('cd-del'); if (!cur) return; if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = T('del_sure'); setTimeout(() => { delete b.dataset.sure; b.textContent = T('del_top'); }, 3000); return; } delete b.dataset.sure; try { const id = cur.meta.id; await BB.Store.remove(id); if (myTop && myTop.id === id) { myTop.id = ''; BB.saveTop(myTop); } closeChar(); $('ov-find').classList.remove('show'); refreshTitle(); BB.toast(T('del_done')); if ($('ov-gal').classList.contains('show')) galLoad(galSort); } catch (e) { $('cd-err').textContent = e.message || T('del_fail'); } };
  let galSort = 't', galMore = null;
  $('btn-gal').onclick = () => { $('ov-gal').classList.add('show'); galLoad(galSort); };
  $('gal-close').onclick = () => $('ov-gal').classList.remove('show');
  $('gal-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('gal-tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); galLoad(b.dataset.sort); };
  $('gal-more').onclick = () => galLoad(galSort, true);
  async function galLoad(sort, more) {
    galSort = sort; if (!more) { $('gal-grid').innerHTML = ''; galMore = null; }
    $('gal-msg').textContent = T('loading'); $('gal-more').hidden = true;
    try {
      const r = await BB.Store.list(sort, more ? galMore : null); if (galSort !== sort) return; galMore = r.more;
      $('gal-grid').insertAdjacentHTML('beforeend', r.items.map(e => `<button data-id="${e.id}"><img alt="" src="${/^data:image\/(jpeg|png|webp);base64,/.test(e.th) ? e.th : ''}"><b>${esc(e.n || T('noname_top'))}</b><small>${T('by', { a: esc(e.a || T('noname')) })}</small><small>${T('uses', { n: e.uses })}</small></button>`).join(''));
      $('gal-msg').textContent = $('gal-grid').children.length ? '' : T('gal_empty'); $('gal-more').hidden = !galMore;
    } catch (e) { $('gal-msg').textContent = e.message || T('load_fail'); }
  }
  $('gal-grid').onclick = async e => { const b = e.target.closest('button[data-id]'); if (!b || b.disabled) return; b.disabled = true; try { openChar(await BB.Store.load(b.dataset.id)); } catch (er) { $('gal-msg').textContent = er.message || T('load_fail'); } b.disabled = false; };

  try { const rc = new URLSearchParams(location.search).get('room'); if (rc) setTimeout(() => openOnline(BB.cleanCode(rc)), 300); } catch (e) {}
  BB._debug = { get M() { return M; }, get V() { return V; }, get mode() { return mode; }, get mine() { return mine; }, get room() { return room; }, get myTop() { return myTop; }, set myTop(t) { myTop = t; refreshTitle(); }, startCpu: (lv, t) => { level = lv || level; return startCpu(t); }, R, makeTop, get tops() { return tops; } };
})();
