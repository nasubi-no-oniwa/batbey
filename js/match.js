// =============================================
//  バトベイ  試合の進み方（CPU戦と、あいことば対戦の「0番の人」が動かす）
//  投票 → ラウンド（向き → 3・2・1・まわせ！ → バトル → 決着）→ 3点先取
//  時刻はすべて「サーバーの時刻」（ms）。CPU戦ではそのままの時刻
// =============================================
window.BB = window.BB || {};
(function () {
  const KEYS = ['std', 'deep', 'flat'];
  const WIN = 3;
  BB.MATCH = { T_VOTE: 12000, T_INTRO: 1600, T_AIM: 2600, T_COUNT: 3200, T_END: 2600, WIN, KEYS };
  // 離したタイミング → 種類
  BB.judge = (releaseAt, goAt) => {
    const d = releaseAt - goAt;
    if (d < -60) return { timing: 'early', delay: 0 };
    if (d <= 230) return { timing: 'perfect', delay: 0 };
    if (d <= 650) return { timing: 'good', delay: 0 };
    return { timing: 'late', delay: Math.min(1.2, (d - 650) / 1000) };
  };
  class Match {
    // tops: [{ prof, st }]（解析ずみ）
    constructor(tops, now) {
      this.tops = tops; this.score = [0, 0]; this.round = 0; this.votes = [null, null];
      this.phase = 'vote'; this.until = now + BB.MATCH.T_VOTE; this.stage = null; this.battle = null; this.launch = [null, null]; this.aim = [0, 0];
      this.events = []; this.seq = 0; this.result = null; this.winner = null; this.ts = 1; this.freeze = 0; this.slowT = 0; this.slowK = 1; this.hsCool = 0; this.cheerT = [0, 0];
    }
    emit(e) { e.id = ++this.seq; this.events.push(e); }
    vote(slot, arr) { if (this.phase !== 'vote' || !Array.isArray(arr)) return; this.votes[slot] = arr.filter(k => KEYS.includes(k)).slice(0, 2); if (this.votes[0] && this.votes[1]) this.until = Math.min(this.until, (this.now || Date.now()) + 600); }
    setAim(slot, a) { if (this.phase === 'aim' || this.phase === 'count') this.aim[slot] = Math.max(-1, Math.min(1, +a || 0)); }
    release(slot, o) { if (this.phase !== 'count' && this.phase !== 'battle') return; if (this.launch[slot]) return; this.launch[slot] = { power: Math.max(0, Math.min(1.3, +o.power || 0)), at: +o.at || 0 }; }
    skill(slot) { if (this.phase === 'battle' && this.battle) this.battle.useSkill(slot); }
    // 応援：n 回ぶん（1秒に6回まで）
    cheer(slot, n, now) {
      if (this.phase !== 'battle' || !this.battle) return;
      const t = now || this.now || 0, allow = Math.max(0, Math.floor((t - this.cheerT[slot]) / 1000 * 6));
      const k = Math.min(Math.max(0, n | 0), allow, 4); if (!k) return;
      this.cheerT[slot] = Math.max(this.cheerT[slot], t - 1000) + k * 1000 / 6;
      this.battle.cheer(slot, k);
    }
    // ヒットストップ・スロー（試合の計算そのものを止める／ゆっくりにする → 全員が同じものを見る）
    hitFx(e) {
      if (e.type === 'hit' && e.tier >= 3 && this.hsCool <= 0) {
        this.freeze = Math.max(this.freeze, e.tier >= 4 ? 0.11 : 0.06); this.hsCool = 0.5;
        if (e.tier >= 4) { this.slowT = Math.max(this.slowT, 0.7); this.slowK = 0.3; }
      }
      if (e.type === 'burst' || e.type === 'out') { this.freeze = 0.12; this.slowT = 1.2; this.slowK = 0.25; }
    }
    pickStage() {
      // 票が多いスタジアム。同じならランダム
      const n = { std: 0, deep: 0, flat: 0 };
      for (const v of this.votes) for (const k of v || KEYS.slice(0, 2)) n[k]++;
      const max = Math.max(...Object.values(n)), top = KEYS.filter(k => n[k] === max);
      this.stage = top[Math.floor(BB.rand() * top.length)]; this.tally = n;
      this.emit({ type: 'stage', stage: this.stage, tally: n, tie: top.length > 1 });
    }
    newRound(now) {
      this.round++; this.launch = [null, null]; this.aim = [0, 0];
      this.battle = new BB.Battle(this.tops, this.stage);
      this.phase = 'intro'; this.until = now + BB.MATCH.T_INTRO; this.ts = 1; this.freeze = 0; this.slowT = 0; this.cheerT = [0, 0]; this.emit({ type: 'round', round: this.round });
    }
    // now：サーバーの時刻
    step(dt, now) {
      this.now = now;
      if (this.phase === 'over') return;
      if (this.phase === 'vote' && now >= this.until) { this.pickStage(); this.newRound(now + 2200); return; }
      if (this.phase === 'intro' && now >= this.until) { this.phase = 'aim'; this.until = now + BB.MATCH.T_AIM; return; }
      if (this.phase === 'aim' && now >= this.until) { this.phase = 'count'; this.goAt = now + BB.MATCH.T_COUNT; this.until = this.goAt; this.emit({ type: 'count', goAt: this.goAt }); return; }
      if (this.phase === 'count' || this.phase === 'battle') {
        // 「まわせ！」から少したったら、離していない人は自動で（おそい）
        for (const i of [0, 1]) if (!this.launch[i] && now > this.goAt + 1600) this.launch[i] = { power: 0.55, at: now };
        if (this.phase === 'count' && now >= this.goAt) { this.phase = 'battle'; this.emit({ type: 'go' }); }
        if (this.phase === 'battle') {
          const b = this.battle;
          for (const i of [0, 1]) if (this.launch[i] && !this.launch[i].done) {
            const L = this.launch[i], j = BB.judge(L.at, this.goAt); L.done = true;
            b.launch(i, { power: L.power, timing: j.timing, aim: this.aim[i], delay: j.delay + Math.max(0, (now - this.goAt) / 1000 - (b.t || 0)) * 0 });
            this.emit({ type: 'launch', i, timing: j.timing, power: L.power });
          }
          if (this.launch[0] && this.launch[1]) {
            this.hsCool -= dt;
            let bdt = dt;
            if (this.freeze > 0) { this.freeze -= dt; bdt = 0; this.ts = 0; }
            else if (this.slowT > 0) { this.slowT -= dt; bdt = dt * this.slowK; this.ts = this.slowK; }
            else this.ts = 1;
            if (bdt > 0) b.step(bdt);
            for (const e of b.events) { this.hitFx(e); this.emit(Object.assign({}, e, { bt: e.t })); }
            b.events = [];
            if (b.over) {
              const w = b.winner, pts = b.why === 'stop' ? 1 : b.why === 'draw' ? 0 : 2;
              if (w >= 0) this.score[w] += pts;
              this.result = { winner: w, why: b.why, pts }; this.phase = 'end'; this.until = now + BB.MATCH.T_END;
              this.emit({ type: 'roundEnd', winner: w, why: b.why, pts, score: this.score.slice() });
            }
          }
        }
        return;
      }
      if (this.phase === 'end' && now >= this.until) {
        if (this.score[0] >= WIN || this.score[1] >= WIN) { this.phase = 'over'; this.winner = this.score[0] >= WIN ? 0 : 1; this.emit({ type: 'over', winner: this.winner, score: this.score.slice() }); }
        else this.newRound(now);
      }
    }
    // 通信用
    pack(now) {
      return { ph: this.phase, u: this.until - now, g: this.goAt ? this.goAt - now : null, st: this.stage, sc: this.score, rd: this.round, v: this.votes.map(v => !!v), a: this.aim.map(a => Math.round(a * 100) / 100),
        l: this.launch.map(l => (l ? 1 : 0)), b: this.battle && this.phase !== 'intro' ? this.battle.pack() : null, bt: this.battle ? Math.round(this.battle.t * 100) / 100 : 0, r: this.result, w: this.winner, ts: this.ts };
    }
  }
  BB.Match = Match;
})();
