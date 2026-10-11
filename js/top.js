// =============================================
//  バトベイ  コマのデータ
//  絵は 480×480 の円の中に描く（半径 R_PX）。真ん中には金属の軸がつく（HUB_PX）
//  描いた形 → 当たり判定（角度ごとの半径）、ポイント配分 → 強さ
// =============================================
window.BB = window.BB || {};
BB.rand = BB.rand || (() => Math.random());   // 試合の計算で使う乱数（動画づくりで固定できるように）
(function () {
  const D = 480, C = D / 2, R_PX = 220, HUB_PX = 26;
  const NA = 128;                                  // 当たり判定の角度の数
  const TOP_R = 0.2;                                // コマのいちばん外の半径（スタジアムの半径＝1）
  const BUDGET = 10, PMAX = 5;                      // ポイント：合計10、ひとつ5まで
  const MIN_FILL = 0.33;                           // 最低ぬり：円の3分の1
  const COLORS = ['#1f2430', '#ffffff', '#ef4444', '#f97316', '#f5b800', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
  const AXES = { atk: '攻撃型', bal: 'バランス型', sta: '持久型' };
  const AXIS_TIP = { atk: 'よく動き回って、ぶつかりに行く', bal: 'ほどよく動いて、ほどよく粘る', sta: '真ん中でじっと、長く回る' };
  const SKILLS = {
    rush: ['突進', '相手にまっすぐ体当たり'], wall: ['鉄壁', '数秒間、重くなる'], heal: ['回復', '回転が少し戻る'], drain: ['吸収', '当たるたびに相手の回転をうばう'],
    grav: ['重力', '相手の動きを遅くする'], loose: ['ゆるめ', '相手のロックを大きくゆるめる'], boost: ['加速', '数秒間、スピードが上がる'], refl: ['反射', '次の一撃をはね返す']
  };
  BB.T = { D, C, R_PX, HUB_PX, NA, TOP_R, BUDGET, PMAX, MIN_FILL, COLORS, AXES, AXIS_TIP, SKILLS };

  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = D; c.getContext('2d', { willReadFrequently: true }); return c; };
  BB.newTop = () => ({ layer: mk(), name: '', author: '', id: '', pts: { atk: 3, def: 2, sta: 3, wgt: 2 }, axis: 'bal', lock: 0.5, spin: 'R', skill: 'rush' });
  BB.cloneTop = t => { const n = BB.newTop(); n.layer.getContext('2d').drawImage(t.layer, 0, 0); n.name = t.name; n.author = t.author || ''; n.id = t.id || ''; n.pts = Object.assign({}, t.pts); n.axis = t.axis; n.lock = t.lock; n.spin = t.spin; n.skill = t.skill; return n; };
  BB.freeTop = t => { if (t && t.layer) { t.layer.width = t.layer.height = 1; t.layer = null; } };

  // ---------- 形を調べる ----------
  // 96×96 にちぢめて、真ん中（軸）とつながったかたまりだけを見る
  const G = 96, K = D / G;
  BB.analyze = function (t) {
    const s = document.createElement('canvas'); s.width = s.height = G;
    const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(t.layer, 0, 0, G, G);
    const d = x.getImageData(0, 0, G, G).data; s.width = 1;
    const filled = new Uint8Array(G * G), cx = C / K, rr = R_PX / K, hub = HUB_PX / K;
    let inCircle = 0;
    for (let y = 0; y < G; y++) for (let i = 0; i < G; i++) {
      const dx = i + 0.5 - cx, dy = y + 0.5 - cx, r = Math.hypot(dx, dy);
      if (r > rr) continue; inCircle++;
      if (r <= hub || d[(y * G + i) * 4 + 3] > 90) filled[y * G + i] = 1;
    }
    // 真ん中からつながっている所
    const conn = new Uint8Array(G * G), st = [(Math.floor(cx) * G + Math.floor(cx))]; conn[st[0]] = 1;
    while (st.length) { const q = st.pop(), qx = q % G, qy = (q - qx) / G; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = qx + ax, ny = qy + ay; if (nx < 0 || ny < 0 || nx >= G || ny >= G) continue; const n = ny * G + nx; if (!conn[n] && filled[n]) { conn[n] = 1; st.push(n); } } }
    let area = 0, loose = 0, I = 0, hubA = 0;
    for (let k = 0; k < G * G; k++) {
      if (!filled[k]) continue;
      const i = k % G, y = (k - i) / G, r = Math.hypot(i + 0.5 - cx, y + 0.5 - cx);
      if (r <= hub) { hubA++; }
      if (conn[k]) { area++; I += r * r; } else loose++;
    }
    const drawnArea = area - hubA;
    // 角度ごとの、いちばん外の半径（つながった所だけ）
    const prof = new Float32Array(NA);
    for (let a = 0; a < NA; a++) {
      const th = a / NA * Math.PI * 2, ux = Math.cos(th), uy = Math.sin(th); let best = hub;
      for (let r = hub; r <= rr; r += 0.5) { const i = Math.floor(cx + ux * r), y = Math.floor(cx + uy * r); if (i < 0 || y < 0 || i >= G || y >= G) break; if (conn[y * G + i]) best = r; }
      prof[a] = best / rr;
    }
    // ならして、角ばりぐあい（とがり）を見る
    let mean = 0; for (const v of prof) mean += v; mean /= NA;
    let rough = 0, peak = 0; for (let a = 0; a < NA; a++) { const v = prof[a], p = prof[(a + NA - 1) % NA], n = prof[(a + 1) % NA]; rough += Math.abs(v - p); peak = Math.max(peak, v - (p + n) / 2); }
    const spike = Math.min(1, rough / NA * 9 + Math.max(0, (Math.max(...prof) - mean)) * 1.4);   // 0＝まんまる、1＝トゲトゲ
    const fillRatio = (drawnArea + hubA) / inCircle;
    return { prof: Array.from(prof, v => Math.round(v * 1000) / 1000), fill: fillRatio, loose: loose / inCircle, spike, mean, size: Math.max(...prof), inertia: area ? I / area / (rr * rr) : 0.1, ok: fillRatio >= MIN_FILL };
  };

  // ---------- 強さ ----------
  // 形で少し、ポイントで大きく決まる。見た目と配分がちぐはぐなら、形の効果は少しだけ弱まる
  // ポイント → 0〜1（はじめの数ポイントがよく効く。全部ふると1）
  const PC = v => (1 - Math.exp(-Math.max(0, Math.min(PMAX, v || 0)) / 2.6)) / (1 - Math.exp(-PMAX / 2.6));
  // 軸の型：どう動くか
  //   move：床をけって動く力  orbitR/orbitV：まわる半径と速さ  dash：ときどき相手へつっこむ（間かく・速さ）  life：ぶつからなければ回る秒数
  const AXP = {
    atk: { move: 4.2, orbitR: 0.62, orbitV: 1.85, dash: [0.5, 1.1], dashV: 2.6, fric: 0.12, life: 55 },
    bal: { move: 2.6, orbitR: 0.3, orbitV: 1.0, dash: [1.0, 1.9], dashV: 1.9, fric: 0.3, life: 52 },
    sta: { move: 1.0, orbitR: 0, orbitV: 0, dash: null, dashV: 0, fric: 0.9, life: 51 }
  };
  BB.AXP = AXP;
  BB.stats = function (t, a) {
    a = a || t.an || BB.analyze(t);
    const p = t.pts, n = PC;
    const shapeAtk = a.spike, shapeDef = 1 - a.spike;
    const mis = Math.max(0, shapeAtk - n(p.atk)) * 0.5;          // とげとげなのに攻撃ポイントが少ない → 形の攻撃は弱まる
    const atk = 0.78 * n(p.atk) + 0.22 * shapeAtk * (1 - mis);
    const def = 0.8 * n(p.def) + 0.2 * shapeDef;
    const sta = 0.82 * n(p.sta) + 0.18 * (1 - a.spike * 0.8);
    const wgt = 0.75 * n(p.wgt) + 0.25 * Math.min(1, a.fill * 1.3);
    const ax = AXP[t.axis] || AXP.bal, lock = t.lock || 0;
    return {
      atk, def, sta, wgt, ax,
      mass: 1 + 0.9 * wgt,                               // 重いほど、はじかれにくい
      radius: BB.T.TOP_R * Math.max(0.35, a.size),
      life: ax.life * (0.72 + 0.56 * sta) * (1 - 0.12 * a.spike * a.size) * (1.06 - 0.12 * lock),   // 回っていられる秒数
      lockMax: 0.9 + 1.4 * lock,                         // バーストまでの耐久（見えない）
      dir: t.spin === 'L' ? -1 : 1, skill: t.skill || 'rush'
    };
  };
  // 合計が多いとき（前の版の20ポイントのコマなど）：割合をたもって10にちぢめる
  BB.fitPts = P => {
    const ks = ['atk', 'def', 'sta', 'wgt'], sum = ks.reduce((s, k) => s + Math.max(0, +P[k] || 0), 0);
    if (sum <= BUDGET) return P;
    if (!(sum > 0)) { Object.assign(P, { atk: 3, def: 2, sta: 3, wgt: 2 }); return P; }
    const raw = ks.map(k => Math.max(0, +P[k] || 0) * BUDGET / sum), fl = raw.map(Math.floor);
    let left = BUDGET - fl.reduce((a, b) => a + b, 0);
    ks.map((k, i) => i).sort((a, b) => (raw[b] - fl[b]) - (raw[a] - fl[a])).forEach(i => { if (left > 0) { fl[i]++; left--; } });
    ks.forEach((k, i) => { P[k] = fl[i]; }); return P;
  };
  BB.ptsLeft = t => BUDGET - (t.pts.atk + t.pts.def + t.pts.sta + t.pts.wgt);

  // ---------- 保存 ----------
  BB.packTop = (t, scale = 1) => {
    let c = t.layer;
    if (scale !== 1) { const s = document.createElement('canvas'); s.width = s.height = Math.round(D * scale); s.getContext('2d').drawImage(c, 0, 0, s.width, s.height); c = s; }
    const img = c.toDataURL('image/png'); if (c !== t.layer) c.width = 1;
    return JSON.stringify({ v: 1, img, name: t.name || '', author: t.author || '', id: t.id || '', pts: t.pts, axis: t.axis, lock: Math.round((t.lock || 0) * 100) / 100, spin: t.spin, skill: t.skill });
  };
  BB.unpackTop = str => new Promise((res, rej) => {
    let o; try { o = typeof str === 'string' ? JSON.parse(str) : str; } catch (e) { return rej(e); }
    const t = BB.newTop();
    t.name = String(o.name || '').slice(0, 8); t.author = String(o.author || '').slice(0, 8); t.id = /^[A-Z0-9]{8}$/.test(o.id || '') ? o.id : '';
    const P = o.pts || {}; t.pts = { atk: +P.atk || 0, def: +P.def || 0, sta: +P.sta || 0, wgt: +P.wgt || 0 };
    // ポイントの合計が多すぎる（書きかえられた）ものは、ならす
    const sum = t.pts.atk + t.pts.def + t.pts.sta + t.pts.wgt;
    for (const k in t.pts) t.pts[k] = Math.max(0, Math.min(PMAX, Math.round(t.pts[k])));
    if (sum > BUDGET) BB.fitPts(t.pts);
    t.axis = AXES[o.axis] ? o.axis : 'bal'; t.lock = Math.max(0, Math.min(1, +o.lock || 0)); t.spin = o.spin === 'L' ? 'L' : 'R'; t.skill = SKILLS[o.skill] ? o.skill : 'rush';
    const im = new Image();
    im.onload = () => { t.layer.getContext('2d').drawImage(im, 0, 0, D, D); res(t); };
    im.onerror = () => res(t);
    if (o.img) im.src = o.img; else res(t);
  });
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } } };
  BB.saveTop = t => ls.set('bb_top', BB.packTop(t));
  BB.loadTop = () => { const s = ls.get('bb_top'); return s ? BB.unpackTop(s).catch(() => null) : Promise.resolve(null); };
  // ライバル帳（CPUの相手に出てくる）
  BB.Pool = {
    MAX: 8,
    list() { try { return JSON.parse(ls.get('bb_pool') || '[]'); } catch (e) { return []; } },
    add(t, from) {
      const L = this.list().filter(e => !(from === 'self' && e.from === 'self' && e.name === (t.name || '')));
      L.unshift({ from, name: t.name || '', s: BB.packTop(t, 0.5), t: Date.now() });
      while (L.length > this.MAX) L.pop();
      for (let n = L.length; n > 0; n--) if (ls.set('bb_pool', JSON.stringify(L.slice(0, n)))) return true;
      return false;
    }
  };

  // ---------- 見本のコマ（コードで描く）----------
  function paint(t, fn) { const x = t.layer.getContext('2d'); x.save(); x.translate(C, C); x.lineJoin = 'round'; x.lineCap = 'round'; fn(x); x.restore(); }
  const INK = '#1f2430';
  function star(x, n, r1, r2, rot = 0) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); }
  BB.samples = function (only) {
    const out = {};
    if (!only || only === 'easy') {           // まるい持久型
      const t = BB.newTop(); t.name = 'まるもち'; t.pts = { atk: 1, def: 3, sta: 5, wgt: 1 }; t.axis = 'sta'; t.lock = 0.4; t.skill = 'heal';
      paint(t, x => { x.fillStyle = '#7dd3fc'; x.strokeStyle = INK; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 175, 0, 7); x.fill(); x.stroke();
        x.fillStyle = '#e0f2fe'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.beginPath(); x.arc(Math.cos(a) * 112, Math.sin(a) * 112, 34, 0, 7); x.fill(); x.stroke(); } });
      out.easy = t;
    }
    if (!only || only === 'normal') {         // 三つ羽のバランス型
      const t = BB.newTop(); t.name = 'ミツバ'; t.pts = { atk: 3, def: 2, sta: 3, wgt: 2 }; t.axis = 'bal'; t.lock = 0.55; t.skill = 'loose'; t.spin = 'R';
      paint(t, x => { x.fillStyle = '#22c55e'; x.strokeStyle = INK; x.lineWidth = 8;
        for (let i = 0; i < 3; i++) { x.save(); x.rotate(i * Math.PI * 2 / 3); x.beginPath(); x.moveTo(-40, -30); x.quadraticCurveTo(80, -190, 195, -30); x.quadraticCurveTo(120, 40, 30, 40); x.closePath(); x.fill(); x.stroke(); x.restore(); }
        x.fillStyle = '#f5b800'; x.beginPath(); x.arc(0, 0, 80, 0, 7); x.fill(); x.stroke(); });
      out.normal = t;
    }
    if (!only || only === 'hard') {           // とげとげ攻撃型
      const t = BB.newTop(); t.name = 'ギザリュウ'; t.pts = { atk: 5, def: 1, sta: 1, wgt: 3 }; t.axis = 'atk'; t.lock = 0.7; t.skill = 'rush'; t.spin = 'R';
      paint(t, x => { x.fillStyle = '#ef4444'; x.strokeStyle = INK; x.lineWidth = 8; star(x, 6, 205, 120, 0.2); x.fill(); x.stroke();
        x.fillStyle = '#1f2430'; star(x, 6, 120, 70, 0.2 + Math.PI / 6); x.fill(); x.fillStyle = '#f97316'; x.beginPath(); x.arc(0, 0, 58, 0, 7); x.fill(); x.stroke(); });
      out.hard = t;
    }
    return out;
  };
})();
