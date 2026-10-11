// =============================================
//  バトベイ  あいことば対戦（Firebase Realtime Database）
//  0番の人（先に入った人）が試合を計算して、ようすを1秒に15回送る。
//  1番の人は「投票・向き・離した強さと時刻・スキル」を送るだけ。3人目からは観戦。
//
//  データの形： batbey/{あいことば}/
//    players/{0|1} : { id, name }      watchers/{id} : { name }      mode : 'normal' | 'raku'
//    ch/{0|1}      : コマ               ready/{0|1}   : 何試合目をやりたいか
//    game          : { round, phase: 'draw'|'play', drawEnd, setupEnd, startAt, raku }   0番の人が書く
//    rch/m{試合}/{0|1}   : らくがきバトルで描いたコマ
//    st            : 試合のようす（0番の人が書く）
//    cmd/m{試合}/{自動ID} : 1番の人の操作 { k, ... }
//    cheer/m{試合}/{自動ID} : 応援スタンプ { e, n, t }
// =============================================
(function () {
  const clean = s => String(s || '').replace(/[.#$\[\]\/\s]/g, '').slice(0, 20);
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const DRAW_MS = 60000, SETUP_MS = 20000;
  class Room {
    constructor(db, code, name, topStr, cb, want) {
      this.db = db; this.code = clean(code); this.name = (String(name || '').trim().slice(0, 8)) || 'ななし';
      this.want = want === 'raku' ? 'raku' : 'normal'; this.mode = this.want; this.topStr = topStr; this.cb = cb || {};
      this.id = uid(); this.slot = -1; this.watching = false; this.players = {}; this.ready = {}; this.chars = {}; this.rch = {};
      this.game = null; this.round = 0; this.subs = []; this.evSubs = []; this.offset = 0; this.left = false;
      this.root = db.ref('batbey/' + this.code);
    }
    call(n, ...a) { if (this.cb[n]) this.cb[n](...a); }
    now() { return Date.now() + this.offset; }
    on(ref, ev, fn) { ref.on(ev, fn); this.subs.push([ref, ev, fn]); }
    async join() {
      if (!this.code) throw new Error('あいことばを入れてください');
      this.on(this.db.ref('.info/serverTimeOffset'), 'value', s => { this.offset = s.val() || 0; });
      for (const s of [0, 1]) {
        const res = await this.root.child('players/' + s).transaction(cur => (cur ? undefined : { id: this.id, name: this.name }));
        if (res.committed && res.snapshot.val() && res.snapshot.val().id === this.id) { this.slot = s; break; }
      }
      if (this.slot < 0) {
        const w = (await this.root.child('watchers').once('value')).val() || {};
        if (Object.keys(w).length >= 10) throw new Error('この部屋は観戦の人でいっぱいです（10人まで）');
        this.watching = true; const me = this.root.child('watchers/' + this.id); await me.set({ name: this.name }); me.onDisconnect().remove();
        this.mode = (await this.root.child('mode').once('value')).val() === 'raku' ? 'raku' : 'normal';
      } else {
        const s = this.slot;
        for (const k of ['players/', 'ready/', 'ch/']) this.root.child(k + s).onDisconnect().remove();
        const other = (await this.root.child('players/' + (1 - s)).once('value')).val();
        if (!other) await this.root.child('mode').set(this.want);
        if (this.topStr) await this.root.child('ch/' + s).set(this.topStr);
        const g0 = (await this.root.child('game').once('value')).val(); this.joinRound = ((g0 && g0.round) || 0) + 1;
      }
      this.on(this.root.child('mode'), 'value', snap => { const m = snap.val() === 'raku' ? 'raku' : 'normal'; if (m !== this.mode) { this.mode = m; this.call('onMode', m); } });
      this.on(this.root.child('players'), 'value', snap => {
        const prev = this.players; this.players = snap.val() || {}; this.call('onPeople', this.people());
        if (!this.watching && this.game && prev[1 - this.slot] && !this.players[1 - this.slot]) this.call('onLeft');
        this.tryStart();
      });
      this.on(this.root.child('watchers'), 'value', snap => this.call('onWatchers', Object.keys(snap.val() || {}).length));
      this.on(this.root.child('ch'), 'value', snap => { this.chars = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('ready'), 'value', snap => { this.ready = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('game'), 'value', snap => this.onGame(snap.val()));
      if (this.slot !== 0) this.on(this.root.child('st'), 'value', snap => { const v = snap.val(); if (v) this.call('onState', v); });
      if (this.slot >= 0) await this.root.child('ready/' + this.slot).set(this.joinRound);
      return { slot: this.slot, code: this.code, mode: this.mode, watching: this.watching };
    }
    people() { return { names: [0, 1].map(s => (this.players[s] ? this.players[s].name : null)), slot: this.slot, watching: this.watching }; }
    tryStart() {
      if (this.slot !== 0 || this.left || !this.joinRound) return;
      const r = this.ready || {}, next = (this.game ? this.game.round : 0) + 1, raku = this.mode === 'raku';
      if (!this.players[0] || !this.players[1] || (!raku && (!this.chars[0] || !this.chars[1]))) return;
      if (!(r[0] >= next && r[1] >= next) || this.starting === next) return;
      this.starting = next;
      if (raku) { const de = this.now() + 3000 + (BB.DRAW_MS || DRAW_MS); this.root.child('game').set({ round: next, phase: 'draw', drawEnd: de, setupEnd: de + (BB.SETUP_MS || SETUP_MS), startAt: de }); }
      else this.root.child('game').set({ round: next, phase: 'play', startAt: this.now() + 1500 });
      if (next > 2) for (const k of ['cmd/', 'rch/', 'cheer/']) this.root.child(k + 'm' + (next - 2)).remove();
    }
    async onGame(g) {
      if (!g || this.left) { this.game = g; return; }
      const key = g.round + ':' + g.phase; if (this.gameKey === key) return;
      this.gameKey = key; this.game = g;
      if (this.joinRound && g.round < this.joinRound) return;
      this.round = g.round; const MK = 'm' + g.round;
      if (g.phase === 'draw') {
        this.off(); this.listenCheer(MK); this.rch = {};
        const rref = this.root.child('rch/' + MK), rfn = snap => { this.rch = snap.val() || {}; this.checkDrawn(); };
        rref.on('value', rfn); this.evSubs.push([rref, 'value', rfn]);
        clearInterval(this.drawTm); if (this.slot === 0) this.drawTm = setInterval(() => this.checkDrawn(), 1000);
        this.call('onDraw', { round: g.round, drawEnd: g.drawEnd, setupEnd: g.setupEnd, slot: this.slot, names: this.people().names });
        return;
      }
      clearInterval(this.drawTm);
      if (!g.raku) { this.off(); }
      this.listenCheer(MK);
      let tops = [this.chars[0], this.chars[1]];
      if (g.raku) { const v = (await this.root.child('rch/' + MK).once('value')).val() || {}; tops = [v[0] || null, v[1] || null]; if (this.left || this.gameKey !== key) return; }
      if (this.slot === 0) { const cref = this.root.child('cmd/' + MK), cfn = snap => this.call('onCmd', snap.val()); cref.on('child_added', cfn); this.evSubs.push([cref, 'child_added', cfn]); }
      this.call('onStart', { round: g.round, slot: this.slot, watching: this.watching, raku: !!g.raku, wait: Math.max(0, g.startAt - this.now()), names: this.people().names, tops });
    }
    off() { for (const [ref, ev, fn] of this.evSubs) ref.off(ev, fn); this.evSubs = []; this.cheerMK = null; }
    listenCheer(MK) {
      if (this.cheerMK === MK) return; this.cheerMK = MK; const since = this.now() - 1500;
      const cref = this.root.child('cheer/' + MK), cfn = snap => { const v = snap.val(); if (v && (v.t || 0) >= since) this.call('onCheer', v); };
      cref.on('child_added', cfn); this.evSubs.push([cref, 'child_added', cfn]);
    }
    checkDrawn() {
      const g = this.game; if (this.slot !== 0 || !g || g.phase !== 'draw' || this.left) return;
      if (!(this.rch[0] && this.rch[1]) && this.now() < g.setupEnd + 6000) return;
      clearInterval(this.drawTm);
      this.root.child('game').set({ round: g.round, phase: 'play', raku: true, startAt: this.now() + 4500 });
    }
    submitDraw(str) { if (!this.left && !this.watching && this.round) this.root.child('rch/m' + this.round + '/' + this.slot).set(str); }
    sendState(o) { if (this.slot === 0 && !this.left) this.root.child('st').set(JSON.stringify(o)); }
    sendCmd(c) { if (this.slot === 1 && !this.left && this.round) this.root.child('cmd/m' + this.round).push(c); }
    cheer(e) { if (!this.left && this.round) this.root.child('cheer/m' + this.round).push({ e, n: this.name, t: this.now() }); }
    rematch() { if (this.slot >= 0) this.root.child('ready/' + this.slot).set(this.round + 1); }
    leave() {
      if (this.left) return; this.left = true; clearInterval(this.drawTm);
      for (const [ref, ev, fn] of this.subs.concat(this.evSubs)) ref.off(ev, fn); this.subs = []; this.evSubs = [];
      if (this.watching) this.root.child('watchers/' + this.id).remove();
      else if (this.slot >= 0) { for (const k of ['players/', 'ready/', 'ch/']) this.root.child(k + this.slot).remove(); if (this.slot === 0) this.root.child('st').remove(); }
    }
  }
  BB.Room = Room; BB.cleanCode = clean;
})();
