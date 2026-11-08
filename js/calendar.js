/* KinPrep — calendrier de la saison 2026-2027 et périodisation */
(function (KP) {
  const START = new Date(2026, 11, 7); // lundi 7 décembre 2026
  const NWEEKS = 47;
  const FIRST = -3; // bêta : B1 à B4 = semaines -3 à 0 (9 nov. → 6 déc. 2026)
  const DAY = 86400000;

  function weekStart(n) { return new Date(START.getTime() + (n - 1) * 7 * DAY); }
  function weekOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((d - START) / (7 * DAY)) + 1;
  }
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const JOURS_LONG = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const fmt = d => `${d.getDate()} ${MOIS[d.getMonth()]}`;
  function weekLabel(n) { const a = weekStart(n), b = new Date(a.getTime() + 6 * DAY); return `${fmt(a)} → ${fmt(b)}`; }

  /* Types : J = journée de championnat, EN = entraînement national (4 h), PO = play-offs,
     COMP = compétition internationale, STAGE = stage national, INFO = événement sans impact. */
  const EVENTS = [
    ['2026-11-15', 'J', 'J4 · Nivelles'], ['2026-11-22', 'J', 'J5 · Oreye'], ['2026-12-05', 'J', 'J6 · Aubel'], ['2026-12-06', 'EN', 'EN 3'],
    ['2026-12-13', 'J', 'J7 · Fléron'], ['2026-12-19', 'EN', 'EN 4'],
    ['2027-01-10', 'EN', 'EN 5'], ['2027-01-17', 'J', 'J8 · Herve'], ['2027-01-24', 'EN', 'EN 6'], ['2027-01-30', 'J', 'J9 · Jodoigne'],
    ['2027-02-06', 'J', 'J10 · K-Ribou'], ['2027-02-13', 'INFO', 'Kin-Day'], ['2027-02-14', 'EN', 'EN 7'], ['2027-02-21', 'J', 'J11 · Thimister'],
    ['2027-03-07', 'EN', 'EN 8'], ['2027-03-14', 'J', 'J12 · Hannut'], ['2027-03-21', 'EN', 'EN 9'], ['2027-03-27', 'J', 'J13 · KBBT'],
    ['2027-04-10', 'PO', 'Play-offs 1', 'po'], ['2027-04-11', 'EN', 'EN 10', 'nopo'],
    ['2027-04-17', 'PO', 'Play-offs 2', 'po'], ['2027-04-18', 'EN', 'EN 11', 'nopo'],
    ['2027-04-25', 'PO', 'Play-offs 3', 'po'],
    ['2027-05-07', 'COMP', 'Challenge Cup (Suisse)', 'cc', 4],
    ['2027-05-22', 'EN', 'EN 12'],
    ['2027-06-05', 'EN', 'EN 13'], ['2027-06-20', 'EN', 'EN 14'], ['2027-06-27', 'EN', 'EN 15'],
    ['2027-07-04', 'EN', 'EN 15bis'], ['2027-07-18', 'EN', 'EN 16'], ['2027-07-25', 'EN', 'EN 17'],
    ['2027-08-08', 'EN', 'EN 18'], ['2027-08-14', 'EN', 'EN 19'], ['2027-08-22', 'EN', 'EN 20'],
    ['2027-09-03', 'STAGE', 'Stage national', null, 3], ['2027-09-12', 'EN', 'EN 21'], ['2027-09-19', 'EN', 'EN 22'], ['2027-09-26', 'EN', 'EN 23'],
    ['2027-10-03', 'EN', 'EN 24'], ['2027-10-10', 'EN', 'EN 25'], ['2027-10-17', 'EN', 'EN 26'], ['2027-10-24', 'EN', 'EN 27'],
    ['2027-10-30', 'COMP', 'World Cup', null, 2],
  ].map(([d, type, label, cond, days]) => ({ date: d, type, label, cond: cond || null, days: days || 1 }));

  const EVENT_WEIGHT = { J: 2, EN: 2, PO: 3, COMP: 4, STAGE: 3, INFO: 0 };
  const EVENT_LABEL = { J: 'Championnat', EN: 'Entraînement national', PO: 'Play-offs', COMP: 'Compétition', STAGE: 'Stage', INFO: 'Événement' };

  function eventsOfWeek(n, profile) {
    const a = weekStart(n), b = new Date(a.getTime() + 7 * DAY);
    return EVENTS.filter(e => { const d = parse(e.date); return d >= a && d < b; })
      .filter(e => !e.cond || (e.cond === 'po' && profile && profile.po === true) || (e.cond === 'nopo' && !(profile && profile.po === true)) || (e.cond === 'cc' && !(profile && profile.cc === false)))
      .map(e => Object.assign({}, e, { dow: (parse(e.date).getDay() + 6) % 7 }));
  }
  function clubActive(n) {
    const d = weekStart(n);
    if (n === 3 || n === 4) return false; // vacances de Noël
    return !(d >= new Date(2027, 4, 10) && d < new Date(2027, 7, 16));
  }

  const PHASES = [
    { id: 'ppg', name: 'Préparation générale', short: 'PPG', w: [1, 4], fam: 'ppg', wk: ['up', 'up', 'up', 'light'],
      goal: 'Reconstruire des bases solides : renforcement global, gainage et prévention (genou, cheville, épaule, coude, bas du dos).',
      focus: ['Technique propre avant la charge', 'Séries de 12 à 15 répétitions', 'Endurance de base et premiers 30-30'] },
    { id: 'force', name: 'Force', short: 'Force', w: [5, 10], fam: 'force', wk: ['up', 'up', 'up', 'deload', 'up', 'up'],
      goal: 'Augmenter la force maximale : charges qui montent chaque semaine, séries courtes, récupérations longues.',
      focus: ['Charges en hausse si le RPE le permet', 'Semaine 8 plus légère pour absorber', 'Intermittent 30-30 pour le cardio'] },
    { id: 'puissance', name: 'Puissance et vitesse', short: 'Puissance', w: [11, 16], fam: 'puiss', wk: ['up', 'up', 'up', 'deload', 'up', 'up'],
      goal: 'Transformer la force en explosivité : sauts, lancers, frappe et démarrages propres à ton rôle.',
      focus: ['Chaque répétition à vitesse maximale', 'Qualité avant quantité', 'Sprints répétés et vitesse spécifique'] },
    { id: 'pic1', name: 'Play-offs et Challenge Cup', short: 'Pic 1', w: [17, 23], fam: 'pic', wk: ['taper', 'comp', 'comp', 'comp', 'maint', 'taper', 'recup'],
      goal: 'Être au top pour les play-offs puis la Challenge Cup : moins de volume, intensité conservée, fraîcheur avant chaque échéance.',
      focus: ['Séances courtes et vives', 'Rien de lourd dans les 48 h avant un match', 'Récupération après la Challenge Cup'] },
    { id: 'transition', name: 'Transition', short: 'Transition', w: [24, 24], fam: 'trans', wk: ['rest'],
      goal: 'Couper physiquement et mentalement. Bouge autrement : vélo, natation, squash, randonnée.',
      focus: ['Aucune séance obligatoire', 'Sports plaisir', 'Soigne les petits bobos'] },
    { id: 'ppg2', name: 'Préparation générale 2', short: 'PPG 2', w: [25, 26], fam: 'ppg', wk: ['up', 'up'],
      goal: 'Relancer la machine, refaire les tests et corriger les points faibles avant le gros bloc d\'été.',
      focus: ['Retests VMA et force', 'Volume modéré', 'Prévention renforcée'] },
    { id: 'force2', name: 'Force 2', short: 'Force 2', w: [27, 34], fam: 'force', wk: ['up', 'up', 'up', 'deload', 'up', 'up', 'up', 'deload'],
      goal: 'Le bloc le plus chargé de l\'année, sans club : 2 séances de renfo et 2 de cardio conseillées.',
      focus: ['Charges plus lourdes qu\'en janvier', 'Semaines 30 et 34 allégées', 'Gros volume d\'intermittent'] },
    { id: 'puissance2', name: 'Puissance 2', short: 'Puissance 2', w: [35, 39], fam: 'puiss', wk: ['up', 'up', 'up', 'deload', 'up'],
      goal: 'Convertir la force de l\'été en vitesse et en frappe. Reprise du club mi-août et stage début septembre.',
      focus: ['Contrastes charge-saut', 'Lancers et frappe des deux bras', 'Sprints répétés'] },
    { id: 'specifique', name: 'Spécifique', short: 'Spécifique', w: [40, 43], fam: 'puiss', wk: ['up', 'up', 'deload', 'up'],
      goal: 'Un entraînement national chaque week-end : entretenir la force, aiguiser la vitesse propre à ton rôle.',
      focus: ['1 séance de renfo courte et intense', 'Vitesse spécifique au rôle', 'Fraîcheur pour les week-ends'] },
    { id: 'affutage', name: 'Affûtage World Cup', short: 'Affûtage', w: [44, 47], fam: 'pic', wk: ['up', 'up', 'taper', 'comp'],
      goal: 'Arriver frais et explosif à la World Cup : intensité maintenue, volume réduit de 40 à 60 % sur les 10 à 14 derniers jours.',
      focus: ['Peu de séries, beaucoup de qualité', 'Sommeil et récupération', 'Activation légère 2 jours avant'] },
  ];
  const BETA_INFO = { id: 'beta', name: 'Bêta', short: 'Bêta', w: [-3, 0], goal: '4 semaines de test avec le staff : une semaine de chaque type pour essayer toutes les fonctions de l\'appli.' };
  const BETA = [
    { id: 'beta_ppg', name: 'Bêta · Préparation générale', short: 'Bêta PPG', fam: 'ppg', wt: 'up', goal: 'Tester une semaine de préparation générale : séries de 12, gainage, prévention, premier 30-30.', focus: ['Teste la séance guidée et le minuteur', 'Fais les tests de départ (VMA, saut, tractions)', 'Signale tout exercice inadapté'] },
    { id: 'beta_force', name: 'Bêta · Force', short: 'Bêta Force', fam: 'force', wt: 'up', goal: 'Tester une semaine de force : charges plus lourdes, récupérations longues, intermittent 30-30.', focus: ['Note charge et RPE réel à chaque série', 'Vérifie les charges proposées la séance suivante', 'Teste l\'ajustement de la semaine'] },
    { id: 'beta_puiss', name: 'Bêta · Puissance', short: 'Bêta Puissance', fam: 'puiss', wt: 'up', goal: 'Tester une semaine de puissance : sauts, lancers rotatifs type coup droit, vitesse propre au rôle.', focus: ['Chaque répétition à vitesse maximale', 'Teste le signal visuel de réaction', 'Lancers des deux bras, même volume'] },
    { id: 'beta_decharge', name: 'Bêta · Décharge', short: 'Bêta Décharge', fam: 'force', wt: 'deload', goal: 'Tester une semaine de décharge : volume réduit avant le vrai départ du 7 décembre.', focus: ['Séances courtes', 'Récupération', 'Note tes retours pour le staff'] },
  ].map(b => Object.assign({ w: [-3, 0], wk: [b.wt] }, b));
  const isBeta = n => n <= 0;
  const wkName = n => (n <= 0 ? `B${n + 4}` : `S${n}`);
  function phaseOf(n) {
    if (n <= 0) { const b = BETA[Math.max(0, Math.min(3, n + 3))]; return { phase: b, wi: n + 3, wtype: b.wt, k: 0, nInPhase: 4 }; }
    const p = PHASES.find(p => n >= p.w[0] && n <= p.w[1]) || PHASES[PHASES.length - 1];
    const wi = n - p.w[0];
    const wtype = p.wk[Math.min(wi, p.wk.length - 1)];
    const k = p.wk.slice(0, wi + 1).filter(t => t === 'up').length - 1;
    return { phase: p, wi, wtype, k: Math.max(0, k), nInPhase: p.w[1] - p.w[0] + 1 };
  }

  KP.cal = { FIRST, BETA, BETA_INFO, isBeta, wkName, START, NWEEKS, DAY, weekStart, weekOf, weekLabel, iso, parse, fmt, MOIS, JOURS, JOURS_LONG, EVENTS, EVENT_WEIGHT, EVENT_LABEL, eventsOfWeek, clubActive, PHASES, phaseOf };
})(window.KP = window.KP || {});
