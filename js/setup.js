// =============================================
//  バトベイ  コマの設定：ポイント配分・軸・ロック・回る向き・スキル
//  （らくがきバトルでは20秒。時間切れのときは、そのままの設定で決まる）
// =============================================
(function () {
  const $ = id => document.getElementById(id);
  const T = BB.T;
  const tr = (k, v) => (window.I18N ? I18N.t(k, v) : k);
  const PT = [['atk', 'pt_atk', '#ff4d5e'], ['def', 'pt_def', '#33c7ff'], ['sta', 'pt_sta', '#2fd27c'], ['wgt', 'pt_wgt', '#ffb020']];
  let top = null, an = null, done = null, back = null, raku = null;

  // 円盤の小さい絵（軸つき）
  BB.drawTopIcon = (t, cv) => {
    const x = cv.getContext('2d'), w = cv.width; x.clearRect(0, 0, w, w);
    if (!t || !t.layer) return;
    const k = w / (T.R_PX * 2 + 8);
    x.save(); x.translate(w / 2, w / 2); x.scale(k, k);
    x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.arc(0, 0, T.R_PX, 0, 7); x.fill();
    x.drawImage(t.layer, -T.C, -T.C);
    const g = x.createRadialGradient(-6, -8, 2, 0, 0, T.HUB_PX); g.addColorStop(0, '#fff'); g.addColorStop(1, '#8b93a3');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, T.HUB_PX, 0, 7); x.fill();
    x.restore();
  };
  function render() {
    BB.drawTopIcon(top, $('su-prev'));
    const left = BB.ptsLeft(top); $('su-left').textContent = left;
    $('su-pts').innerHTML = PT.map(([k, n, c]) => `<div class="pt" style="--c:${c}"><span>${tr(n)}</span><button data-k="${k}" data-d="-1">－</button><div class="bar">${Array.from({ length: T.PMAX }, (_, i) => `<i class="${i < top.pts[k] ? 'on' : ''}"></i>`).join('')}</div><button data-k="${k}" data-d="1"${left <= 0 || top.pts[k] >= T.PMAX ? ' disabled' : ''}>＋</button></div>`).join('');
    $('su-axis').innerHTML = Object.keys(T.AXES).map(k => `<button data-v="${k}" class="${top.axis === k ? 'on' : ''}">${tr('ax_' + k)}<small>${tr('axd_' + k)}</small></button>`).join('');
    document.querySelectorAll('#su-spin button').forEach(b => b.classList.toggle('on', b.dataset.v === top.spin));
    $('su-lock').value = Math.round(top.lock * 100);
    $('su-skill').innerHTML = Object.keys(T.SKILLS).map(k => `<button data-v="${k}" class="${top.skill === k ? 'on' : ''}"><b>${tr('sk_' + k)}</b><small>${tr('skd_' + k)}</small></button>`).join('');
    // 形のとくちょう（ことばで）
    const sp = an.spike, sz = an.size;
    $('su-shape').textContent = tr('shape_l') + tr(sp > 0.55 ? 'sh_spiky' : sp > 0.28 ? 'sh_bumpy' : 'sh_round') + (sz < 0.6 ? tr('sh_small') : sz > 0.92 ? tr('sh_big') : '');
  }
  $('su-pts').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b || !top) return;
    const k = b.dataset.k, d = +b.dataset.d;
    if (d > 0 && BB.ptsLeft(top) <= 0) return;
    top.pts[k] = Math.max(0, Math.min(T.PMAX, top.pts[k] + d)); render();
  });
  $('su-axis').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b && top) { top.axis = b.dataset.v; render(); } });
  $('su-spin').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b && top) { top.spin = b.dataset.v; render(); } });
  $('su-skill').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b && top) { top.skill = b.dataset.v; render(); } });
  $('su-lock').addEventListener('input', e => { if (top) top.lock = +e.target.value / 100; });
  $('su-name').addEventListener('input', e => { if (top) top.name = e.target.value.trim().slice(0, 8); });
  function finish() {
    if (!top) return;
    // 使いきっていないポイントは、そのまま（少ないのも自由）
    endRaku(); top.name = ($('su-name').value || '').trim().slice(0, 8);
    const d = done; done = null; d && d(top);
  }
  $('su-done').onclick = finish;
  $('su-back').onclick = () => { if (raku) return; endRaku(); back && back(top); };
  function endRaku() { if (!raku) return; clearInterval(raku.tm); raku = null; $('su-timer').hidden = true; $('su-back').disabled = false; }
  function tick() {
    if (!raku) return;
    const left = Math.max(0, Math.ceil((raku.until - BB.now()) / 1000)), el = $('su-timer');
    el.textContent = Math.min(20, left); el.classList.toggle('hurry', left <= 5);
    if (left <= 0) finish();
  }
  BB.Setup = {
    open(t, analysis, onDone, onBack, opt = {}) {
      endRaku(); top = t; an = analysis; done = onDone; back = onBack;
      $('su-name').value = top.name || '';
      if (opt.until) { raku = { until: opt.until, tm: setInterval(tick, 250) }; $('su-timer').hidden = false; $('su-back').disabled = true; tick(); }
      render(); $('setup').querySelector('.su-body').scrollTop = 0;
    },
    stop: endRaku
  };
})();
