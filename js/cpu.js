// =============================================
//  バトベイ  CPU（よわい・ふつう・つよい）
//  回す力とタイミング、スキルを使う時を決める
// =============================================
window.BB = window.BB || {};
(function () {
  const LV = {
    easy:   { p: [0.5, 0.85], early: 0.15, perfect: 0.05, late: 0.35, think: 1.6, smart: 0.2 },
    normal: { p: [0.72, 0.97], early: 0.07, perfect: 0.25, late: 0.2, think: 0.9, smart: 0.6 },
    hard:   { p: [0.86, 0.99], early: 0.02, perfect: 0.6, late: 0.06, think: 0.35, smart: 1 }
  };
  BB.cpuLaunch = function (level) {
    const L = LV[level] || LV.normal, r = BB.rand();
    const timing = r < L.early ? 'early' : r < L.early + L.perfect ? 'perfect' : r < L.early + L.perfect + L.late ? 'late' : 'good';
    return { power: L.p[0] + BB.rand() * (L.p[1] - L.p[0]), timing, aim: (BB.rand() - 0.5) * 0.8, delay: timing === 'late' ? 0.1 + BB.rand() * 0.3 : 0 };
  };
  class Cpu {
    constructor(level, i) { this.L = LV[level] || LV.normal; this.i = i; this.t = 0.5; }
    update(b, dt) {
      const f = b.f[this.i], o = b.f[1 - this.i];
      if (f.used || f.gauge < 1 || f.state !== 'spin') return null;
      this.t -= dt; if (this.t > 0) return null; this.t = this.L.think * (0.6 + BB.rand() * 0.8);
      if (BB.rand() > this.L.smart) return { skill: BB.rand() < 0.5 };   // 考えずに使う
      const k = f.st.skill, sr = Math.abs(f.w) / f.w0, osr = Math.abs(o.w) / o.w0, d = Math.hypot(o.x - f.x, o.y - f.y), orr = Math.hypot(o.x, o.y);
      const use =
        k === 'heal' ? sr < 0.45 :
        k === 'rush' ? orr > 0.55 || d < 0.6 :
        k === 'wall' ? d < 0.5 :
        k === 'drain' ? d < 0.6 :
        k === 'grav' ? true :
        k === 'loose' ? true :
        k === 'boost' ? sr > 0.4 :
        k === 'refl' ? d < 0.7 : true;
      return use ? { skill: true } : null;
    }
  }
  BB.Cpu = Cpu;
})();
