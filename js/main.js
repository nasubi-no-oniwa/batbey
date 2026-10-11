// =============================================
//  バトベイ  画面と操作
// =============================================
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
  BB.toast = t => { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(BB.toast.tm); BB.toast.tm = setTimeout(() => el.classList.remove('show'), 1900); };
  let room = null;
  BB.now = () => (room ? room.now() : Date.now());
  const SK = BB.T.SKILLS;

  // ---------- 音（すべて合成） ----------
  let ac = null, bus = null, nbuf = null;
  const A = () => {
    try {
      if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); const c = ac.createDynamicsCompressor(); c.threshold.value = -16; c.knee.value = 8; c.ratio.value = 5; c.attack.value = 0.002; c.release.value = 0.15; c.connect(ac.destination); bus = c;
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
    tap: () => tone(1500 + Math.random() * 300, 0.04, 'triangle', 0.025)
  };
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
  const QN = { auto: 'おまかせ', hi: 'きれい', lo: 'かるい' };
  $('q-name').textContent = QN[R.quality] || 'おまかせ';
  $('btn-q').onclick = () => { const order = ['auto', 'hi', 'lo'], q = order[(order.indexOf(R.quality) + 1) % 3]; R.setQuality(q); $('q-name').textContent = QN[q]; BB.toast('画質：' + QN[q] + '（切りかえます）'); setTimeout(() => location.reload(), 700); };

  // ---------- 自分のコマ ----------
  let myTop = null, level = 'normal';
  function refreshTitle() {
    BB.drawTopIcon(myTop, $('t-prev'));
    $('t-name').textContent = myTop ? (myTop.name || 'なまえなし') : 'まだコマがありません';
    $('btn-make').textContent = myTop ? 'コマをなおす' : 'コマをつくる';
    $('t-id').innerHTML = myTop && myTop.id ? 'ID：' + myTop.id + '<button id="t-id-copy">コピー</button>' : '';
    const cb = $('t-id-copy'); if (cb) cb.onclick = () => copyText(myTop.id, cb);
    if (myTop && myTop.id) checkMyId(myTop.id);
    attract();
  }
  async function copyText(t, b) { try { await navigator.clipboard.writeText(t); if (b) { const o = b.textContent; b.textContent = 'コピーしました'; setTimeout(() => { b.textContent = o; }, 1500); } } catch (e) { BB.toast('ID：' + t); } }
  const idChecked = {};
  async function checkMyId(id) {
    if (!(id in idChecked)) idChecked[id] = await BB.Store.exists(id);
    if (idChecked[id] !== false || !myTop || myTop.id !== id) return;
    const msg = await BB.Store.goneMsg(id).catch(() => '');
    $('t-id').innerHTML = '<s>ID：' + id + '</s><br><span class="gone">' + esc(msg.replace(/（.*）/, '')) + '</span><button id="t-id-new">もう一度IDをもらう</button>';
    $('t-id-new').onclick = () => { myTop.id = ''; BB.saveTop(myTop); openSave(myTop, { done: refreshTitle }); };
  }
  BB.loadTop().then(t => { myTop = t; refreshTitle(); });

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
    if (!myTop) { BB.toast('まずはコマをつくろう！'); makeTop(() => startCpu()); return; }
    startCpu();
  }));

  // ---------- 試合 ----------
  // V：画面に出す試合のようす（CPU戦・0番の人は M から、1番の人・観戦は届いたようすから）
  let mode = 'title', mine = 0, M = null, V = null, cpu = null, cpuPlan = null, tops = [null, null], ans = [null, null], names = ['あなた', 'CPU'], lastEv = 0, sendT = 0;
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
    if (!s && k >= 2) { try { s = await BB.unpackTop(pool[k - 2].s); s.name = s.name || 'ライバル'; } catch (e) {} }
    if (!s) { const key = k === 1 ? ['easy', 'normal', 'hard'][Math.floor(BB.rand() * 3)] : level; s = BB.samples(key)[key]; }
    setTops([myTop, s], [myTop.name || 'あなた', (s.name || 'ななし') + '（' + { easy: 'よわい', normal: 'ふつう', hard: 'つよい' }[level] + '）']);
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
    $('vote-list').innerHTML = BB.MATCH.KEYS.map(k => `<button data-k="${k}"><canvas width="96" height="96"></canvas><b>${BB.STAGES[k].name}</b><small>${BB.STAGES[k].sub}</small><span class="votes"></span></button>`).join('');
    $('vote-list').querySelectorAll('button').forEach(b => stageIcon(b.querySelector('canvas'), b.dataset.k));
    $('btn-vote').disabled = true; $('btn-vote').hidden = mode === 'watch'; $('vote-msg').textContent = mode === 'watch' ? 'ふたりが投票しています…' : '';
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
    $('btn-vote').disabled = true; $('vote-msg').textContent = 'あいての投票を待っています…';
  };
  function showStagePick(e) {
    const t = e.tally || {};
    $('vote-list').querySelectorAll('button').forEach(b => { b.querySelector('.votes').textContent = '★'.repeat(t[b.dataset.k] || 0); b.classList.toggle('win', b.dataset.k === e.stage); });
    $('vote-msg').textContent = BB.STAGES[e.stage].name + (e.tie ? '（同じ票だったので、ランダム）' : '') + 'で戦います！';
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
    const msg = t === 'early' ? ['フライング！', 'red'] : t === 'perfect' ? ['ナイス！', 'cyan'] : t === 'late' ? ['おそい…', 'red'] : p > 1.02 ? ['強すぎ！ぐらつく', 'red'] : p < 0.5 ? ['よわい…', ''] : ['いい感じ', 'cyan'];
    big(msg[0], msg[1], 900);
  }
  function useSkill() { if (!V || V.ph !== 'battle' || mode === 'watch') return; if (M) M.skill(mine); else room && room.sendCmd({ k: 'skill' }); }
  $('b-skill').onclick = useSkill;

  // 大きい文字
  let bigTm = 0;
  function big(t, cls, ms) { const el = $('big'); el.innerHTML = t; el.className = 'big show ' + (cls || ''); clearTimeout(bigTm); if (ms) bigTm = setTimeout(() => el.classList.remove('show'), ms); }
  // 起きたことの表示と音
  const WHY = { burst: 'バースト！', out: '場外！', stop: 'スピンフィニッシュ', draw: 'ひきわけ' };
  function handle(e) {
    const side = i => (i === mine ? 'cyan' : 'red'), nm = i => names[i] || '？';
    if (e.type === 'stage') showStagePick(e);
    else if (e.type === 'round') { big('ROUND ' + e.round, '', 1300); $('h-round').textContent = 'ROUND ' + e.round; released = false; power = 0; aim = 0; holdT = null; V.cn = 0; hold.classList.remove('on'); R.clearFx(); for (const i of [0, 1]) { if (R.tops[i]) { R.buildTop(i, tops[i], ans[i]); } } humStop(); setFinal(false); comboShow(0); }
    else if (e.type === 'count') { }
    else if (e.type === 'go') { big('まわせ！', '', 800); snd.go(); }
    else if (e.type === 'land') { snd.land(); shake = Math.max(shake, 0.14); }
    else if (e.type === 'launch') { }
    else if (e.type === 'hit') {
      const tier = e.tier || 1, y = BB.surfY(V.st || 'std', Math.hypot(e.x, e.y)) + 0.07;
      R.spark(e.x, y, e.y, e.s, tier >= 3, tier); snd.hit(tier);
      shake = Math.max(shake, [0, 0.07, 0.18, 0.38, 0.7][tier]);
      if (tier >= 3) { punch = { x: e.x, z: e.y, t: tier >= 4 ? 0.55 : 0.32, T: tier >= 4 ? 0.55 : 0.32, k: tier >= 4 ? 1 : 0.6 }; freeze = Math.max(freeze, tier >= 4 ? 0.11 : 0.06); }
      if (tier >= 4) { flash(); buzz(70); slow = Math.max(slow, 0.75); } else buzz(tier === 3 ? 30 : tier === 2 ? 12 : 5);
      if (tier >= 2) popAt(e.x, y + 0.12, e.y, ['', '', 'ガキッ！', 'ガキーン！', 'ドゴォッ！'][tier], 't' + tier);
      comboShow(e.combo || 0);
    }
    else if (e.type === 'grind') { const y = BB.surfY(V.st || 'std', Math.hypot(e.x, e.y)) + 0.06; R.grind(e.x, y, e.y); snd.grind(); shake = Math.max(shake, 0.05); if (Math.random() < 0.18) popAt(e.x, y + 0.1, e.y, 'ギャリギャリ', 'grd'); }
    else if (e.type === 'rail') { snd.rail(); R.railGlow = 1; }
    else if (e.type === 'wall') { snd.wall(e.s || 1); shake = Math.max(shake, 0.1); }
    else if (e.type === 'final') { setFinal(true); snd.final(); }
    else if (e.type === 'skill') { snd.skill(); big(SK[e.skill][0] + '！<small>' + esc(nm(e.i)) + '</small>', side(e.i), 1100); }
    else if (e.type === 'refl') big('反射！', side(e.i), 900);
    else if (e.type === 'burst') { snd.burst(); shake = 0.9; slow = 1.2; freeze = 0.12; flash(); buzz(140); setFinal(false); }
    else if (e.type === 'out') { snd.out(); shake = 0.5; slow = 0.9; freeze = 0.1; setFinal(false); }
    else if (e.type === 'stop') { snd.stop(); setFinal(false); }
    else if (e.type === 'roundEnd') {
      humStop(); setFinal(false); comboShow(0);
      const w = e.winner, me = w === mine;
      big(WHY[e.why] + (w >= 0 ? '<small>' + esc(nm(w)) + ' ＋' + e.pts + '点</small>' : ''), w < 0 ? '' : mode === 'watch' ? 'cyan' : me ? 'cyan' : 'red', 2200);
      if (w >= 0 && mode !== 'watch') (me ? snd.win : snd.lose)();
    }
    else if (e.type === 'over') finish(e.winner, e.score);
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
    el.innerHTML = n + '<small>連打！</small>'; el.classList.add('show'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    comboTm = setTimeout(() => el.classList.remove('show'), 1100);
  }
  // スピン勝負（ふたりとも回転が3割を切った）
  const spinLbl = [0, 1].map(() => { const d = document.createElement('div'); d.className = 'spin-lbl'; d.hidden = true; $('fx-layer').appendChild(d); return d; });
  function setFinal(on) {
    finalOn = on; $('vig').classList.toggle('on', on); $('final-tag').classList.toggle('on', on); heartT = 0;
    if (!on) spinLbl.forEach(d => { d.hidden = true; });
  }
  // 応援（バトル中に画面をタップ）
  function tapCheer(e) {
    if (!V || V.ph !== 'battle' || mode === 'watch') return;
    const me = V.battle && V.battle.f[mine]; if (!me || me.state !== 'spin' || me.used) return;
    const n = performance.now(); tapTimes = tapTimes.filter(t => n - t < 1000); if (tapTimes.length >= 8) return; tapTimes.push(n);
    const r = document.createElement('div'); r.className = 'tap-ring'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; $('fx-layer').appendChild(r); setTimeout(() => r.remove(), 460);
    if (me.gauge < 1) { const p = document.createElement('div'); p.className = 'tap-plus'; p.textContent = '+応援'; p.style.left = e.clientX + 'px'; p.style.top = (e.clientY - 30) + 'px'; $('fx-layer').appendChild(p); setTimeout(() => p.remove(), 620); }
    snd.tap(); buzz(4);
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
    if (R.quality === 'auto' && mode !== 'title') { fpsN++; fpsT += rdt; if (fpsN === 150) { if (fpsT / fpsN > 0.045) { R.setQuality('lo'); BB.toast('動きが重いので、次から画質を「かるい」にします'); } } }
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
    $('tap-hint').hidden = sb.hidden || !me || me.used || me.gauge >= 1 || me.state !== 'spin';
    if (!sb.hidden) { const gq = me.used ? 0 : me.gauge; $('sk-ring').style.strokeDashoffset = 276.5 * (1 - gq); sb.classList.toggle('ready', !me.used && gq >= 1); sb.classList.toggle('used', !!me.used); $('sk-name').textContent = SK[tops[mine].skill][0]; }
    // コマ
    const t = now / 1000;
    if (V.battle) {
      const B = V.battle;
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
    V.ph = p.ph; V.ts = p.ts; V.until = now + (p.u || 0); V.goAtS = p.g != null ? BB.now() + p.g : null; V.sc = p.sc; V.rd = p.rd; V.v = p.v; V.r = p.r;
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
      $('res-title').textContent = watch ? (names[w] || '？') + 'のかち！' : me ? 'かち！' : 'まけ…'; $('res-title').className = me || watch ? 'win' : 'lose';
      $('res-sub').textContent = `${names[0]} ${score[0]} － ${score[1]} ${names[1]}`;
      for (const i of [0, 1]) { BB.drawTopIcon(tops[i], $('r' + i)); $('rn' + i).textContent = names[i] || '？'; }
      $('btn-keep').disabled = false; $('btn-keep').textContent = watch ? '2つともライバル帳に入れる' : '相手のコマをライバル帳に入れる';
      $('btn-again').hidden = watch; $('btn-again').disabled = false; $('again-msg').textContent = watch ? 'つぎの試合が始まると、自動で見られます' : '';
      $('btn-reedit').hidden = mode !== 'cpu'; $('btn-savedraw').hidden = !(rakuTop && mode === 'online'); $('btn-savedraw').disabled = false;
      $('ov-result').classList.add('show');
      me || watch ? snd.win() : snd.lose();
    }, 1800);
  }
  $('btn-keep').onclick = () => {
    let ok = BB.Pool.add(tops[1 - mine], 'rival'); if (mode === 'watch') ok = BB.Pool.add(tops[mine], 'rival') && ok;
    $('btn-keep').disabled = true; $('btn-keep').textContent = ok ? 'ライバル帳に入れました（CPUの相手に出てきます）' : '保存できませんでした';
  };
  $('btn-again').onclick = () => {
    if (mode === 'cpu') { $('ov-result').classList.remove('show'); return startCpu(); }
    if (room) { room.rematch(); $('btn-again').disabled = true; $('again-msg').textContent = 'あいての「もう一回」を待っています…'; }
  };
  $('btn-reedit').onclick = () => { $('ov-result').classList.remove('show'); endBattle(); makeTop(() => startCpu()); };
  function endBattle() { M = null; V = null; cpu = null; cpuPlan = null; humStop(); R.clearFx(); arrow.visible = false; for (const i of [0, 1]) R.dropTop(i); }
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
  $('btn-copy').onclick = async () => { const url = location.origin + location.pathname + '?room=' + encodeURIComponent(room ? room.code : ''); try { await navigator.clipboard.writeText(url); $('btn-copy').textContent = 'コピーしました！'; } catch (e) { prompt('このリンクを送ってください', url); } setTimeout(() => { $('btn-copy').textContent = 'さそうリンクをコピー'; }, 2000); };
  $('btn-join').onclick = joinOnline;
  const NOTOP = 'この部屋は「いまのコマで」対戦です。先にコマをつくるか、IDでよんでね';
  async function joinOnline() {
    const code = BB.cleanCode($('in-code').value), name = $('in-name').value.trim().slice(0, 8) || 'ななし';
    if (!code) { $('online-err').textContent = 'あいことばを入れてください'; return; }
    try { localStorage.setItem('bb-name', name); } catch (e) {}
    $('online-err').textContent = ''; $('btn-join').disabled = true; $('btn-join').textContent = 'つないでいます…';
    try {
      const db = await BB.getDb(); leaveRoom();
      const r = new BB.Room(db, code, name, myTop ? BB.packTop(myTop, 0.6) : null, {
        onPeople: p => { if (room !== r) return; if (!r.watching && !p.names[1 - r.slot]) $('wait-msg').textContent = 'あいてを待っています…'; },
        onMode: m => { if (room !== r) return; showMode(r); if (m === 'normal' && !myTop && !r.watching) { leaveRoom(); lobby(false); $('online-err').textContent = NOTOP; } },
        onWatchers: n => { if (room !== r) return; $('watchers').hidden = !n; $('watchers').textContent = '👀 ' + n + '人'; },
        onDraw: g => { if (room === r) startDraw(g); },
        onStart: g => { if (room === r) onlineStart(g); },
        onState: s => { if (room === r) onState(s); },
        onCmd: c => { if (room !== r || !M || !c) return; if (c.k === 'vote') M.vote(1, c.v); else if (c.k === 'aim') M.setAim(1, c.a); else if (c.k === 'rel') M.release(1, { power: c.p, at: c.at }); else if (c.k === 'skill') M.skill(1); else if (c.k === 'ch') M.cheer(1, +c.n || 0, BB.now()); },
        onCheer: v => { if (room === r) cheerPop(v); },
        onLeft: () => { if (room !== r) return; if (V && V.ph !== 'over') { BB.toast('あいてが退室しました'); toTitle(); } else { $('btn-again').hidden = true; $('again-msg').textContent = 'あいてが退室しました'; } }
      }, want);
      room = r;
      const res = await r.join();
      if (!res.watching && res.mode === 'normal' && !myTop) { leaveRoom(); throw new Error(NOTOP); }
      lobby(true); showMode(r); $('wait-msg').textContent = res.watching ? '観戦で入りました。つぎの試合を待っています…' : 'あいてを待っています…';
    } catch (e) { $('online-err').textContent = e.message || 'つながりませんでした'; leaveRoom(); }
    $('btn-join').disabled = false; $('btn-join').textContent = 'はいる';
  }
  function showMode(r) { $('wait-code').textContent = r.code + '（' + (r.mode === 'raku' ? 'らくがきバトル' : 'いまのコマで') + '）'; }
  // らくがきバトル：60秒で描く → 20秒で設定
  function startDraw(g) {
    for (const o of ['ov-online', 'ov-result', 'ov-reveal', 'ov-vote']) $(o).classList.remove('show');
    endBattle(); stopAttract(); rakuTop = null;
    if (g.slot < 0) { mode = 'watch'; drawWait(g.setupEnd, 'ふたりがコマを描いています', '描いて、設定したら「せーの」で発表！', true); return; }
    mode = 'online'; BB.toast('60秒で描こう！ そのあと20秒で設定');
    show('editor');
    const submit = t => { rakuTop = t; t.id = ''; t.name = t.name || g.names[g.slot] || ''; if (room) room.submitDraw(BB.packTop(t, 0.6)); drawWait(g.setupEnd, 'できた！', 'あいてを待っています…', false); };
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
    $('rv-say').textContent = 'せーの…'; $('ov-reveal').classList.add('show'); snd.count();
    setTimeout(() => { rv.classList.add('open'); $('rv-say').textContent = 'ドン！'; snd.go(); }, 1300);
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
  $('btn-savedraw').onclick = () => { if (rakuTop) openSave(rakuTop, { raku: true, done: () => { $('btn-savedraw').disabled = true; $('btn-savedraw').textContent = '保存しました'; } }); };

  // ---------- ID ----------
  let saveCtx = null;
  function openSave(t, opt) {
    saveCtx = { t, opt: opt || {} }; BB.drawTopIcon(t, $('sv-prev'));
    $('sv-form').hidden = false; $('sv-done').hidden = true; $('sv-err').textContent = ''; $('sv-author').value = BB.Store.author(); $('sv-pub').checked = false;
    $('sv-mine-l').hidden = !saveCtx.opt.raku; $('sv-mine').checked = true; $('sv-skip').textContent = saveCtx.opt.raku ? '保存しない' : 'IDなしで使う';
    $('sv-title').textContent = saveCtx.opt.raku ? '描いたコマを保存' : 'コマにIDをつける'; $('ov-save').classList.add('show');
  }
  function closeSave() { $('ov-save').classList.remove('show'); const c = saveCtx; saveCtx = null; if (c && c.opt.done) c.opt.done(); }
  $('sv-skip').onclick = closeSave; $('sv-close').onclick = closeSave;
  $('sv-ok').onclick = async () => {
    if (!saveCtx) return; const { t, opt } = saveCtx, author = $('sv-author').value.trim().slice(0, 8); BB.Store.setAuthor(author);
    $('sv-ok').disabled = true; $('sv-ok').textContent = '保存しています…'; $('sv-err').textContent = '';
    try {
      const id = await BB.Store.save(t, { author, pub: $('sv-pub').checked, par: t.par });
      t.id = id; t.author = author || 'ななし'; delete t.par;
      if (opt.raku && $('sv-mine').checked) { const old = myTop; myTop = BB.cloneTop(t); if (old) BB.freeTop(old); BB.Pool.add(myTop, 'self'); }
      if (myTop && (myTop === t || myTop.id === id)) BB.saveTop(myTop);
      if (mode === 'title') refreshTitle();
      $('sv-id').textContent = id; $('sv-form').hidden = true; $('sv-done').hidden = false;
    } catch (e) { $('sv-err').textContent = (e && e.message) || '保存できませんでした。通信を確認してね'; }
    $('sv-ok').disabled = false; $('sv-ok').textContent = '保存してIDをもらう';
  };
  $('sv-copy').onclick = () => copyText($('sv-id').textContent, $('sv-copy'));
  $('btn-find').onclick = () => {
    $('find-err').textContent = ''; $('in-id').value = ''; const L = BB.Store.mine();
    $('my-ids').innerHTML = L.length ? '<p>このスマホでつくったコマ</p>' + L.slice(0, 8).map(e => `<button data-id="${e.id}"><span>${esc(e.name || 'なまえなし')}${e.pub ? '（公開）' : ''}</span><b>${e.id}</b></button>`).join('') : '';
    $('ov-find').classList.add('show'); markGone();
  };
  async function markGone() { for (const b of $('my-ids').querySelectorAll('button[data-id]')) { if ((await BB.Store.exists(b.dataset.id)) === false) { b.classList.add('gone'); b.querySelector('span').insertAdjacentHTML('beforeend', '<em>（削除ずみ）</em>'); } } }
  $('my-ids').onclick = e => { const b = e.target.closest('button[data-id]'); if (b) { $('in-id').value = b.dataset.id; findGo(); } };
  $('btn-find-close').onclick = () => $('ov-find').classList.remove('show');
  $('in-id').addEventListener('input', () => { const v = BB.cleanId($('in-id').value); if (v !== $('in-id').value) $('in-id').value = v; });
  $('in-id').addEventListener('keydown', e => { if (e.key === 'Enter') findGo(); });
  $('btn-find-go').onclick = findGo;
  async function findGo() {
    const id = BB.cleanId($('in-id').value);
    if (!BB.isId(id)) { $('find-err').textContent = 'IDは英数字8文字です'; return; }
    $('find-err').textContent = ''; $('btn-find-go').disabled = true;
    try { openChar(await BB.Store.load(id)); } catch (e) { $('find-err').textContent = e.message || '見つかりませんでした'; }
    $('btn-find-go').disabled = false;
  }
  let cur = null;
  function openChar(r) {
    if (cur && cur.ch !== myTop) BB.freeTop(cur.ch);
    cur = r; const m = r.meta; BB.drawTopIcon(r.ch, $('cd-prev'));
    $('cd-name').textContent = m.name || 'なまえなし'; $('cd-meta').textContent = 'ID ' + m.id + '　作：' + (m.author || 'ななし') + '　使われた回数 ' + m.uses + '\n' + BB.T.AXES[r.ch.axis] + '・' + (r.ch.spin === 'L' ? '左回り' : '右回り') + '・スキル「' + SK[r.ch.skill][0] + '」';
    $('cd-err').textContent = ''; $('cd-keep').disabled = false; $('cd-keep').textContent = 'ライバル帳に入れる';
    const own = BB.Store.owns(m.id); $('cd-report').hidden = !m.pub || own; $('cd-report').disabled = BB.Store.reported(m.id); $('cd-report').textContent = BB.Store.reported(m.id) ? '通報ずみ' : '通報する'; $('cd-del').hidden = !own; $('cd-del').textContent = 'このコマを消す';
    $('ov-char').classList.add('show');
  }
  function closeChar(keep) { $('ov-char').classList.remove('show'); if (!keep && cur && cur.ch !== myTop) BB.freeTop(cur.ch); cur = null; }
  $('cd-close').onclick = () => closeChar();
  $('cd-use').onclick = () => { if (!cur) return; const old = myTop; myTop = cur.ch; if (old && old !== myTop) BB.freeTop(old); BB.saveTop(myTop); BB.Store.touch(cur.meta.id); closeChar(true); for (const o of ['ov-find', 'ov-gal']) $(o).classList.remove('show'); refreshTitle(); BB.toast('「' + (myTop.name || 'なまえなし') + '」を自分のコマにしました'); };
  $('cd-lv').onclick = e => { const b = e.target.closest('button[data-level]'); if (!b || !cur) return; if (!myTop) { $('cd-err').textContent = '先に自分のコマをつくるか、「自分のコマにする」をえらんでね'; return; } level = b.dataset.level; const t = cur.ch; BB.Store.touch(cur.meta.id); closeChar(true); for (const o of ['ov-find', 'ov-gal']) $(o).classList.remove('show'); startCpu(t); };
  $('cd-keep').onclick = () => { if (!cur) return; const ok = BB.Pool.add(cur.ch, 'rival'); $('cd-keep').disabled = true; $('cd-keep').textContent = ok ? 'ライバル帳に入れました' : '保存できませんでした'; };
  $('cd-copy').onclick = () => cur && copyText(cur.meta.id, $('cd-copy'));
  $('cd-report').onclick = async () => { const b = $('cd-report'); if (!cur) return; if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'もう一度押すと通報'; setTimeout(() => { delete b.dataset.sure; if (!b.disabled) b.textContent = '通報する'; }, 3000); return; } delete b.dataset.sure; try { await BB.Store.report(cur.meta.id); b.disabled = true; b.textContent = '通報しました'; } catch (e) { $('cd-err').textContent = '通報できませんでした'; } };
  $('cd-del').onclick = async () => { const b = $('cd-del'); if (!cur) return; if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'もう一度押すと消えます'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'このコマを消す'; }, 3000); return; } delete b.dataset.sure; try { const id = cur.meta.id; await BB.Store.remove(id); if (myTop && myTop.id === id) { myTop.id = ''; BB.saveTop(myTop); } closeChar(); $('ov-find').classList.remove('show'); refreshTitle(); BB.toast('コマを消しました'); if ($('ov-gal').classList.contains('show')) galLoad(galSort); } catch (e) { $('cd-err').textContent = e.message || '消せませんでした'; } };
  let galSort = 't', galMore = null;
  $('btn-gal').onclick = () => { $('ov-gal').classList.add('show'); galLoad(galSort); };
  $('gal-close').onclick = () => $('ov-gal').classList.remove('show');
  $('gal-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('gal-tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); galLoad(b.dataset.sort); };
  $('gal-more').onclick = () => galLoad(galSort, true);
  async function galLoad(sort, more) {
    galSort = sort; if (!more) { $('gal-grid').innerHTML = ''; galMore = null; }
    $('gal-msg').textContent = '読みこんでいます…'; $('gal-more').hidden = true;
    try {
      const r = await BB.Store.list(sort, more ? galMore : null); if (galSort !== sort) return; galMore = r.more;
      $('gal-grid').insertAdjacentHTML('beforeend', r.items.map(e => `<button data-id="${e.id}"><img alt="" src="${/^data:image\/(jpeg|png|webp);base64,/.test(e.th) ? e.th : ''}"><b>${esc(e.n || 'なまえなし')}</b><small>作：${esc(e.a || 'ななし')}</small><small>使われた ${e.uses}回</small></button>`).join(''));
      $('gal-msg').textContent = $('gal-grid').children.length ? '' : 'まだ公開されたコマがありません'; $('gal-more').hidden = !galMore;
    } catch (e) { $('gal-msg').textContent = e.message || '読みこめませんでした'; }
  }
  $('gal-grid').onclick = async e => { const b = e.target.closest('button[data-id]'); if (!b || b.disabled) return; b.disabled = true; try { openChar(await BB.Store.load(b.dataset.id)); } catch (er) { $('gal-msg').textContent = er.message || '読みこめませんでした'; } b.disabled = false; };

  try { const rc = new URLSearchParams(location.search).get('room'); if (rc) setTimeout(() => openOnline(BB.cleanCode(rc)), 300); } catch (e) {}
  BB._debug = { get M() { return M; }, get V() { return V; }, get mode() { return mode; }, get mine() { return mine; }, get room() { return room; }, get myTop() { return myTop; }, set myTop(t) { myTop = t; refreshTitle(); }, startCpu: (lv, t) => { level = lv || level; return startCpu(t); }, R, makeTop, get tops() { return tops; } };
})();
