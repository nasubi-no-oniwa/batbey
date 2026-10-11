// =============================================
//  バトベイ  コマの動き（画面なしでも動く）
//  スタジアムの半径＝1。すり鉢は真ん中に引っぱる力。
//  決着：バースト（ロックが0）／場外（出口に落ちる・強い一撃でかべをこえる）／回転が止まる
//  攻撃型：ふちを回って、ときどき真ん中へつっこむ。バランス型：中くらいを回る。持久型：真ん中でじっと
// =============================================
window.BB = window.BB || {};
(function () {
  const TAU = Math.PI * 2;
  const W0 = 170;                    // いちばん強く回したときの回転（ラジアン／秒）
  const W_STOP = 14;                 // これより遅いと止まる
  const T_LIMIT = 100;               // とても長いときの時間切れ（秒）
  const STAGES = {
    std:  { name: 'スタンダード', sub: '出口が3つ＋加速レール。攻撃型がかっとぶ', k: 3.9, over: 2.5, wallE: 0.72, pockets: [[90, 18], [210, 18], [330, 18]], rail: [0.74, 0.9], color: '#3b82f6' },
    deep: { name: 'ふかすりばち', sub: 'かべが高く場外なし。当たりが重く、バーストしやすい', k: 4.5, over: 3.3, wallE: 0.6, pockets: [], smash: 1.15, color: '#8b5cf6' },
    flat: { name: 'ひらば', sub: 'かべが低く、はじき出しやすい。攻撃型むき', k: 2.4, over: 1.8, wallE: 0.8, pockets: [], color: '#f97316' }
  };
  const SK_T = { rush: 0.8, wall: 3.5, drain: 5, grav: 3.5, boost: 3.5, refl: 7 };
  // ぶつかりの強さ（段階）：1 カキン／2 ガキッ／3 ガキーン／4 ドゴォ
  const TIER = [1.2, 2.7, 4.1];
  BB.STAGES = STAGES; BB.W0 = W0; BB.W_STOP = W_STOP; BB.TIER = TIER;
  BB.CHEER = { add: 0.016, max: 0.45 };    // 応援1回でたまるゲージ／1ラウンドの上限

  const rad = d => d * Math.PI / 180;
  const rnd = (a, b) => a + BB.rand() * (b - a);
  function inPocket(st, ang) {
    for (const [c, w] of st.pockets) { let d = Math.abs(((ang - rad(c)) % TAU + TAU * 1.5) % TAU - Math.PI); if (d < rad(w) / 2) return true; }
    return false;
  }

  class Battle {
    // tops: [{ prof, st }]
    constructor(tops, stage) {
      this.stage = STAGES[stage] ? stage : 'std'; this.S = STAGES[this.stage];
      this.f = tops.map((t, i) => ({
        i, prof: t.prof, st: t.st, x: i ? 0.58 : -0.58, y: 0, vx: 0, vy: 0, ang: BB.rand() * TAU, w: 0, w0: 1, lock: t.st.lockMax, gauge: 0, used: false,
        eff: {}, state: 'wait', wob: 0, over: 0, touch: 0, outV: null, lastHit: -9, kick: -9, hits: 0, mode: 'orbit', mt: 0, tx: 0, ty: 0, rail: false, cheer: 0, critReq: null, critN: 0, critDone: false, danger: 0, crackLv: 0
      }));
      this.t = 0; this.events = []; this.over = false; this.winner = null; this.why = null; this.combo = 0; this.lastHitT = -9; this.final = false; this.grindT = 0; this.hitLog = []; this.near = null;
    }
    emit(e) { e.t = this.t; this.events.push(e); }
    // 回す：power 0〜1.3（1をこえるとぐらつく）、timing：'early'|'perfect'|'good'|'late'、aim：左右±1、delay：出おくれ（秒）
    launch(i, o) {
      const f = this.f[i];
      let p = Math.max(0.1, Math.min(1.3, o.power));
      if (o.timing === 'early') p = Math.min(p, 1) * 0.6;
      if (o.timing === 'perfect') p = p <= 1 ? Math.min(1, p * 1.08) : p;   // ぴったり：少し強く（でも満タンはこえない）
      f.over = Math.max(0, p - 1) * 3.2;                 // 強すぎ → ぐらつき
      const pe = Math.min(1, p);
      f.w0 = W0 * (0.45 + 0.55 * pe); f.w = f.w0 * f.st.dir;
      const dir = Math.atan2(-f.y, -f.x) + Math.max(-1, Math.min(1, o.aim || 0)) * 0.9;
      const sp = 0.7 + 1.0 * pe + f.over * 0.35;
      f.vx = Math.cos(dir) * sp; f.vy = Math.sin(dir) * sp;
      if (f.over) { const a = BB.rand() * TAU; f.vx += Math.cos(a) * f.over * 0.9; f.vy += Math.sin(a) * f.over * 0.9; }
      f.state = 'wait'; f.startAt = this.t + Math.max(0, o.delay || 0); f.safeUntil = f.startAt + 2.0; f.timing = o.timing; f.power = p;
      const ax = f.st.ax; f.mode = 'orbit'; f.mt = ax.dash ? rnd(ax.dash[0], ax.dash[1]) * 0.8 : 0;
    }
    r(f, phi) {   // 角度 phi（世界）の向きの、コマのはしまでの半径
      const NA = f.prof.length, a = ((phi - f.ang) / TAU * NA % NA + NA) % NA, i = Math.floor(a), fr = a - i;
      return (f.prof[i] * (1 - fr) + f.prof[(i + 1) % NA] * fr) * BB.T.TOP_R;
    }
    bump(f, phi) {  // その向きが、まわりより出っぱっているか（とげ）
      const NA = f.prof.length, a = Math.round(((phi - f.ang) / TAU * NA % NA + NA) % NA);
      let s = 0; for (let k = 3; k <= 8; k++) s += f.prof[(a + k) % NA] + f.prof[(a - k + NA) % NA];
      return Math.max(0, Math.min(1, (f.prof[a % NA] - s / 12) * 7));
    }
    useSkill(i) {
      const f = this.f[i], o = this.f[1 - i];
      if (this.over || f.used || f.gauge < 1 || f.state !== 'spin') return false;
      f.used = true; f.gauge = 0; const k = f.st.skill;
      if (k === 'rush') { const dx = o.x - f.x, dy = o.y - f.y, d = Math.hypot(dx, dy) || 1; f.vx = dx / d * 3.4; f.vy = dy / d * 3.4; f.mode = 'dash'; f.mt = 0.8; f.tx = o.x; f.ty = o.y; }
      else if (k === 'heal') f.w = Math.sign(f.w) * Math.min(f.w0, Math.abs(f.w) + 0.3 * W0);
      else if (k === 'grav') o.eff.slow = SK_T.grav;
      else if (k === 'loose') o.lock = Math.max(0.04, o.lock - 0.42 * o.st.lockMax);
      if (SK_T[k] && k !== 'grav') f.eff[k] = SK_T[k];
      this.emit({ type: 'skill', i, skill: k });
      return true;
    }
    // 応援：ゲージが少したまる（1ラウンドに上限あり）
    cheer(i, n = 1) {
      const f = this.f[i]; if (this.over || f.state !== 'spin' || f.used) return 0;
      const C = BB.CHEER, add = Math.min(n * C.add, C.max - f.cheer); if (add <= 0) return 0;
      f.cheer += add; f.gauge = Math.min(1, f.gauge + add); return add;
    }
    // 会心：ぶつかる直前（0.2秒以内）にタップ。tTap は、押した人に見えていた試合の時刻
    crit(i, tTap) {
      const f = this.f[i]; if (this.over || f.state !== 'spin') return;
      if (tTap == null) tTap = this.t;
      // もう当たっていた（通信のおくれ）：すぐあとの当たりなら、あとから会心にする
      const h = this.hitLog.find(e => !e.crit[i] && e.t - tTap >= -0.03 && e.t - tTap <= 0.2);
      if (h && this.t - h.t < 0.45) { this.critHit(i, h); return; }
      if (f.critReq != null && this.t - f.critReq < 0.6) { f.critN++; return; }      // 連打は会心にならない
      f.critReq = tTap; f.critN = 1;
    }
    critHit(i, h) {
      const A = this.f[i], B = this.f[1 - i]; h.crit[i] = 1; A.critReq = null;
      if (B.state !== 'spin') return;
      const nx = h.nx * (i ? -1 : 1), ny = h.ny * (i ? -1 : 1), k = 0.75 * (0.6 + A.st.atk) / B.st.mass;
      B.vx += nx * k; B.vy += ny * k; B.kick = this.t;
      B.lock -= (0.015 + 0.035 * A.st.atk) * (1 - 0.4 * B.st.def); if (B.hits < 5) B.lock = Math.max(0.05, B.lock);
      B.w *= 0.985;
      this.emit({ type: 'crit', i, x: h.x, y: h.y });
      if (B.lock <= 0 && B.hits >= 5) this.finish(B, 'burst');
    }
    step(dt, inp) {
      if (this.over) return;
      const n = 3, h = dt / n;
      for (let s = 0; s < n && !this.over; s++) this.sub(h);
      if (inp) for (const i of [0, 1]) if (inp[i] && inp[i].skill) this.useSkill(i);
    }
    sub(h) {
      this.t += h; const S = this.S;
      for (const f of this.f) {
        for (const k in f.eff) { f.eff[k] -= h; if (f.eff[k] <= 0) delete f.eff[k]; }
        if (f.state === 'wait') { if (f.startAt != null && this.t >= f.startAt) { f.state = 'spin'; this.emit({ type: 'land', i: f.i, x: f.x, y: f.y }); } else continue; }
        if (f.state !== 'spin') continue;
        const st = f.st, u = Math.min(1, Math.abs(f.w) / W0), ax = st.ax, o = this.f[1 - f.i];
        // 回転が落ちる（life 秒で止まるくらい。強すぎた打ち出しは、はじめに落ちやすい）
        const overF = 1 + f.over * (this.t - f.startAt < 2.5 ? 1.4 : 0.25);
        f.w -= Math.sign(f.w) * (1.18 / st.life) * (0.55 + 0.45 * u) * W0 * overF * h;
        f.wob = Math.max(f.over * 0.6 * Math.max(0, 1 - (this.t - f.startAt) / 2.5), u < 0.3 ? (0.3 - u) * 2.2 : 0);
        // 動き
        const px = f.x, py = f.y, rr = Math.hypot(px, py) || 1e-6, rx = px / rr, ry = py / rr, dir = Math.sign(f.w) || 1;
        let ax_ = -S.k * px, ay_ = -S.k * py;
        let trac = ax.move * (0.3 + 0.7 * Math.min(1, u / 0.55)), spd = 0.55 + 0.45 * Math.min(1, u / 0.5);
        if (f.eff.slow) trac *= 0.15;
        if (f.eff.stun) trac *= 0.6;
        if (f.eff.boost) { trac *= 1.8; spd *= 1.35; }
        let vdx = 0, vdy = 0, ctl = 0;
        if (f.mode === 'dash') {
          // つっこむ：ねらった所（相手の少し先）へ
          if (o.state === 'spin') { const ld = Math.min(0.35, Math.hypot(o.x - px, o.y - py) / (ax.dashV || 2)); f.tx = o.x + o.vx * ld; f.ty = o.y + o.vy * ld; }
          const dx = f.tx - px, dy = f.ty - py, d = Math.hypot(dx, dy) || 1;
          vdx = dx / d * ax.dashV * spd * (f.eff.boost ? 1.2 : 1); vdy = dy / d * ax.dashV * spd; ctl = 1;
          f.mt -= h; if (f.mt <= 0) { f.mode = 'orbit'; f.mt = ax.dash ? rnd(ax.dash[0], ax.dash[1]) : 0; }
        } else if (ax.orbitV) {
          // まわる：回る向きに、決まった半径で
          const tx = -ry * dir, ty = rx * dir, er = ax.orbitR - rr;
          vdx = tx * ax.orbitV * spd + rx * er * 2.6; vdy = ty * ax.orbitV * spd + ry * er * 2.6; ctl = 1;
          f.mt -= h;
          if (f.mt <= 0 && o.state === 'spin' && this.t > f.startAt + 0.6) { f.mode = 'dash'; f.mt = 0.75; f.tx = o.x + o.vx * 0.2; f.ty = o.y + o.vy * 0.2; }
        }
        if (ctl) {
          let ex = vdx - f.vx, ey = vdy - f.vy; const em = Math.hypot(ex, ey), cap = trac;
          const k = Math.min(4 * em, cap) / (em || 1); ax_ += ex * k; ay_ += ey * k;
        }
        const fr = 0.12 + ax.fric * (f.eff.slow ? 3 : 1); ax_ -= fr * f.vx; ay_ -= fr * f.vy;
        // 加速レール（スタンダード）：ふちのみぞに乗ると、回る向きに加速
        let onRail = false;
        if (S.rail && ax.orbitV && f.mode !== 'dash' && rr > S.rail[0] && rr < S.rail[1]) {
          const tx = -ry, ty = rx, vt = f.vx * tx + f.vy * ty;
          if (Math.abs(vt) > 0.55) {
            onRail = true; const sg = Math.sign(vt);
            if (Math.abs(vt) < 2.6) { ax_ += tx * sg * 1.9; ay_ += ty * sg * 1.9; }
            const mid = (S.rail[0] + S.rail[1]) / 2; ax_ -= rx * (rr - mid) * 7; ay_ -= ry * (rr - mid) * 7;
            if (!f.rail && Math.abs(vt) > 1.1) this.emit({ type: 'rail', i: f.i });
          }
        }
        f.rail = onRail;
        if (f.wob) { ax_ += Math.cos(this.t * 13 + f.i) * f.wob * 1.5; ay_ += Math.sin(this.t * 11 + f.i) * f.wob * 1.5; }
        f.vx += ax_ * h; f.vy += ay_ * h;
        const vm = Math.hypot(f.vx, f.vy); if (vm > 4.2) { f.vx *= 4.2 / vm; f.vy *= 4.2 / vm; }
        f.x += f.vx * h; f.y += f.vy * h; f.ang += f.w * h;
        // ふち：はね返る。場外は「出口」か「強い一撃のすぐあと」だけ
        const r2 = Math.hypot(f.x, f.y), edge = 1 - st.radius * 0.55;
        if (r2 > edge) {
          const nx = f.x / r2, ny = f.y / r2, vr = f.vx * nx + f.vy * ny, phi = Math.atan2(f.y, f.x);
          if (vr > 0 && this.t > (f.safeUntil || 0)) {
            const hard = f.hits >= 4 && this.t > 8 && this.t - f.kick < 0.7 && vr > S.over * (f.eff.wall ? 1.5 : 1) * (0.75 + 0.25 * st.mass);
            if ((inPocket(S, phi) && f.hits >= 3 && this.t > 6 && vr > 0.8 && this.t - f.kick < 1.2) || hard) { this.outHow = hard ? 'hard' : 'pocket'; this.finish(f, 'out'); f.outV = [f.vx, f.vy]; continue; }
          }
          if (vr > 0) {
            f.vx -= (1 + S.wallE) * vr * nx; f.vy -= (1 + S.wallE) * vr * ny;
            if (vr > 0.7) this.emit({ type: 'wall', i: f.i, s: vr, x: f.x, y: f.y });
            f.w *= 1 - 0.002 * vr;
            if (f.mode === 'dash') { f.mode = 'orbit'; f.mt = ax.dash ? rnd(ax.dash[0], ax.dash[1]) : 0; }
          }
          f.x = nx * edge; f.y = ny * edge;
        }
        if (f.critReq != null && this.t - f.critReq > 0.6) { f.critReq = null; f.critN = 0; }   // ぶつからなかった：なにもなし
        // バースト寸前のきざし
        const lr = f.lock / st.lockMax, lv = lr < 0.15 ? 3 : lr < 0.3 ? 2 : lr < 0.5 ? 1 : 0;
        f.danger = lv; if (lv > f.crackLv) { f.crackLv = lv; this.emit({ type: 'crack', i: f.i, lv, x: f.x, y: f.y }); }
        if (Math.abs(f.w) < W_STOP) this.finish(f, 'stop');
        f.gauge = Math.min(1, f.gauge + h * 0.02);
      }
      this.collide(h);
      this.near = Battle.nearOf(this.f);
      // スピン勝負：ふたりとも回転が3割を切った
      if (!this.over && !this.final) { const [a, b] = this.f; if (a.state === 'spin' && b.state === 'spin' && Math.abs(a.w) < W0 * 0.3 && Math.abs(b.w) < W0 * 0.3) { this.final = true; this.emit({ type: 'final' }); } }
      // 時間切れ（とても長いとき）：回転が多いほうの勝ち
      if (!this.over && this.t > T_LIMIT) { const [a, b] = this.f; this.finish(Math.abs(a.w) < Math.abs(b.w) ? a : b, 'stop'); }
    }
    collide(h) {
      const [A, B] = this.f;
      if (A.state !== 'spin' || B.state !== 'spin') return;
      const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1e-6, nx = dx / d, ny = dy / d;
      const phi = Math.atan2(dy, dx), rA = this.r(A, phi), rB = this.r(B, phi + Math.PI);
      if (d > rA + rB) { A.touch = B.touch = 0; return; }
      // めりこみをもどす
      const mA = A.st.mass * (A.eff.wall ? 2.2 : 1), mB = B.st.mass * (B.eff.wall ? 2.2 : 1), ov = rA + rB - d, iA = 1 / mA, iB = 1 / mB, mr = 1 / (iA + iB);
      A.x -= nx * ov * iA * mr; A.y -= ny * ov * iA * mr; B.x += nx * ov * iB * mr; B.y += ny * ov * iB * mr;
      const vn = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
      const sA = A.w * rA, sB = B.w * rB, slipS = sA + sB, slip = Math.abs(slipS), tot = Math.abs(sA) + Math.abs(sB) + 1e-6, grip = 1 - slip / tot;
      const fresh = A.touch <= 0 || vn < -0.15;
      A.touch = B.touch = 1;
      if (!fresh || this.t - A.lastHit < 0.07) {
        // くっついたまま：逆回りどうしは、ギャリギャリ回転をうばいあう／同じ向きは、はじきあう
        if (grip > 0.4) {
          this.grindT -= h;
          const amt = 0.3 * grip * h * Math.min(Math.abs(A.w), Math.abs(B.w));
          if (Math.abs(A.w) * (1 + A.st.sta) > Math.abs(B.w) * (1 + B.st.sta)) { A.w += Math.sign(A.w) * amt * 0.5; B.w -= Math.sign(B.w) * amt; } else { B.w += Math.sign(B.w) * amt * 0.5; A.w -= Math.sign(A.w) * amt; }
          A.vx -= nx * 0.9 * h * iA; A.vy -= ny * 0.9 * h * iA; B.vx += nx * 0.9 * h * iB; B.vy += ny * 0.9 * h * iB;
          if (this.grindT <= 0) { this.grindT = 0.09; this.emit({ type: 'grind', x: A.x + nx * rA, y: A.y + ny * rA }); }
        } else { const p = 1.2 * h * mr; A.vx -= nx * p * iA; A.vy -= ny * p * iA; B.vx += nx * p * iB; B.vy += ny * p * iB; }
        return;
      }
      A.lastHit = B.lastHit = this.t;
      const defA = Math.max(0, Math.min(0.95, A.st.def + (A.eff.wall ? 0.4 : 0) - (A.eff.stun ? 0.15 : 0))), defB = Math.max(0, Math.min(0.95, B.st.def + (B.eff.wall ? 0.4 : 0) - (B.eff.stun ? 0.15 : 0)));
      const e = 0.8 - 0.25 * (defA + defB) / 2;
      let J = vn < 0 ? -(1 + e) * vn * mr : 0;
      J = Math.max(J, 0.35 * mr);                                         // ふれただけでも、少しはじく
      const atkA = (0.25 + A.st.atk * (1 + 0.9 * this.bump(A, phi))) * (A.eff.rush ? 1.7 : 1), atkB = (0.25 + B.st.atk * (1 + 0.9 * this.bump(B, phi + Math.PI))) * (B.eff.rush ? 1.7 : 1);
      // 当たった勢い（近づく速さ）と、こすれ（回転）で、はじく力（スマッシュ）
      const slipN = Math.min(1.2, slip / (W0 * BB.T.TOP_R * 1.6)), app = Math.min(1.5, Math.max(0, -vn) / 2);
      const kS = (this.S.smash || 1) * slipN * (0.45 + app);
      let SA = kS * atkA * (1 - 0.5 * defB), SB = kS * atkB * (1 - 0.5 * defA);   // SA：AがBに与える力
      // 反射：受ける力を、相手にはね返す
      if (B.eff.refl && SA > 0.05) { SB += SA * 1.5; SA *= 0.2; delete B.eff.refl; this.emit({ type: 'refl', i: 1 }); }
      if (A.eff.refl && SB > 0.05) { SA += SB * 1.5; SB *= 0.2; delete A.eff.refl; this.emit({ type: 'refl', i: 0 }); }
      A.vx -= nx * (J * iA + SB * iA); A.vy -= ny * (J * iA + SB * iA);
      B.vx += nx * (J * iB + SA * iB); B.vy += ny * (J * iB + SA * iB);
      // 横にそれる（こすれた向き）
      const Jt = 0.3 * Math.sign(slipS) * slipN * (1 - grip * 0.7) * (0.5 + app), tx = -ny, ty = nx;
      B.vx -= tx * Jt * iB; B.vy -= ty * Jt * iB; A.vx += tx * Jt * iA; A.vy += ty * Jt * iA;
      const imp = Math.abs(J) + SA + SB, rv = 0.6 + BB.rand() * 0.8;
      // 回転がへる・うばいあう（1回では少しだけ）
      // 防御の高い相手にぶつかると、こちらも回転を少し失う（かたい！）
      const lossA = Math.min(0.045, 0.006 * (Math.abs(J) * (0.4 + 0.9 * defB) + SB * 2.4) * (1 - 0.5 * A.st.sta) * (1 - 0.35 * defA)), lossB = Math.min(0.045, 0.006 * (Math.abs(J) * (0.4 + 0.9 * defA) + SA * 2.4) * (1 - 0.5 * B.st.sta) * (1 - 0.35 * defB));
      A.w *= 1 - lossA * rv; B.w *= 1 - lossB * (2 - rv);
      if (grip > 0.4) {          // 逆回り：強いほうが、弱いほうの回転をもらう
        const amt = 0.015 * grip * Math.min(Math.abs(A.w), Math.abs(B.w));
        if (Math.abs(A.w) * (1 + A.st.sta) > Math.abs(B.w) * (1 + B.st.sta)) { A.w += Math.sign(A.w) * amt * 0.6; B.w -= Math.sign(B.w) * amt; } else { B.w += Math.sign(B.w) * amt * 0.6; A.w -= Math.sign(A.w) * amt; }
      }
      for (const [X, Y] of [[A, B], [B, A]]) if (X.eff.drain) { const a = 0.06 * Math.abs(Y.w); Y.w -= Math.sign(Y.w) * a; X.w = Math.sign(X.w) * Math.min(X.w0, Math.abs(X.w) + a * 0.8); }
      if (A.eff.rush) delete A.eff.rush; if (B.eff.rush) delete B.eff.rush;
      // つっこみ中だった方は、はね返ったら、また回りだす
      for (const X of [A, B]) if (X.mode === 'dash') { X.mode = 'orbit'; X.mt = X.st.ax.dash ? rnd(X.st.ax.dash[0], X.st.ax.dash[1]) : 0; }
      // ロックがゆるむ（低い回転ほど、ゆるみやすい）。ぶつかり5回までは、バーストしない
      const lowA = 1.4 - Math.min(1, Math.abs(A.w) / W0), lowB = 1.4 - Math.min(1, Math.abs(B.w) / W0);
      A.lock -= (Math.pow(SB, 1.4) * 0.065 + Math.abs(J) * 0.003) * lowA * (1 - 0.4 * defA); B.lock -= (Math.pow(SA, 1.4) * 0.065 + Math.abs(J) * 0.003) * lowB * (1 - 0.4 * defB);
      A.hits++; B.hits++;
      if (A.hits < 5) A.lock = Math.max(0.05, A.lock); if (B.hits < 5) B.lock = Math.max(0.05, B.lock);
      A.gauge = Math.min(1, A.gauge + 0.025 + imp * 0.03); B.gauge = Math.min(1, B.gauge + 0.025 + imp * 0.03);
      A.kick = B.kick = this.t;
      // れんだ（1秒以内につづけて当たる）
      this.combo = this.t - this.lastHitT < 0.75 ? this.combo + 1 : 1; this.lastHitT = this.t;
      const tier = imp < TIER[0] ? 1 : imp < TIER[1] ? 2 : imp < TIER[2] ? 3 : 4;
      const cx = A.x + nx * rA, cy = A.y + ny * rA;
      this.emit({ type: 'hit', x: cx, y: cy, s: Math.round(imp * 100) / 100, tier, combo: this.combo, same: grip < 0.4, by: SA >= SB ? 0 : 1 });
      const hl = { t: this.t, nx, ny, x: cx, y: cy, crit: [0, 0] }; this.hitLog.push(hl); if (this.hitLog.length > 8) this.hitLog.shift();
      for (const X of [A, B]) {
        if (X.critReq == null || this.t < X.critReq) continue;
        if (X.critN === 1 && this.t - X.critReq <= 0.2) this.critHit(X.i, hl);
        else { if (X.critN === 1) { X.eff.stun = 0.5; this.emit({ type: 'miss', i: X.i, x: X.x, y: X.y }); } X.critReq = null; X.critN = 0; }   // 早すぎ：スキ
      }
      if (this.over) return;
      if (A.hits < 5) A.lock = Math.max(0.05, A.lock); if (B.hits < 5) B.lock = Math.max(0.05, B.lock);
      if (A.lock <= 0 && B.lock <= 0) { this.finish(A.lock < B.lock ? A : B, 'burst'); return; }
      if (A.lock <= 0) this.finish(A, 'burst'); else if (B.lock <= 0) this.finish(B, 'burst');
    }
    // 2つのコマが、あと何秒でぶつかりそうか（見た目の輪にも使う）
    static nearOf(F) {
      const [A, B] = F; if (A.state !== 'spin' || B.state !== 'spin') return null;
      const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1e-6, cl = -((B.vx - A.vx) * dx + (B.vy - A.vy) * dy) / d;
      const gap = d - (A.st.radius + B.st.radius) * 1.05;
      if (cl < 0.5 || gap > 0.5) return null;
      const tc = Math.max(0, gap) / cl; return tc < 0.6 ? { tc, x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } : null;
    }
    finish(f, why) {
      if (f.state !== 'spin') return;
      f.state = why; this.emit({ type: why, i: f.i, x: f.x, y: f.y, vx: f.vx, vy: f.vy });
      if (this.over) return;
      const o = this.f[1 - f.i];
      // 同時に相手も止まりそうなら、ひきわけ
      if (why === 'stop' && o.state === 'spin' && Math.abs(o.w) < W_STOP * 1.02) { o.state = 'stop'; this.emit({ type: 'stop', i: o.i, x: o.x, y: o.y }); this.end(-1, 'draw'); return; }
      this.end(o.i, why);
    }
    end(w, why) { this.over = true; this.winner = w; this.why = why; this.emit({ type: 'end', winner: w, why, pts: why === 'stop' ? 1 : why === 'draw' ? 0 : 2 }); }
    // 通信用：ようすを小さくまとめる
    pack() {
      const r = v => Math.round(v * 1000) / 1000;
      return this.f.map(f => [r(f.x), r(f.y), r(f.vx), r(f.vy), r(f.ang % TAU), Math.round(f.w * 10) / 10, r(f.wob), Math.round(f.gauge * 100) / 100, f.used ? 1 : 0, ['wait', 'spin', 'out', 'burst', 'stop'].indexOf(f.state), Object.keys(f.eff).join(','), f.rail ? 1 : 0, Math.round(f.w0), f.danger]).concat([this.final ? 1 : 0]);
    }
    unpack(arr) {
      for (let i = 0; i < 2; i++) { const a = arr[i], f = this.f[i]; if (!a) continue; [f.x, f.y, f.vx, f.vy, f.ang, f.w, f.wob, f.gauge] = a; f.used = !!a[8]; f.state = ['wait', 'spin', 'out', 'burst', 'stop'][a[9]] || 'spin'; f.eff = {}; for (const k of String(a[10] || '').split(',')) if (k) f.eff[k] = 1; f.rail = !!a[11]; if (a[12]) f.w0 = a[12]; f.danger = a[13] || 0; }
      this.final = !!arr[2];
    }
  }
  BB.Battle = Battle;
})();
