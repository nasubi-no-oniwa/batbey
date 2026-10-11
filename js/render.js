// =============================================
//  バトベイ  3D表示
//  ・まわりの映りこみ（HDR）で金属をピカッと
//  ・スタジアムは傷のあるプラスチック、コマの重りと軸は金属
//  ・描いた絵が、そのままコマのリングになる
// =============================================
window.BB = window.BB || {};
(function () {
  const TAU = Math.PI * 2;
  const asset = p => (BB.ASSETS && BB.ASSETS[p]) || ('assets/' + p);
  // RGBE（HDRの色の形）→ 浮動小数の画像
  function rgbeTexture(buf, w, h) {
    const src = new Uint8Array(buf), out = new Float32Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const e = src[i * 4 + 3], f = e ? Math.pow(2, e - 136) : 0;
      out[i * 4] = src[i * 4] * f; out[i * 4 + 1] = src[i * 4 + 1] * f; out[i * 4 + 2] = src[i * 4 + 2] * f; out[i * 4 + 3] = 1;
    }
    const t = new THREE.DataTexture(out, w, h, THREE.RGBAFormat, THREE.FloatType);
    t.mapping = THREE.EquirectangularReflectionMapping; t.flipY = true; t.needsUpdate = true; t.magFilter = t.minFilter = THREE.LinearFilter;
    return t;
  }
  async function loadBin(p) {
    const u = asset(p);
    if (u.startsWith('data:')) { const b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a.buffer; }
    const r = await fetch(u); return r.arrayBuffer();
  }
  const texLoader = new THREE.TextureLoader();
  function tex(p, rep, srgb) { const t = texLoader.load(asset(p)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

  // すり鉢の深さ（見た目）
  const LOOK = {
    std: { depth: 0.13, wall: 0.06, tint: '#2f6fd6', line: '#bfe0ff' },
    deep: { depth: 0.24, wall: 0.11, tint: '#6d3fd6', line: '#e2d4ff' },
    flat: { depth: 0.05, wall: 0.028, tint: '#e0641a', line: '#ffe0c2' }
  };
  BB.LOOK = LOOK;
  const surfY = (st, r) => -LOOK[st].depth * (1 - Math.min(1, r) ** 2);

  class Render {
    constructor(canvas) {
      this.cv = canvas;
      this.quality = (function () { try { return localStorage.getItem('bb_q') || 'auto'; } catch (e) { return 'auto'; } })();
      this.hi = this.quality !== 'lo';
      this.make();
    }
    make() {
      const hi = this.hi;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.cv, antialias: hi, powerPreference: 'high-performance' });
      const r = this.renderer;
      r.setPixelRatio(Math.min(hi ? 2 : 1, window.devicePixelRatio || 1));
      r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      r.shadowMap.enabled = hi; r.shadowMap.type = THREE.PCFSoftShadowMap;
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#0b0d14'); this.scene.fog = new THREE.Fog('#0b0d14', 6, 14);
      this.camera = new THREE.PerspectiveCamera(38, 1, 0.02, 50);
      this.world = new THREE.Group(); this.scene.add(this.world);
      // 光：上からのスポット＋左右の色つきの光
      const hemi = new THREE.HemisphereLight('#c9d6ff', '#1a1410', 0.35); this.scene.add(hemi);
      const key = this.key = new THREE.SpotLight('#ffffff', 26, 9, 0.55, 0.45, 1.4); key.position.set(0.6, 4.2, 1.4); key.target.position.set(0, 0, 0);
      key.castShadow = hi; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.camera.near = 1; key.shadow.camera.far = 8;
      this.scene.add(key, key.target);
      this.rimA = new THREE.PointLight('#5aa9ff', 3.2, 6, 1.6); this.rimA.position.set(-2.4, 1.2, -1.6); this.scene.add(this.rimA);
      this.rimB = new THREE.PointLight('#ff7a3a', 2.6, 6, 1.6); this.rimB.position.set(2.4, 1.0, -1.2); this.scene.add(this.rimB);
      // 床（まわりの暗いマット）
      const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshStandardMaterial({ color: '#15171f', roughness: 0.92, metalness: 0 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = -0.42; floor.receiveShadow = hi; this.scene.add(floor);
      // 質感
      this.T = {
        pc: tex('plastic_c.jpg', 3, true), pn: tex('plastic_n.jpg', 3), pr: tex('plastic_r.jpg', 3),
        mc: tex('metal_c.jpg', 1, true), mn: tex('metal_n.jpg', 1), mr: tex('metal_r.jpg', 1)
      };
      this.sparks = []; this.flashes = []; this.pieces = []; this.tops = [null, null]; this.stage = null;
      this.envReady = loadBin('env.rgbe').then(buf => {
        const pm = new THREE.PMREMGenerator(this.renderer), t = rgbeTexture(buf, 512, 256);
        this.scene.environment = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose();
      }).catch(() => {});
      this.sparkTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,220,140,.9)'); g.addColorStop(1, 'rgba(255,120,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
      this.resize();
    }
    setQuality(q) { try { localStorage.setItem('bb_q', q); } catch (e) {} this.quality = q; }
    resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }

    // ---------- スタジアム ----------
    buildStage(key) {
      if (this.stageGroup) { this.world.remove(this.stageGroup); this.stageGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map && o.material.map.isCanvasTexture) o.material.map.dispose(); }); }
      this.stage = key; const L = LOOK[key], S = BB.STAGES[key], g = this.stageGroup = new THREE.Group(); this.world.add(g);
      const hi = this.hi;
      // すり鉢：まるい網目（上から見たままの UV）
      const NR = 26, NP = 96, pos = [], uv = [], idx = [];
      for (let i = 0; i <= NR; i++) for (let j = 0; j <= NP; j++) {
        const r = i / NR * 1.02, a = j / NP * TAU, x = Math.cos(a) * r, z = Math.sin(a) * r;
        pos.push(x, surfY(key, r), z); uv.push(x / 2.2 + 0.5, 0.5 - z / 2.2);
      }
      for (let i = 0; i < NR; i++) for (let j = 0; j < NP; j++) { const a = i * (NP + 1) + j, b = a + NP + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      // 床の模様（線・まる・ロゴ）
      const mc = document.createElement('canvas'); mc.width = mc.height = 1024; const x = mc.getContext('2d');
      x.fillStyle = L.tint; x.fillRect(0, 0, 1024, 1024);
      const gr = x.createRadialGradient(512, 512, 40, 512, 512, 470); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); x.fillStyle = gr; x.fillRect(0, 0, 1024, 1024);
      x.strokeStyle = L.line; x.globalAlpha = 0.55; x.lineWidth = 6;
      for (const rr of [120, 260, 400]) { x.beginPath(); x.arc(512, 512, rr * 465 / 400 * 0.86, 0, TAU); x.stroke(); }
      x.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.moveTo(512 + Math.cos(a) * 120, 512 + Math.sin(a) * 120); x.lineTo(512 + Math.cos(a) * 455, 512 + Math.sin(a) * 455); x.stroke(); }
      x.globalAlpha = 0.9; x.fillStyle = L.line; x.font = '900 64px "Dela Gothic One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BATBEY', 512, 512 - 300); x.save(); x.translate(512, 812); x.rotate(Math.PI); x.fillText('BATBEY', 0, 0); x.restore();
      // 出口（スタンダード）
      for (const [c, w] of S.pockets) { const a = c * Math.PI / 180; x.save(); x.translate(512 + Math.cos(a) * 452, 512 + Math.sin(a) * 452); x.rotate(a); x.fillStyle = 'rgba(10,10,14,.85)'; x.fillRect(-22, -40, 44, 80); x.restore(); }
      x.globalAlpha = 1;
      const mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace; mt.anisotropy = 8;
      const mat = new THREE.MeshPhysicalMaterial({ map: mt, normalMap: this.T.pn, normalScale: new THREE.Vector2(0.35, 0.35), roughnessMap: this.T.pr, roughness: 0.55, metalness: 0, clearcoat: hi ? 0.6 : 0, clearcoatRoughness: 0.25, envMapIntensity: 0.8 });
      const bowl = new THREE.Mesh(geo, mat); bowl.receiveShadow = hi; g.add(bowl);
      // かべ（出口のところは切れている）
      const wallMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(L.tint).multiplyScalar(0.55), normalMap: this.T.pn, normalScale: new THREE.Vector2(0.4, 0.4), roughnessMap: this.T.pr, roughness: 0.5, metalness: 0.05, clearcoat: hi ? 0.7 : 0, clearcoatRoughness: 0.2 });
      const lipMat = new THREE.MeshStandardMaterial({ color: '#c9ced8', metalness: 1, roughness: 0.32, map: this.T.mc, normalMap: this.T.mn, roughnessMap: this.T.mr, envMapIntensity: 1.3 });
      const y0 = surfY(key, 1.0), top = y0 + L.wall, outerY = -0.4;
      const wallP = [new THREE.Vector2(1.0, y0 - 0.01), new THREE.Vector2(1.0, top)];
      const lipP = [new THREE.Vector2(1.0, top), new THREE.Vector2(1.035, top + 0.012), new THREE.Vector2(1.12, top + 0.012), new THREE.Vector2(1.15, top - 0.01), new THREE.Vector2(1.17, outerY)];
      // 角度（sim の向き α）→ three の Lathe の角度 φ（x＝sinφ, z＝cosφ）＝ π/2 − α
      const segs = [];
      if (!S.pockets.length) segs.push([0, TAU]);
      else {
        const gaps = S.pockets.map(([c, w]) => [(c - w / 2) * Math.PI / 180, (c + w / 2) * Math.PI / 180]).sort((p, q) => p[0] - q[0]);
        for (let i = 0; i < gaps.length; i++) { const a0 = gaps[i][1], a1 = gaps[(i + 1) % gaps.length][0] + (i === gaps.length - 1 ? TAU : 0); segs.push([Math.PI / 2 - a1, a1 - a0]); }
      }
      for (const [st, len] of segs) {
        const wl = new THREE.Mesh(new THREE.LatheGeometry(wallP, 72, st, len), wallMat); wl.receiveShadow = hi; g.add(wl);
        const lip = new THREE.Mesh(new THREE.LatheGeometry(lipP, 72, st, len), lipMat); lip.castShadow = hi; lip.receiveShadow = hi; g.add(lip);
      }
      wallMat.side = THREE.DoubleSide;
      // 外の台
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.3, 0.06, 64), new THREE.MeshStandardMaterial({ color: '#1d2130', roughness: 0.6, metalness: 0.3 })); base.position.y = -0.41; base.receiveShadow = hi; g.add(base);
      // 加速レール（光るみぞ）
      this.railMat = null;
      if (S.rail) {
        const r0 = S.rail[0] + 0.025, r1 = S.rail[1] - 0.025, mid = (r0 + r1) / 2;
        const rg = new THREE.RingGeometry(r0, r1, 120, 1); rg.rotateX(-Math.PI / 2);
        const p = rg.attributes.position; for (let k = 0; k < p.count; k++) { const rr = Math.hypot(p.getX(k), p.getZ(k)); p.setY(k, surfY(key, rr) + 0.004); }
        const rc = document.createElement('canvas'); rc.width = 512; rc.height = 16; const rx = rc.getContext('2d');
        for (let i = 0; i < 24; i++) { const gx = rx.createLinearGradient(i * 512 / 24, 0, (i + 1) * 512 / 24, 0); gx.addColorStop(0, 'rgba(120,230,255,0)'); gx.addColorStop(0.8, 'rgba(160,240,255,.9)'); gx.addColorStop(1, 'rgba(255,255,255,1)'); rx.fillStyle = gx; rx.fillRect(i * 512 / 24, 2, 512 / 24, 12); }
        const rt = new THREE.CanvasTexture(rc); rt.wrapS = THREE.RepeatWrapping;
        // UV：角度ぐるり
        const uv = rg.attributes.uv; for (let k = 0; k < p.count; k++) { const a = Math.atan2(p.getZ(k), p.getX(k)); uv.setXY(k, (a / TAU + 1) % 1, Math.hypot(p.getX(k), p.getZ(k)) > mid ? 1 : 0); }
        this.railMat = new THREE.MeshBasicMaterial({ map: rt, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, color: '#7fe3ff' });
        const rm = new THREE.Mesh(rg, this.railMat); rm.renderOrder = 1; g.add(rm); this.railGlow = 0;
        // みぞのふち（金属）
        for (const rr of [r0 - 0.01, r1 + 0.01]) { const tg = new THREE.TorusGeometry(rr, 0.006, 6, 120); tg.rotateX(Math.PI / 2); const tm = new THREE.Mesh(tg, lipMat); tm.position.y = surfY(key, rr) + 0.004; g.add(tm); }
      }
      this.rimA.color.set('#5aa9ff'); this.rimB.color.set(S.color);
    }

    // ---------- コマ ----------
    buildTop(i, top, an) {
      if (this.tops[i]) this.dropTop(i);
      const hi = this.hi, T = BB.T, s = T.TOP_R / T.R_PX, NA = an.prof.length;
      const shape = new THREE.Shape();
      for (let a = 0; a < NA; a++) { const th = a / NA * TAU, r = Math.max(an.prof[a], T.HUB_PX / T.R_PX) * T.TOP_R; const px = Math.cos(th) * r, py = -Math.sin(th) * r; a ? shape.lineTo(px, py) : shape.moveTo(px, py); }
      shape.closePath();
      const H = 0.03, D = T.D;
      const uvGen = { generateTopUV: (g, v, a, b, c) => [a, b, c].map(k => new THREE.Vector2((v[k * 3] / s + T.C) / D, 1 - (-v[k * 3 + 1] / s + T.C) / D)),
        generateSideWallUV: (g, v, a, b, c, d) => [a, b, c, d].map((k, n) => new THREE.Vector2(n === 0 || n === 3 ? 0 : 1, n < 2 ? 0 : 1)) };
      const geo = new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: hi ? 3 : 1, curveSegments: 1, UVGenerator: uvGen });
      geo.rotateX(-Math.PI / 2);   // 上を向いた円盤（y が上）
      const img = new THREE.CanvasTexture(top.layer); img.colorSpace = THREE.SRGBColorSpace; img.anisotropy = 8;
      const edge = avgColor(top.layer);
      const capMat = new THREE.MeshPhysicalMaterial({ map: img, roughness: 0.35, metalness: 0.15, clearcoat: hi ? 1 : 0.3, clearcoatRoughness: 0.12, envMapIntensity: 1.1 });
      const sideMat = new THREE.MeshStandardMaterial({ color: edge.multiplyScalar(0.8), metalness: 0.85, roughness: 0.28, map: this.T.mc, normalMap: this.T.mn, envMapIntensity: 1.4 });
      const ring = new THREE.Mesh(geo, [capMat, sideMat]); ring.castShadow = hi; ring.receiveShadow = hi;
      const st = BB.stats(top, an);
      // 重り（金属）：重さのポイントで厚くなる
      const wh = 0.012 + 0.016 * st.wgt, wr = Math.max(0.05, T.TOP_R * Math.min(an.mean, 0.8) * 0.82);
      const metal = new THREE.MeshStandardMaterial({ color: '#d7dbe3', metalness: 1, roughness: 0.22, map: this.T.mc, normalMap: this.T.mn, roughnessMap: this.T.mr, envMapIntensity: 1.6 });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr * 0.92, wh, 48), metal); disc.castShadow = hi;
      // 軸（とがり）
      const tipH = 0.034; let tip;
      if (top.axis === 'atk') { tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, tipH, 24), new THREE.MeshStandardMaterial({ color: '#16171c', roughness: 0.85 })); tip.position.y = tipH / 2; }
      else if (top.axis === 'sta') { tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, tipH, 24), metal); tip.rotation.x = Math.PI; tip.position.y = tipH / 2; }
      else { tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 24, 16), new THREE.MeshStandardMaterial({ color: '#e8eaf0', metalness: 0.6, roughness: 0.2 })); tip.scale.y = 0.85; tip.position.y = 0.017; }
      tip.castShadow = hi;
      const hubR = T.HUB_PX / T.R_PX * T.TOP_R;
      const hubTex = hubCanvas(top.spin, edge); const hub = new THREE.Mesh(new THREE.CylinderGeometry(hubR * 0.95, hubR, 0.012, 32), [new THREE.MeshStandardMaterial({ color: '#c9ced8', metalness: 1, roughness: 0.25 }), new THREE.MeshPhysicalMaterial({ map: hubTex, roughness: 0.3, clearcoat: 1 }), new THREE.MeshStandardMaterial({ color: '#888' })]);
      disc.position.y = tipH + wh / 2; ring.position.y = tipH + wh - 0.004; hub.position.y = ring.position.y + H + 0.012;
      // 回っているときの、ぶれ（同心円の色）
      const blurTex = blurCanvas(top.layer); const blur = new THREE.Mesh(new THREE.CircleGeometry(T.TOP_R * 1.02, 64), new THREE.MeshBasicMaterial({ map: blurTex, transparent: true, opacity: 0, depthWrite: false }));
      blur.rotation.x = -Math.PI / 2; blur.position.y = ring.position.y + H + 0.0075; blur.renderOrder = 2;
      const spin = new THREE.Group(); spin.add(disc, ring, tip, hub);
      const tilt = new THREE.Group(); tilt.add(spin, blur);
      const root = new THREE.Group(); root.add(tilt);
      // 足もとの丸い影（かるい画質のとき）
      const sh = new THREE.Mesh(new THREE.CircleGeometry(T.TOP_R * 1.1, 32), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: hi ? 0.18 : 0.35, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.003;
      root.add(sh);
      // 足もとの「回転の輪」：残りの回転の量だけ、ぐるっと光る
      const NS = 64, sg = new THREE.RingGeometry(T.TOP_R * 1.18, T.TOP_R * 1.32, NS, 1, Math.PI / 2, -TAU); sg.rotateX(-Math.PI / 2);
      const sm = new THREE.MeshBasicMaterial({ color: '#33c7ff', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const sring = new THREE.Mesh(sg, sm); sring.position.y = 0.006; sring.renderOrder = 3; root.add(sring);
      const bg = new THREE.Mesh(new THREE.RingGeometry(T.TOP_R * 1.18, T.TOP_R * 1.32, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.35, depthWrite: false })); bg.position.y = 0.005; root.add(bg);
      this.world.add(root);
      this.tops[i] = { root, tilt, spin, blur, ring, disc, tip, hub, sh, img, blurTex, hubTex, edge, va: 0, fall: 0, dead: null, y: 0.6, sring, sbg: bg, NS, u: 1 };
      return this.tops[i];
    }
    dropTop(i) { const t = this.tops[i]; if (!t) return; this.world.remove(t.root); t.root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); t.img.dispose(); t.blurTex.dispose(); t.hubTex.dispose(); this.tops[i] = null; }
    clearFx() { for (const p of this.pieces) this.world.remove(p.m); this.pieces = []; for (const s of this.sparks) this.world.remove(s.p); this.sparks = []; for (const f of this.flashes) this.world.remove(f.s); this.flashes = []; }

    // 打ち出しまえ：上でういて待つ
    hover(i, x, z, t) { const R = this.tops[i]; if (!R) return; R.root.position.set(x, 0.55 + Math.sin(t * 3 + i) * 0.02, z); R.tilt.rotation.set(0.12 * Math.sin(t * 2), 0, 0.1); R.spin.rotation.y += 0.02; R.blur.material.opacity = 0; R.sh.visible = false; }
    // 試合中のようす（sim の f）
    sync(i, f, dt, time) {
      const R = this.tops[i]; if (!R) return;
      const st = this.stage, r = Math.hypot(f.x, f.y);
      if (f.state === 'wait') { this.hover(i, f.x, f.y, time); R.sring.visible = R.sbg.visible = false; return; }
      R.sh.visible = true;
      // 回転の輪
      const u = f.state === 'spin' ? Math.min(1, Math.abs(f.w) / BB.W0) : 0; R.u += (u - R.u) * Math.min(1, dt * 10);
      const on = f.state === 'spin' && this.showRings !== false; R.sring.visible = R.sbg.visible = on;
      if (on) {
        R.sring.geometry.setDrawRange(0, Math.max(1, Math.round(R.u * R.NS)) * 6);
        R.sring.material.color.set(this.ringColor ? this.ringColor[i] : (i ? '#ff6b7a' : '#33c7ff'));
        R.sring.material.opacity = u < 0.3 ? 0.55 + 0.45 * Math.abs(Math.sin(time * 9)) : 0.85;
      }
      if (f.state === 'spin') {
        const gy = surfY(st, r);
        R.y = Math.max(gy, R.y - dt * 4);          // 上から落ちてくる
        R.root.position.set(f.x, R.y, f.y);
        // 坂にそって傾く＋ふらつき
        const sl = 2 * LOOK[st].depth * Math.min(r, 1), ang = Math.atan(sl) * 0.8, dirA = Math.atan2(f.y, f.x);
        const wob = f.wob || 0, wt = time * (6 + 10 * wob);
        R.tilt.rotation.set(Math.sin(dirA) * ang + Math.sin(wt) * wob * 0.35, 0, -Math.cos(dirA) * ang + Math.cos(wt) * wob * 0.35);
        const fa = Math.atan(sl); R.sring.rotation.set(Math.sin(dirA) * fa, 0, -Math.cos(dirA) * fa); R.sbg.rotation.copy(R.sring.rotation);
        R.sring.position.y = gy - R.y + 0.012; R.sbg.position.y = gy - R.y + 0.01;
        const sp = Math.abs(f.w);
        // 速く回っているときは、見た目の回転をおさえて、ぶれの円盤を重ねる
        R.va += Math.sign(f.w || 1) * Math.min(sp, 26) * dt; R.spin.rotation.y = -R.va;
        R.blur.material.opacity = Math.max(0, Math.min(0.85, (sp - 45) / 110));
        R.sh.position.y = gy - R.y + 0.003; R.sh.scale.setScalar(1);
      } else if (f.state === 'stop') {
        // 止まって、ぱたんとたおれる
        R.fall = Math.min(1, R.fall + dt * 1.6); const gy = surfY(st, r);
        R.root.position.set(f.x, gy + 0.01, f.y); R.tilt.rotation.set(R.fall * 1.25, 0, R.fall * 0.3); R.blur.material.opacity = 0;
        R.va += dt * 4 * (1 - R.fall); R.spin.rotation.y = -R.va;
      } else if (f.state === 'out') {
        if (!R.dead) R.dead = { vx: (f.outV || [f.vx, f.vy])[0], vz: (f.outV || [f.vx, f.vy])[1], vy: 1.6, x: f.x, z: f.y, y: R.root.position.y };
        const d = R.dead; d.vy -= 9 * dt; d.x += d.vx * dt; d.z += d.vz * dt; d.y += d.vy * dt;
        const rr = Math.hypot(d.x, d.z), floor = rr > 1.25 ? -0.38 : surfY(st, rr);
        if (d.y < floor) { d.y = floor; d.vy = Math.abs(d.vy) * 0.3; d.vx *= 0.6; d.vz *= 0.6; }
        R.root.position.set(d.x, d.y, d.z); R.tilt.rotation.x += dt * 6; R.tilt.rotation.z += dt * 3; R.blur.material.opacity *= 0.9; R.sh.visible = false;
      } else if (f.state === 'burst' && !R.burstDone) { this.burst(i, f); }
    }
    // バースト：部品がばらばらに飛ぶ
    burst(i, f) {
      const R = this.tops[i]; R.burstDone = true;
      R.root.updateMatrixWorld(true);
      for (const m of [R.ring, R.disc, R.tip, R.hub]) {
        const wp = new THREE.Vector3(), wq = new THREE.Quaternion(), ws = new THREE.Vector3(); m.matrixWorld.decompose(wp, wq, ws);
        const c = m.clone(); c.position.copy(wp); c.quaternion.copy(wq); this.world.add(c);
        const a = Math.random() * TAU, sp = 0.8 + Math.random() * 1.4;
        this.pieces.push({ m: c, vx: Math.cos(a) * sp + f.vx * 0.5, vz: Math.sin(a) * sp + f.vy * 0.5, vy: 1.4 + Math.random() * 1.6, rx: (Math.random() - 0.5) * 22, rz: (Math.random() - 0.5) * 22, ry: (Math.random() - 0.5) * 30 });
      }
      R.root.visible = false;
      this.spark(f.x, R.root.position.y + 0.06, f.y, 3, true, 4);
    }
    // 火花：s＝強さ、tier＝段階（1〜4）
    spark(x, y, z, s, big, tier) {
      tier = tier || (big ? 3 : 1);
      if (this.sparks.length > (this.hi ? 26 : 12)) { const o = this.sparks.shift(); this.world.remove(o.p); o.p.geometry.dispose(); o.p.material.dispose(); }
      const mul = this.hi ? 1 : 0.55, n = Math.round(Math.min(140, [0, 10, 26, 55, 110][tier] + s * 8) * mul), pos = new Float32Array(n * 3), vel = [];
      const vk = [0, 0.8, 1.1, 1.5, 2.1][tier];
      for (let k = 0; k < n; k++) { pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z; const a = Math.random() * TAU, e = Math.random() * 1.1, v = (0.6 + Math.random() * 2.4) * vk; vel.push([Math.cos(a) * v * Math.cos(e), Math.sin(e) * v + 0.4, Math.sin(a) * v * Math.cos(e)]); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const p = new THREE.Points(g, new THREE.PointsMaterial({ map: this.sparkTex, size: [0, 0.04, 0.05, 0.065, 0.08][tier], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: tier >= 4 ? '#ffb15a' : '#ffd28a' }));
      this.world.add(p); this.sparks.push({ p, vel, t: 0, life: [0, 0.3, 0.42, 0.6, 0.85][tier] });
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkTex, color: '#fff2c4', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      fl.position.set(x, y, z); this.world.add(fl); this.flashes.push({ s: fl, t: 0, big: [0, 0.22, 0.4, 0.75, 1.3][tier], life: tier >= 3 ? 0.26 : 0.16 });
      if (tier >= 3) this.shock(x, z, tier);
    }
    // 衝撃の輪（床にひろがる）
    shock(x, z, tier) {
      if (!this.shockGeo) { this.shockGeo = new THREE.RingGeometry(0.8, 1, 48); this.shockGeo.rotateX(-Math.PI / 2); }
      const m = new THREE.Mesh(this.shockGeo, new THREE.MeshBasicMaterial({ color: tier >= 4 ? '#ffb15a' : '#fff0c0', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      m.position.set(x, surfY(this.stage || 'std', Math.hypot(x, z)) + 0.01, z); this.world.add(m);
      this.flashes.push({ s: m, t: 0, ring: tier >= 4 ? 0.75 : 0.42, life: tier >= 4 ? 0.5 : 0.32 });
    }
    // こすれ火花（ギャリギャリ）
    grind(x, y, z) {
      if (this.sparks.length > (this.hi ? 26 : 12)) return;
      const n = this.hi ? 8 : 4, pos = new Float32Array(n * 3), vel = [];
      for (let k = 0; k < n; k++) { pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z; const a = Math.random() * TAU, v = 0.6 + Math.random() * 1.2; vel.push([Math.cos(a) * v, 0.3 + Math.random() * 0.8, Math.sin(a) * v]); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const p = new THREE.Points(g, new THREE.PointsMaterial({ map: this.sparkTex, size: 0.035, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ff9be8' }));
      this.world.add(p); this.sparks.push({ p, vel, t: 0, life: 0.25 });
    }
    // 3D の点 → 画面の位置（px）
    toScreen(x, y, z) {
      const v = new THREE.Vector3(x, y, z).project(this.camera), w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight;
      return { x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h, ok: v.z < 1 };
    }
    fx(dt) {
      for (let k = this.sparks.length - 1; k >= 0; k--) {
        const s = this.sparks[k]; s.t += dt; const a = s.p.geometry.attributes.position;
        for (let j = 0; j < s.vel.length; j++) { const v = s.vel[j]; v[1] -= 6 * dt; a.array[j * 3] += v[0] * dt; a.array[j * 3 + 1] += v[1] * dt; a.array[j * 3 + 2] += v[2] * dt; }
        a.needsUpdate = true; s.p.material.opacity = Math.max(0, 1 - s.t / s.life);
        if (s.t > s.life) { this.world.remove(s.p); s.p.geometry.dispose(); s.p.material.dispose(); this.sparks.splice(k, 1); }
      }
      for (let k = this.flashes.length - 1; k >= 0; k--) { const f = this.flashes[k]; f.t += dt; const q = f.t / (f.life || 0.18); if (f.ring) { f.s.scale.setScalar(0.05 + f.ring * Math.sqrt(q)); f.s.material.opacity = 0.9 * Math.max(0, 1 - q); } else { f.s.scale.setScalar(f.big * (0.4 + q)); f.s.material.opacity = Math.max(0, 1 - q); } if (q >= 1) { this.world.remove(f.s); f.s.material.dispose(); this.flashes.splice(k, 1); } }
      if (this.railMat) { this.railGlow = Math.max(0, (this.railGlow || 0) - dt * 1.5); this.railMat.opacity = 0.3 + 0.6 * this.railGlow; this.railMat.map.offset.x -= dt * (0.15 + this.railGlow * 0.9); }
      for (const p of this.pieces) {
        p.vy -= 9 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
        const rr = Math.hypot(p.m.position.x, p.m.position.z), fl = rr > 1.2 ? -0.38 : surfY(this.stage, rr) + 0.01;
        if (p.m.position.y < fl) { p.m.position.y = fl; p.vy = Math.abs(p.vy) * 0.35; p.vx *= 0.7; p.vz *= 0.7; p.rx *= 0.6; p.rz *= 0.6; p.ry *= 0.6; }
        p.m.rotation.x += p.rx * dt; p.m.rotation.z += p.rz * dt; p.m.rotation.y += p.ry * dt;
      }
    }
    render() { this.renderer.render(this.scene, this.camera); }
  }
  // 絵のふちに近い所の平均の色（リングの側面の色）
  function avgColor(cv) {
    const s = document.createElement('canvas'); s.width = s.height = 32; const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(cv, 0, 0, 32, 32);
    const d = x.getImageData(0, 0, 32, 32).data; let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < 32 * 32; i++) if (d[i * 4 + 3] > 120) { r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; n++; }
    s.width = 1; return n ? new THREE.Color(`rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`) : new THREE.Color('#888');
  }
  // 速く回っているときに重ねる、ぶれた絵（半径ごとの平均の色）
  function blurCanvas(cv) {
    const N = 64, s = document.createElement('canvas'); s.width = s.height = 128; const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(cv, 0, 0, 128, 128);
    const d = x.getImageData(0, 0, 128, 128).data, out = document.createElement('canvas'); out.width = out.height = 256; const o = out.getContext('2d');
    const k = 128 / BB.T.D, Rp = BB.T.R_PX * k;
    for (let ri = N; ri >= 1; ri--) {
      const rr = ri / N * Rp; let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let j = 0; j < 48; j++) { const t = j / 48 * TAU, px = Math.floor(64 + Math.cos(t) * rr), py = Math.floor(64 + Math.sin(t) * rr); if (px < 0 || py < 0 || px > 127 || py > 127) continue; const q = (py * 128 + px) * 4; r += d[q] * d[q + 3]; g += d[q + 1] * d[q + 3]; b += d[q + 2] * d[q + 3]; a += d[q + 3]; n++; }
      const al = n ? a / n / 255 : 0; if (a > 0) { r /= a; g /= a; b /= a; }
      o.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${al.toFixed(3)})`; o.beginPath(); o.arc(128, 128, ri / N * 128 * (BB.T.R_PX / (BB.T.TOP_R / BB.T.TOP_R * BB.T.R_PX)), 0, TAU); o.fill();
    }
    s.width = 1; const t = new THREE.CanvasTexture(out); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // 軸のまん中の飾り（回る向きの矢印）
  function hubCanvas(spin, col) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#' + col.clone().multiplyScalar(0.6).getHexString(); x.beginPath(); x.arc(64, 64, 64, 0, TAU); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 10; x.lineCap = 'round'; const d = spin === 'L' ? -1 : 1;
    x.beginPath(); x.arc(64, 64, 34, -2.3, 1.2); x.stroke();
    const a = d > 0 ? 1.2 : -2.3, ex = 64 + Math.cos(a) * 34, ey = 64 + Math.sin(a) * 34;
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(ex + 14, ey - 4); x.lineTo(ex - 12, ey - 10); x.lineTo(ex - 2, ey + 14); x.closePath(); x.fill();
    if (d < 0) { x.globalCompositeOperation = 'copy'; const m = document.createElement('canvas'); m.width = m.height = 128; const y = m.getContext('2d'); y.translate(128, 0); y.scale(-1, 1); y.drawImage(c, 0, 0); x.drawImage(m, 0, 0); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  BB.Render = Render; BB.surfY = surfY;
})();
