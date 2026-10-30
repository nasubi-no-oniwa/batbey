// =============================================
//  バトベイ  コマを描く画面（絵私の描く画面がもと）
//  円の中だけに描ける。「対称」で回転対称に描ける（2・3・4・6）
// =============================================
(function () {
  const { D, C, R_PX, HUB_PX, COLORS, MIN_FILL } = BB.T;
  const $ = id => document.getElementById(id);
  const tr = (k, v) => (window.I18N ? I18N.t(k, v) : k);
  const STAMPS = ['star', 'heart', 'bolt', 'eyes', 'tsuri', 'kiba', 'flame', 'dot'].map(k => [k, 'st_' + k]);
  const SYMS = [1, 2, 3, 4, 6];
  const cv = $('ed-canvas'), g = cv.getContext('2d');
  let top = null, tool = 'pen', color = COLORS[2], size = 10, dpr = 1, sym = 1, shape = 'circle', shapeFill = true, stamp = 'star';
  let dirty = false, raku = null, undo = [], drawing = null, shapeDrag = null, onDone = null, an = null;
  let z = 1, z0 = 1, vx = 0, vy = 0, cw = 0, chh = 0;

  function layout() {
    const wrap = $('ed-wrap'); cw = wrap.clientWidth; chh = wrap.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(chh * dpr); cv.style.width = cw + 'px'; cv.style.height = chh + 'px';
    z0 = Math.min(cw, chh - 34) / D * 0.98; fit();
  }
  function fit() { z = z0; vx = (cw - D * z) / 2; vy = (chh - 30 - D * z) / 2; draw(); }
  function clampView() { z = Math.max(z0, Math.min(z0 * 5, z)); const m = 60; vx = Math.max(Math.min(0, cw - D * z) - m, Math.min(Math.max(0, cw - D * z) + m, vx)); vy = Math.max(Math.min(0, chh - D * z) - m, Math.min(Math.max(0, chh - D * z) + m, vy)); }
  function zoomAt(k, sx, sy) { const cx = (sx - vx) / z, cy = (sy - vy) / z; z *= k; clampView(); vx = sx - cx * z; vy = sy - cy * z; clampView(); draw(); }
  addEventListener('resize', () => { if (top && $('editor').classList.contains('active')) layout(); });

  // ---------- 表示 ----------
  function draw() {
    if (!top) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(dpr * z, 0, 0, dpr * z, dpr * vx, dpr * vy);
    // 台（金属の円盤）
    const gr = g.createRadialGradient(C - 60, C - 80, 20, C, C, R_PX + 10); gr.addColorStop(0, '#f6f8fb'); gr.addColorStop(1, '#c9ced8');
    g.fillStyle = gr; g.beginPath(); g.arc(C, C, R_PX, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1 / z;
    for (const r of [60, 120, 180]) { g.beginPath(); g.arc(C, C, r, 0, Math.PI * 2); g.stroke(); }
    if (sym > 1) { g.strokeStyle = 'rgba(51,199,255,.55)'; g.lineWidth = 1.5 / z; g.setLineDash([6 / z, 5 / z]); for (let k = 0; k < sym; k++) { const a = k / sym * Math.PI * 2 - Math.PI / 2; g.beginPath(); g.moveTo(C, C); g.lineTo(C + Math.cos(a) * R_PX, C + Math.sin(a) * R_PX); g.stroke(); } g.setLineDash([]); }
    g.drawImage(top.layer, 0, 0);
    // 真ん中とつながっていない所（コマにならない）は、うすく赤で知らせる
    if (an && an.loose > 0.004 && looseMask) g.drawImage(looseMask, 0, 0, D, D);
    // 軸
    const hg = g.createRadialGradient(C - 6, C - 8, 2, C, C, HUB_PX); hg.addColorStop(0, '#fff'); hg.addColorStop(1, '#8b93a3');
    g.fillStyle = hg; g.beginPath(); g.arc(C, C, HUB_PX, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4a5160'; g.lineWidth = 2 / z; g.stroke();
    g.strokeStyle = '#ff7a1a'; g.lineWidth = 3 / z; g.beginPath(); g.arc(C, C, R_PX, 0, Math.PI * 2); g.stroke();
    if (shapeDrag) { g.save(); symDo(g, x => { shapePath(x, shapeDrag.a, shapeDrag.b); if (shapeFill && shape !== 'line') { x.fillStyle = color; x.fill(); } x.strokeStyle = color; x.lineWidth = size; x.lineCap = 'round'; x.stroke(); }); g.restore(); }
    hud();
  }
  let looseMask = null;
  function analyze() {
    an = BB.analyze(top);
    const el = $('ed-fill'), pct = Math.round(an.fill * 100);
    el.style.width = Math.min(100, pct) + '%'; el.classList.toggle('ok', an.ok);
    $('ed-fill-t').textContent = tr('fill_pct', { p: pct }) + (an.ok ? tr('fill_ok') : tr('fill_need', { m: Math.round(MIN_FILL * 100) }));
    // つながっていない所の印
    if (an.loose > 0.004) {
      const s = document.createElement('canvas'); s.width = s.height = 96; const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(top.layer, 0, 0, 96, 96);
      const d = x.getImageData(0, 0, 96, 96), A = d.data, K = D / 96, cx = C / K, hub = HUB_PX / K, conn = new Uint8Array(96 * 96), st = [Math.floor(cx) * 96 + Math.floor(cx)]; conn[st[0]] = 1;
      const fill = q => { const i = q % 96, y = (q - i) / 96; return Math.hypot(i + 0.5 - cx, y + 0.5 - cx) <= hub || A[q * 4 + 3] > 90; };
      while (st.length) { const q = st.pop(), i = q % 96, y = (q - i) / 96; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = i + a, ny = y + b; if (nx < 0 || ny < 0 || nx > 95 || ny > 95) continue; const n = ny * 96 + nx; if (!conn[n] && fill(n)) { conn[n] = 1; st.push(n); } } }
      for (let q = 0; q < 96 * 96; q++) { const on = A[q * 4 + 3] > 90 && !conn[q]; A[q * 4] = 255; A[q * 4 + 1] = 40; A[q * 4 + 2] = 60; A[q * 4 + 3] = on ? 150 : 0; }
      x.putImageData(d, 0, 0); looseMask = s;
    } else looseMask = null;
  }
  function sub() {
    const el = $('ed-sub');
    if (tool === 'shape') el.innerHTML = ['line', 'circle', 'rect', 'tri'].map(k => `<button data-shape="${k}" class="${shape === k ? 'on' : ''}">${tr('sh_' + k)}</button>`).join('') + `<button data-sfill="1" class="${shapeFill ? 'on' : ''}">${tr('sh_fill')}</button>`;
    else if (tool === 'stamp') el.innerHTML = STAMPS.map(([k, t]) => `<button data-stamp="${k}" class="${stamp === k ? 'on' : ''}">${tr(t)}</button>`).join('');
    else el.innerHTML = '';
  }
  function hud() {
    sub();
    document.querySelectorAll('#ed-tools button[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
    document.querySelectorAll('#ed-colors button[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === color));
    const cb = $('ed-color-free'); cb.classList.toggle('on', !COLORS.includes(color)); if (!COLORS.includes(color)) cb.style.background = color;
    $('ed-size').value = size; $('ed-size-n').textContent = size; $('ed-size-dot').style.width = $('ed-size-dot').style.height = Math.max(3, Math.min(28, size * z)) + 'px'; $('ed-size-dot').style.background = tool === 'erase' ? '#fff' : color;
    $('ed-undo').disabled = !undo.length;
    $('ed-sym').classList.toggle('on', sym > 1); $('ed-sym-t').textContent = sym > 1 ? tr('sym_n', { n: sym }) : tr('sym_off');
  }
  $('ed-sub').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.shape) shape = b.dataset.shape; if (b.dataset.sfill) shapeFill = !shapeFill; if (b.dataset.stamp) stamp = b.dataset.stamp; draw(); });

  // ---------- やりなおし ----------
  function snap() {
    dirty = true;
    const x = top.layer.getContext('2d'); undo.push(x.getImageData(0, 0, D, D)); if (undo.length > 20) undo.shift();
  }
  $('ed-undo').onclick = () => { const u = undo.pop(); if (!u) return; top.layer.getContext('2d').putImageData(u, 0, 0); analyze(); draw(); };
  $('ed-clear').onclick = () => { snap(); top.layer.getContext('2d').clearRect(0, 0, D, D); analyze(); draw(); };

  // ---------- 描く ----------
  const lctx = () => top.layer.getContext('2d');
  // 対称：同じものを、まわして何回か描く。円の外には描けない
  function symDo(x, fn) {
    for (let k = 0; k < sym; k++) {
      x.save(); x.beginPath(); x.arc(C, C, R_PX, 0, Math.PI * 2); x.clip();
      x.translate(C, C); x.rotate(k / sym * Math.PI * 2); x.translate(-C, -C);
      x.lineCap = 'round'; x.lineJoin = 'round'; fn(x); x.restore();
    }
  }
  function line(a, b, erase) {
    symDo(lctx(), x => { x.globalCompositeOperation = erase ? 'destination-out' : 'source-over'; x.strokeStyle = color; x.lineWidth = erase ? size * 1.8 : size; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0] + 0.01, b[1]); x.stroke(); });
  }
  function shapePath(x, a, b) {
    x.beginPath();
    if (shape === 'line') { x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); }
    else if (shape === 'rect') x.rect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    else if (shape === 'tri') { x.moveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1])); x.lineTo(Math.max(a[0], b[0]), Math.max(a[1], b[1])); x.lineTo(Math.min(a[0], b[0]), Math.max(a[1], b[1])); x.closePath(); }
    else x.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2 + 0.01, Math.abs(b[1] - a[1]) / 2 + 0.01, 0, 0, 7);
  }
  function putStamp(p) {
    const s = 10 + size * 1.6, ink = '#1f2430';
    symDo(lctx(), x => {
      x.translate(p[0], p[1]); x.lineWidth = Math.max(2, s * 0.12); x.strokeStyle = ink;
      const eye = (ex, r, pr) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(ex, 0, r, 0, 7); x.fill(); x.stroke(); x.fillStyle = ink; x.beginPath(); x.arc(ex, r * 0.1, pr, 0, 7); x.fill(); };
      if (stamp === 'star') { x.fillStyle = color; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.4 : s * 0.9; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); }
      else if (stamp === 'heart') { x.fillStyle = color; x.beginPath(); x.moveTo(0, s * 0.7); x.bezierCurveTo(-s * 1.1, -s * 0.1, -s * 0.5, -s * 0.9, 0, -s * 0.3); x.bezierCurveTo(s * 0.5, -s * 0.9, s * 1.1, -s * 0.1, 0, s * 0.7); x.fill(); x.stroke(); }
      else if (stamp === 'bolt') { x.fillStyle = color; x.beginPath(); x.moveTo(s * 0.15, -s); x.lineTo(-s * 0.55, s * 0.1); x.lineTo(-s * 0.05, s * 0.1); x.lineTo(-s * 0.2, s); x.lineTo(s * 0.55, -s * 0.15); x.lineTo(s * 0.05, -s * 0.15); x.closePath(); x.fill(); x.stroke(); }
      else if (stamp === 'eyes') { eye(-s * 0.55, s * 0.42, s * 0.2); eye(s * 0.55, s * 0.42, s * 0.2); }
      else if (stamp === 'tsuri') { for (const d of [-1, 1]) { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(d * s * 0.15, -s * 0.05); x.lineTo(d * s * 0.95, -s * 0.35); x.lineTo(d * s * 0.85, s * 0.3); x.lineTo(d * s * 0.2, s * 0.3); x.closePath(); x.fill(); x.stroke(); x.fillStyle = ink; x.beginPath(); x.arc(d * s * 0.5, s * 0.1, s * 0.13, 0, 7); x.fill(); } }
      else if (stamp === 'kiba') { x.beginPath(); x.moveTo(-s * 0.8, 0); x.lineTo(s * 0.8, 0); x.stroke(); x.fillStyle = '#fff'; for (const d of [-0.45, 0.45]) { x.beginPath(); x.moveTo(d * s - s * 0.15, 0); x.lineTo(d * s, s * 0.45); x.lineTo(d * s + s * 0.15, 0); x.closePath(); x.fill(); x.stroke(); } }
      else if (stamp === 'flame') { x.fillStyle = color; x.beginPath(); x.moveTo(0, -s); x.bezierCurveTo(s * 0.9, -s * 0.2, s * 0.6, s * 0.8, 0, s * 0.8); x.bezierCurveTo(-s * 0.6, s * 0.8, -s * 0.9, -s * 0.1, -s * 0.2, -s * 0.5); x.bezierCurveTo(-s * 0.1, -s * 0.1, s * 0.1, -s * 0.3, 0, -s); x.fill(); x.stroke(); }
      else { x.fillStyle = color; x.beginPath(); x.arc(0, 0, s * 0.6, 0, 7); x.fill(); }
    });
  }
  // ぬりつぶし（円の中だけ）
  function fill(p) {
    const L = top.layer, ctx = L.getContext('2d'), w = D, h = D, img = ctx.getImageData(0, 0, w, h), d = img.data;
    const sx = Math.floor(p[0]), sy = Math.floor(p[1]); if (Math.hypot(sx - C, sy - C) > R_PX) return;
    const i0 = (sy * w + sx) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
    const nc = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), 255];
    if (t[3] > 40 && Math.abs(t[0] - nc[0]) + Math.abs(t[1] - nc[1]) + Math.abs(t[2] - nc[2]) < 6) return;
    const same = i => t[3] < 40 ? d[i + 3] < 40 : Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) < 60 && d[i + 3] > 100;
    const inC = q => { const x = q % w, y = (q - x) / w; return (x - C) * (x - C) + (y - C) * (y - C) <= R_PX * R_PX; };
    const seen = new Uint8Array(w * h), st = [sx + sy * w], list = []; seen[st[0]] = 1;
    while (st.length) { const q = st.pop(); list.push(q); const x = q % w; for (const n of [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, q - w, q + w]) { if (n < 0 || n >= w * h || seen[n]) continue; seen[n] = 1; if (inC(n) && same(n * 4)) st.push(n); } }
    snap();
    for (const q of list) { const i = q * 4; d[i] = nc[0]; d[i + 1] = nc[1]; d[i + 2] = nc[2]; d[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    // 対称：ぬった形もまわしてかさねる
    if (sym > 1) { const c = document.createElement('canvas'); c.width = c.height = D; c.getContext('2d').drawImage(L, 0, 0); for (let k = 1; k < sym; k++) { ctx.save(); ctx.beginPath(); ctx.arc(C, C, R_PX, 0, 7); ctx.clip(); ctx.translate(C, C); ctx.rotate(k / sym * Math.PI * 2); ctx.translate(-C, -C); ctx.drawImage(c, 0, 0); ctx.restore(); } c.width = 1; }
    analyze(); draw();
  }

  // ---------- 指の操作 ----------
  const ptrs = new Map(); let pinch = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - vx) / z, (e.clientY - r.top - vy) / z]; };
  function cancel() { if (drawing || shapeDrag) { const u = undo.pop(); if (u) top.layer.getContext('2d').putImageData(u, 0, 0); } drawing = shapeDrag = null; }
  cv.addEventListener('pointerdown', e => {
    if (!top) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    const r = cv.getBoundingClientRect(); ptrs.set(e.pointerId, [e.clientX - r.left, e.clientY - r.top]);
    if (ptrs.size === 2) { cancel(); const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], vx, vy }; draw(); return; }
    if (ptrs.size > 2 || pinch) return;
    const p = pt(e);
    if (tool === 'fill') { fill(p); return; }
    if (tool === 'stamp') { snap(); putStamp(p); analyze(); draw(); return; }
    if (tool === 'shape') { snap(); shapeDrag = { a: p, b: p }; draw(); return; }
    snap(); drawing = { last: p }; line(p, p, tool === 'erase'); draw();
  });
  cv.addEventListener('pointermove', e => {
    if (!top) return; const r = cv.getBoundingClientRect();
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX - r.left, e.clientY - r.top]);
    if (pinch) { if (ptrs.size < 2) return; const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const cx = (pinch.m[0] - pinch.vx) / pinch.z, cy = (pinch.m[1] - pinch.vy) / pinch.z; z = pinch.z * d / pinch.d; clampView(); vx = m[0] - cx * z; vy = m[1] - cy * z; clampView(); draw(); return; }
    const p = pt(e);
    if (shapeDrag) { shapeDrag.b = p; draw(); return; }
    if (drawing) { line(drawing.last, p, tool === 'erase'); drawing.last = p; draw(); }
  });
  const up = e => {
    ptrs.delete(e.pointerId);
    if (pinch) { if (ptrs.size === 0) pinch = null; return; }
    if (shapeDrag) { const { a, b } = shapeDrag; shapeDrag = null; if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 3) symDo(lctx(), x => { shapePath(x, a, b); if (shapeFill && shape !== 'line') { x.fillStyle = color; x.fill(); } x.strokeStyle = color; x.lineWidth = size; x.stroke(); }); else undo.pop(); analyze(); draw(); }
    if (drawing) { drawing = null; analyze(); draw(); }
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  $('ed-zin').onclick = () => zoomAt(1.4, cw / 2, chh / 2); $('ed-zout').onclick = () => zoomAt(1 / 1.4, cw / 2, chh / 2); $('ed-zfit').onclick = fit;

  // ---------- ボタン ----------
  document.querySelectorAll('#ed-tools button[data-tool]').forEach(b => b.onclick = () => { tool = b.dataset.tool; draw(); });
  $('ed-sym').onclick = () => { sym = SYMS[(SYMS.indexOf(sym) + 1) % SYMS.length]; EK_toast(sym > 1 ? tr('sym_toast', { n: sym }) : tr('sym_off')); draw(); };
  function closePops() { $('ed-menu').hidden = true; $('ed-size-pop').hidden = true; }
  $('ed-more').onclick = e => { e.stopPropagation(); const h = $('ed-menu').hidden; closePops(); $('ed-menu').hidden = !h; };
  $('ed-menu').addEventListener('click', () => setTimeout(closePops, 0));
  $('ed-size-btn').onclick = e => { e.stopPropagation(); const h = $('ed-size-pop').hidden; closePops(); $('ed-size-pop').hidden = !h; };
  $('ed-size-pop').addEventListener('pointerdown', e => e.stopPropagation());
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#ed-menu, #ed-more, #ed-size-pop, #ed-size-btn')) closePops(); }, true);
  $('ed-colors').innerHTML = COLORS.map(c => `<button data-c="${c}" style="background:${c}"></button>`).join('') + '<button id="ed-color-free" class="free">🎨</button><input type="color" id="ed-color-in" value="#33c7ff">';
  $('ed-colors').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'ed-color-free') { $('ed-color-in').click(); return; } color = b.dataset.c; if (tool === 'erase') tool = 'pen'; draw(); };
  $('ed-color-in').addEventListener('input', e => { color = e.target.value; if (tool === 'erase') tool = 'pen'; draw(); });
  $('ed-size').addEventListener('input', e => { size = +e.target.value; draw(); });
  const EK_toast = t => BB.toast && BB.toast(t);
  $('ed-sample').onclick = () => {
    const keys = ['easy', 'normal', 'hard']; BB._sI = ((BB._sI == null ? -1 : BB._sI) + 1) % 3;
    const s = BB.samples(keys[BB._sI])[keys[BB._sI]]; snap(); const x = lctx(); x.clearRect(0, 0, D, D); x.drawImage(s.layer, 0, 0);
    top.name = top.name || s.name; top.pts = Object.assign({}, s.pts); top.axis = s.axis; top.lock = s.lock; top.skill = s.skill; top.spin = s.spin; BB.freeTop(s); analyze(); draw();
  };
  function finish(force) {
    analyze();
    if (!an.ok && !force) { EK_toast(tr('fill_more', { m: Math.round(MIN_FILL * 100) })); return; }
    const r = raku; endRaku();
    if (onDone) onDone(top, { dirty, an, raku: !!r });
  }
  $('ed-done').onclick = () => finish(false);
  // らくがきバトル：時間切れ。ぬりが足りなければ、まるい板を足してコマにする
  function endRaku() { if (!raku) return; clearInterval(raku.tm); raku = null; $('editor').classList.remove('raku'); $('ed-timer').hidden = true; }
  function rakuTick() {
    if (!raku) return;
    const left = Math.max(0, Math.ceil((raku.until - BB.now()) / 1000)), el = $('ed-timer');
    el.textContent = Math.min(raku.max, left); el.classList.toggle('hurry', left <= 10);
    if (left <= 0) { analyze(); if (!an.ok) BB.fillMin(top); finish(true); }
  }
  BB.Editor = {
    open(t, done, opt = {}) {
      endRaku();
      top = t ? BB.cloneTop(t) : BB.newTop(); onDone = done; undo = []; dirty = false; tool = 'pen'; sym = 1;
      $('ed-menu').hidden = true;
      if (opt.until) { raku = { until: opt.until, max: 60, tm: setInterval(rakuTick, 250) }; $('editor').classList.add('raku'); $('ed-timer').hidden = false; rakuTick(); }
      requestAnimationFrame(() => { layout(); analyze(); draw(); });
    },
    stop() { endRaku(); },
    get top() { return top; }, get dirty() { return dirty; },
    toScreen: (x, y) => { const r = cv.getBoundingClientRect(); return [r.left + vx + x * z, r.top + vy + y * z]; }
  };
  // ぬりが足りないとき：外側をまるくぬって、最低限にする
  BB.fillMin = t => { const x = t.layer.getContext('2d'); x.save(); x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#9aa3b8'; x.beginPath(); x.arc(C, C, R_PX * 0.62, 0, 7); x.fill(); x.restore(); };
})();
