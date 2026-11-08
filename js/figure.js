/* KinPrep — moteur d'illustration animée (squelette 2D original, cinématique directe).
   Convention d'angle : 0° = vers le bas, 90° = vers l'avant (droite), 180° = vers le haut, -90° = vers l'arrière.
   Une pose : { v:'side'|'front', a:[joint,x,y], t:tronc, hd:tête, ln/lf:[cuisse,tibia,pied], an/af:[bras,avant-bras], p:[accessoires] }
   ln/an = membres côté proche (dessinés devant), lf/af = côté éloigné. */
(function (KP) {
  const L = { trunk: 40, neck: 5, head: 8, thigh: 34, shin: 33, foot: 10, ua: 24, fa: 22 };
  const R = Math.PI / 180;
  const GROUND = 140;
  const dir = a => [Math.sin(a * R), Math.cos(a * R)];
  const add = (p, a, l) => { const d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; };

  const BASE = { v: 'side', a: ['fn', 100, GROUND], t: 180, hd: null, ln: [0, 0, 90], lf: [0, 0, 90], an: [4, 4], af: [-4, -4], p: [] };

  function P(o) { // fabrique de pose avec valeurs par défaut
    return Object.assign({}, BASE, o, { p: (o && o.p) || [] });
  }

  function solve(pose) {
    const front = pose.v === 'front';
    const J = {};
    J.hip = [0, 0];
    J.sc = add(J.hip, pose.t, L.trunk);
    const hd = pose.hd == null ? pose.t : pose.hd;
    J.head = add(J.sc, hd, L.neck + L.head);
    const o = pose.o || (front ? [7, 0, 13, 2] : [0, 0, 0, 0]);
    // côté proche = droite de l'écran en vue de face ; pose.o = décalages [hanche x,y, épaule x,y] du côté proche
    const sides = { n: [1, pose.ln, pose.an], f: [-1, pose.lf, pose.af] };
    for (const s of ['n', 'f']) {
      const [sg, leg, arm] = sides[s];
      const hp = [J.hip[0] + sg * o[0], J.hip[1] + sg * o[1]];
      const sp = [J.sc[0] + sg * o[2], J.sc[1] + (front && !pose.o ? 2 : sg * o[3])];
      J['hp' + s] = hp; J['sp' + s] = sp;
      J['k' + s] = add(hp, leg[0], L.thigh);
      J['f' + s] = add(J['k' + s], leg[1], L.shin);
      J['t' + s] = add(J['f' + s], leg[2], L.foot);
      J['e' + s] = add(sp, arm[0], L.ua);
      J['h' + s] = add(J['e' + s], arm[1], L.fa);
    }
    const [aj, ax, ay] = pose.a;
    const ref = J[aj] || J.hip;
    const dx = ax - ref[0], dy = ay - ref[1];
    for (const k in J) J[k] = [J[k][0] + dx, J[k][1] + dy];
    if (pose.ik) for (const key of ['fn', 'ff', 'hn', 'hf']) {
      const tg = pose.ik[key]; if (!tg) continue;
      const sd = key[1], leg = key[0] === 'f';
      const root = J[(leg ? 'hp' : 'sp') + sd];
      const l1 = leg ? L.thigh : L.ua, l2 = leg ? L.shin : L.fa;
      const vx = tg[0] - root[0], vy = tg[1] - root[1];
      let d = Math.hypot(vx, vy) || 0.001; const dd = Math.min(d, l1 + l2 - 0.01);
      const ux = vx / d, uy = vy / d;
      const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
      const bend = tg[2] == null ? (leg ? -1 : 1) : tg[2];
      const mid = [root[0] + ux * a + bend * -uy * h, root[1] + uy * a + bend * ux * h];
      const end = [root[0] + ux * dd, root[1] + uy * dd];
      J[(leg ? 'k' : 'e') + sd] = mid; J[(leg ? 'f' : 'h') + sd] = end;
      if (leg) J['t' + sd] = add(end, (sd === 'n' ? pose.ln : pose.lf)[2], L.foot);
    }
    return J;
  }

  const f1 = n => Math.round(n * 10) / 10;
  const pt = p => f1(p[0]) + ' ' + f1(p[1]);
  const line = (pts, w, cls) => `<path class="${cls}" d="M${pts.map(pt).join(' L')}" stroke-width="${w}"/>`;
  const resolve = (J, v) => (typeof v === 'string' ? J[v] : v);

  function prop(pr, J, front) {
    const k = pr.k;
    if (k === 'db') { const h = resolve(J, pr.j); if (front) return `<g class="eq"><path d="M${f1(h[0] - 9)} ${f1(h[1])} H${f1(h[0] + 9)}" stroke-width="3"/><rect x="${f1(h[0] - 12)}" y="${f1(h[1] - 6)}" width="5" height="12" rx="1.5"/><rect x="${f1(h[0] + 7)}" y="${f1(h[1] - 6)}" width="5" height="12" rx="1.5"/></g>`; return `<g class="eq"><circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="6.5"/><circle class="eqi" cx="${f1(h[0])}" cy="${f1(h[1])}" r="2"/></g>`; }
    if (k === 'kb') { const h = resolve(J, pr.j); return `<g class="eq"><path d="M${f1(h[0] - 5)} ${f1(h[1] + 6)} Q${f1(h[0])} ${f1(h[1] - 6)} ${f1(h[0] + 5)} ${f1(h[1] + 6)}" fill="none" stroke-width="3"/><circle cx="${f1(h[0])}" cy="${f1(h[1] + 12)}" r="8"/></g>`; }
    if (k === 'bar') { const h = resolve(J, pr.j); if (front) { const hf = J.hf, hn = J.hn; const y = (hf[1] + hn[1]) / 2; return `<g class="eq"><path d="M${f1(hf[0] - 40)} ${f1(y)} H${f1(hn[0] + 40)}" stroke-width="3"/><rect x="${f1(hf[0] - 40)}" y="${f1(y - 14)}" width="6" height="28" rx="2"/><rect x="${f1(hn[0] + 34)}" y="${f1(y - 14)}" width="6" height="28" rx="2"/></g>`; } return `<g class="eq"><circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="${pr.r || 14}"/><circle class="eqi" cx="${f1(h[0])}" cy="${f1(h[1])}" r="2.5"/></g>`; }
    if (k === 'plate') { const h = resolve(J, pr.j); return `<g class="eq"><circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="${pr.r || 10}"/><circle class="eqi" cx="${f1(h[0])}" cy="${f1(h[1])}" r="2"/></g>`; }
    if (k === 'ball') { const h = pr.j ? resolve(J, pr.j) : [pr.x, pr.y]; const o = pr.o || [0, 0]; return `<circle class="ball" cx="${f1(h[0] + o[0])}" cy="${f1(h[1] + o[1])}" r="${pr.r || 9}"/>`; }
    if (k === 'swiss') return `<circle class="swiss" cx="${f1(pr.x)}" cy="${f1(pr.y)}" r="${pr.r || 18}"/>`;
    if (k === 'bench') return `<g class="furn"><rect x="${f1(pr.x)}" y="${f1(pr.y)}" width="${pr.w}" height="6" rx="2"/><path d="M${f1(pr.x + 6)} ${f1(pr.y + 6)} V${GROUND} M${f1(pr.x + pr.w - 6)} ${f1(pr.y + 6)} V${GROUND}" stroke-width="3"/></g>`;
    if (k === 'box') return `<rect class="furn" x="${f1(pr.x)}" y="${f1(pr.y)}" width="${pr.w}" height="${f1(GROUND - pr.y)}" rx="2"/>`;
    if (k === 'wall') return `<path class="wall" d="M${f1(pr.x)} ${GROUND} V${pr.top || 20}" stroke-width="4"/>`;
    if (k === 'pull') return `<path class="furn" d="M${pr.x1} ${pr.y} H${pr.x2}" stroke-width="4" fill="none"/>`;
    if (k === 'band') { const a = resolve(J, pr.from), b = resolve(J, pr.to); return `<path class="band" d="M${pt(a)} L${pt(b)}"/>`; }
    if (k === 'loop') { const a = resolve(J, pr.a), b = resolve(J, pr.b); return `<path class="band" d="M${pt(a)} L${pt(b)}"/>`; }
    if (k === 'rope') { const a = resolve(J, pr.a), b = resolve(J, pr.b); const y = pr.y != null ? pr.y : GROUND + 1; const mx = (a[0] + b[0]) / 2; return `<path class="rope" d="M${pt(a)} Q${f1(mx - (pr.dx || 0))} ${f1(y + (y - a[1]) * 0.35)} ${pt(b)}"/>`; }
    if (k === 'land') { const a = resolve(J, pr.from), b = resolve(J, pr.to); return `<g class="eq"><path d="M${pt(a)} L${pt(b)}" stroke-width="4"/><circle cx="${f1(b[0] + (b[0] - a[0]) * 0.08)}" cy="${f1(b[1] + (b[1] - a[1]) * 0.08)}" r="8"/></g>`; }
    if (k === 'cone') return `<path class="cone" d="M${pr.x - 6} ${GROUND} L${pr.x} ${GROUND - 13} L${pr.x + 6} ${GROUND} Z"/>`;
    if (k === 'mat') return `<rect class="mat" x="${pr.x || 30}" y="${GROUND}" width="${pr.w || 140}" height="4" rx="2"/>`;
    if (k === 'pad') return `<rect class="mat" x="${f1(pr.x)}" y="${f1(pr.y)}" width="${pr.w || 18}" height="${pr.h || 6}" rx="3"/>`;
    if (k === 'arrow') { const [x, y, a, l] = [pr.x, pr.y, pr.a, pr.l || 18]; const e = add([x, y], a, l); const h1 = add(e, a + 150, 6), h2 = add(e, a - 150, 6); return `<path class="arr" d="M${f1(x)} ${f1(y)} L${pt(e)} M${pt(h1)} L${pt(e)} L${pt(h2)}"/>`; }
    if (k === 'label') return `<text class="lbl" x="${pr.x}" y="${pr.y}">${pr.txt}</text>`;
    return '';
  }

  const BACK = new Set(['bench', 'box', 'wall', 'pull', 'swiss', 'mat', 'pad', 'cone', 'label']);

  function render(pose) {
    const J = solve(pose);
    const front = pose.v === 'front';
    const props = pose.p || [];
    let s = `<path class="gnd" d="M-60 ${GROUND + 0.5} H260"/>`;
    for (const pr of props) if (BACK.has(pr.k)) s += prop(pr, J, front);
    const leg = c => line([J['hp' + c], J['k' + c], J['f' + c], J['t' + c]], 9, c === 'n' ? 'lim n' : 'lim f');
    const arm = c => line([J['sp' + c], J['e' + c], J['h' + c]], 8, c === 'n' ? 'lim n' : 'lim f');
    for (const pr of props) if (pr.back && !BACK.has(pr.k)) s += prop(pr, J, front);
    s += arm('f') + leg('f');
    if (front || pose.o) s += line([J.hpf, J.hpn], 11, 'trk') + line([J.spf, J.spn], 11, 'trk');
    s += line([J.hip, J.sc], front ? 15 : 13, 'trk');
    s += `<circle class="hd" cx="${f1(J.head[0])}" cy="${f1(J.head[1])}" r="${L.head}"/>`;
    s += leg('n') + arm('n');
    for (const pr of props) if (!pr.back && !BACK.has(pr.k)) s += prop(pr, J, front);
    return s;
  }

  // ---- interpolation ----
  function lerpVal(a, b, u) {
    if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * u;
    if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => lerpVal(x, b[i], u));
    if (a && b && typeof a === 'object') { const o = {}; for (const k in a) o[k] = k in b ? lerpVal(a[k], b[k], u) : a[k]; return o; }
    return u < 0.5 ? a : b;
  }
  function lerpPose(A, B, u) {
    const o = {};
    for (const k in A) {
      if (k === 'p') o.p = A.p.map((pa, i) => (B.p && B.p[i] && B.p[i].k === pa.k ? lerpVal(pa, B.p[i], u) : pa));
      else if (k === 'a') o.a = [A.a[0], lerpVal(A.a[1], B.a[1], u), lerpVal(A.a[2], B.a[2], u)];
      else if (k === 'v') o.v = A.v;
      else if (k === 'o') o.o = A.o && B.o ? lerpVal(A.o, B.o, u) : A.o;
      else if (k === 'hd') o.hd = A.hd == null || B.hd == null ? A.hd : lerpVal(A.hd, B.hd, u);
      else o[k] = lerpVal(A[k], B[k], u);
    }
    return o;
  }
  const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * u);

  /* Animation : { f:[poses], d: durée transition (s), h: pause (s), m:'yoyo'|'loop' } */
  function sample(anim, time) {
    const fr = anim.f; if (fr.length === 1) return fr[0];
    const d = anim.d || 0.9, h = anim.h == null ? 0.35 : anim.h;
    const seq = anim.m === 'loop' ? fr.map((_, i) => [i, (i + 1) % fr.length]) : [...fr.slice(0, -1).map((_, i) => [i, i + 1]), ...fr.slice(1).map((_, i) => [fr.length - 1 - i, fr.length - 2 - i])];
    const seg = d + h, total = seq.length * seg;
    let t = time % total; const i = Math.floor(t / seg); t -= i * seg;
    const [a, b] = seq[i];
    if (t < h) return fr[a];
    return lerpPose(fr[a], fr[b], ease(Math.min(1, (t - h) / d)));
  }

  function key(anim, which) { const f = anim.f; return which === 'last' ? f[f.length - 1] : f[Math.min(which || 0, f.length - 1)]; }

  // ---- montage dans le DOM ----
  const live = new Set();
  let raf = 0, t0 = performance.now(), lastDraw = 0;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const boxCache = new WeakMap();
  function bounds(anim) {
    if (!anim) return '0 -24 200 174';
    if (boxCache.has(anim)) return boxCache.get(anim);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const eat = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    anim.f.forEach(f => {
      const J = solve(f); for (const k in J) eat(J[k][0], J[k][1]);
      eat(J.head[0], J.head[1] - L.head); (f.p || []).forEach(pr => {
        if (pr.x != null && pr.y != null && pr.k !== 'arrow') { eat(pr.x, pr.y); if (pr.w) eat(pr.x + pr.w, pr.y); }
        if (pr.k === 'wall') eat(pr.x, Math.max(pr.top || 20, y0 - 6));
        if (pr.k === 'pull') { eat(Math.max(pr.x1, x0 - 10), pr.y); eat(Math.min(pr.x2, x1 + 10), pr.y); }
        if ((pr.k === 'band' || pr.k === 'land') && Array.isArray(pr.to)) eat(pr.to[0], pr.to[1]);
        if ((pr.k === 'band' || pr.k === 'land') && Array.isArray(pr.from)) eat(pr.from[0], pr.from[1]);
        if (pr.k === 'cone') eat(pr.x, GROUND - 13);
      });
    });
    eat(x0, GROUND + 2);
    const pad = 12; x0 -= pad; y0 -= pad; x1 += pad; y1 += 4;
    let w = x1 - x0, h = y1 - y0;
    if (w < 110) { x0 -= (110 - w) / 2; w = 110; }
    if (h < 90) { y0 -= 90 - h; h = 90; }
    const vb = `${Math.round(x0)} ${Math.round(y0)} ${Math.round(w)} ${Math.round(h)}`;
    boxCache.set(anim, vb); return vb;
  }
  function svgShell(inner, cls, vb) {
    return `<svg class="fig ${cls || ''}" viewBox="${vb || '0 -24 200 174'}" role="img" aria-hidden="true"><g class="figg">${inner}</g></svg>`;
  }
  function staticSVG(anim, which, cls) { return svgShell(render(key(anim, which == null ? 'last' : which)), cls, bounds(anim)); }

  function mount(el, anim) {
    if (!anim) { el.innerHTML = ''; return; }
    el.innerHTML = svgShell(render(key(anim, reduced() ? 'last' : 0)), '', bounds(anim));
    el._anim = anim; el._g = el.querySelector('.figg');
    if (!reduced()) { live.add(el); if (!raf) raf = requestAnimationFrame(tick); }
  }
  function tick(now) {
    raf = 0;
    if (now - lastDraw > 33) {
      lastDraw = now;
      for (const el of live) {
        if (!el.isConnected) { live.delete(el); continue; }
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.width === 0) continue;
        el._g.innerHTML = render(sample(el._anim, (now - t0) / 1000));
      }
    }
    if (live.size) raf = requestAnimationFrame(tick);
  }
  function mountAll(root) {
    (root || document).querySelectorAll('[data-anim]').forEach(el => {
      if (el._mounted === el.dataset.anim) return;
      el._mounted = el.dataset.anim;
      const ex = KP.EX_BY_ID[el.dataset.anim];
      mount(el, ex ? KP.animOf(ex) : null);
    });
  }

  KP.fig = { P, solve, render, sample, mount, mountAll, staticSVG, bounds, GROUND, L };
})(window.KP = window.KP || {});
