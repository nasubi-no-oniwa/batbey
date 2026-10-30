// =============================================
//  コマID：描いたコマをサーバーに保存して、8文字のIDで誰でもよび出せる（絵私と同じしくみ）
//
//  データの形（Firebase）
//    bb_c/{ID}   : { d: コマ, n: 名前, a: 作者, t: 作った時刻, u: 最後に使われた時刻, uses: 使われた回数, pub: 公開, par: 元にしたID }
//    bb_pub/{ID} : 公開したコマの一覧用 { n, a, t, u, uses, th: 小さい絵, rp: { 通報した人: true } }
//    bb_u/{ID}   : 最後に使われた時刻（いっぱいになったら、使われていない順に消すため）
//    bb_k/{ID}   : 消すためのかぎ（作ったスマホだけが知っている。だれも読めない）
//    bb_meta/n   : 保存されている数
// =============================================
(function () {
  const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';     // 0とO・1とI・L はまぎらわしいので使わない
  const LIMIT = 8000;                                 // これより多くなったら使われていない順に消す（1体 約0.2MB × 4000 ＝ 約0.8GB）
  const KEEP_DAYS = 3;                                // 作ってすぐのコマは消さない
  const TS = { '.sv': 'timestamp' };
  const rnd = (n, abc = ABC) => { const a = new Uint32Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 1e9; }); return Array.from(a, v => abc[v % abc.length]).join(''); };
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  BB.cleanId = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  BB.isId = s => /^[A-Z0-9]{8}$/.test(s) && [...s].every(c => ABC.includes(c));
  // Firebase（あいことば対戦と同じ場所）
  function loadScript(src) { return new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error(I18N.t('err_net'))); document.head.appendChild(el); }); }
  BB.getDb = async () => {
    if (BB._db) return BB._db;
    if (!BB.FIREBASE_CONFIG) throw new Error(I18N.t('err_prep'));
    const v = '10.12.2';
    if (!window.firebase || !firebase.database) {
      await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-database-compat.js');
    }
    if (!firebase.apps.length) firebase.initializeApp(BB.FIREBASE_CONFIG);
    return BB._db = firebase.database();
  };
  BB.deviceId = () => { let d = ls.get('bb_dev', null); if (!d) { d = rnd(12); ls.set('bb_dev', d); } return d; };

  // 一覧用の小さい絵（白い紙の上に、描いた所を切り出して）
  function thumb(ch) {
    const c = document.createElement('canvas'); c.width = c.height = 112;
    const x = c.getContext('2d'); x.fillStyle = '#1f2433'; x.fillRect(0, 0, 112, 112);
    const t = document.createElement('canvas'); t.width = t.height = 112; BB.drawTopIcon(ch, t); x.drawImage(t, 0, 0); t.width = 1;
    const s = c.toDataURL('image/jpeg', 0.72); c.width = c.height = 1; return s;
  }

  BB.Store = {
    db: null,
    async getDb() { if (!this.db) this.db = await BB.getDb(); return this.db; },
    mine() { return ls.get('bb_mine', []); },                       // このスマホで作ったコマ
    owns(id) { return !!ls.get('bb_own', {})[id]; },
    author() { return ls.get('bb_author', '') || (function () { try { return localStorage.getItem('bb-name') || ''; } catch (e) { return ''; } })(); },
    setAuthor(a) { ls.set('bb_author', String(a || '').trim().slice(0, 8)); },

    // 保存してIDをもらう
    async save(ch, opt = {}) {
      const db = await this.getDb();
      let d = BB.packTop(ch, 1);
      if (d.length > 440000) d = BB.packTop(ch, 0.6);      // 色が多くて大きいときは少し小さくして保存
      if (d.length > 440000) throw new Error(I18N.t('err_big'));
      const name = String(ch.name || '').slice(0, 8), a = String(opt.author || '').trim().slice(0, 8) || I18N.t('noname');
      const key = rnd(24);
      // コマ・かぎ・一覧・数を、1回でまとめて書く（数は「本当に増えたとき」しか増やせないルール）
      for (let tries = 0; tries < 8; tries++) {
        const id = rnd(8);
        const [ex, gone, meta] = await Promise.all(['bb_c/' + id + '/t', 'bb_gone/' + id, 'bb_meta'].map(p => db.ref(p).once('value').then(x => x.val())));
        if (ex || gone) continue;                       // 一度使われたIDは、二度と使わない
        const rec = { d, n: name, a, t: TS, u: TS, uses: 0, pub: !!opt.pub };
        if (opt.par && BB.isId(opt.par)) rec.par = opt.par;
        const up = {};
        up['bb_c/' + id] = rec; up['bb_k/' + id] = key; up['bb_u/' + id] = TS;
        if (opt.pub) up['bb_pub/' + id] = { n: name, a, t: TS, u: TS, uses: 0, th: thumb(ch) };
        up['bb_meta'] = { n: ((meta && meta.n) || 0) + 1, last: id };
        try { await db.ref().update(up); } catch (er) { continue; }   // 同時に保存した人がいたら、やりなおし
        const own = ls.get('bb_own', {}); own[id] = key; ls.set('bb_own', own);
        const mine = this.mine().filter(x => x.id !== id); mine.unshift({ id, name, t: Date.now(), pub: !!opt.pub }); ls.set('bb_mine', mine.slice(0, 50));
        this.tidy().catch(() => {});
        return id;
      }
      throw new Error(I18N.t('err_noid'));
    },
    // 消す（コマ・一覧・かぎを消して、「消えた理由」を残す。数も1へらす）
    async drop(id, why) {
      const db = await this.getDb();
      for (let tries = 0; tries < 5; tries++) {
        const meta = (await db.ref('bb_meta').once('value')).val() || { n: 1 };
        const up = {}; for (const p of ['bb_c/', 'bb_pub/', 'bb_u/', 'bb_k/']) up[p + id] = null;
        up['bb_gone/' + id] = { w: why, t: TS };
        up['bb_meta'] = { n: Math.max(0, (meta.n || 1) - 1), last: id };
        try { await db.ref().update(up); return true; } catch (e) {}
      }
      return false;
    },
    // 消えたIDのわけ
    async goneMsg(id) {
      const db = await this.getDb();
      const g = (await db.ref('bb_gone/' + id).once('value')).val();
      if (g && g.w === 'full') return I18N.t('gone_full');
      if (g && g.w === 'del') return I18N.t('gone_del');
      return I18N.t('gone_nf');
    },
    // まだあるか（タイトルや自分のID一覧で使う）
    async exists(id) { try { const db = await this.getDb(); return !!(await db.ref('bb_c/' + id + '/t').once('value')).val(); } catch (e) { return null; } },
    // IDでよぶ
    async load(id) {
      id = BB.cleanId(id); if (!BB.isId(id)) throw new Error(I18N.t('id_bad'));
      const db = await this.getDb();
      const s = await db.ref('bb_c/' + id).once('value'), v = s.val();
      if (!v || !v.d) throw new Error(await this.goneMsg(id));
      const ch = await BB.unpackTop(v.d);
      ch.id = id; ch.author = v.a || ''; ch.name = v.n || ch.name || '';
      return { ch, meta: { id, name: v.n || '', author: v.a || '', uses: v.uses || 0, pub: !!v.pub, t: v.t || 0 } };
    },
    // 使われた（一覧の人気順と、消す順番のため）
    async touch(id) {
      if (!BB.isId(id || '')) return;
      const now = Date.now(); this._t = this._t || {};
      if (this._t[id] && now - this._t[id] < 10 * 60e3) return;     // 同じコマは10分に1回だけ数える
      this._t[id] = now;
      try {
        const db = await this.getDb();
        const ex = (await db.ref('bb_c/' + id + '/t').once('value')).val(); if (!ex) return;
        const up = {}; up['bb_c/' + id + '/u'] = TS; up['bb_u/' + id] = TS;
        const pub = (await db.ref('bb_pub/' + id + '/t').once('value')).val(); if (pub) up['bb_pub/' + id + '/u'] = TS;
        await db.ref().update(up);
        await db.ref('bb_c/' + id + '/uses').transaction(n => (n || 0) + 1);
        if (pub) await db.ref('bb_pub/' + id + '/uses').transaction(n => (n || 0) + 1);
      } catch (e) {}
    },
    // みんなのコマ：sort は 't'（新しい順）か 'uses'（人気順）
    async list(sort, after) {
      const db = await this.getDb();
      let q = db.ref('bb_pub').orderByChild(sort);
      if (after) q = q.endBefore(after.v, after.id);
      const s = await q.limitToLast(30).once('value'), out = [];
      s.forEach(c => { const v = c.val(); out.push({ id: c.key, n: v.n || '', a: v.a || '', uses: v.uses || 0, t: v.t || 0, th: v.th || '', rp: v.rp ? Object.keys(v.rp).length : 0, v: v[sort] || 0 }); });
      out.reverse();
      const last = out[out.length - 1];
      return { items: out.filter(e => e.rp < 3), more: out.length >= 30 ? { v: last.v, id: last.id } : null };
    },
    async report(id) {
      const db = await this.getDb();
      await db.ref('bb_pub/' + id + '/rp/' + BB.deviceId()).set(true);
      const r = ls.get('bb_rep', []); r.push(id); ls.set('bb_rep', r.slice(-100));
    },
    reported(id) { return ls.get('bb_rep', []).includes(id); },
    // 作ったスマホから消す
    async remove(id) {
      const key = ls.get('bb_own', {})[id]; if (!key) throw new Error(I18N.t('del_own'));
      const db = await this.getDb();
      await db.ref('bb_del/' + id).set(key);
      const ok = await this.drop(id, 'del');
      await db.ref('bb_del/' + id).remove();
      if (!ok) throw new Error(I18N.t('del_net'));
      const own = ls.get('bb_own', {}); delete own[id]; ls.set('bb_own', own);
      ls.set('bb_mine', this.mine().filter(e => e.id !== id));
    },
    // 保管庫がいっぱいになったら、最後に使われたのがいちばん古いコマから消す
    async tidy() {
      const db = await this.getDb();
      const n = ((await db.ref('bb_meta').once('value')).val() || {}).n || 0;
      if (n <= LIMIT) return 0;
      const s = await db.ref('bb_u').orderByValue().limitToFirst(Math.min(5, n - LIMIT)).once('value');
      const old = []; s.forEach(c => { if (c.val() < Date.now() - KEEP_DAYS * 864e5) old.push(c.key); });
      let k = 0;
      for (const id of old) if (await this.drop(id, 'full')) k++;
      return k;
    },
    LIMIT
  };
})();
