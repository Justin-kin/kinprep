/* KinPrep — interface */
(function (KP) {
  const C = KP.cal, G = KP.gen, ST = KP.store, SB = KP.sb;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = () => ST.data;
  const P = () => ST.data.profile;

  // ---------- icônes ----------
  const I = {
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
    dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    week: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', plan: '<path d="M4 6h16M4 12h10M4 18h13"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', team: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 0 5.5 2.4 5.5 5.8"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c0-4 3.4-7 7.5-7s7.5 3 7.5 7"/>', play: '<path d="M8 5.5v13l11-6.5z"/>', timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 3h5"/>',
    bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>', swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  };
  const ic = (n, fill) => `<svg viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  // ---------- état ----------
  const today = () => new Date();
  const curWeek = () => Math.min(C.NWEEKS, Math.max(C.FIRST, C.weekOf(today())));
  const WN = n => C.wkName(n);
  const st = { tab: 'semaine', n: curWeek(), page: null, sheet: null, player: null, lieux: {}, team: null, feed: null, chat: [] };
  const PHC = { beta: '--ph-trans', beta_ppg: '--ph-ppg', beta_force: '--ph-force', beta_puiss: '--ph-puiss', beta_decharge: '--ph-trans', ppg: '--ph-ppg', force: '--ph-force', puissance: '--ph-puiss', pic1: '--ph-pic', transition: '--ph-trans', ppg2: '--ph-ppg', force2: '--ph-force', puissance2: '--ph-puiss', specifique: '--ph-spec', affutage: '--ph-aff' };
  const WTYPE = { up: 'Montée en charge', light: 'Semaine plus légère', deload: 'Semaine de décharge', taper: 'Affûtage', comp: 'Semaine de compétition', maint: 'Entretien', recup: 'Récupération', rest: 'Repos actif' };

  function save() { ST.save(); }
  function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 2600); }
  const fmtRest = s => s >= 60 ? `${Math.floor(s / 60)}'${s % 60 ? String(s % 60).padStart(2, '0') : ''}` : `${s}"`;
  const rxText = it => { const x = it.ex, p = it.p; const per = x.uni || x.side ? '/côté' : ''; const v = x.load === 'time' ? `${p.t} s` : `${p.r}`; return `<b>${p.s} × ${v}</b>${per}${x.load !== 'time' && x.load !== 'plyo' ? ` · RPE cible ${String(p.rpe).replace('.', ',')}` : ''} · repos ${fmtRest(p.rest)}`; };
  const figThumb = (exId) => `<div class="thumb" data-anim="${esc(exId)}"></div>`;
  function week(n) { const p = P(); return G.buildWeek(n, p, D().checkins[n] || {}, { lieux: st.lieux[n] || {} }); }
  const logOf = (n, key) => D().logs.find(l => l.week === n && l.key === key);

  // ---------- profil d'exemple ----------
  const SAMPLE = () => ({ name: 'Joueur exemple', role: 'ailier', arm: 'droite', xp: 2, eq: ['elastique', 'mini_band', 'halteres', 'corde', 'swiss', 'medball'], max: { halteres: 24 }, salle: true, eqSalle: KP.GYM_SET.slice(), days: [0, 1, 2, 3, 4, 5, 6], clubDays: [1, 3], clubN: 2, maxMin: 60, vma: 16.5, fcmax: 192, po: true, cc: true, pain: {}, overrides: {}, bans: {}, share: true, demo: true, created: Date.now() });

  // =====================================================================
  // RENDU PRINCIPAL
  // =====================================================================
  function render() {
    const app = $('#app');
    if (!P()) { app.innerHTML = onboarding(); after(); return; }
    let body = '';
    if (st.tab === 'semaine') body = viewWeek();
    if (st.tab === 'plan') body = viewPlan();
    if (st.tab === 'progres') body = viewProgress();
    if (st.tab === 'equipe') body = viewTeam();
    if (st.tab === 'profil') body = viewProfile();
    app.innerHTML = body + tabs();
    renderOverlays();
    after();
  }
  function after() { KP.fig.mountAll(document); }
  function tabs() {
    const T = [['semaine', 'Semaine', 'week'], ['plan', 'Plan', 'plan'], ['progres', 'Progrès', 'chart'], ['equipe', 'Équipe', 'team'], ['profil', 'Profil', 'user']];
    return `<nav class="tabs" aria-label="Navigation"><div>${T.map(([id, l, i]) => `<button data-a="tab" data-v="${id}" class="${st.tab === id ? 'on' : ''}" aria-current="${st.tab === id}">${ic(i)}<span>${l}</span></button>`).join('')}</div></nav>`;
  }

  // ---------- SEMAINE ----------
  function viewWeek() {
    const n = st.n, w = week(n), ph = w.ph.phase, p = P();
    const before = today() < C.START;
    const pct = Math.round(((w.ph.wi + 1) / w.ph.nInPhase) * 100);
    const days = Array.from({ length: 7 }, (_, d) => {
      const date = new Date(C.weekStart(n).getTime() + d * C.DAY);
      const isToday = C.iso(date) === C.iso(today());
      const ev = w.load.events.filter(e => e.dow <= d && d < e.dow + e.days);
      const club = C.clubActive(n) && (p.clubDays || [1, 3]).includes(d) && (D().checkins[n] || {}).club !== 0;
      const ss = w.sessions.filter(s => s.day === d);
      return `<div class="day ${isToday ? 'today' : ''}"><span class="dn">${C.JOURS[d]}</span><span class="dd num">${date.getDate()}</span>
        ${ev.map(e => `<span class="tag ev ${e.type}" title="${esc(e.label)}">${esc(e.type === 'J' ? 'Match' : e.type === 'COMP' ? 'Compét.' : e.type === 'STAGE' ? 'Stage' : e.type === 'INFO' ? 'Event' : e.type)}</span>`).join('')}
        ${club ? '<span class="tag club">Club</span>' : ''}
        ${ss.map(s => `<span class="tag ${logOf(n, s.key) ? 'done' : 's-' + (s.kind === 'cardio' ? 'cardio' : 'renfo')}">${s.key}</span>`).join('')}</div>`;
    }).join('');
    const mode = w.mode, M = G.MODES[mode];
    const ci = D().checkins[n];
    const essential = w.sessions.filter(s => s.essential === true);
    const doneEss = essential.filter(s => logOf(n, s.key)).length;
    return `
    <header class="top"><div class="brand"><span class="flag" aria-hidden="true"><i></i><i></i><i></i></span>Kin<b>Prep</b></div>
      <div class="wknav"><button class="icon-btn" data-a="wk" data-v="-1" aria-label="Semaine précédente" ${n <= C.FIRST ? 'disabled' : ''}>${ic('left')}</button>
      <div class="wk-label"><div class="w num">${n <= 0 ? `Bêta ${n + 4}<span class="muted" style="font-size:13px"> /4</span>` : `Semaine ${n}<span class="muted" style="font-size:13px"> /${C.NWEEKS}</span>`}</div><div class="d">${C.weekLabel(n)}</div></div>
      <button class="icon-btn" data-a="wk" data-v="1" aria-label="Semaine suivante" ${n >= C.NWEEKS ? 'disabled' : ''}>${ic('right')}</button></div></header>
    <div class="stack">
      ${p.demo ? `<div class="demo"><span class="grow">Profil d'exemple : les séances s'adaptent à son matériel. Crée le tien pour un programme personnel.</span><button class="btn sm primary" data-a="newprofile">Créer</button></div>` : ''}
      ${today() < C.weekStart(C.FIRST) && n === C.FIRST ? `<div class="note">La bêta démarre le lundi 9 novembre 2026. Tu peux déjà parcourir les semaines.</div>` : ''}
      ${n <= 0 ? `<div class="note acc small"><b>Version bêta.</b> Ces 4 semaines servent à tester l'appli avant le vrai départ du 7 décembre. Tes séances bêta restent séparées du programme officiel.</div>` : ''}
      ${n !== curWeek() ? `<button class="link" data-a="today" style="align-self:flex-start">Revenir à la semaine en cours</button>` : ''}
      <section class="phase" style="--phc:var(${PHC[ph.id]});${['puissance', 'puissance2', 'specifique'].includes(ph.id) ? '--phfg:#141414' : ''}">
        <div class="eyebrow" style="color:inherit;opacity:.8">${n <= 0 ? `Bêta · semaine ${w.ph.wi + 1} sur 4` : `Bloc ${C.PHASES.indexOf(ph) + 1} · semaine ${w.ph.wi + 1} sur ${w.ph.nInPhase}`}</div>
        <h2 style="margin-top:6px">${esc(ph.name)}</h2>
        <div class="meta"><span class="pill">${WTYPE[w.ph.wtype] || ''}</span>${w.load.events.filter(e => e.type !== 'INFO').map(e => `<span class="pill">${esc(e.label)}</span>`).join('')}</div>
        <p>${esc(ph.goal)}</p>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </section>
      <div class="days" aria-label="Jours de la semaine">${days}</div>
      <button class="card mode mode-${mode}" data-a="checkin" style="border:0;text-align:left;width:100%">
        ${gauge(w.load.score)}
        <div class="grow"><div class="eyebrow">${ci ? 'Charge de la semaine' : 'Charge estimée · à confirmer'}</div><div class="lbl" style="margin-top:4px">Semaine ${M.label.toLowerCase()}</div>
        <div class="small muted" style="margin-top:3px">${esc(w.load.why.join(' · ') || 'Aucune contrainte déclarée')}</div></div>
        <span class="btn sm ghost">Ajuster</span></button>
      <div class="row" style="margin-top:6px"><h3 class="grow" style="font-size:22px">Tes séances</h3><span class="small muted num">${doneEss}/${essential.length} essentielles faites</span></div>
      ${w.sessions.map(s => sessCard(n, s)).join('')}
      ${w.hidden.length ? `<details class="card flat"><summary class="small" style="cursor:pointer;font-weight:600">${w.hidden.length} séance${w.hidden.length > 1 ? 's' : ''} retirée${w.hidden.length > 1 ? 's' : ''} pour alléger la semaine</summary><div class="stack" style="margin-top:10px">${w.hidden.map(s => sessCard(n, s, true)).join('')}</div></details>` : ''}
      <details class="card flat"><summary style="cursor:pointer;font-weight:600">Les priorités du bloc</summary><ul class="cues" style="margin-top:8px">${ph.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>
    </div>`;
  }
  function gauge(score) {
    const v = Math.min(1, score / 11), r = 21, c = 2 * Math.PI * r;
    return `<svg class="gauge" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="26" cy="26" r="${r}" fill="none" stroke="var(--mc)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 26 26)"/><text x="26" y="31" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="16" fill="var(--ink)">${Math.round(score)}</text></svg>`;
  }
  function sessThumbId(s) {
    if (s.kind === 'renfo') { const it = s.blocks.flatMap(b => b.items).find(i => i.kind === 'main') || s.blocks[0]?.items[0]; return it ? it.ex.id : 'squat_pdc'; }
    if (s.kind === 'cardio') { const r = s.blocks.find(b => b.type === 'role'); return r ? r.drills[0].ex.id : 'run'; }
    if (s.kind === 'test') return 'broad_jump';
    return 'worlds_greatest';
  }
  function sessCard(n, s, hidden) {
    const lg = logOf(n, s.key);
    const kind = { renfo: 'Renfo', cardio: 'Cardio', test: 'Tests', mobilite: 'Récupération' }[s.kind];
    const ess = s.essential === true ? '<span class="badge ess">Essentielle</span>' : s.essential === 'conseillee' ? '<span class="badge cons">Conseillée</span>' : '<span class="badge">Facultative</span>';
    const day = s.day != null ? `${C.JOURS_LONG[s.day]} conseillé` : '';
    return `<button class="sess ${s.kind} ${lg ? 'done' : ''}" data-a="open-sess" data-k="${s.key}" ${hidden ? 'data-hidden="1"' : ''}>
      ${figThumb(sessThumbId(s))}
      <div style="min-width:0"><div class="row" style="gap:6px"><span class="k">${kind}</span>${ess}</div><div class="ttl">${esc(s.title)}</div>
      <div class="sub num">≈ ${s.min} min${day ? ' · ' + day : ''}${lg ? ` · faite le ${new Date(lg.date).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })}` : ''}</div></div>
      <span class="check ${lg ? 'on' : ''}">${lg ? ic('check') : ''}</span></button>`;
  }

  // ---------- PLAN ----------
  function viewPlan() {
    const p = P(), cw = curWeek();
    return `<header class="top"><h1 style="font-size:28px">Plan de la saison</h1></header>
    <div class="stack">
      <p class="muted" style="margin:0">4 semaines de bêta (9 nov. → 6 déc.), puis 47 semaines, du 7 décembre 2026 à la World Cup. Deux pics de forme : les play-offs et la Challenge Cup au printemps, puis la World Cup fin octobre.</p>
      ${[C.BETA_INFO].concat(C.PHASES).map(ph => `<div class="ph-head" style="--phc:var(${PHC[ph.id]})"><span class="sw"></span><h3 style="font-size:20px">${esc(ph.name)}</h3><span class="small muted">${WN(ph.w[0])}${ph.w[1] !== ph.w[0] ? '–' + WN(ph.w[1]) : ''}</span></div>
        ${Array.from({ length: ph.w[1] - ph.w[0] + 1 }, (_, i) => ph.w[0] + i).map(n => {
          const ev = C.eventsOfWeek(n, p).filter(e => e.type !== 'INFO');
          const ess = ['R1', 'C1'];
          return `<button class="ph-row ${n === cw ? 'cur' : ''}" data-a="goweek" data-v="${n}"><span class="w num">${WN(n)}</span>
            <span style="min-width:0"><span class="small">${C.weekLabel(n)} · ${n <= 0 ? esc(C.phaseOf(n).phase.short) : WTYPE[C.phaseOf(n).wtype] || ''}</span><br>${ev.map(e => `<span class="tag ev ${e.type}" style="display:inline-block;margin:3px 3px 0 0">${esc(e.label)}</span>`).join('')}</span>
            <span class="dots">${ess.map(k => `<i class="${logOf(n, k) ? 'on' : ''}"></i>`).join('')}</span></button>`;
        }).join('')}`).join('')}
    </div>`;
  }

  // ---------- PROGRÈS ----------
  function viewProgress() {
    const L = D().logs, cw = curWeek();
    const NB = C.NWEEKS - C.FIRST + 1, wOf = i => i + C.FIRST;
    const byWeek = Array.from({ length: NB }, (_, i) => L.filter(l => l.week === wOf(i)).reduce((a, l) => a + (+l.rpe || 0) * (+l.dur || 0), 0));
    const max = Math.max(400, ...byWeek);
    const W = 340, H = 140, bw = W / NB;
    const bars = byWeek.map((v, i) => { const h = (v / max) * (H - 24); const ph = C.phaseOf(wOf(i)).phase; return `<rect x="${(i * bw + 1).toFixed(1)}" y="${(H - 16 - h).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${Math.max(v ? 2 : 0, h).toFixed(1)}" rx="1.5" fill="var(${PHC[ph.id]})"><title>${WN(wOf(i))} : ${Math.round(v)} UA</title></rect>`; }).join('');
    const ticks = [-3, 1, 10, 20, 30, 40, 47].map(n => `<text x="${Math.max(8, Math.min(W - 8, (n - C.FIRST + 0.5) * bw)).toFixed(1)}" y="${H - 3}" font-size="9" text-anchor="middle" fill="var(--muted)">${WN(n)}</text>`).join('');
    const doneR = L.filter(l => l.kind === 'renfo').length, doneC = L.filter(l => l.kind === 'cardio').length;
    const upto = Array.from({ length: Math.max(0, cw - C.FIRST + 1) }, (_, i) => i + C.FIRST);
    const planned = upto.reduce((a, n) => a + week(n).sessions.filter(s => s.essential === true).length, 0);
    const doneEss = upto.reduce((a, n) => a + week(n).sessions.filter(s => s.essential === true && logOf(n, s.key)).length, 0);
    const exIds = [...new Set(L.flatMap(l => Object.keys(l.ex || {})))].filter(id => KP.EX_BY_ID[id] && ['kg', 'lest'].includes(KP.EX_BY_ID[id].load));
    const sel = st.progEx && exIds.includes(st.progEx) ? st.progEx : exIds[0];
    const tests = L.filter(l => l.kind === 'test');
    return `<header class="top"><h1 style="font-size:28px">Progrès</h1></header>
    <div class="stack">
      <div class="row" style="gap:8px">
        <div class="card grow"><div class="eyebrow">Séances essentielles</div><div class="big num" style="font-size:40px;margin-top:6px">${doneEss}<small>/${planned}</small></div></div>
        <div class="card grow"><div class="eyebrow">Réalisées</div><div class="num" style="font:700 20px/1.3 var(--display);margin-top:8px">${doneR} renfo<br>${doneC} cardio</div></div>
      </div>
      <div class="card"><div class="eyebrow">Charge hebdomadaire (RPE × minutes)</div>
        <div class="tbl" style="margin-top:8px"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:300px;height:auto" role="img" aria-label="Charge par semaine"><line x1="0" x2="${W}" y1="${H - 16}" y2="${H - 16}" stroke="var(--line)"/>${bars}${ticks}</svg></div>
        <p class="small muted" style="margin:6px 0 0">La couleur indique le bloc. Une charge stable d'une semaine à l'autre limite le risque de blessure.</p></div>
      <div class="card"><div class="eyebrow">Force estimée (1RM)</div>
        ${exIds.length ? `<select id="progEx" data-a="progex" style="margin-top:8px">${exIds.map(id => `<option value="${id}" ${id === sel ? 'selected' : ''}>${esc(KP.EX_BY_ID[id].n)}</option>`).join('')}</select>${lineChart(sel)}` : `<p class="muted small">Note tes charges pendant les séances pour voir ta progression ici.</p>`}</div>
      <div class="card"><div class="eyebrow">Tests</div>${tests.length ? `<div class="tbl" style="margin-top:8px"><table><thead><tr><th>Date</th>${G.TESTS.map(t => `<th>${esc(t.label.split(' (')[0])}</th>`).join('')}</tr></thead><tbody>${tests.map(t => `<tr><td>${new Date(t.date).toLocaleDateString('fr-BE')}</td>${G.TESTS.map(x => `<td class="num">${t.tests && t.tests[x.id] ? esc(t.tests[x.id]) + ' ' + x.unit : '–'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Les tests sont proposés en B1 (bêta), S1, S25 et S40.</p>'}
      ${P().vma ? `<p class="small" style="margin:8px 0 0">VMA utilisée pour tes allures : <b class="num">${P().vma} km/h</b></p>` : ''}</div>
    </div>`;
  }
  function lineChart(id) {
    const pts = D().logs.filter(l => l.ex && l.ex[id]).map(l => { const best = (l.ex[id].sets || []).filter(s => +s.kg > 0 && +s.r > 0).map(s => G.e1rm(+s.kg, +s.r, +s.rpe || 8)); return best.length ? { w: l.week, v: Math.max(...best) } : null; }).filter(Boolean);
    if (pts.length < 1) return '<p class="muted small">Pas encore de données.</p>';
    const W = 320, H = 150, mn = Math.min(...pts.map(p => p.v)) * 0.9, mx = Math.max(...pts.map(p => p.v)) * 1.05;
    const x = w => 26 + ((w - C.FIRST) / (C.NWEEKS - C.FIRST)) * (W - 36), y = v => H - 20 - ((v - mn) / (mx - mn || 1)) * (H - 36);
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.w).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;margin-top:8px" role="img" aria-label="Progression">
      ${[mn, (mn + mx) / 2, mx].map(v => `<line x1="26" x2="${W - 8}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="22" y="${y(v) + 3}" font-size="9" text-anchor="end" fill="var(--muted)">${Math.round(v)}</text>`).join('')}
      <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.map(p => `<circle cx="${x(p.w)}" cy="${y(p.v)}" r="3" fill="var(--accent)"/>`).join('')}
      <text x="${x(last.w)}" y="${y(last.v) - 8}" font-size="11" font-weight="700" text-anchor="middle" fill="var(--ink)">${Math.round(last.v)} kg</text>
      <text x="26" y="${H - 4}" font-size="9" fill="var(--muted)">B1</text><text x="${W - 8}" y="${H - 4}" font-size="9" text-anchor="end" fill="var(--muted)">S47</text></svg>`;
  }

  // ---------- ÉQUIPE ----------
  function viewTeam() {
    const head = `<header class="top"><h1 style="font-size:28px">Équipe</h1></header>`;
    if (!SB.enabled()) return head + `<div class="stack"><div class="card"><h3 style="font-size:20px">Espace équipe non relié</h3><p class="muted">Quand l'application sera reliée à la base de l'équipe, tu verras ici les séances de tes coéquipiers, et les coachs auront une vue sur tout le groupe.</p><p class="small muted" style="margin:0">Tes données restent pour l'instant sur cet appareil. Pense à les exporter depuis l'onglet Profil.</p></div></div>`;
    if (!SB.user()) return head + authForm();
    const tm = st.feed;
    if (!tm) { loadFeed(); return head + '<div class="card muted">Chargement…</div>'; }
    if (tm.error) return head + `<div class="card"><p>${esc(tm.error)}</p><button class="btn sm" data-a="reload-feed">Réessayer</button></div>`;
    const me = tm.me || {};
    const staff = me.role === 'coach' || me.role === 'admin';
    if (!me.approved && !staff) return head + `<div class="card"><h3 style="font-size:20px">Compte en attente</h3><p class="muted">L'administrateur doit valider ton compte avant que tu voies le fil de l'équipe. Tes séances sont déjà enregistrées.</p><button class="btn sm ghost" data-a="logout">Se déconnecter</button></div>`;
    const rc = {}; tm.reacts.forEach(r => { (rc[r.log_id] = rc[r.log_id] || []).push(r.user_id); });
    const myId = SB.user().id;
    return head + `<div class="stack">
      ${staff ? `<div class="seg"><button class="${st.teamTab !== 'coach' ? 'on' : ''}" data-a="teamtab" data-v="feed">Fil</button><button class="${st.teamTab === 'coach' ? 'on' : ''}" data-a="teamtab" data-v="coach">Vue coach</button></div>` : ''}
      ${st.teamTab === 'coach' && staff ? coachView(me) : tm.logs.map(l => {
        const r = rc[l.id] || [], mine = r.includes(myId), d = l;
        return `<div class="card"><div class="row"><div class="grow"><b>${esc(l.author || 'Joueur')}</b> <span class="muted small">· ${ago(l.done_at)}</span><div style="font:700 18px/1.2 var(--display);margin-top:3px">${esc(l.title || l.session_key)}</div>
          <div class="small muted num">${WN(l.week)} · ${d.dur || '?'} min · RPE ${d.rpe || '?'}${d.km ? ' · ' + d.km + ' km' : ''}</div></div>
          <button class="btn sm ${mine ? 'primary' : 'ghost'}" data-a="react" data-v="${l.id}" data-on="${mine ? 0 : 1}" aria-pressed="${mine}">Bravo${r.length ? ' · ' + r.length : ''}</button></div></div>`;
      }).join('') || '<div class="card muted">Aucune séance partagée pour l\'instant.</div>'}
      <button class="btn ghost sm" data-a="logout">Se déconnecter (${esc(SB.user().email || '')})</button></div>`;
  }
  function ago(t) { const m = Math.round((Date.now() - new Date(t)) / 60000); if (m < 60) return `il y a ${m} min`; const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`; return `il y a ${Math.round(h / 24)} j`; }
  async function loadFeed() {
    try { const [f, me] = await Promise.all([SB.feed(), SB.me()]); st.feed = Object.assign(f, { me }); if (me && (me.role === 'coach' || me.role === 'admin')) st.team = await SB.team(); }
    catch (e) { st.feed = { error: 'Impossible de charger le fil : ' + e.message }; }
    if (st.tab === 'equipe') render();
  }
  const hm = m => { m = Math.round(m || 0); if (!m) return '–'; const h = Math.floor(m / 60); return h ? `${h} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}` : `${m} min`; };
  const ROLE_LB = { joueur: 'Joueur', coach: 'Coach', admin: 'Admin' };
  function coachView(me) {
    const t = st.team; if (!t) return '<div class="card muted">Chargement…</div>';
    const admin = me.role === 'admin', myId = SB.user().id;
    const cw = curWeek(), nW = st.coachWeeks || 6;
    const weeks = []; for (let n = cw; n >= Math.max(C.FIRST, cw - nW + 1); n--) weeks.push(n);
    const pend = t.profs.filter(p => !p.approved && p.role === 'joueur');
    const lgOf = id => t.logs.filter(l => l.user_id === id);
    // joueurs suivis : comptes validés qui jouent (le staff n'apparaît que s'il encode des séances)
    const players = t.profs.filter(p => (p.approved || p.role !== 'joueur') && (p.role === 'joueur' || lgOf(p.id).length)).sort((a, b) => a.display_name.localeCompare(b.display_name));
    const rows = players.map(p => {
      const lg = lgOf(p.id);
      const ci = t.cis.find(c => c.user_id === p.id && c.week === cw);
      const pain = p.data && p.data.pain ? Object.keys(p.data.pain) : [];
      const tot = weeks.reduce((a, n) => a + lg.filter(l => l.week === n).reduce((x, l) => x + ((l.data || {}).dur || 0), 0), 0);
      return `<tr data-a="coach-player" data-v="${p.id}" style="cursor:pointer"><td><b>${esc(p.display_name)}</b>${pain.length ? ' <span class="tag ev COMP" title="Douleur déclarée">!</span>' : ''}<br><span class="muted">${esc((KP.ROLES.find(r => r.id === (p.data || {}).role) || {}).label || '')}${ci && ci.data && ci.data.fatigue ? ' · fatigue ' + ci.data.fatigue + '/5' : ''}</span></td>
        ${weeks.map(n => { const l = lg.filter(x => x.week === n), m = l.reduce((a, x) => a + ((x.data || {}).dur || 0), 0); return `<td class="num" style="white-space:nowrap">${hm(m)}${l.length ? `<br><span class="muted small">${l.length} séance${l.length > 1 ? 's' : ''}</span>` : ''}</td>`; }).join('')}
        <td class="num" style="white-space:nowrap"><b>${hm(tot)}</b></td></tr>`;
    }).join('');
    const staffCard = admin ? `<div class="card"><div class="eyebrow">Comptes et rôles</div><p class="small muted" style="margin:6px 0 0">Les coachs voient les résultats de tous les joueurs, sans pouvoir modifier les comptes.</p>
      ${t.profs.filter(p => p.id !== myId && (p.approved || p.role !== 'joueur')).sort((a, b) => a.display_name.localeCompare(b.display_name)).map(p => `<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)"><div class="row"><b class="grow">${esc(p.display_name)}</b><span class="tag">${ROLE_LB[p.role] || p.role}</span></div><div class="row wrap" style="gap:6px;margin-top:6px">
        ${p.role === 'admin' ? '' : p.role === 'coach' ? `<button class="btn sm ghost" data-a="setrole" data-v="${p.id}" data-r="joueur">Retirer coach</button>` : `<button class="btn sm ghost" data-a="setrole" data-v="${p.id}" data-r="coach">Nommer coach</button>`}
        ${p.role === 'joueur' ? `<button class="btn sm ghost" data-a="unapprove" data-v="${p.id}">Retirer l'accès</button>` : ''}</div></div>`).join('')}</div>` : '';
    return `${pend.length ? `<div class="card"><div class="eyebrow">Comptes en attente</div>${pend.map(p => `<div class="row" style="margin-top:10px"><span class="grow">${esc(p.display_name)}</span>${admin ? `<button class="btn sm primary" data-a="approve" data-v="${p.id}">Valider</button>` : '<span class="small muted">validation par l\'admin</span>'}</div>`).join('')}</div>` : ''}
      <div class="card"><div class="row"><div class="eyebrow grow">Temps d'entraînement encodé</div><button class="link small" data-a="coachweeks">${nW === 6 ? 'Toute la saison' : '6 dernières semaines'}</button></div>
        <p class="small muted" style="margin:6px 0 0">Total des séances notées par chaque joueur (renfo, cardio, tests, autres activités). Touche un joueur pour voir le détail.</p>
        <div class="tbl" style="margin-top:8px"><table><thead><tr><th>Joueur</th>${weeks.map(n => `<th>${WN(n)}</th>`).join('')}<th>Total</th></tr></thead><tbody>${rows || `<tr><td colspan="${weeks.length + 2}" class="muted">Aucun joueur validé.</td></tr>`}</tbody></table></div></div>
      ${staffCard}`;
  }
  function playerSheet(id) {
    const t = st.team || { profs: [], logs: [], cis: [] }, p = t.profs.find(x => x.id === id); if (!p) return '<p>Joueur introuvable.</p>';
    const d = p.data || {}, lg = t.logs.filter(l => l.user_id === id).slice().sort((a, b) => new Date(b.done_at) - new Date(a.done_at));
    const cis = t.cis.filter(c => c.user_id === id).sort((a, b) => b.week - a.week).slice(0, 6);
    const pain = Object.entries(d.pain || {});
    const zl = z => (KP.ZONES.find(x => x.id === z) || {}).label || z;
    const eqN = (d.eq || []).map(e => (KP.EQUIP[e] || {}).label || e);
    const logHTML = l => {
      const x = l.data || {};
      let det = '';
      if (x.ex) det = Object.entries(x.ex).map(([eid, e]) => `<div class="small" style="margin-top:4px"><b>${esc((KP.EX_BY_ID[eid] || {}).n || eid)}</b> <span class="muted num">${(e.sets || []).map(z => `${z.r ?? '?'}${z.kg != null ? ' × ' + z.kg + ' kg' : ''}${z.rpe ? ' @' + String(z.rpe).replace('.', ',') : ''}`).join(' · ')}</span></div>`).join('');
      if (x.kind === 'cardio') det = `<div class="small muted num" style="margin-top:4px">${esc(x.mode || '')}${x.km ? ' · ' + x.km + ' km' : ''}${x.fc ? ' · FC ' + x.fc : ''}${x.dplus ? ' · D+ ' + x.dplus + ' m' : ''}</div>`;
      if (x.tests) det = `<div class="small muted num" style="margin-top:4px">${Object.entries(x.tests).map(([k, v]) => { const tt = G.TESTS.find(z => z.id === k) || {}; return `${esc(tt.label || k)} : ${esc(String(v))} ${esc(tt.unit || '')}`; }).join(' · ')}</div>`;
      return `<details class="card" style="padding:12px 14px"><summary style="cursor:pointer;list-style:none"><div class="row"><div class="grow"><b>${esc(l.title || l.session_key)}</b><div class="small muted num">${WN(l.week)} · ${l.done_at ? new Date(l.done_at).toLocaleDateString('fr-BE') : ''} · ${hm(x.dur)} · RPE ${x.rpe || '?'}</div></div></div></summary>
        ${det}${x.note ? `<div class="note small" style="margin-top:8px">${esc(x.note)}</div>` : ''}</details>`;
    };
    return `<h2 style="font-size:26px">${esc(p.display_name)}</h2>
      <p class="small muted" style="margin:4px 0 12px">${esc((KP.ROLES.find(r => r.id === d.role) || {}).label || '')}${d.xp ? ' · niveau ' + d.xp : ''}${d.vma ? ' · VMA ' + d.vma + ' km/h' : ''}${d.maxMin ? ' · ' + d.maxMin + ' min max' : ''}</p>
      <div class="stack" style="gap:10px">
      ${pain.length ? `<div class="note crit small">Douleur déclarée : ${pain.map(([z, dt]) => `${esc(zl(z))} depuis le ${new Date(dt).toLocaleDateString('fr-BE')}`).join(', ')}</div>` : ''}
      ${eqN.length ? `<div class="small muted">Matériel : ${esc(eqN.join(', '))}${d.salle ? ' · accès salle' : ''}</div>` : ''}
      ${cis.length ? `<div class="card" style="padding:12px 14px"><div class="eyebrow">Ressenti</div>${cis.map(c => `<div class="small num" style="margin-top:6px">${WN(c.week)} · fatigue ${c.data.fatigue || '–'}/5 · sommeil ${c.data.sommeil || '–'}/5 · club ${c.data.club ?? '–'}${(c.data.extra || []).length ? ' · ' + esc(c.data.extra.map(e => e.label).join(', ')) : ''}</div>`).join('')}</div>` : ''}
      <div class="eyebrow" style="margin-top:4px">Séances (${lg.length})</div>
      ${lg.map(logHTML).join('') || '<p class="muted small">Aucune séance notée.</p>'}</div>`;
  }
  function authForm() {
    const up = st.authMode === 'up';
    return `<form class="card stack" id="authf" data-f="auth"><h3 style="font-size:22px">${up ? 'Créer mon compte' : 'Se connecter'}</h3>
      ${up ? `<label class="f">Prénom et nom<input type="text" id="au_name" required autocomplete="name" value="${esc(P().name || '')}"></label>` : ''}
      <label class="f">E-mail<input type="email" id="au_mail" required autocomplete="email"></label>
      <label class="f">Mot de passe<input type="password" id="au_pw" required minlength="8" autocomplete="${up ? 'new-password' : 'current-password'}"></label>
      <div class="small" id="au_err" style="color:var(--crit)"></div>
      <button class="btn primary block" type="submit">${up ? 'Créer le compte' : 'Se connecter'}</button>
      <button class="link" type="button" data-a="authmode">${up ? 'J\'ai déjà un compte' : 'Pas encore de compte ? Créer un compte'}</button></form>`;
  }

  // ---------- PROFIL ----------
  function viewProfile() {
    const p = P();
    const ov = Object.entries(p.overrides || {}), bans = Object.entries(p.bans || {}).flatMap(([l, a]) => a.map(id => [l, id]));
    return `<header class="top"><h1 style="font-size:28px">Profil</h1></header>
    <div class="stack">${profileForm(p, 'edit')}
      <div class="card"><div class="eyebrow">Douleurs signalées</div>${Object.keys(p.pain || {}).length ? Object.entries(p.pain).map(([z, d]) => `<div class="row" style="margin-top:10px"><span class="grow">${esc((KP.ZONES.find(x => x.id === z) || {}).label)} <span class="muted small">depuis le ${new Date(d).toLocaleDateString('fr-BE')}</span></span><button class="btn sm ghost" data-a="painok" data-v="${z}">Résolue</button></div>`).join('') + '<p class="small muted" style="margin:10px 0 0">Les exercices qui sollicitent ces zones sont retirés du programme. Si la douleur dure plus d\'une semaine, consulte un kiné.</p>' : '<p class="muted small" style="margin:8px 0 0">Aucune douleur en cours.</p>'}</div>
      <div class="card"><div class="eyebrow">Exercices remplacés ou exclus</div>${ov.length || bans.length ? `${ov.map(([k, id]) => `<div class="small" style="margin-top:8px">${k.startsWith('epaule|') ? 'Bloc épaule · ' + esc((KP.EX_BY_ID[k.split('|')[1]] || {}).n || '') : esc(k.split('|')[0]) + ' · ' + esc(k.split('|')[1]) + ' ' + esc(k.split('|')[2])} → <b>${esc((KP.EX_BY_ID[id] || {}).n)}</b></div>`).join('')}${bans.map(([l, id]) => `<div class="small" style="margin-top:8px">Exclu (${l}) : <b>${esc((KP.EX_BY_ID[id] || {}).n)}</b></div>`).join('')}<button class="btn sm ghost" style="margin-top:12px" data-a="resetov">Tout réinitialiser</button>` : '<p class="muted small" style="margin:8px 0 0">Aucun. Signale un exercice depuis une séance pour l\'adapter.</p>'}</div>
      <div class="card stack"><div class="eyebrow">Sauvegarde</div><p class="small muted" style="margin:0">${SB.enabled() && SB.user() ? 'Tes données sont synchronisées avec l\'espace équipe.' : 'Tes données sont enregistrées sur cet appareil. Exporte-les régulièrement.'}</p>
        <div class="row wrap"><button class="btn sm" data-a="export">Exporter</button><button class="btn sm" data-a="import">Importer</button><button class="btn sm ghost" data-a="theme">Thème : ${({ light: 'clair', dark: 'sombre' })[document.documentElement.dataset.theme] || 'système'}</button></div>
        ${st.confirmReset ? `<div class="note crit">Supprimer toutes tes données de cet appareil ? <div class="row" style="margin-top:8px"><button class="btn sm dark" data-a="reset-yes">Oui, tout supprimer</button><button class="btn sm ghost" data-a="reset-no">Annuler</button></div></div>` : `<button class="link" data-a="reset" style="align-self:flex-start;color:var(--crit)">Supprimer mes données</button>`}</div>
      <p class="small muted" style="text-align:center">KinPrep · basé sur la préparation de Nicolas (2023) et la littérature en préparation physique.</p>
    </div>`;
  }

  // ---------- formulaire de profil (onboarding + édition) ----------
  function eqList(sel, maxes, pre) {
    return KP.EQUIP_GROUPS.filter(g => g.id !== 'base').map(g => `<div class="eyebrow" style="margin-top:12px">${g.label}</div>${g.items.map(it => `<label class="ck"><input type="checkbox" id="${pre}_${it.id}" data-eq="${pre}" value="${it.id}" ${sel.includes(it.id) ? 'checked' : ''}><span class="grow">${esc(it.label)}${it.hint && !it.max ? `<br><span class="small muted">${esc(it.hint)}</span>` : ''}</span>${it.max ? `<input type="number" id="${pre}_max_${it.id}" placeholder="kg max" inputmode="decimal" min="0" value="${maxes && maxes[it.id] ? maxes[it.id] : ''}" aria-label="${esc(it.hint)}">` : ''}</label>`).join('')}`).join('');
  }
  function profileForm(p, mode) {
    p = p || {};
    const days = p.days || [0, 1, 2, 3, 4, 5, 6], club = p.clubDays || [1, 3];
    const ob = mode === 'onboard', step = st.obStep || 1;
    const sec = (i, html) => (!ob || step === i) ? html : '';
    return `<form class="stack" id="pf" data-f="profile" data-mode="${mode}">
      ${sec(1, `<div class="card stack"><div class="eyebrow">Toi</div>
        <label class="f">Prénom et nom<input type="text" id="pf_name" required value="${esc(p.name || '')}" autocomplete="name"></label>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Ton rôle en défense</span><div class="stack" style="gap:6px">${KP.ROLES.map(r => `<label class="ck" style="border:1px solid var(--line);border-radius:10px;padding:10px"><input type="radio" name="pf_role" value="${r.id}" ${(p.role || 'pointe') === r.id ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--accent)"><span class="grow"><b>${r.label}</b><br><span class="small muted">${r.desc}</span></span></label>`).join('')}</div></div>
        <div class="row" style="gap:10px"><label class="f grow">Expérience en musculation<select id="pf_xp"><option value="1" ${p.xp == 1 ? 'selected' : ''}>Moins d'un an</option><option value="2" ${!p.xp || p.xp == 2 ? 'selected' : ''}>1 à 3 ans</option><option value="3" ${p.xp == 3 ? 'selected' : ''}>Plus de 3 ans</option></select></label></div></div>`)}
      ${sec(2, `<div class="card"><div class="eyebrow">Ton matériel à la maison</div><p class="small muted" style="margin:6px 0 0">Poids du corps, mur, chaise et tapis sont toujours pris en compte.</p>${eqList(p.eq || [], p.max, 'eqm')}</div>
        <div class="card"><label class="ck" style="border:0;padding:0"><input type="checkbox" id="pf_salle" ${p.salle ? 'checked' : ''}><span class="grow"><b>J'ai aussi accès à une salle de sport</b><br><span class="small muted">Tu pourras choisir « Salle » pour une séance. Tout le matériel courant est supposé disponible.</span></span></label></div>`)}
      ${sec(3, `<div class="card stack"><div class="eyebrow">Ton planning</div>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Jours où tu peux t'entraîner</span><div class="chips">${C.JOURS.map((d, i) => `<label class="chip ${days.includes(i) ? 'on' : ''}"><input type="checkbox" data-day="av" value="${i}" ${days.includes(i) ? 'checked' : ''} hidden>${d}</label>`).join('')}</div></div>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Jours d'entraînement en club</span><div class="chips">${C.JOURS.map((d, i) => `<label class="chip ${club.includes(i) ? 'on' : ''}"><input type="checkbox" data-day="club" value="${i}" ${club.includes(i) ? 'checked' : ''} hidden>${d}</label>`).join('')}</div></div>
        <label class="f">Durée maximale d'une séance<select id="pf_maxMin">${[30, 45, 60].map(m => `<option value="${m}" ${(+p.maxMin || 60) === m ? 'selected' : ''}>${m} minutes</option>`).join('')}</select></label>
        <div class="row" style="gap:10px"><label class="f grow">VMA (km/h)<input type="number" id="pf_vma" step="0.1" min="10" max="25" inputmode="decimal" placeholder="ex. 16,5" value="${p.vma || ''}"></label>
        <label class="f grow">FC max (bpm)<input type="number" id="pf_fcmax" min="150" max="220" inputmode="numeric" placeholder="facultatif" value="${p.fcmax || ''}"></label></div>
        <p class="small muted" style="margin:-4px 0 0">Pas de VMA récente ? Laisse vide : le test de la semaine 1 la calculera. En attendant, les allures sont données au ressenti.</p>
        <label class="f">Mon club joue les play-offs<select id="pf_po"><option value="">Je ne sais pas encore</option><option value="1" ${p.po === true ? 'selected' : ''}>Oui</option><option value="0" ${p.po === false ? 'selected' : ''}>Non</option></select></label>
        <label class="f">Je vais à la Challenge Cup<select id="pf_cc"><option value="1" ${p.cc !== false ? 'selected' : ''}>Oui ou probablement</option><option value="0" ${p.cc === false ? 'selected' : ''}>Non</option></select></label></div>`)}
      ${sec(4, `<div class="card stack"><div class="eyebrow">Santé et partage</div>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Zones douloureuses en ce moment</span><div class="chips">${KP.ZONES.map(z => `<label class="chip ${(p.pain || {})[z.id] ? 'on' : ''}"><input type="checkbox" data-pain value="${z.id}" ${(p.pain || {})[z.id] ? 'checked' : ''} hidden>${z.label}</label>`).join('')}</div></div>
        <label class="ck" style="border:0;padding:0"><input type="checkbox" id="pf_share" ${p.share !== false ? 'checked' : ''}><span class="grow">Partager mes séances terminées avec l'équipe<br><span class="small muted">Titre, durée et RPE seulement. Tes douleurs et ta fatigue ne sont visibles que par les coachs.</span></span></label>
        ${ob ? `<label class="ck" style="border:0;padding:0"><input type="checkbox" id="pf_consent" required><span class="grow small">J'accepte que mes données d'entraînement et de santé (RPE, douleurs, fatigue) soient enregistrées pour adapter mon programme. Je peux les supprimer à tout moment.</span></label>` : ''}</div>`)}
      ${ob ? `<div class="row">${step > 1 ? `<button class="btn ghost" type="button" data-a="obprev">Retour</button>` : ''}<button class="btn primary grow" type="submit">${step < 4 ? 'Continuer' : 'Créer mon programme'}</button></div>` : `<div class="savebar"><span class="small dirty-msg">Modifications non enregistrées</span><button class="btn primary block" type="submit">Enregistrer le profil</button></div>`}
    </form>`;
  }
  function readProfileForm(base) {
    const p = Object.assign({}, base || {});
    const v = id => { const el = document.getElementById(id); return el ? el.value : undefined; };
    if (v('pf_name') !== undefined) p.name = v('pf_name').trim();
    const role = document.querySelector('input[name=pf_role]:checked'); if (role) p.role = role.value;
    if (v('pf_arm') !== undefined) p.arm = v('pf_arm');
    if (v('pf_xp') !== undefined) p.xp = +v('pf_xp');
    if (document.querySelector('[data-eq=eqm]')) {
      p.eq = [...document.querySelectorAll('[data-eq=eqm]:checked')].map(x => x.value);
      p.max = Object.assign({}, p.max); ['halteres', 'kettlebell', 'barre'].forEach(k => { const x = v('eqm_max_' + k); if (x !== undefined) p.max[k] = x ? +x : null; });
      p.salle = document.getElementById('pf_salle').checked;
      p.eqSalle = KP.GYM_SET.slice();
    }
    if (document.querySelector('[data-day=av]')) {
      p.days = [...document.querySelectorAll('[data-day=av]:checked')].map(x => +x.value);
      p.clubDays = [...document.querySelectorAll('[data-day=club]:checked')].map(x => +x.value);
      p.maxMin = +v('pf_maxMin'); p.vma = v('pf_vma') ? +String(v('pf_vma')).replace(',', '.') : null; p.fcmax = v('pf_fcmax') ? +v('pf_fcmax') : null;
      p.po = v('pf_po') === '' ? null : v('pf_po') === '1'; p.cc = v('pf_cc') !== '0';
    }
    if (document.querySelector('[data-pain]')) {
      const now = {}; document.querySelectorAll('[data-pain]:checked').forEach(x => { now[x.value] = (base && base.pain && base.pain[x.value]) || Date.now(); }); p.pain = now;
      p.share = document.getElementById('pf_share').checked;
    }
    return p;
  }
  function saveProfileForm(auto) {
    if (!document.getElementById('pf')) { st.pfDirty = false; document.body.classList.remove('pfdirty'); return; }
    const before = JSON.stringify([P().eq, P().max, P().salle, P().days, P().maxMin, P().pain, P().role, P().xp]);
    const np = readProfileForm(P()); delete np.demo; D().profile = np; save(); ST.sync({ t: 'profile' });
    st.pfDirty = false; document.body.classList.remove('pfdirty');
    const changed = before !== JSON.stringify([np.eq, np.max, np.salle, np.days, np.maxMin, np.pain, np.role, np.xp]);
    toast((auto ? 'Profil enregistré automatiquement' : 'Profil enregistré') + (changed ? ' · séances mises à jour' : ''));
  }
  function onboarding() {
    const step = st.obStep || 1;
    return `<div style="padding-block:24px 40px" class="stack">
      <div><div class="brand" style="font-size:34px"><span class="flag" aria-hidden="true" style="width:26px;height:19px"><i></i><i></i><i></i></span>Kin<b>Prep</b></div><p class="muted" style="margin:6px 0 0">${esc((KP.CONFIG || {}).teamName || '')} · saison 2026-2027</p></div>
      ${step === 1 ? `<div class="card" style="background:var(--ink);color:var(--surface)"><h2 style="font-size:26px">Ta prépa physique, adaptée à toi</h2><p style="margin:8px 0 0;opacity:.85">1 séance de renfo et 1 séance de cardio par semaine comme base, ajustées à ton matériel, ton rôle et ta semaine (club, nationaux, matchs).</p>
        <button class="btn sm" style="margin-top:12px;background:var(--surface);color:var(--ink)" data-a="sample">Voir avec un profil d'exemple</button></div>` : ''}
      <div class="row small muted"><span>Étape ${step} sur 4</span><span class="grow"><span class="prog" style="display:block"><i style="width:${step * 25}%"></i></span></span></div>
      ${profileForm(st.obDraft || {}, 'onboard')}</div>`;
  }

  // =====================================================================
  // OVERLAYS : pages, panneaux, lecteur
  // =====================================================================
  let ov = null;
  function renderOverlays() {
    if (!ov) { ov = document.createElement('div'); ov.id = 'ov'; document.body.appendChild(ov); }
    let h = '';
    if (st.page) h += `<div class="page" role="dialog" aria-modal="true"><div class="page-in">${pageHTML()}</div></div>`;
    if (st.player) h += `<div class="player" role="dialog" aria-modal="true">${playerHTML()}</div>`;
    if (!st.player && P()) h += fabHTML();
    if (st.sheet) h += `<div class="sheet-wrap" data-a="close-sheet-bg"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${sheetHTML()}</div></div>`;
    ov.innerHTML = h;
    KP.fig.mountAll(ov);
    document.body.style.overflow = st.page || st.player || st.sheet ? 'hidden' : '';
    syncNav();
  }

  // ---------- bouton retour du téléphone ----------
  // Chaque couche ouverte (autre onglet, séance, lecteur, panneau) = une entrée d'historique.
  let navLayers = 0, navSkip = 0;
  const layersNow = () => (P() && st.tab !== 'semaine' ? 1 : 0) + (st.page ? 1 : 0) + (st.player ? 1 : 0) + (st.sheet ? 1 : 0);
  function syncNav() {
    const n = layersNow();
    try {
      if (n > navLayers) for (let i = navLayers; i < n; i++) history.pushState({ kp: i + 1 }, '');
      else if (n < navLayers) { navSkip++; history.go(n - navLayers); }
    } catch (e) { /* historique indisponible */ }
    navLayers = n;
  }
  window.addEventListener('popstate', () => {
    if (navSkip > 0) { navSkip--; return; }
    navLayers = Math.max(0, navLayers - 1);
    if (st.sheet) { closeSheet(); return; }
    if (st.player) { try { history.pushState({ kp: navLayers + 1 }, ''); } catch (e) { /* */ } navLayers++; toast('Pour quitter la séance, touche la croix en haut à gauche'); return; }
    if (st.page) { st.page = null; render(); return; }
    if (st.tab !== 'semaine') { if (st.pfDirty) saveProfileForm(true); st.tab = 'semaine'; render(); return; }
  });
  function curSess() { const pg = st.page; if (!pg) return null; const w = week(pg.n); return w.sessions.concat(w.hidden).find(s => s.key === pg.key); }

  // ---------- page séance ----------
  function pageHTML() {
    const pg = st.page, s = curSess(); if (!s) return '<p>Séance introuvable.</p>';
    const lg = logOf(pg.n, s.key);
    const top = `<div class="page-top"><button class="icon-btn" data-a="close-page" aria-label="Fermer">${ic('close')}</button><div class="grow"><div class="eyebrow">${pg.n <= 0 ? 'Bêta ' + (pg.n + 4) : 'Semaine ' + pg.n} · ${s.kind === 'cardio' ? 'Cardio' : s.kind === 'renfo' ? 'Renfo' : s.kind === 'test' ? 'Tests' : 'Récupération'}</div><h2 style="font-size:24px">${esc(s.title)}</h2></div></div>`;
    let body = '';
    const meta = `<div class="row wrap" style="gap:6px"><span class="pill num">≈ ${s.min} min</span>${s.day != null ? `<span class="pill">${C.JOURS_LONG[s.day]} conseillé</span>` : ''}${lg ? `<span class="pill" style="background:var(--ok-soft);color:var(--ok)">Faite</span>` : ''}${week(pg.n).mode !== 'normal' ? `<span class="pill" style="background:var(--warn-soft);color:var(--warn)">Semaine ${G.MODES[week(pg.n).mode].label.toLowerCase()}</span>` : ''}</div>`;
    if (s.kind === 'renfo') {
      const p = P();
      body = `${meta}
        ${p.salle ? `<div class="seg" role="group" aria-label="Lieu"><button class="${s.lieu !== 'salle' ? 'on' : ''}" data-a="lieu" data-v="maison">À la maison</button><button class="${s.lieu === 'salle' ? 'on' : ''}" data-a="lieu" data-v="salle">En salle</button></div>` : ''}
        <section class="blk"><div class="blk-h"><span class="g">0</span><h3 style="font-size:19px">Échauffement</h3><span class="small muted">${esc(s.warmup.format)}</span></div>
          <div class="wu">${s.warmup.items.map(x => `<button class="it" data-a="open-ex" data-id="${x.id}"><div data-anim="${x.id}"></div>${esc(x.n)}</button>`).join('')}</div></section>
        ${s.blocks.map(b => `<section class="blk"><div class="blk-h"><span class="g">${b.grp}</span><h3 style="font-size:19px">${b.shoulder ? 'Épaule et omoplate' : b.items.length > 1 ? (s.circuit ? 'Circuit' : 'Superset') : 'Exercice'}</h3>${b.shoulder ? '<span class="small muted">Fin d\'échauffement, 5 min, sans charge lourde</span>' : b.items.length > 1 ? `<span class="small muted">${s.circuit ? '40 s / 20 s, 3 tours' : 'Enchaîne les exercices, puis récupère'}</span>` : ''}</div>
          ${b.items.map((it, i) => exRow(it, b.grp + (b.items.length > 1 ? i + 1 : ''))).join('')}</section>`).join('')}
        <details class="card flat"><summary style="cursor:pointer;font-weight:600">RPE cible et RPE réel</summary><p class="small" style="margin:10px 0 0">Le <b>RPE cible</b> t'aide à choisir ta charge. Pendant la séance guidée, tu notes ton <b>RPE réel</b> après chaque série : l'appli s'en sert pour te proposer la charge de la séance suivante.</p>${rpeScale()}</details>`;
    } else if (s.kind === 'cardio') {
      body = `${meta}${s.blocks.map(b => cardioBlock(b)).join('')}
        <div class="note small">Pas envie de courir ? Tu peux remplacer cette séance par une autre activité (vélo, natation, squash…) d'une durée et d'une intensité proches, puis l'enregistrer comme telle.</div>`;
    } else if (s.kind === 'test') {
      body = `${meta}${s.tests.map(t => `<div class="ex" style="grid-template-columns:76px 1fr">${figThumb(t.anim)}<div><div class="nm">${esc(t.label)}</div><div class="hint">${esc(t.detail)}</div><input type="number" inputmode="decimal" id="t_${t.id}" placeholder="${t.unit}" style="margin-top:6px" value="${lg && lg.tests ? esc(lg.tests[t.id] || '') : ''}"></div></div>`).join('')}`;
    } else {
      body = `${meta}<div class="stack">${s.items.map(x => `<button class="ex" data-a="open-ex" data-id="${x.id}" style="grid-template-columns:76px 1fr">${figThumb(x.id)}<div><div class="nm">${esc(x.n)}</div><div class="rx">2 × 45 s</div></div></button>`).join('')}</div>`;
    }
    const cta = s.kind === 'renfo' ? `<button class="btn primary grow" data-a="start">${ic('play', 1)} ${lg ? 'Refaire la séance' : 'Démarrer la séance'}</button><button class="btn" data-a="quicklog">${lg ? 'Modifier' : 'Déjà faite'}</button>`
      : s.kind === 'cardio' ? `<button class="btn primary grow" data-a="cardiolog">${lg ? 'Modifier mon relevé' : 'Enregistrer la séance'}</button>`
      : s.kind === 'test' ? `<button class="btn primary grow" data-a="savetests">Enregistrer les tests</button>${lg ? `<button class="btn" data-a="dellog" data-v="${lg.id}">Supprimer</button>` : ''}` : `<button class="btn primary grow" data-a="quicklog">C'est fait</button>`;
    return top + `<div class="stack">${body}</div><div class="cta"><div>${cta}${KP.CONFIG.ai && SB.user() ? `<button class="btn ghost" data-a="ai" aria-label="Demander à l'assistant">${ic('chat')}</button>` : ''}</div></div>`;
  }
  function exRow(it, tag) {
    const sug = G.suggestLoad(it.ex, it.p, P(), D().logs);
    return `<div class="ex"><button style="all:unset;cursor:pointer;display:contents" data-a="open-ex" data-id="${it.ex.id}" data-slot="${esc(it.slotKey)}">${figThumb(it.ex.id)}
      <div style="min-width:0"><div class="nm"><span class="muted">${tag}</span> ${esc(it.ex.n)}</div><div class="rx">${rxText(it)}</div>
      ${sug && sug.kg ? `<div class="hint">Charge conseillée : <b class="num" style="color:var(--ink)">${sug.kg} kg</b>${sug.capped ? ' · ' + esc(sug.txt) : ''}</div>` : sug ? `<div class="hint">${esc(sug.txt)}</div>` : ''}
      ${it.note ? `<div class="hint">${esc(it.note)}</div>` : ''}</div></button>
      <div class="stack" style="gap:6px"><button class="more" data-a="rest-go" data-v="${it.p.rest}" data-l="${esc(it.ex.n)}" aria-label="Lancer le repos de ${fmtRest(it.p.rest)}">${ic('timer')}</button><button class="more" data-a="report" data-slot="${esc(it.slotKey)}" aria-label="Signaler un problème avec ${esc(it.ex.n)}">${ic('dots', 1)}</button></div></div>`;
  }
  function cardioBlock(b) {
    if (b.type === 'role') return `<section class="blk"><div class="blk-h"><h3 style="font-size:19px">${esc(b.label)}</h3></div>
      ${b.drills.map(d => `<button class="ex" data-a="open-ex" data-id="${d.ex.id}" style="grid-template-columns:76px 1fr">${figThumb(d.ex.id)}<div><div class="nm">${esc(d.t)}</div><div class="rx">${esc(d.v)}</div></div></button>`).join('')}
      <button class="btn sm ghost" data-a="signal">${ic('bolt')} Signal visuel de réaction</button></section>`;
    const timer = ['int', 'rsa'].includes(b.type) ? `<button class="btn sm ghost" data-a="itimer" data-v='${esc(JSON.stringify(b.type === 'int' ? { sets: b.sets, reps: b.reps, on: b.on, off: b.off, rec: 180 } : { sets: +b.label.match(/: (\d+)/)[1], reps: +b.label.match(/× (\d+) ×/)[1], on: 5, off: 15, rec: 180 }))}'>${ic('timer')} Lancer le minuteur</button>` : '';
    return `<div class="card"><div style="font:700 20px/1.15 var(--display)">${esc(b.label)}</div><p class="small" style="margin:6px 0 0">${esc(b.detail || '')}</p>${timer ? `<div style="margin-top:10px">${timer}</div>` : ''}</div>`;
  }
  function rpeScale() {
    const R = [['6', 'Assez simple, série d\'échauffement'], ['6,5', 'Entre l\'échauffement et le début du vrai travail'], ['7', 'J\'aurais pu faire 3 répétitions de plus'], ['7,5', 'Peut-être 3, sûrement 2 de plus'], ['8', 'J\'aurais pu faire 2 répétitions de plus'], ['8,5', 'Peut-être 2, sûrement 1 de plus'], ['9', 'J\'aurais pu faire 1 répétition de plus'], ['9,5', 'Plus de répétition, mais un peu plus de charge'], ['10', 'Impossible d\'en faire plus']];
    return `<dl class="kv" style="margin-top:10px">${R.map(([a, b]) => `<dt class="num" style="font-weight:700;color:var(--ink)">RPE ${a}</dt><dd style="text-align:left;font-weight:400">${b}</dd>`).join('')}</dl>`;
  }

  // ---------- panneaux ----------
  function sheetHTML() {
    const sh = st.sheet;
    if (sh.t === 'ex') {
      const x = KP.EX_BY_ID[sh.id];
      return `<div class="stage" style="min-height:220px"><div data-anim="${x.id}" style="width:100%"></div></div>
        <h2 style="font-size:26px;margin-top:12px">${esc(x.n)}</h2><p class="small muted" style="margin:4px 0 0">${esc(x.mus)}</p>
        ${videoBlock(x, sh)}
        <div class="stack" style="margin-top:12px"><div><div class="eyebrow">Points clés</div><ul class="cues" style="margin-top:6px">${x.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
        ${x.err && x.err.length ? `<div><div class="eyebrow">Erreurs fréquentes</div><ul class="cues" style="margin-top:6px">${x.err.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
        <div class="small"><span class="muted">Matériel : </span>${x.eq.length ? x.eq.map(r => r.split('|').map(id => (KP.EQUIP[id] || {}).label).join(' ou ')).join(' + ') : 'aucun'}</div>
        ${x.note ? `<div class="note acc small">${esc(x.note)}</div>` : ''}
        ${sh.slot ? `<button class="btn ghost block" data-a="report" data-slot="${esc(sh.slot)}">Signaler un problème</button>` : ''}
        <button class="btn block" data-a="close-sheet">Fermer</button></div>`;
    }
    if (sh.t === 'report') {
      const it = findItem(sh.slot);
      if (!it) return '<p>Exercice introuvable.</p>';
      if (!sh.reason) return `<h2 style="font-size:24px">${esc(it.ex.n)}</h2><p class="muted" style="margin:6px 0 12px">Qu'est-ce qui ne va pas ?</p>
        <div class="stack" style="gap:8px">${[['materiel', 'Je n\'ai pas le matériel'], ['douleur', 'J\'ai mal en le faisant'], ['trop_dur', 'C\'est trop difficile'], ['trop_facile', 'C\'est trop facile'], ['autre', 'Autre chose']].map(([k, l]) => `<button class="btn block ghost" style="justify-content:flex-start;text-transform:none;font:600 16px var(--body)" data-a="reason" data-v="${k}">${l}</button>`).join('')}</div>`;
      if (sh.reason === 'douleur' && !sh.zone) return `<h2 style="font-size:24px">Où as-tu mal ?</h2><div class="chips" style="margin-top:12px">${KP.ZONES.map(z => `<button class="chip ${it.ex.zones.includes(z.id) ? 'on' : ''}" data-a="zone" data-v="${z.id}">${z.label}</button>`).join('')}</div>
        <div class="note warn small" style="margin-top:14px">Arrête l'exercice si la douleur est vive. Si elle persiste plus d'une semaine ou gêne au quotidien, consulte un kiné ou un médecin.</div>`;
      if (sh.reason === 'autre') return `<h2 style="font-size:24px">Explique le problème</h2><textarea id="rep_txt" style="margin-top:10px" placeholder="Ex. : le banc de ma salle est toujours occupé le mardi"></textarea>
        <button class="btn primary block" style="margin-top:10px" data-a="sendfb">Envoyer</button>${KP.CONFIG.ai && SB.user() ? '<button class="btn ghost block" style="margin-top:8px" data-a="ai">Demander à l\'assistant</button>' : ''}`;
      const alts = G.alternatives(it, st.page.n, st.page.key, P(), sh.reason, sh.zone);
      const why = { materiel: 'Voici ce que tu peux faire avec ton matériel :', douleur: 'Ces exercices épargnent la zone douloureuse :', trop_dur: 'Des variantes plus accessibles :', trop_facile: 'Des variantes plus exigeantes :' }[sh.reason];
      return `<h2 style="font-size:24px">Remplacer « ${esc(it.ex.n)} »</h2><p class="muted" style="margin:6px 0 12px">${why}</p>
        <div class="stack" style="gap:8px">${alts.length ? alts.map(a => `<button class="ex" data-a="pick-alt" data-id="${a.id}" style="grid-template-columns:76px 1fr">${figThumb(a.id)}<div><div class="nm">${esc(a.n)}</div><div class="hint">${esc(a.mus)} · niveau ${a.lvl}</div></div></button>`).join('') : '<div class="note">Aucune alternative trouvée avec ton matériel. Ajoute du matériel dans ton profil ou contacte ton coach.</div>'}</div>
        ${sh.reason === 'trop_facile' && !alts.length ? '' : `<p class="small muted" style="margin:12px 0 0">Le remplacement vaut pour tout le bloc ${esc(C.phaseOf(st.page.n).phase.name)}.${sh.reason === 'materiel' ? ' L\'exercice ne te sera plus proposé à cet endroit.' : ''}</p>`}`;
    }
    if (sh.t === 'player') return playerSheet(sh.id);
    if (sh.t === 'checkin') {
      const n = st.n, ci = Object.assign({}, D().checkins[n] || {}), w = week(n);
      const clubDef = C.clubActive(n) ? (P().clubN != null ? P().clubN : 2) : 0;
      const val = (k, d) => (ci[k] != null ? ci[k] : d);
      const scale = (k, d, lab) => `<div class="f"><span class="small" style="font-weight:600;color:var(--muted)">${lab}</span><div class="seg">${[1, 2, 3, 4, 5].map(i => `<button type="button" class="${+val(k, d) === i ? 'on' : ''}" data-a="ci" data-k="${k}" data-v="${i}">${i}</button>`).join('')}</div></div>`;
      return `<h2 style="font-size:26px">${n <= 0 ? 'Bêta ' + (n + 4) : 'Ta semaine ' + n}</h2><p class="small muted" style="margin:4px 0 12px">${C.weekLabel(n)}${w.load.events.length ? ' · ' + w.load.events.map(e => e.label).join(', ') : ''}</p>
        <div class="stack">
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Entraînements en club cette semaine</span><div class="seg">${[0, 1, 2, 3].map(i => `<button type="button" class="${+val('club', clubDef) === i ? 'on' : ''}" data-a="ci" data-k="club" data-v="${i}">${i}</button>`).join('')}</div></div>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Travail, études, déplacements</span><div class="seg">${[['0', 'Normal'], ['1', 'Chargé'], ['2', 'Très chargé']].map(([v, l]) => `<button type="button" class="${String(val('vie', 0)) === v ? 'on' : ''}" data-a="ci" data-k="vie" data-v="${v}">${l}</button>`).join('')}</div></div>
        ${scale('fatigue', 3, 'Fatigue (1 = en pleine forme, 5 = épuisé)')}
        ${scale('sommeil', 3, 'Sommeil (1 = très mauvais, 5 = excellent)')}
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Autre sport ou match en plus</span><div class="chips">${[['match', 'Match / tournoi', 2], ['sport', 'Autre sport intense', 1]].map(([k, l, wgt]) => { const on = (ci.extra || []).some(x => x.k === k); return `<button type="button" class="chip ${on ? 'on' : ''}" data-a="ci-extra" data-k="${k}" data-l="${l}" data-w="${wgt}">${l}</button>`; }).join('')}</div></div>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Choisir le niveau de la semaine</span><div class="seg">${[['auto', 'Auto'], ['normal', 'Normale'], ['allege', 'Allégée'], ['minimal', 'Minimale'], ['repos', 'Récup']].map(([v, l]) => `<button type="button" class="${(ci.mode || 'auto') === v ? 'on' : ''}" data-a="ci" data-k="mode" data-v="${v}">${l}</button>`).join('')}</div></div>
        <div class="note small mode-${w.mode}" style="border-left:0"><b style="color:var(--mc)">Semaine ${G.MODES[w.mode].label.toLowerCase()}</b> · ${G.MODES[w.mode].desc}<br><span class="muted">Charge estimée ${Math.round(w.load.score)} : ${esc(w.load.why.join(', ') || 'rien de particulier')}</span></div>
        <button class="btn primary block" data-a="ci-save">Valider</button></div>`;
    }
    if (sh.t === 'cardiolog') {
      const s = curSess(), lg = logOf(st.page.n, s.key) || {};
      return `<h2 style="font-size:26px">Ton relevé</h2><form class="stack" style="margin-top:12px" data-f="cardiolog">
        <label class="f">Activité<select id="cl_mode">${[['course', 'Course à pied'], ['velo', 'Vélo'], ['rameur', 'Rameur'], ['natation', 'Natation'], ['squash', 'Squash'], ['autre', 'Autre sport']].map(([v, l]) => `<option value="${v}" ${(lg.mode || 'course') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="row" style="gap:10px"><label class="f grow">Durée (min)<input type="number" id="cl_dur" inputmode="numeric" required value="${lg.dur || s.min}"></label><label class="f grow">Distance (km)<input type="number" id="cl_km" step="0.01" inputmode="decimal" value="${lg.km || ''}"></label></div>
        <div class="row" style="gap:10px"><label class="f grow">FC moyenne<input type="number" id="cl_fc" inputmode="numeric" value="${lg.fc || ''}"></label><label class="f grow">Dénivelé + (m)<input type="number" id="cl_dplus" inputmode="numeric" value="${lg.dplus || ''}"></label></div>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Difficulté de la séance (RPE)</span>${rpePicker('cl_rpe', lg.rpe || 7, true)}</div>
        <label class="f">Ressenti<textarea id="cl_note" placeholder="Ex. : dur mais je pouvais faire un peu plus">${esc(lg.note || '')}</textarea></label>
        <button class="btn primary block" type="submit">Enregistrer</button>${lg.id ? `<button class="btn ghost block" type="button" data-a="dellog" data-v="${lg.id}">Supprimer ce relevé</button>` : ''}</form>`;
    }
    if (sh.t === 'quicklog') {
      const s = curSess(), lg = logOf(st.page.n, s.key) || {};
      return `<h2 style="font-size:26px">Séance réalisée</h2><form class="stack" style="margin-top:12px" data-f="quicklog">
        <label class="f">Durée (min)<input type="number" id="ql_dur" inputmode="numeric" value="${lg.dur || s.min}"></label>
        <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Difficulté de la séance (RPE)</span>${rpePicker('ql_rpe', lg.rpe || 7, true)}</div>
        <label class="f">Note<textarea id="ql_note">${esc(lg.note || '')}</textarea></label>
        <button class="btn primary block" type="submit">Enregistrer</button>${lg.id ? `<button class="btn ghost block" type="button" data-a="dellog" data-v="${lg.id}">Supprimer ce relevé</button>` : ''}</form>`;
    }
    if (sh.t === 'export') return `<h2 style="font-size:26px">Exporter mes données</h2><p class="small muted">Copie ce texte et garde-le en lieu sûr. Tu pourras le réimporter sur un autre appareil.</p><textarea id="exp" readonly style="min-height:200px;font-size:12px">${esc(JSON.stringify(D()))}</textarea>
      <div class="row" style="margin-top:10px"><button class="btn primary grow" data-a="copyexp">Copier</button>${location.protocol.startsWith('http') && !location.hostname.includes('claude') ? '<button class="btn grow" data-a="dlexp">Télécharger</button>' : ''}</div>`;
    if (sh.t === 'import') return `<h2 style="font-size:26px">Importer des données</h2><p class="small muted">Colle le texte exporté. Il remplacera les données de cet appareil.</p><textarea id="imp" style="min-height:180px;font-size:12px"></textarea><div class="small" id="imp_err" style="color:var(--crit)"></div><button class="btn primary block" style="margin-top:10px" data-a="doimport">Importer</button>`;
    if (sh.t === 'ai') {
      return `<h2 style="font-size:24px">Assistant</h2><p class="small muted" style="margin:4px 0 10px">Pose une question sur ta séance ou demande une adaptation. L'assistant ne remplace pas un avis médical.</p>
        <div class="chat">${st.chat.map(m => `<div class="msg ${m.role === 'user' ? 'me' : 'ai'}">${esc(m.content)}${m.action ? `<div style="margin-top:8px"><button class="btn sm primary" data-a="ai-apply" data-v='${esc(JSON.stringify(m.action))}'>Appliquer : ${esc((KP.EX_BY_ID[m.action.to] || {}).n || '')}</button></div>` : ''}</div>`).join('')}${st.aiBusy ? '<div class="msg ai muted">…</div>' : ''}</div>
        <form class="row" style="margin-top:12px" data-f="ai"><input type="text" id="ai_q" placeholder="Ex. : je n'ai que 30 minutes aujourd'hui" autocomplete="off"><button class="btn primary" type="submit">Envoyer</button></form>`;
    }
    if (sh.t === 'signal') return signalHTML();
    if (sh.t === 'timer') return timerHTML();
    return '';
  }
  function videoOf(x) {
    const mine = (P().videos || {})[x.id];
    if (mine) return { url: mine, src: 'Ton lien' };
    if (x.video) return { url: x.video, src: x.videoSrc === 'Nicolas' ? 'Vidéo envoyée par Nicolas' : 'Vidéo de l\'équipe' };
    return { url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(x.n + ' exercice technique'), src: 'Recherche YouTube', search: true };
  }
  function videoBlock(x, sh) {
    const v = videoOf(x), mine = (P().videos || {})[x.id];
    if (sh.editVideo) return `<form class="stack" data-f="video" data-id="${x.id}" style="margin-top:12px;gap:8px"><label class="f">Lien YouTube pour cet exercice<input type="url" id="vid_url" placeholder="https://www.youtube.com/watch?v=…" value="${esc(mine || '')}" inputmode="url"></label>
      <div class="small" id="vid_err" style="color:var(--crit)"></div><div class="row"><button class="btn sm primary" type="submit">Enregistrer</button><button class="btn sm ghost" type="button" data-a="vid-cancel">Annuler</button>${mine ? '<button class="link" type="button" data-a="vid-clear">Revenir au lien par défaut</button>' : ''}</div></form>`;
    return `<div class="row wrap" style="margin-top:12px;gap:8px"><a class="btn sm dark" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${ic('play', 1)} ${v.search ? 'Chercher une vidéo' : 'Voir la vidéo'}</a><span class="small muted grow">${esc(v.src)}</span><button class="link small" data-a="vid-edit">${mine ? 'Changer' : 'Ajouter mon lien'}</button></div>`;
  }
  function rpePicker(id, v, full) { const vals = full ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]; return `<div class="rpe" style="grid-template-columns:repeat(${full ? 5 : 4},1fr)" data-rpe="${id}">${vals.map(x => `<button type="button" class="${+v === x ? 'on' : ''}" data-a="rpe" data-id="${id}" data-v="${x}">${String(x).replace('.', ',')}</button>`).join('')}</div><input type="hidden" id="${id}" value="${v}">`; }
  function findItem(slotKey) { const s = curSess(); if (!s || !s.blocks) return null; for (const b of s.blocks) for (const it of b.items) if (it.slotKey === slotKey) return it; return null; }

  // ---------- lecteur de séance guidé ----------
  function buildSteps(s) {
    const steps = [];
    for (let r = 0; r < 2; r++) s.warmup.items.forEach((x, i) => steps.push({ t: 'wu', ex: x, sec: 40, rest: 20, label: `Échauffement · tour ${r + 1}/2` }));
    s.blocks.forEach(b => {
      const rounds = Math.max(...b.items.map(i => i.p.s));
      for (let r = 1; r <= rounds; r++) b.items.forEach((it, j) => {
        if (r > it.p.s) return;
        const last = b.items.slice(j + 1).every(x => r > x.p.s);
        steps.push({ t: 'set', it, set: r, of: it.p.s, grp: b.grp, rest: s.circuit ? 20 : last ? it.p.rest : 15 });
      });
    });
    return steps;
  }
  function startPlayer() {
    const s = curSess();
    const prev = logOf(st.page.n, s.key);
    st.player = { steps: buildSteps(s), i: 0, mode: 'work', t0: Date.now(), log: {}, sess: s, timer: null, remain: 0, prev };
    wake(true); beep(0); render();
  }
  function playerHTML() {
    const pl = st.player, s = pl.sess;
    if (pl.mode === 'end') return `<div class="player-in"><div class="row"><h2 class="grow" style="font-size:28px">Séance terminée</h2></div>
      <div class="card"><div class="kv"><dt>Durée</dt><dd class="num">${Math.round((Date.now() - pl.t0) / 60000)} min</dd><dt>Séries notées</dt><dd class="num">${Object.values(pl.log).reduce((a, x) => a + x.sets.length, 0)}</dd></div></div>
      <div class="f"><span class="small" style="font-weight:600;color:var(--muted)">Difficulté globale de la séance (RPE 1 à 10)</span>${rpePicker('pl_rpe', pl.rpe || 7, true)}</div>
      <label class="f">Note pour toi ou ton coach<textarea id="pl_note" placeholder="Ex. : genou droit un peu sensible sur les fentes"></textarea></label>
      <div class="grow"></div><button class="btn primary block" data-a="pl-save">Enregistrer la séance</button><button class="btn ghost block" data-a="pl-quit">Quitter sans enregistrer</button></div>`;
    const st0 = pl.steps[pl.i], tot = pl.steps.length;
    const head = `<div class="row"><button class="icon-btn" data-a="pl-close" aria-label="Quitter">${ic('close')}</button><div class="grow"><div class="prog"><i style="width:${Math.round((pl.i / tot) * 100)}%"></i></div></div><span class="small muted num">${pl.i + 1}/${tot}</span></div>`;
    if (pl.mode === 'rest') {
      const nx = pl.steps[pl.i + 1];
      const nxEx = nx ? (nx.t === 'wu' ? nx.ex : nx.it.ex) : null;
      return `<div class="player-in">${head}<div class="eyebrow" style="text-align:center;margin-top:10px">Récupération</div>
        <div style="display:grid;place-items:center">${ring(pl.remain, pl.restTot, 'rest')}</div>
        <div class="row" style="justify-content:center"><button class="btn sm ghost" data-a="pl-add">+15 s</button><button class="btn sm" data-a="pl-skip">Passer</button></div>
        ${nxEx ? `<div class="card row" style="margin-top:auto"><div style="width:84px;height:72px" data-anim="${nxEx.id}"></div><div class="grow"><div class="eyebrow">Ensuite</div><div style="font-weight:700">${esc(nxEx.n)}</div><div class="small muted">${nx.t === 'set' ? `Série ${nx.set}/${nx.of}` : '40 s'}</div></div></div>` : ''}</div>`;
    }
    if (st0.t === 'wu') return `<div class="player-in">${head}<div class="eyebrow">${st0.label}</div><h2 style="font-size:28px">${esc(st0.ex.n)}</h2>
      <div class="stage"><div data-anim="${st0.ex.id}" style="width:100%"></div></div>
      <div style="display:grid;place-items:center">${ring(pl.remain || st0.sec, st0.sec, pl.timer ? 'work' : '')}</div>
      ${pl.timer ? `<button class="btn block" data-a="pl-next">Passer</button>` : `<button class="btn primary block" data-a="pl-go">${ic('play', 1)} Go 40 s</button><button class="link" data-a="pl-skipwu" style="align-self:center">Passer l'échauffement</button>`}</div>`;
    const it = st0.it, x = it.ex, p = it.p;
    const sug = G.suggestLoad(x, p, P(), D().logs);
    const prevSet = (pl.log[x.id] && pl.log[x.id].sets.slice(-1)[0]) || null;
    const kg = prevSet && prevSet.kg != null ? prevSet.kg : sug && sug.kg ? sug.kg : '';
    const isTime = x.load === 'time';
    const per = x.uni || x.side ? ' par côté' : '';
    return `<div class="player-in">${head}
      <div class="row"><div class="grow"><div class="eyebrow">${it.slot ? `${st0.grp} · ` : ''}Série ${st0.set} sur ${st0.of}</div><h2 style="font-size:26px">${esc(x.n)}</h2></div><button class="more" data-a="pl-info" data-id="${x.id}" aria-label="Consignes">${ic('info')}</button></div>
      <div class="stage"><div data-anim="${x.id}" style="width:100%"></div></div>
      ${isTime ? `<div style="display:grid;place-items:center">${ring(pl.remain || p.t, p.t, pl.timer ? 'work' : '')}</div><div class="small muted" style="text-align:center">${p.t} s${per}${it.note ? ' · ' + esc(it.note) : ''}</div>
        ${pl.timer ? '' : `<button class="btn primary block" data-a="pl-go">${ic('play', 1)} Lancer ${p.t} s</button>`}<button class="btn block ${pl.timer ? 'primary' : 'ghost'}" data-a="pl-done">Série terminée</button>`
      : `<div class="row" style="align-items:flex-end"><div class="grow"><div class="big num">${p.r}<small> rép.${per}</small></div>${x.load !== 'plyo' ? `<div class="small muted">RPE cible ${String(p.rpe).replace('.', ',')}${it.note ? ' · ' + esc(it.note) : ''}</div>` : `<div class="small muted">Qualité maximale${it.note ? ' · ' + esc(it.note) : ''}</div>`}</div></div>
      <div class="row" style="gap:8px"><div class="f grow"><span class="small" style="font-weight:600;color:var(--muted)">Répétitions faites</span>${stepper('pl_r', p.r, 1)}</div>
        ${x.load === 'kg' || x.load === 'lest' ? `<div class="f grow"><span class="small" style="font-weight:600;color:var(--muted)">${x.load === 'lest' ? 'Lest (kg)' : 'Charge (kg)'}</span>${stepper('pl_kg', kg === '' ? (x.load === 'lest' ? 0 : '') : kg, x.eq.some(r => r.includes('barre')) ? 2.5 : 1)}</div>` : ''}</div>
      ${x.load !== 'plyo' ? `<div class="f"><span class="small" style="font-weight:600;color:var(--muted)">RPE réel de cette série (après l'effort)</span>${rpePicker('pl_rpe_set', prevSet ? prevSet.rpe : p.rpe)}</div>` : ''}
      <button class="btn primary block" data-a="pl-done">${ic('check')} Série terminée</button>`}</div>`;
  }
  function stepper(id, v, step) { return `<div class="stepper"><button type="button" data-a="step" data-id="${id}" data-v="${-step}" aria-label="Moins">−</button><input type="number" id="${id}" value="${v}" inputmode="decimal" step="${step}"><button type="button" data-a="step" data-id="${id}" data-v="${step}" aria-label="Plus">+</button></div>`; }
  function ring(remain, total, cls) {
    const r = 92, c = 2 * Math.PI * r, f = total ? Math.max(0, remain) / total : 0;
    return `<svg class="ring ${cls}" viewBox="0 0 210 210"><circle class="bg" cx="105" cy="105" r="${r}"/><circle class="fg" cx="105" cy="105" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}" transform="rotate(-90 105 105)"/><text x="105" y="122" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="56" fill="var(--ink)">${fmtClock(remain)}</text></svg>`;
  }
  const fmtClock = s => { s = Math.max(0, Math.ceil(s)); return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}`; };
  function countdown(sec, onEnd, mode) {
    const pl = st.player; clearInterval(pl.timer);
    pl.remain = sec; pl.restTot = sec; const end = Date.now() + sec * 1000;
    pl.timer = setInterval(() => {
      pl.remain = (end - Date.now()) / 1000;
      if (pl.remain <= 3.05 && pl.remain > 0 && Math.ceil(pl.remain) !== pl.lastBeep) { pl.lastBeep = Math.ceil(pl.remain); beep(1); }
      if (pl.remain <= 0) { clearInterval(pl.timer); pl.timer = null; beep(2); onEnd(); return; }
      const ring = document.querySelector('.player .ring'); if (ring) ring.outerHTML = ring_(pl, mode);
    }, 250);
  }
  const ring_ = (pl, mode) => ring(pl.remain, mode === 'rest' ? pl.restTot : pl.restTot, pl.mode === 'rest' ? 'rest' : 'work');
  function recordSet() {
    const pl = st.player, s0 = pl.steps[pl.i]; if (s0.t !== 'set') return;
    const x = s0.it.ex, gv = id => { const el = document.getElementById(id); return el ? el.value : null; };
    const e = pl.log[x.id] = pl.log[x.id] || { sets: [] };
    e.sets.push({ r: x.load === 'time' ? s0.it.p.t : +gv('pl_r') || s0.it.p.r, kg: gv('pl_kg') !== null && gv('pl_kg') !== '' ? +gv('pl_kg') : null, rpe: gv('pl_rpe_set') ? +gv('pl_rpe_set') : null });
  }
  function nextStep() {
    const pl = st.player; clearInterval(pl.timer); pl.timer = null;
    const cur = pl.steps[pl.i];
    if (pl.i >= pl.steps.length - 1) { pl.mode = 'end'; wake(false); render(); return; }
    if (pl.mode === 'work' && cur.rest) { pl.mode = 'rest'; render(); countdown(cur.rest, () => { pl.mode = 'work'; pl.i++; autoWu(); render(); }, 'rest'); return; }
    pl.mode = 'work'; pl.i++; autoWu(); render();
  }
  function autoWu() { const pl = st.player, s = pl.steps[pl.i]; if (s && s.t === 'wu' && pl.i > 0) { pl.remain = s.sec; setTimeout(() => { if (st.player && st.player.steps[st.player.i] === s && !st.player.timer) countdown(s.sec, () => nextStep(), 'work'); render(); }, 50); } }

  // ---------- minuteur global (repos, intervalles, chrono) ----------
  const TM = { iv: null };
  function tmStart(seq, label) {
    tmStop(true);
    st.tm = { seq, k: 0, label, end: Date.now() + seq[0].d * 1000, remain: seq[0].d, paused: false };
    beep(0); beep(2); wake(true);
    TM.iv = setInterval(tmTick, 200); tmPaint();
  }
  function tmStop(silent) { clearInterval(TM.iv); TM.iv = null; st.tm = null; if (!silent) { wake(!!st.player); tmPaint(); } }
  function tmTick() {
    const t = st.tm; if (!t) return clearInterval(TM.iv);
    if (t.paused) return;
    t.remain = (t.end - Date.now()) / 1000;
    if (t.remain <= 3.05 && t.remain > 0 && Math.ceil(t.remain) !== t.lb) { t.lb = Math.ceil(t.remain); beep(1); }
    if (t.remain <= 0) {
      t.k++;
      if (t.k >= t.seq.length) { beep(2); setTimeout(() => beep(2), 250); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { /* */ } toast(t.label ? `${t.label} : terminé` : 'Temps écoulé'); tmStop(); return; }
      beep(2); try { navigator.vibrate && navigator.vibrate(150); } catch (e) { /* */ }
      t.end = Date.now() + t.seq[t.k].d * 1000; t.remain = t.seq[t.k].d; t.lb = null;
    }
    tmPaint();
  }
  const PH_LABEL = { on: 'EFFORT', off: 'REPOS', rec: 'RÉCUPÉRATION', rest: 'REPOS' };
  function tmPaint() {
    const r = document.getElementById('tmlive'); if (r) r.innerHTML = tmLive();
    const f = document.getElementById('tmfab'); if (f) f.outerHTML = fabHTML();
    else if (!st.player) { const ovf = document.getElementById('ov'); if (ovf && !ovf.querySelector('#tmfab') && (st.tm || st.sw)) ovf.insertAdjacentHTML('beforeend', fabHTML()); }
  }
  function tmLive() {
    const t = st.tm; if (!t) return '';
    const ph = t.seq[t.k], many = t.seq.length > 1;
    return `<div class="eyebrow">${esc(t.label || '')}${ph.set ? ` · bloc ${ph.set}/${t.sets} · rép. ${ph.rep}/${t.reps}` : ''}</div>
      ${many ? `<div style="font:700 40px/1 var(--display);margin:8px 0;color:${ph.t === 'on' ? 'var(--crit)' : 'var(--ok)'}">${PH_LABEL[ph.t]}</div>` : ''}
      <div style="display:grid;place-items:center">${ring(t.remain, ph.d, ph.t === 'on' ? 'work' : 'rest')}</div>
      <div class="row" style="justify-content:center;margin-top:8px"><button class="btn sm ghost" data-a="tm-add">+15 s</button><button class="btn sm" data-a="tm-pause">${t.paused ? 'Reprendre' : 'Pause'}</button><button class="btn sm dark" data-a="tm-stop">Arrêter</button></div>`;
  }
  function fabHTML() {
    if (st.player) return '';
    if (st.tm) { const ph = st.tm.seq[st.tm.k]; return `<button id="tmfab" class="fab live ${ph.t === 'on' ? 'work' : ''}" data-a="timer" aria-label="Ouvrir le minuteur">${ic('timer')}<span class="num">${st.tm.paused ? 'Pause' : fmtClock(st.tm.remain)}</span></button>`; }
    if (st.sw && st.sw.running) return `<button id="tmfab" class="fab live" data-a="timer" data-v="chrono" aria-label="Ouvrir le chronomètre">${ic('timer')}<span class="num">${fmtSw(swNow())}</span></button>`;
    return `<button id="tmfab" class="fab" data-a="timer" aria-label="Minuteur">${ic('timer')}</button>`;
  }
  function intervalSeq(c) {
    const seq = [];
    for (let s = 1; s <= c.sets; s++) { for (let r = 1; r <= c.reps; r++) { seq.push({ t: 'on', d: c.on, set: s, rep: r }); if (r < c.reps && c.off) seq.push({ t: 'off', d: c.off, set: s, rep: r }); } if (s < c.sets && c.rec) seq.push({ t: 'rec', d: c.rec, set: s, rep: c.reps }); }
    return seq;
  }
  // chronomètre
  const swNow = () => st.sw ? st.sw.acc + (st.sw.running ? Date.now() - st.sw.t0 : 0) : 0;
  const fmtSw = ms => { const t = Math.floor(ms / 100), d = t % 10, s = Math.floor(t / 10) % 60, m = Math.floor(t / 600); return `${m}:${String(s).padStart(2, '0')}<small>,${d}</small>`; };
  let swIv = null;
  function swLoop() { clearInterval(swIv); if (!(st.sw && st.sw.running)) return; swIv = setInterval(() => { const el = document.getElementById('swv'); if (el) el.innerHTML = fmtSw(swNow()); const f = document.getElementById('tmfab'); if (f && !st.tm) f.outerHTML = fabHTML(); }, 100); }
  function timerHTML() {
    const tab = st.tmTab || 'repos';
    const head = `<h2 style="font-size:26px">Minuteur</h2><div class="seg" style="margin-top:12px" role="tablist"><button class="${tab === 'repos' ? 'on' : ''}" data-a="tm-tab" data-v="repos">Repos</button><button class="${tab === 'inter' ? 'on' : ''}" data-a="tm-tab" data-v="inter">Intervalles</button><button class="${tab === 'chrono' ? 'on' : ''}" data-a="tm-tab" data-v="chrono">Chrono</button></div>`;
    if (tab === 'chrono') {
      const sw = st.sw || { acc: 0, running: false, laps: [] };
      return head + `<div style="text-align:center;margin-top:18px"><div class="big num" id="swv" style="font-size:72px">${fmtSw(swNow())}</div>
        <div class="row" style="justify-content:center;margin-top:14px"><button class="btn ${sw.running ? 'dark' : 'primary'}" data-a="sw-toggle">${sw.running ? 'Pause' : swNow() ? 'Reprendre' : 'Démarrer'}</button><button class="btn ghost" data-a="sw-lap" ${sw.running ? '' : 'disabled'}>Tour</button><button class="btn ghost" data-a="sw-reset" ${swNow() ? '' : 'disabled'}>Remise à zéro</button></div>
        ${sw.laps && sw.laps.length ? `<div class="tbl" style="margin-top:14px"><table><thead><tr><th>Tour</th><th>Temps</th><th>Total</th></tr></thead><tbody>${sw.laps.map((l, i) => `<tr><td>${i + 1}</td><td class="num">${fmtSw(l.split)}</td><td class="num">${fmtSw(l.total)}</td></tr>`).reverse().join('')}</tbody></table></div>` : ''}</div>`;
    }
    if (st.tm) return head + `<div id="tmlive" style="text-align:center;margin-top:14px">${tmLive()}</div>`;
    if (tab === 'repos') {
      const P0 = [[30, '30 s'], [45, '45 s'], [60, '1 min'], [90, '1 min 30'], [120, '2 min'], [150, '2 min 30'], [180, '3 min'], [240, '4 min']];
      return head + `<p class="small muted" style="margin:12px 0 8px">Choisis une durée : le compte à rebours démarre tout de suite et continue si tu changes d'écran.</p>
        <div class="chips">${P0.map(([v, l]) => `<button class="chip" data-a="tm-rest" data-v="${v}">${l}</button>`).join('')}</div>
        <form class="row" data-f="tm-custom" style="margin-top:14px;align-items:flex-end"><label class="f grow">Minutes<input type="number" id="tmc_m" min="0" max="59" value="1" inputmode="numeric"></label><label class="f grow">Secondes<input type="number" id="tmc_s" min="0" max="59" value="0" inputmode="numeric"></label><button class="btn primary" type="submit">Démarrer</button></form>`;
    }
    const c = st.tmCfg || { on: 30, off: 30, reps: 6, sets: 3, rec: 180 };
    const presets = [['30-30', { on: 30, off: 30, reps: 6, sets: 3, rec: 180 }], ['15-15', { on: 15, off: 15, reps: 10, sets: 2, rec: 180 }], ['10-20', { on: 10, off: 20, reps: 10, sets: 2, rec: 180 }], ['Circuit 40-20', { on: 40, off: 20, reps: 6, sets: 2, rec: 60 }], ['Gainage 30-15', { on: 30, off: 15, reps: 4, sets: 3, rec: 60 }]];
    const fld = (id, l, v) => `<label class="f grow" style="min-width:90px">${l}<input type="number" id="${id}" value="${v}" min="0" inputmode="numeric"></label>`;
    const tot = intervalSeq(c).reduce((a, x) => a + x.d, 0);
    return head + `<div class="chips" style="margin-top:12px">${presets.map(([l, v]) => `<button class="chip" data-a="tm-preset" data-v='${JSON.stringify(v)}'>${l}</button>`).join('')}</div>
      <form class="stack" data-f="tm-inter" style="margin-top:12px;gap:10px"><div class="row wrap" style="gap:8px">${fld('ti_on', 'Effort (s)', c.on)}${fld('ti_off', 'Repos (s)', c.off)}${fld('ti_reps', 'Répétitions', c.reps)}</div>
        <div class="row wrap" style="gap:8px">${fld('ti_sets', 'Blocs', c.sets)}${fld('ti_rec', 'Récup entre blocs (s)', c.rec)}</div>
        <p class="small muted" style="margin:0">Durée totale : <b class="num">${Math.floor(tot / 60)} min ${String(tot % 60).padStart(2, '0')}</b></p>
        <button class="btn primary block" type="submit">${ic('play', 1)} Démarrer</button></form>`;
  }

  // ---------- signal visuel ----------
  function signalHTML() {
    const sg = st.sheet.sig;
    return `<div style="text-align:center"><div class="eyebrow">Signal visuel</div><p class="small muted">Pose le téléphone face à toi, en position de prêt. Démarre dans la direction indiquée dès que la flèche apparaît.</p>
      <div class="stage" style="min-height:240px"><div class="sig" id="sigv">${sg && sg.cur ? sg.cur : ''}</div></div>
      ${sg && sg.on ? `<div class="small muted num" style="margin-top:8px">Signal ${sg.count}/${sg.max}</div><button class="btn block" style="margin-top:10px" data-a="sig-stop">Arrêter</button>` : `<button class="btn primary block" style="margin-top:12px" data-a="sig-go">Démarrer 8 signaux</button>`}</div>`;
  }
  function signalStart() {
    const sg = st.sheet.sig = { on: true, count: 0, max: 8, cur: '' };
    const arrows = ['←', '→', '↑', '↓', '↖', '↗'];
    const fire = () => {
      if (!st.sheet || st.sheet.sig !== sg || !sg.on) return;
      sg.count++; sg.cur = arrows[Math.floor(Math.random() * arrows.length)]; beep(2); renderOverlays();
      setTimeout(() => { if (st.sheet && st.sheet.sig === sg) { sg.cur = ''; renderOverlays(); } }, 1200);
      if (sg.count < sg.max) sg.to = setTimeout(fire, 6000 + Math.random() * 4000); else setTimeout(() => { if (st.sheet && st.sheet.sig === sg) { sg.on = false; renderOverlays(); } }, 1400);
    };
    renderOverlays(); sg.to = setTimeout(fire, 2500 + Math.random() * 2500);
  }

  // ---------- audio & écran ----------
  let actx = null, wl = null;
  function beep(kind) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (kind === 0) return;
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = kind === 2 ? 1046 : 660; g.gain.value = 0.12;
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + (kind === 2 ? 0.35 : 0.12));
    } catch (e) { /* audio indisponible */ }
  }
  async function wake(on) { try { if (on && navigator.wakeLock) wl = await navigator.wakeLock.request('screen'); else if (wl) { wl.release(); wl = null; } } catch (e) { /* refusé */ } }

  // ---------- enregistrements ----------
  function upsertLog(l) {
    const L = D().logs, i = L.findIndex(x => x.week === l.week && x.key === l.key);
    if (i >= 0) { l.id = L[i].id; L[i] = Object.assign({}, L[i], l); } else { l.id = l.id || ST.uid(); L.push(l); }
    l.shared = P().share !== false;
    save(); ST.sync({ t: 'log', id: l.id });
  }

  // ---------- assistant ----------
  async function askAI(q) {
    const s = curSess(), n = st.page ? st.page.n : st.n, p = P();
    st.chat.push({ role: 'user', content: q }); st.aiBusy = true; renderOverlays();
    const ctx = { semaine: n, bloc: C.phaseOf(n).phase.name, profil: { role: p.role, xp: p.xp, materiel: p.eq, salle: p.salle, douleurs: Object.keys(p.pain || {}), vma: p.vma, dureeMax: p.maxMin },
      seance: s ? { titre: s.title, type: s.kind, exercices: (s.blocks || []).flatMap(b => b.items || []).map(it => ({ slot: it.slotKey, id: it.ex.id, nom: it.ex.n, prescription: it.p, alternatives: G.alternatives(it, n, s.key, p, 'materiel').map(a => ({ id: a.id, nom: a.n })) })) } : null };
    try {
      const r = await SB.ai({ messages: st.chat.map(m => ({ role: m.role, content: m.content })), context: ctx });
      let txt = (r && r.text) || 'Pas de réponse.', action = null;
      const m = txt.match(/ACTION:\s*(\{.*\})\s*$/m);
      if (m) { try { action = JSON.parse(m[1]); if (!KP.EX_BY_ID[action.to]) action = null; } catch (e) { action = null; } txt = txt.replace(m[0], '').trim(); }
      st.chat.push({ role: 'assistant', content: txt, action });
    } catch (e) { st.chat.push({ role: 'assistant', content: 'L\'assistant est indisponible : ' + e.message }); }
    st.aiBusy = false; renderOverlays();
  }

  // =====================================================================
  // ÉVÉNEMENTS
  // =====================================================================
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]'); if (!el) return;
    const a = el.dataset.a, v = el.dataset.v;
    if (a === 'close-sheet-bg') { if (e.target !== el) return; closeSheet(); return; }
    const H = ACTIONS[a]; if (H) { e.preventDefault(); H(el, v); }
  });
  const markDirty = el => { const f = el.closest && el.closest('#pf[data-mode=edit]'); if (f) { st.pfDirty = true; document.body.classList.add('pfdirty'); } };
  document.addEventListener('input', e => {
    const el = e.target;
    // charge max saisie → matériel coché automatiquement
    const m = el.id && el.id.match(/^(\w+)_max_(\w+)$/);
    if (m && el.value !== '') { const ck = document.getElementById(m[1] + '_' + m[2]); if (ck && !ck.checked) ck.checked = true; }
    markDirty(el);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    markDirty(el);
    if (el.matches('[data-day], [data-pain]')) { el.closest('label').classList.toggle('on', el.checked); }
    if (el.id === 'progEx') { st.progEx = el.value; render(); }
  });
  function closeSheet() { if (st.sheet && st.sheet.sig) { st.sheet.sig.on = false; clearTimeout(st.sheet.sig.to); } st.sheet = null; wake(!!st.player || !!st.tm); renderOverlays(); }
  const ACTIONS = {
    tab: (el, v) => { if (st.pfDirty) saveProfileForm(true); st.tab = v; if (v === 'equipe') st.feed = null; window.scrollTo(0, 0); render(); },
    wk: (el, v) => { st.n = Math.min(C.NWEEKS, Math.max(C.FIRST, st.n + +v)); render(); },
    today: () => { st.n = curWeek(); render(); },
    goweek: (el, v) => { st.n = +v; st.tab = 'semaine'; window.scrollTo(0, 0); render(); },
    'open-sess': el => { st.page = { n: st.n, key: el.dataset.k }; renderOverlays(); },
    'close-page': () => { st.page = null; render(); },
    'open-ex': el => { st.sheet = { t: 'ex', id: el.dataset.id, slot: el.dataset.slot }; renderOverlays(); },
    'close-sheet': closeSheet,
    report: el => { st.sheet = { t: 'report', slot: el.dataset.slot }; renderOverlays(); },
    reason: (el, v) => { st.sheet.reason = v; renderOverlays(); },
    zone: (el, v) => { st.sheet.zone = v; const p = P(); p.pain = Object.assign({}, p.pain, { [v]: Date.now() }); save(); ST.sync({ t: 'profile' }); renderOverlays(); },
    'pick-alt': el => {
      const p = P(), sh = st.sheet, it = findItem(sh.slot);
      p.overrides = Object.assign({}, p.overrides, { [sh.slot]: el.dataset.id });
      if (sh.reason === 'materiel') { const l = curSess().lieu || 'maison'; p.bans = Object.assign({}, p.bans); p.bans[l] = [...new Set([...(p.bans[l] || []), it.ex.id])]; }
      D().feedback.push({ date: Date.now(), week: st.page.n, slot: sh.slot, from: it.ex.id, to: el.dataset.id, reason: sh.reason, zone: sh.zone || null });
      save(); ST.sync({ t: 'profile' }); st.sheet = null; toast('Exercice remplacé'); render();
    },
    sendfb: () => { const t = (document.getElementById('rep_txt') || {}).value || ''; D().feedback.push({ date: Date.now(), week: st.page.n, slot: st.sheet.slot, reason: 'autre', text: t }); save(); st.sheet = null; toast('Merci, c\'est noté'); renderOverlays(); },
    lieu: (el, v) => { const pg = st.page; st.lieux[pg.n] = Object.assign({}, st.lieux[pg.n], { [pg.key]: v }); renderOverlays(); },
    start: () => { startPlayer(); },
    'pl-close': () => { if (!st.player.confirm) { st.player.confirm = true; toast('Appuie encore pour quitter la séance'); setTimeout(() => { if (st.player) st.player.confirm = false; }, 2500); return; } clearInterval(st.player.timer); st.player = null; wake(false); render(); },
    'pl-go': () => { const pl = st.player, s0 = pl.steps[pl.i]; const sec = s0.t === 'wu' ? s0.sec : s0.it.p.t; countdown(sec, () => { if (s0.t === 'wu') nextStep(); else { recordSet(); nextStep(); } }, 'work'); render(); },
    'pl-next': () => nextStep(),
    'pl-skipwu': () => { const pl = st.player; clearInterval(pl.timer); pl.timer = null; pl.i = pl.steps.findIndex(x => x.t !== 'wu'); pl.mode = 'work'; render(); },
    'pl-done': () => { recordSet(); nextStep(); },
    'pl-add': () => { const pl = st.player; const rem = pl.remain + 15; countdown(rem, () => { pl.mode = 'work'; pl.i++; autoWu(); render(); }, 'rest'); pl.restTot = Math.max(pl.restTot, rem); },
    'pl-skip': () => { const pl = st.player; clearInterval(pl.timer); pl.timer = null; pl.mode = 'work'; pl.i++; autoWu(); render(); },
    'pl-info': el => { st.sheet = { t: 'ex', id: el.dataset.id }; renderOverlays(); },
    'pl-save': () => {
      const pl = st.player, s = pl.sess;
      upsertLog({ week: st.page.n, key: s.key, kind: 'renfo', title: s.title, date: new Date().toISOString(), dur: Math.max(1, Math.round((Date.now() - pl.t0) / 60000)), rpe: +document.getElementById('pl_rpe').value, note: document.getElementById('pl_note').value, ex: pl.log, lieu: s.lieu });
      st.player = null; st.page = null; wake(false); toast('Séance enregistrée'); render();
    },
    'pl-quit': () => { st.player = null; wake(false); render(); },
    step: (el) => { const i = document.getElementById(el.dataset.id); const v = (+i.value || 0) + +el.dataset.v; i.value = Math.max(0, Math.round(v * 10) / 10); },
    rpe: el => { const id = el.dataset.id; document.getElementById(id).value = el.dataset.v; el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); if (id === 'pl_rpe' && st.player) st.player.rpe = +el.dataset.v; },
    quicklog: () => { st.sheet = { t: 'quicklog' }; renderOverlays(); },
    cardiolog: () => { st.sheet = { t: 'cardiolog' }; renderOverlays(); },
    dellog: (el, v) => { D().logs = D().logs.filter(l => l.id !== v); save(); ST.sync({ t: 'dellog', id: v }); st.sheet = null; st.page = null; toast('Relevé supprimé'); render(); },
    savetests: () => {
      const s = curSess(), t = {}; G.TESTS.forEach(x => { const val = document.getElementById('t_' + x.id).value; if (val) t[x.id] = +String(val).replace(',', '.'); });
      if (!Object.keys(t).length) { toast('Saisis au moins un résultat'); return; }
      if (t.vma) { P().vma = Math.round(t.vma / 10) / 10; ST.sync({ t: 'profile' }); }
      upsertLog({ week: st.page.n, key: s.key, kind: 'test', title: s.title, date: new Date().toISOString(), dur: 40, rpe: 8, tests: t });
      st.page = null; toast(t.vma ? `Tests enregistrés · VMA ${P().vma} km/h` : 'Tests enregistrés'); render();
    },
    checkin: () => { st.sheet = { t: 'checkin' }; renderOverlays(); },
    ci: el => { const n = st.n, ci = D().checkins[n] = Object.assign({}, D().checkins[n]); ci[el.dataset.k] = el.dataset.k === 'mode' ? el.dataset.v : +el.dataset.v; save(); renderOverlays(); },
    'ci-extra': el => { const n = st.n, ci = D().checkins[n] = Object.assign({}, D().checkins[n]); const ex = (ci.extra || []).filter(x => x.k !== el.dataset.k); if (ex.length === (ci.extra || []).length) ex.push({ k: el.dataset.k, label: el.dataset.l, w: +el.dataset.w }); ci.extra = ex; save(); renderOverlays(); },
    'ci-save': () => { const n = st.n; D().checkins[n] = Object.assign({ done: true }, D().checkins[n]); save(); ST.sync({ t: 'checkin', week: n }); st.sheet = null; render(); toast('Semaine ajustée'); },
    signal: () => { st.sheet = { t: 'signal' }; renderOverlays(); },
    'sig-go': () => { beep(0); signalStart(); },
    'sig-stop': () => { const sg = st.sheet.sig; sg.on = false; clearTimeout(sg.to); renderOverlays(); },
    itimer: (el, v) => { const c = JSON.parse(v); st.tmCfg = c; st.tmTab = 'inter'; const sq = intervalSeq(c); const t0 = { sets: c.sets, reps: c.reps }; tmStart(sq, 'Intervalles'); Object.assign(st.tm, t0); st.sheet = { t: 'timer' }; renderOverlays(); },
    timer: (el, v) => { if (v) st.tmTab = v; st.sheet = { t: 'timer' }; renderOverlays(); },
    'tm-tab': (el, v) => { st.tmTab = v; renderOverlays(); },
    'tm-rest': (el, v) => { tmStart([{ t: 'rest', d: +v }], 'Repos'); renderOverlays(); },
    'tm-preset': (el, v) => { st.tmCfg = JSON.parse(v); renderOverlays(); },
    'tm-add': () => { const t = st.tm; if (!t) return; t.end += 15000; t.seq[t.k] = Object.assign({}, t.seq[t.k], { d: t.seq[t.k].d + 15 }); if (t.paused) t.remain += 15; tmPaint(); },
    'tm-pause': () => { const t = st.tm; if (!t) return; if (t.paused) { t.end = Date.now() + t.remain * 1000; t.paused = false; } else { t.remain = (t.end - Date.now()) / 1000; t.paused = true; } tmPaint(); },
    'tm-stop': () => { tmStop(); renderOverlays(); },
    'rest-go': (el, v) => { tmStart([{ t: 'rest', d: +v }], 'Repos · ' + (el.dataset.l || '')); toast(`Repos ${fmtRest(+v)} lancé`); },
    'sw-toggle': () => { const sw = st.sw = st.sw || { acc: 0, running: false, laps: [] }; if (sw.running) { sw.acc += Date.now() - sw.t0; sw.running = false; } else { sw.t0 = Date.now(); sw.running = true; beep(0); } swLoop(); renderOverlays(); },
    'sw-lap': () => { const sw = st.sw; if (!sw) return; const tot = swNow(), prev = sw.laps.length ? sw.laps[sw.laps.length - 1].total : 0; sw.laps.push({ total: tot, split: tot - prev }); renderOverlays(); },
    'sw-reset': () => { st.sw = null; swLoop(); renderOverlays(); },
    'vid-edit': () => { st.sheet.editVideo = true; renderOverlays(); },
    'vid-cancel': () => { st.sheet.editVideo = false; renderOverlays(); },
    'vid-clear': () => { const p = P(); delete (p.videos || {})[st.sheet.id]; save(); ST.sync({ t: 'profile' }); st.sheet.editVideo = false; renderOverlays(); toast('Lien par défaut rétabli'); },
    newprofile: () => { st.obDraft = {}; st.obStep = 1; ST.data.profile = null; render(); },
    sample: () => { D().profile = SAMPLE(); save(); st.n = curWeek(); render(); },
    obprev: () => { st.obDraft = readProfileForm(st.obDraft); st.obStep = Math.max(1, (st.obStep || 1) - 1); render(); },
    painok: (el, v) => { const p = P(); delete p.pain[v]; save(); ST.sync({ t: 'profile' }); render(); toast('Zone retirée'); },
    resetov: () => { const p = P(); p.overrides = {}; p.bans = {}; save(); ST.sync({ t: 'profile' }); render(); toast('Programme réinitialisé'); },
    export: () => { st.sheet = { t: 'export' }; renderOverlays(); },
    import: () => { st.sheet = { t: 'import' }; renderOverlays(); },
    copyexp: () => { const t = document.getElementById('exp'); const txt = t.value; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copié'), () => { t.select(); toast('Sélectionné : copie avec Ctrl+C'); }); },
    dlexp: () => { const b = new Blob([JSON.stringify(D(), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `kinprep-${(P().name || 'joueur').replace(/\s+/g, '-')}.json`; a.click(); },
    doimport: () => { try { const d = JSON.parse(document.getElementById('imp').value); if (!d || !d.profile) throw new Error('Le texte ne contient pas de profil.'); ST.data = Object.assign({ logs: [], checkins: {}, feedback: [], queue: [] }, d); save(); st.sheet = null; render(); toast('Données importées'); } catch (e) { document.getElementById('imp_err').textContent = 'Import impossible : ' + e.message; } },
    reset: () => { st.confirmReset = true; render(); },
    'reset-no': () => { st.confirmReset = false; render(); },
    'reset-yes': () => { ST.reset(); st.confirmReset = false; st.obStep = 1; st.obDraft = {}; render(); },
    theme: () => { const r = document.documentElement, t = r.dataset.theme; const nx = !t ? 'dark' : t === 'dark' ? 'light' : ''; if (nx) r.dataset.theme = nx; else delete r.dataset.theme; try { localStorage.setItem('kinprep.theme', nx); } catch (e) { /* */ } render(); },
    authmode: () => { st.authMode = st.authMode === 'up' ? 'in' : 'up'; render(); },
    logout: () => { SB.signOut(); st.feed = null; render(); },
    'reload-feed': () => { st.feed = null; render(); },
    teamtab: (el, v) => { st.teamTab = v; render(); },
    react: async (el, v) => { try { await SB.react(v, el.dataset.on === '1'); st.feed = null; render(); } catch (e) { toast(e.message); } },
    approve: async (el, v) => { try { await SB.approve(v, true); st.feed = null; render(); toast('Compte validé'); } catch (e) { toast(e.message); } },
    unapprove: async (el, v) => { try { await SB.approve(v, false); st.feed = null; render(); toast('Accès retiré'); } catch (e) { toast(e.message); } },
    setrole: async (el, v) => { try { await SB.setRole(v, el.dataset.r); st.feed = null; render(); toast(el.dataset.r === 'coach' ? 'Coach ajouté' : 'Rôle coach retiré'); } catch (e) { toast(e.message); } },
    'coach-player': (el, v) => { st.sheet = { t: 'player', id: v }; renderOverlays(); },
    coachweeks: () => { st.coachWeeks = (st.coachWeeks || 6) === 6 ? 60 : 6; render(); },
    ai: () => { st.sheet = { t: 'ai' }; renderOverlays(); },
    'ai-apply': (el, v) => { const act = JSON.parse(v); const p = P(); if (act.slot && act.to) { p.overrides = Object.assign({}, p.overrides, { [act.slot]: act.to }); save(); ST.sync({ t: 'profile' }); toast('Modification appliquée'); st.sheet = null; render(); } },
  };
  document.addEventListener('submit', async e => {
    const f = e.target; e.preventDefault();
    const kind = f.dataset.f;
    if (kind === 'profile') {
      if (f.dataset.mode === 'onboard') {
        st.obDraft = readProfileForm(st.obDraft);
        if ((st.obStep || 1) < 4) { st.obStep = (st.obStep || 1) + 1; window.scrollTo(0, 0); render(); return; }
        D().profile = Object.assign({ overrides: {}, bans: {}, created: Date.now() }, st.obDraft); delete D().profile.demo;
        save(); ST.sync({ t: 'profile' }); st.obStep = 1; st.n = curWeek(); render(); toast('Programme créé'); return;
      }
      saveProfileForm(false); render(); return;
    }
    if (kind === 'cardiolog') {
      const s = curSess(), g = id => document.getElementById(id).value;
      upsertLog({ week: st.page.n, key: s.key, kind: 'cardio', title: s.title, date: new Date().toISOString(), mode: g('cl_mode'), dur: +g('cl_dur'), km: g('cl_km') ? +String(g('cl_km')).replace(',', '.') : null, fc: g('cl_fc') ? +g('cl_fc') : null, dplus: g('cl_dplus') ? +g('cl_dplus') : null, rpe: +g('cl_rpe'), note: g('cl_note') });
      st.sheet = null; st.page = null; toast('Séance enregistrée'); render(); return;
    }
    if (kind === 'quicklog') {
      const s = curSess(), g = id => document.getElementById(id).value;
      upsertLog({ week: st.page.n, key: s.key, kind: s.kind, title: s.title, date: new Date().toISOString(), dur: +g('ql_dur'), rpe: +g('ql_rpe'), note: g('ql_note') });
      st.sheet = null; st.page = null; toast('Séance enregistrée'); render(); return;
    }
    if (kind === 'auth') {
      const err = document.getElementById('au_err'); err.textContent = '';
      const mail = document.getElementById('au_mail').value.trim(), pw = document.getElementById('au_pw').value;
      try {
        if (st.authMode === 'up') { const r = await SB.signUp(mail, pw, document.getElementById('au_name').value.trim()); if (!r.access_token) { err.textContent = 'Compte créé. Confirme ton adresse via l\'e-mail reçu, puis connecte-toi.'; st.authMode = 'in'; return; } }
        else await SB.signIn(mail, pw);
        const remote = await SB.pull();
        const rp = remote && remote.profile && remote.profile.data;
        if (rp && rp.role && (!P() || P().demo)) { D().profile = rp; D().logs = remote.logs || []; D().checkins = remote.checkins || {}; }
        else if (P() && !P().demo) {
          const ids = new Set(D().logs.map(l => l.id)); (remote ? remote.logs : []).forEach(l => { if (l && !ids.has(l.id)) D().logs.push(l); });
          ST.sync({ t: 'profile' }); D().logs.forEach(l => ST.sync({ t: 'log', id: l.id })); Object.keys(D().checkins).forEach(w => ST.sync({ t: 'checkin', week: +w }));
        }
        save(); st.feed = null; render(); toast('Connecté');
      } catch (ex) { err.textContent = ex.message === 'Invalid login credentials' ? 'E-mail ou mot de passe incorrect.' : ex.message; }
      return;
    }
    if (kind === 'ai') { const q = document.getElementById('ai_q').value.trim(); if (q) askAI(q); }
    if (kind === 'tm-custom') { const sec = (+document.getElementById('tmc_m').value || 0) * 60 + (+document.getElementById('tmc_s').value || 0); if (sec > 0) { tmStart([{ t: 'rest', d: sec }], 'Compte à rebours'); renderOverlays(); } }
    if (kind === 'tm-inter') { const g = id => Math.max(0, +document.getElementById(id).value || 0); const c = { on: g('ti_on') || 30, off: g('ti_off'), reps: g('ti_reps') || 1, sets: g('ti_sets') || 1, rec: g('ti_rec') }; st.tmCfg = c; tmStart(intervalSeq(c), 'Intervalles'); Object.assign(st.tm, { sets: c.sets, reps: c.reps }); renderOverlays(); }
    if (kind === 'video') {
      const u = document.getElementById('vid_url').value.trim();
      if (!/^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//.test(u)) { document.getElementById('vid_err').textContent = 'Colle un lien YouTube qui commence par https://www.youtube.com ou https://youtu.be'; return; }
      const p = P(); p.videos = Object.assign({}, p.videos, { [f.dataset.id]: u }); save(); ST.sync({ t: 'profile' }); st.sheet.editVideo = false; renderOverlays(); toast('Lien enregistré');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (st.sheet) closeSheet(); else if (st.page && !st.player) { st.page = null; render(); } } });

  // ---------- démarrage ----------
  try { const t = localStorage.getItem('kinprep.theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) { /* */ }
  if (!P() && KP.CONFIG.demo) { D().profile = SAMPLE(); save(); }
  render();
  ST.flush();
  KP.app = { st, render, week };
})(window.KP);
