/* KinPrep — mannequin 3D (sans bibliothèque) : squelette articulé, rendu canvas, angle de vue libre.
   Remplace l'animation 2D pour les exercices listés dans KP.A3D (mise en place progressive, 1er lot le 26/11).
   Repère : y vers le haut, le mannequin regarde +z, sa droite est en -x. Longueurs en mètres. */
(function (KP) {
  const D = Math.PI / 180;
  const mul = (A, B) => { const C = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return C; };
  const Rx = a => { a *= D; const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
  const Ry = a => { a *= D; const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
  const Rz = a => { a *= D; const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
  const ap = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  const DOWN = [0, -1, 0];
  const LEN = { thigh: .44, shin: .43, foot: .2, torso: .5, neck: .09, head: .11, ua: .29, fa: .27, hipW: .095, shW: .19 };
  const NA = { flex: 0, abd: 6, rot: 0, elbow: 8 }, NL = { flex: 0, abd: 3, knee: 0, ankle: 0, ev: 0 };
  const NEUTRAL = { yaw: 0, roll: 0, bodyPitch: 0, pitch: 0, sYaw: 0, sRoll: 0, head: 0, rx: 0, ry: 0, rz: 0 };
  // pose : valeurs par défaut + surcharges (bras R/L, jambes RL/LL)
  function pose(o) {
    o = o || {};
    return Object.assign({}, NEUTRAL, o, { R: Object.assign({}, NA, o.R), L: Object.assign({}, NA, o.L), RL: Object.assign({}, NL, o.RL), LL: Object.assign({}, NL, o.LL) });
  }
  function joints(p) {
    const W = mul(mul(Ry(p.yaw), Rz(p.roll)), Rx(p.bodyPitch));
    const S = mul(mul(mul(W, Ry(p.sYaw)), Rz(p.sRoll)), Rx(p.pitch));
    const pel = [0, 0, 0], chest = add(pel, ap(S, [0, LEN.torso, 0])), neck = add(chest, ap(S, [0, LEN.neck, 0]));
    const J = { pel, chest, neck, head: add(neck, ap(mul(S, Rx(p.head)), [0, LEN.head, 0])) };
    [['R', -1], ['L', 1]].forEach(([k, sd]) => {
      const a = p[k], sh = add(chest, ap(S, [sd * LEN.shW, -.03, 0]));
      const U = mul(mul(mul(S, Rz(sd * a.abd)), Rx(-a.flex)), Ry(sd * a.rot)); // rot > 0 = rotation externe
      const el = add(sh, ap(U, DOWN), LEN.ua), F = mul(U, Rx(-a.elbow)), wr = add(el, ap(F, DOWN), LEN.fa);
      Object.assign(J, { [k + 'sh']: sh, [k + 'el']: el, [k + 'wr']: wr, [k + 'ha']: add(wr, ap(F, DOWN), .06) });
    });
    [['RL', -1], ['LL', 1]].forEach(([k, sd]) => {
      const l = p[k], hip = add(pel, ap(W, [sd * LEN.hipW, -.02, 0]));
      const T = mul(mul(W, Rz(sd * l.abd)), Rx(-l.flex)), kn = add(hip, ap(T, DOWN), LEN.thigh);
      const K = mul(T, Rx(l.knee)), an = add(kn, ap(K, DOWN), LEN.shin);
      const Fo = mul(mul(K, Ry(-sd * l.ev)), Rx(-(90 - l.ankle))); // ev > 0 : la pointe du pied tourne vers l'extérieur
      Object.assign(J, { [k + 'hip']: hip, [k + 'kn']: kn, [k + 'an']: an, [k + 'toe']: add(an, ap(Fo, DOWN), LEN.foot), [k + 'heel']: add(an, ap(Fo, DOWN), -.05) });
    });
    return J;
  }
  const lerp = (a, b, t) => typeof a === 'number' ? a + (b - a) * t : Object.fromEntries(Object.keys(a).map(k => [k, lerp(a[k], b[k], t)]));
  // pose → points posés au sol ; plant 'feet' : les pieds restent à leur place, 'LL'/'RL' : ce pied-là ; 'none' : position libre (rx, ry, rz)
  function place(A, p, ref) {
    const J = joints(p); let dx = 0, dz = 0, dy;
    if (A.plant === 'none') { dx = p.rx; dy = p.ry; dz = p.rz; }
    else {
      const pts = Object.keys(J).filter(k => k !== 'head'); dy = -Math.min(...pts.map(k => J[k][1])) + .035;
      if (ref) { const keys = A.plant === 'LL' || A.plant === 'RL' ? [A.plant + 'an'] : ['RLan', 'LLan']; const m = J0 => keys.reduce((s, k) => [s[0] + J0[k][0] / keys.length, s[1] + J0[k][2] / keys.length], [0, 0]); const a = m(J), b = m(ref); dx = b[0] - a[0]; dz = b[1] - a[1]; }
    }
    for (const k in J) J[k] = add(J[k], [dx, dy, dz]);
    return J;
  }

  // ---------------- bibliothèque d'animations 3D (clé = id d'animation 2D remplacée) ----------------
  const A3 = {};
  const legSquat = (f, k, an, ab) => ({ flex: f, abd: ab, knee: k, ankle: an });
  // rotation externe bras à 90° : coude à hauteur d'épaule, avant-bras de devant vers le haut
  A3.ext_rot_90 = { view: '3/4', dur: 1.6, plant: 'feet', cue: 'Coude fixe à hauteur d\'épaule',
    keys: [pose({ R: { abd: 88, rot: 0, elbow: 90 } }), pose({ R: { abd: 88, rot: 90, elbow: 90 } })],
    props: [{ k: 'band', from: 'Rha', to: [-.45, .25, 1.1] }] };
  // rotation externe coude au corps : élastique fixé de l'autre côté, l'avant-bras s'ouvre vers l'extérieur
  A3.ext_rot = { view: 'dessus', dur: 1.5, plant: 'feet', cue: 'Coude collé au corps, l\'avant-bras s\'ouvre',
    keys: [pose({ R: { abd: 4, rot: -35, elbow: 90 } }), pose({ R: { abd: 4, rot: 65, elbow: 90 } })],
    props: [{ k: 'band', from: 'Rha', to: [.75, .95, .25] }, { k: 'post', at: [.8, .25] }] };
  // péroniers : assis, jambes tendues, la pointe du pied tourne vers l'extérieur contre l'élastique
  A3.peroneal = { view: '3/4', dur: 1.2, plant: 'feet', cue: 'La pointe du pied tourne vers l\'extérieur',
    keys: [pose({ pitch: -18, head: 10, R: { flex: -30, abd: 12, elbow: 0 }, L: { flex: -30, abd: 12, elbow: 0 }, RL: { flex: 88, abd: 5, ankle: 5, ev: -5 }, LL: { flex: 88, abd: 5, ankle: 5 } }),
      pose({ pitch: -18, head: 10, R: { flex: -30, abd: 12, elbow: 0 }, L: { flex: -30, abd: 12, elbow: 0 }, RL: { flex: 88, abd: 5, ankle: 5, ev: 40 }, LL: { flex: 88, abd: 5, ankle: 5 } })],
    props: [{ k: 'band', from: 'RLtoe', to: [.25, .08, .95] }, { k: 'post', at: [.3, 1.0], h: .2 }] };
  // Y-balance : en appui sur la jambe gauche, la droite va toucher devant, sur le côté, puis en arrière en diagonale
  const yb = (leg, pitch, sk) => pose({ pitch, R: { flex: 20, abd: 30, elbow: 10 }, L: { flex: 20, abd: 30, elbow: 10 }, LL: { flex: 30 + sk, knee: 55 + sk, ankle: 20 }, RL: leg });
  A3.balance_reach = { view: '3/4', dur: 1.3, plant: 'LL', cue: 'Devant, sur le côté, en arrière : le pied libre effleure le sol',
    keys: [yb({ flex: 10, knee: 20 }, 5, 0), yb({ flex: 62, knee: 0, ankle: 10 }, 14, 15), yb({ flex: 10, knee: 20 }, 5, 0), yb({ flex: 15, abd: 50, knee: 0 }, 8, 15), yb({ flex: 10, knee: 20 }, 5, 0), yb({ flex: -40, abd: 22, knee: 0 }, 32, 18)],
    loop: true };
  // Copenhague : gainage latéral sur l'avant-bras gauche, cheville du dessus sur le banc, le bassin monte
  const cop = (roll, sag, knee) => pose({ roll, sRoll: sag, R: { flex: 0, abd: 8, elbow: 10 }, L: { abd: 82, elbow: 90, flex: 0 }, RL: { flex: 0, abd: -sag, knee: knee || 0 }, LL: { flex: 0, abd: sag + 4, knee: knee || 0 } });
  A3.copenhagen = { view: 'face', dur: 1.6, plant: 'none', cue: 'Le bassin monte : corps aligné de la cheville à la tête',
    keys: [Object.assign(cop(-96, 14), { rx: .2, ry: .44, rz: 0 }), Object.assign(cop(-80, 0), { rx: .2, ry: .43, rz: 0 })],
    props: [{ k: 'box', x: [-.9, -.5], y: .4, z: [-.22, .22] }] };
  A3.copenhagen_short = { view: 'face', dur: 1.6, plant: 'none', cue: 'Genou du dessus sur le banc, le bassin monte',
    keys: [Object.assign(cop(-96, 14, 90), { rx: .15, ry: .44, rz: 0 }), Object.assign(cop(-82, 0, 90), { rx: .15, ry: .44, rz: 0 })],
    props: [{ k: 'box', x: [-.48, -.12], y: .4, z: [-.55, .12] }] };
  // squats : vue de face par défaut pour voir les genoux dans l'axe des pieds
  const sqArms = (f, e, ab) => ({ R: { flex: f, abd: ab, elbow: e }, L: { flex: f, abd: ab, elbow: e } });
  const sq = (deep, arms, pitch) => pose(Object.assign({ pitch: deep ? pitch : 0, RL: deep ? legSquat(105, 118, 28, 16) : { abd: 12 }, LL: deep ? legSquat(105, 118, 28, 16) : { abd: 12 } }, arms));
  A3.squat_goblet = { view: 'face', dur: 1.8, plant: 'feet', cue: 'Genoux dans l\'axe des pieds',
    keys: [sq(0, sqArms(35, 125, -8)), sq(1, sqArms(22, 125, -8), 28)], props: [{ k: 'kb', at: ['Rha', 'Lha'] }] };
  A3.squat_goblet_db = { view: 'face', dur: 1.8, plant: 'feet', cue: 'Genoux dans l\'axe des pieds',
    keys: [sq(0, sqArms(35, 125, -8)), sq(1, sqArms(22, 125, -8), 28)], props: [{ k: 'db1', at: ['Rha', 'Lha'] }] };
  A3.squat_db = { view: 'face', dur: 1.8, plant: 'feet', cue: 'Genoux dans l\'axe des pieds, poitrine haute',
    keys: [sq(0, sqArms(0, 4, 8)), sq(1, sqArms(-8, 4, 14), 24)], props: [{ k: 'db', at: 'Rha' }, { k: 'db', at: 'Lha' }] };
  A3.squat_bar = { view: '3/4', dur: 1.8, plant: 'feet', cue: 'Barre sur le haut du dos, genoux dans l\'axe',
    keys: [sq(0, { R: { flex: -30, abd: 80, elbow: 140, rot: 120 }, L: { flex: -30, abd: 80, elbow: 140, rot: 120 } }), sq(1, { R: { flex: -30, abd: 80, elbow: 140, rot: 120 }, L: { flex: -30, abd: 80, elbow: 140, rot: 120 } }, 32)], props: [{ k: 'bar', at: ['Rha', 'Lha'] }] };

  // ---------------- rendu ----------------
  const VIEWS = { face: [0, 8], '3/4': [-40, 14], profil: [-90, 6], dessus: [0, 62] };
  const VIEW_LABEL = { face: 'Face', '3/4': '3/4', profil: 'Profil', dessus: 'Dessus' };
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function draw(st, now) {
    const A = st.A, cv = st.cv, g = st.g, W = cv.width, H = cv.height, dpr = st.dpr;
    const n = A.keys.length, per = A.dur, T = (now - st.t0) / 1000;
    let i, u;
    if (A.loop) { const ph = ((T / per) % n + n) % n; i = Math.floor(ph); u = ph - i; }
    else { const cyc = (n - 1) * 2, ph = ((T / per) % cyc + cyc) % cyc; i = Math.floor(ph); u = ph - i; if (i >= n - 1) { i = Math.max(0, cyc - 1 - i); u = 1 - u; } }
    const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const P = lerp(A.keys[i], A.keys[(i + 1) % n], e), J = place(A, P, st.ref);
    const cam = st.cam, ca = Math.cos(cam.az * D), sa = Math.sin(cam.az * D), ce = Math.cos(cam.el * D), se = Math.sin(cam.el * D);
    const sc = Math.min(W, H * 1.25) * (st.big ? 1.15 : 1.9); // vignette : on zoome sur le mannequin
    const pr = v => { const x = v[0] * ca - v[2] * sa, z = v[0] * sa + v[2] * ca, y = v[1] - .85; const y2 = y * ce - z * se, z2 = y * se + z * ce; const f = sc / (4.2 - z2); return [W / 2 + x * f, H * .55 - y2 * f, z2, f]; };
    const ink = css('--ink') || '#141414', far = css('--fig-far') || '#A8A7A0', acc = css('--accent') || '#C8102E', line = css('--line') || '#DEDDD8', surf = css('--surface-2') || '#F5F5F3';
    g.clearRect(0, 0, W, H);
    // sol
    g.fillStyle = surf; g.beginPath(); for (let a = 0; a <= 360; a += 12) { const p = pr([Math.cos(a * D) * 1.05, 0, Math.sin(a * D) * 1.05]); a ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.fill();
    g.strokeStyle = line; g.lineWidth = dpr; for (let k = -1; k <= 1; k += .5) { [[[k, 0, -1], [k, 0, 1]], [[-1, 0, k], [1, 0, k]]].forEach(([a, b]) => { const p = pr(a), q = pr(b); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }); }
    g.fillStyle = 'rgba(0,0,0,.10)'; ['RLan', 'LLan', 'pel'].forEach(k => { const p = pr([J[k][0], 0, J[k][2]]); g.beginPath(); g.ellipse(p[0], p[1], 14 * dpr, 4.5 * dpr, 0, 0, 7); g.fill(); });
    const S = [['pel', 'chest', .15, ink], ['chest', 'neck', .07, ink], ['Rsh', 'Lsh', .1, ink], ['RLhip', 'LLhip', .13, ink],
      ['Rsh', 'Rel', .075, ink], ['Rel', 'Rwr', .062, ink], ['Rwr', 'Rha', .05, ink], ['Lsh', 'Lel', .075, far], ['Lel', 'Lwr', .062, far], ['Lwr', 'Lha', .05, far],
      ['RLhip', 'RLkn', .11, ink], ['RLkn', 'RLan', .085, ink], ['RLheel', 'RLtoe', .06, ink], ['LLhip', 'LLkn', .11, far], ['LLkn', 'LLan', .085, far], ['LLheel', 'LLtoe', .06, far]];
    const items = S.map(([a, b, w, col]) => { const p = pr(J[a]), q = pr(J[b]); return { z: (p[2] + q[2]) / 2, d: () => { const f = (p[3] + q[3]) / 2; g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = w * f; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = w * f * .32; g.beginPath(); g.moveTo(p[0] - w * f * .15, p[1] - w * f * .15); g.lineTo(q[0] - w * f * .15, q[1] - w * f * .15); g.stroke(); } }; });
    const h = pr(J.head); items.push({ z: h[2], d: () => { g.fillStyle = ink; g.beginPath(); g.arc(h[0], h[1], LEN.head * .95 * h[3], 0, 7); g.fill(); } });
    (A.props || []).forEach(o => {
      if (o.k === 'band') { const a = pr(J[o.from]), b = pr(o.to); items.push({ z: -9, d: () => { g.strokeStyle = acc; g.lineWidth = 2 * dpr; g.setLineDash([5 * dpr, 4 * dpr]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]); } }); }
      if (o.k === 'post') { const a = pr([o.at[0], 0, o.at[1]]), b = pr([o.at[0], o.h || 1.2, o.at[1]]); items.push({ z: (a[2] + b[2]) / 2, d: () => { g.strokeStyle = far; g.lineWidth = 3 * dpr; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }); }
      if (o.k === 'kb' || o.k === 'db1') { const m = [(J[o.at[0]][0] + J[o.at[1]][0]) / 2, (J[o.at[0]][1] + J[o.at[1]][1]) / 2 - .04, (J[o.at[0]][2] + J[o.at[1]][2]) / 2]; const p = pr(m); items.push({ z: p[2] + .05, d: () => { g.fillStyle = acc; g.strokeStyle = acc; g.beginPath(); g.arc(p[0], p[1], .075 * p[3], 0, 7); g.fill(); if (o.k === 'kb') { g.lineWidth = .022 * p[3]; g.beginPath(); g.arc(p[0], p[1] - .08 * p[3], .04 * p[3], Math.PI, 0); g.stroke(); } } }); }
      if (o.k === 'db') { const p = pr(J[o.at]); items.push({ z: p[2] + .02, d: () => { g.fillStyle = acc; g.beginPath(); g.arc(p[0], p[1], .055 * p[3], 0, 7); g.fill(); } }); }
      if (o.k === 'bar') { const a = J[o.at[0]], b = J[o.at[1]], dv = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const p = pr(add(a, dv, -.9)), q = pr(add(b, dv, .9)); items.push({ z: (p[2] + q[2]) / 2 + .05, d: () => { g.strokeStyle = acc; g.lineCap = 'round'; g.lineWidth = .035 * p[3]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.lineWidth = .12 * p[3]; [p, q].forEach(e => { g.beginPath(); g.moveTo(e[0], e[1]); g.lineTo(e[0] + .001, e[1]); g.stroke(); }); } }); }
      if (o.k === 'box') { const [x0, x1] = o.x, [z0, z1] = o.z, y = o.y; const V = [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1], [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(pr);
        const F = [[4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
        F.forEach((f, fi) => items.push({ z: f.reduce((s, k) => s + V[k][2], 0) / 4 - (fi ? 0 : .02), d: () => { g.fillStyle = fi ? far : line; g.globalAlpha = fi ? .55 : .9; g.beginPath(); f.forEach((k, j) => j ? g.lineTo(V[k][0], V[k][1]) : g.moveTo(V[k][0], V[k][1])); g.closePath(); g.fill(); g.globalAlpha = 1; } })); }
    });
    items.sort((a, b) => a.z - b.z).forEach(it => it.d());
  }
  // ---------------- montage dans la page ----------------
  const live = new Set(); let raf = 0;
  function loop(now) {
    raf = 0;
    for (const st of live) {
      if (!st.el.isConnected) { live.delete(st); continue; }
      const r = st.cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.width === 0) continue;
      if (st.cv.width !== Math.round(r.width * st.dpr) || st.cv.height !== Math.round(r.height * st.dpr)) { st.cv.width = Math.round(r.width * st.dpr); st.cv.height = Math.round(r.height * st.dpr); }
      draw(st, now);
    }
    if (live.size) raf = requestAnimationFrame(loop);
  }
  function mount(el, id) {
    const A = A3[id]; if (!A) return false;
    const big = !!el.closest('.stage'), dpr = Math.min(2, window.devicePixelRatio || 1);
    el.innerHTML = `<div class="m3d" style="position:relative;width:100%;height:${big ? '100%' : 'auto'};aspect-ratio:${big ? 'auto' : '4/3'}"><canvas style="width:100%;height:100%;display:block;touch-action:${big ? 'none' : 'auto'};cursor:${big ? 'grab' : 'default'}"></canvas>${big ? `<div class="m3d-v" style="position:absolute;left:6px;top:6px;display:flex;gap:4px">${Object.keys(VIEWS).map(v => `<button type="button" data-v="${v}" class="btn sm ghost" style="padding:3px 8px;font-size:11px;min-height:0">${VIEW_LABEL[v]}</button>`).join('')}</div><div style="position:absolute;right:8px;bottom:6px;font-size:10px;opacity:.6">3D · glisse</div>` : ''}</div>`;
    if (big) { el.style.height = '100%'; el.style.alignSelf = 'stretch'; }
    const cv = el.querySelector('canvas'), st = { el, cv, big, g: cv.getContext('2d'), A, dpr, t0: performance.now(), cam: { az: VIEWS[A.view][0], el: VIEWS[A.view][1] } };
    st.ref = A.plant === 'none' ? null : (() => { const J = joints(A.keys[0]); const minY = Math.min(...Object.keys(J).filter(k => k !== 'head').map(k => J[k][1])); for (const k in J) J[k] = add(J[k], [0, -minY, 0]); return J; })();
    if (big) {
      const setV = v => { st.cam = { az: VIEWS[v][0], el: VIEWS[v][1] }; el.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === v)); };
      el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); setV(b.dataset.v); }));
      setV(A.view);
      let dr = null;
      cv.addEventListener('pointerdown', e => { dr = { x: e.clientX, y: e.clientY, az: st.cam.az, el: st.cam.el }; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* */ } });
      cv.addEventListener('pointermove', e => { if (!dr) return; st.cam.az = dr.az - (e.clientX - dr.x) * .6; st.cam.el = Math.max(-5, Math.min(85, dr.el + (e.clientY - dr.y) * .35)); el.querySelectorAll('[data-v]').forEach(b => b.classList.remove('on')); });
      const end = () => { dr = null; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    }
    live.add(st); if (!raf) raf = requestAnimationFrame(loop);
    return true;
  }
  KP.A3D = A3;
  KP.m3d = { has: ex => !!(ex && A3[ex.anim]), mount: (el, ex) => mount(el, ex.anim), pose, joints, VIEWS };
})(window.KP = window.KP || {});
