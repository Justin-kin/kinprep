/* KinPrep — générateur de programme individualisé */
(function (KP) {
  const C = KP.cal;

  // ---------------- prescriptions ----------------
  // kinds : main, sec, acc, prev, core, iso, ecc, plyo, power
  const P = (s, r, rpe, rest, t) => ({ s, r, rpe, rest, t });
  function presc(fam, kind, k, wtype, pid) {
    const light = wtype === 'deload' || wtype === 'light';
    if (fam === 'ppg') {
      const T = {
        main: P(3, [12, 12, 15, 15][k] || 15, [6.5, 7, 7, 7.5][k] || 7.5, 75),
        sec: P(3, [12, 12, 12, 15][k] || 12, 7, 60),
        acc: P(3, 12, 7, 45), prev: P([2, 3, 3, 3][k] || 3, 15, 6.5, 45, [30, 35, 40, 40][k] || 40),
        core: P(3, 10, 7, 30, [30, 35, 40, 45][k] || 45), iso: P(4, 1, 7, 60, [30, 40, 45, 45][k] || 45),
        ecc: P([2, 3, 3, 3][k] || 3, [4, 5, 5, 6][k] || 6, 7, 90), plyo: P(3, 5, 6, 60), power: P(3, 8, 6.5, 60),
      };
      const p = T[kind];
      return light ? Object.assign({}, p, { s: Math.max(2, p.s - 1), rpe: Math.min(p.rpe, 6.5) }) : p;
    }
    if (fam === 'force') {
      if (light) return { main: P(2, 6, 6.5, 120), sec: P(2, 8, 6.5, 90), acc: P(2, 10, 6.5, 60), prev: P(2, 12, 6, 45, 30), core: P(2, 10, 6.5, 30, 30), iso: P(3, 1, 6.5, 60, 40), ecc: P(2, 4, 6.5, 90), plyo: P(2, 3, 6, 90), power: P(2, 4, 6, 90) }[kind];
      // Force (comme 2023) : 4 × 10 → 4 × 8, RPE 6,5 → 8,5. Force 2 : on garde le volume puis 3 × 6 lourd (comme le Rappel Force 2023).
      if (pid === 'rappel') { const r = { main: P(3, 6, 8, 150), sec: P(3, 6, 8, 90) }[kind]; if (r) return r; }
      const M = pid === 'force2' ? [[4, 8, 7.5], [4, 8, 8], [4, 6, 8], [4, 6, 8], [3, 6, 8.5], [3, 6, 8.5], [3, 5, 8.5], [3, 5, 8.5]][Math.min(k, 7)]
        : [[4, 10, 6.5], [4, 10, 7], [4, 10, 7.5], [4, 8, 7.5], [4, 8, 8], [4, 8, 8.5]][Math.min(k, 5)];
      const S = pid === 'force2' ? [[3, 10, 7.5], [3, 10, 8], [3, 8, 8], [3, 8, 8], [3, 8, 8], [3, 6, 8.5], [3, 6, 8.5], [3, 6, 8.5]][Math.min(k, 7)]
        : [[3, 12, 7], [3, 12, 7], [3, 10, 7.5], [3, 10, 7.5], [3, 10, 8], [3, 8, 8]][Math.min(k, 5)];
      return {
        main: P(M[0], M[1], M[2], 150), sec: P(S[0], S[1], S[2], 90), acc: P(3, 12, 7.5, 60), prev: P(3, 12, 7, 45, 40),
        core: P(3, 10, 7.5, 30, 40), iso: P(4, 1, 7.5, 60, 45), ecc: P(3, [5, 6, 6, 6, 8, 8, 8][Math.min(k, 6)], 7.5, 90),
        plyo: P(3, 3, 7, 90), power: P(3, 5, 7, 90),
      }[kind];
    }
    if (fam === 'puiss') {
      if (light) return { main: P(3, 3, 7, 150), sec: P(2, 5, 7, 90), acc: P(2, 8, 6.5, 60), prev: P(2, 12, 6, 45, 30), core: P(2, 10, 6.5, 30, 30), iso: P(3, 1, 7, 60, 40), ecc: P(2, 4, 6.5, 90), plyo: P(3, 4, 7, 90), power: P(3, 4, 7, 90) }[kind];
      const M = [[4, 5, 8], [4, 4, 8], [5, 3, 8.5], [5, 3, 8.5], [4, 3, 8.5]][Math.min(k, 4)];
      return {
        main: P(M[0], M[1], M[2], 180), sec: P(3, 6, 8, 90), acc: P(3, 8, 7.5, 60), prev: P(2, 12, 7, 45, 35),
        core: P(3, 8, 7.5, 30, 30), iso: P(3, 1, 7.5, 60, 45), ecc: P(2, 5, 7.5, 90),
        plyo: P([4, 4, 5, 5, 4][Math.min(k, 4)], [5, 6, 5, 5, 5][Math.min(k, 4)], 8, 90), power: P([4, 4, 5, 5, 4][Math.min(k, 4)], [5, 6, 5, 5, 5][Math.min(k, 4)], 8, 90),
      }[kind];
    }
    if (fam === 'pic') {
      const W = {
        up: { main: P(4, 3, 8.5, 180), sec: P(3, 5, 8, 90), plyo: P(4, 4, 8, 90), power: P(4, 4, 8, 90) },
        taper: { main: P(2, 3, 8, 150), sec: P(2, 5, 7.5, 90), plyo: P(2, 4, 8, 90), power: P(2, 4, 8, 90) }, // affûtage : comme 2023, on garde charges et intensité, on passe à 2 séries
        comp: { main: P(2, 3, 7, 150), sec: P(2, 4, 7, 90), plyo: P(2, 3, 7, 90), power: P(2, 3, 7, 90) },
        maint: { main: P(3, 4, 8, 150), sec: P(3, 6, 7.5, 90), plyo: P(3, 5, 8, 90), power: P(3, 5, 8, 90) },
        recup: { main: P(2, 8, 6, 60), sec: P(2, 10, 6, 60), plyo: P(2, 3, 6, 60), power: P(2, 5, 6, 60) },
      }[wtype] || {};
      const base = { acc: P(2, 8, 7, 60), prev: P(2, 10, 6.5, 45, 30), core: P(2, 8, 7, 30, 30), iso: P(3, 1, 7, 60, 40), ecc: P(2, 4, 7, 90) };
      return W[kind] || base[kind];
    }
    // transition / circuit
    return P(2, 12, 6, 30, 40);
  }

  // ---------------- modèles de séances ----------------
  const S = (id, pats, kind, pri, o) => Object.assign({ id, pats, kind, pri }, o || {});
  const EL = (id, pri) => S(id, ['ELBOW_PREV'], 'prev', pri == null ? 1 : pri, { pref: ['wrist_ecc', 'elbow_iso', 'pronosup'] });
  // frappe : armé → balayage montant (rotation) → ramené vers le bas, au moins un pied ancré
  const ROT = ['frappe_full_band', 'rot_throw_diag', 'rot_throw', 'rot_throw_open', 'rot_band_high', 'frappe_ball', 'rot_band', 'frappe_air'];
  const ROT2 = ['frappe_step', 'rot_throw_diag', 'rot_throw_step', 'frappe_full_band', 'rot_throw_open', 'rot_band_high', 'frappe_air'];
  const DOWN = ['slam', 'straight_pulldown', 'frappe_band'];
  // Séance A = indispensable : tout ce qui doit être fait chaque semaine (frappe, appuis latéraux, Nordic, adducteurs, coude).
  // Séance B = complément facultatif : volume, variantes, accessoires.
  // alt : variante utilisée une semaine sur deux (alternance deux jambes / une jambe).
  const UNI = { pats: ['LEG_UNI'], pref: ['bulgarian_db', 'split_squat_db', 'bulgarian', 'split_squat'] };
  const T = {
    ppg_R1: { title: 'Renfo A · Essentiel', blocks: [
      [S('A1', ['LEG_KNEE'], 'main', 1, { pref: ['goblet_kb', 'goblet_db', 'back_squat'], alt: UNI }), S('A2', ['PULL_H'], 'sec', 1, { pref: ['row_db', 'inverted_row', 'table_row'] })],
      [S('B1', ['POWER_ROT'], 'power', 1, { pref: ROT }), S('B2', ['LEG_LAT'], 'sec', 1, { pref: ['lunge_lat_db', 'lunge_lat'] })],
      [S('C1', ['HAM_ECC'], 'ecc', 1, { pref: ['nordic', 'nordic_assist', 'ham_slide', 'ham_swiss'] }), S('C2', ['PUSH_H'], 'sec', 1, { pref: ['push_up', 'bench_db'] })],
      [S('D1', ['ADD'], 'prev', 1, { pref: ['copenhagen_short', 'copenhagen', 'add_squeeze'] }), S('D2', ['CORE_ANTI'], 'core', 1, { pref: ['pallof', 'chop_ecc', 'dead_bug', 'plank'] })],
      [EL('E1'), S('E2', ['LEG_HIP'], 'sec', 2, { pref: ['rdl_db', 'rdl_kb', 'sl_rdl_db', 'hip_thrust_db', 'bridge'] }), S('R1', ['ANKLE', 'CALF', 'POGO'], 'prev', 1, { roles: ['rapproche'], pref: ['calf_db', 'calf', 'peroneal'], note: 'Rapproché : réactivité de la cheville pour les petits appuis' }), S('R2', ['HAM_ECC', 'LEG_HIP'], 'sec', 1, { roles: ['pointe'], pref: ['sl_rdl_db', 'ham_slide', 'sl_bridge', 'sl_rdl_pdc'], note: 'Pointe : chaîne arrière pour les démarrages' }), S('R3', ['ADD', 'LEG_LAT'], 'prev', 1, { roles: ['ailier'], pref: ['lateral_walk', 'add_squeeze', 'copenhagen_short', 'copenhagen'], note: 'Ailier : adducteurs et appuis latéraux' })],
    ] },
    ppg_R2: { title: 'Renfo B · Complément', blocks: [
      [S('A1', ['LEG_HIP'], 'main', 1, { pref: ['rdl_db', 'rdl_kb', 'sl_rdl_db', 'hip_thrust_db', 'bridge'] }), S('A2', ['PULL_V'], 'sec', 1, { pref: ['pull_up_neg', 'chin_up', 'lat_pull_band'] })],
      [S('B1', ['LEG_UNI'], 'sec', 1, { pref: ['step_up_db', 'lunge_rev', 'step_up', 'split_squat_db'] }), S('B2', ['POWER_DOWN', 'PEC_ADD'], 'acc', 1, { pref: ['straight_pulldown', 'pec_iso', 'pullover'] })],
      [S('C1', ['QUAD_ISO'], 'iso', 2, { pref: ['spanish_squat', 'wall_sit'] }), S('C2', ['CORE_ROT'], 'core', 1, { pref: ['chop_ecc', 'landmine_rot', 'chop'] })],
      [S('D1', ['PROPRIO'], 'prev', 2, { pref: ['balance_reach', 'balance_pad', 'hop_rot'] }), S('D2', ['PUSH_V', 'PEC_ADD'], 'acc', 2, { pref: ['landmine_press', 'ohp_db', 'pec_iso'] })],
      [S('E1', ['CORE_FLEX', 'CORE_ANTI'], 'core', 2, { pref: ['ab_wheel', 'hollow', 'curl_up', 'side_plank'] }), S('E2', ['ANKLE', 'CALF'], 'prev', 1, { pref: ['peroneal', 'tibialis', 'calf_db', 'toe_yoga'] }), EL('E3', 2)],
    ] },
    force_R1: { title: 'Force A · Essentiel', blocks: [
      [S('A1', ['JUMP_V'], 'plyo', 2, { pref: ['cmj', 'box_jump', 'squat_jump'] })],
      [S('B1', ['LEG_KNEE'], 'main', 1, { pref: ['back_squat', 'goblet_kb', 'squat_db', 'goblet_db'], alt: UNI }), S('B2', ['PULL_V'], 'main', 1, { pref: ['chin_up', 'pull_up', 'pull_up_band', 'lat_pull_band'] })],
      [S('C1', ['POWER_ROT'], 'power', 1, { pref: ROT }), S('C2', ['PUSH_H'], 'main', 1, { pref: ['bench_bar', 'bench_db', 'floor_press', 'push_up_lest', 'push_up'] })],
      [S('D1', ['LEG_LAT'], 'sec', 1, { pref: ['lunge_lat_db', 'lunge_lat'] }), S('D2', ['ADD'], 'prev', 1, { pref: ['copenhagen', 'copenhagen_short'] })],
      [S('E1', ['HAM_ECC'], 'ecc', 1, { pref: ['nordic', 'nordic_assist', 'ham_slide'] }), EL('E2'), S('E3', ['CORE_ANTI'], 'core', 2, { pref: ['pallof', 'chop_ecc', 'side_plank', 'plank_reach'] }), S('R1', ['ANKLE', 'CALF', 'POGO'], 'prev', 1, { roles: ['rapproche'], pref: ['calf_sl', 'calf_db', 'peroneal'], note: 'Rapproché : réactivité de la cheville pour les petits appuis' }), S('R2', ['HAM_ECC', 'LEG_HIP'], 'sec', 1, { roles: ['pointe'], pref: ['sl_rdl_db', 'ham_slide', 'sl_bridge', 'sl_rdl_pdc'], note: 'Pointe : chaîne arrière pour les démarrages' }), S('R3', ['ADD', 'LEG_LAT'], 'prev', 1, { roles: ['ailier'], pref: ['lateral_walk', 'add_squeeze', 'copenhagen_short', 'copenhagen'], note: 'Ailier : adducteurs et appuis latéraux' })],
    ] },
    force_R2: { title: 'Force B · Complément', blocks: [
      [S('A1', ['LEG_HIP'], 'main', 1, { pref: ['rdl_bar', 'sl_rdl_db', 'rdl_db', 'hip_thrust_bar', 'rdl_kb'] }), S('A2', ['PULL_H'], 'main', 1, { pref: ['row_db', 'row_bar', 'inverted_row'] })],
      [S('B1', ['LEG_UNI'], 'sec', 1, { pref: ['lunge_fwd_db', 'step_up_db', 'lunge_rev', 'bulgarian_db'] }), S('B2', ['POWER_DOWN'], 'power', 1, { pref: DOWN })],
      [S('C1', ['CORE_ROT'], 'core', 1, { pref: ['landmine_rot', 'chop_ecc', 'rot_band_high'] }), S('C2', ['PEC_ADD'], 'acc', 2, { pref: ['pullover', 'fly_db', 'pec_iso'] })],
      [S('D1', ['PROPRIO'], 'prev', 2, { pref: ['hop_rot', 'hop_balance', 'balance_reach'] }), S('D2', ['QUAD_ISO', 'QUAD_ECC'], 'iso', 2, { pref: ['reverse_nordic', 'spanish_squat'] })],
      [S('E1', ['CALF', 'ANKLE'], 'prev', 1, { pref: ['calf_sl', 'peroneal', 'calf_db'] }), S('E2', ['CORE_FLEX'], 'core', 3, { pref: ['ab_wheel', 'hollow'] }), EL('E3', 2)],
    ] },
    // Puissance : méthode de contraste (comme la préparation 2023) : exercice chargé puis exercice explosif du même mouvement
    puiss_R1: { title: 'Puissance A · Essentiel', blocks: [
      [S('A1', ['POWER_ROT'], 'power', 1, { pref: ROT, note: 'En début de séance, quand tu es frais' })],
      [S('B1', ['LEG_KNEE'], 'main', 1, { pref: ['back_squat', 'squat_db', 'goblet_kb', 'goblet_db'], note: 'Charge lourde, remonte le plus vite possible' }), S('B2', ['JUMP_V'], 'plyo', 1, { pref: ['squat_jump', 'cmj', 'box_jump'], note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('C1', ['PUSH_H'], 'main', 1, { pref: ['bench_bar', 'bench_db', 'floor_press', 'push_up_lest', 'push_up'], note: 'Charge lourde, remonte le plus vite possible' }), S('C2', ['PUSH_PLYO'], 'plyo', 1, { pref: ['push_up_plyo', 'push_up_plyo_knee', 'chest_pass', 'push_up_plyo_inc'], note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('D1', ['LEG_LAT'], 'main', 1, { pref: ['lunge_lat_db', 'lunge_lat'], note: 'Charge lourde, remonte le plus vite possible' }), S('D2', ['ROLE'], 'plyo', 1, { note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('E1', ['HAM_ECC'], 'ecc', 1, { pref: ['nordic', 'nordic_assist', 'ham_slide'] }), S('E2', ['ADD'], 'prev', 1, { pref: ['copenhagen', 'copenhagen_short'] }), EL('E3')],
      [S('F1', ['PULL_V'], 'main', 2, { pref: ['chin_up', 'pull_up', 'pull_up_band', 'lat_pull_band'] }), S('F2', ['POWER_DOWN'], 'power', 2, { pref: DOWN }), S('R1', ['ANKLE', 'CALF', 'POGO'], 'prev', 1, { roles: ['rapproche'], pref: ['pogo', 'calf_sl'], note: 'Rapproché : réactivité de la cheville pour les petits appuis' }), S('R2', ['HAM_ECC', 'LEG_HIP'], 'sec', 1, { roles: ['pointe'], pref: ['sl_rdl_db', 'ham_slide', 'sl_bridge', 'sl_rdl_pdc'], note: 'Pointe : chaîne arrière pour les démarrages' }), S('R3', ['ADD', 'LEG_LAT'], 'prev', 1, { roles: ['ailier'], pref: ['lateral_walk', 'add_squeeze', 'copenhagen_short', 'copenhagen'], note: 'Ailier : adducteurs et appuis latéraux' })],
    ] },
    puiss_R2: { title: 'Puissance B · Complément', blocks: [
      [S('A1', ['POWER_ROT'], 'power', 1, { pref: ROT2 })],
      [S('B1', ['LEG_UNI'], 'main', 1, { pref: ['pistol_box', 'bulgarian_db', 'step_up_db', 'pistol'], note: 'Charge lourde, remonte le plus vite possible' }), S('B2', ['ROLE2'], 'plyo', 1, { note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('C1', ['POWER_OLY'], 'power', 1, { pref: ['db_snatch', 'kb_swing'] }), S('C2', ['JUMP_H'], 'plyo', 2, { pref: ['broad_jump', 'broad_sl'], note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('D1', ['CORE_ROT'], 'core', 1, { pref: ['landmine_rot', 'rot_band_high', 'chop_ecc'] }), S('D2', ['PULL_H'], 'sec', 2, { pref: ['row_db', 'inverted_row', 'table_row'] })],
      [S('E1', ['PROPRIO'], 'prev', 2, { pref: ['hop_rot', 'hop_balance'] }), S('E2', ['POGO', 'CALF', 'ANKLE'], 'prev', 1, { pref: ['pogo', 'calf_sl', 'toe_yoga'] }), EL('E3', 2)],
      [S('F1', ['PEC_ADD'], 'acc', 2, { pref: ['pec_iso', 'fly_db'] }), S('F2', ['CORE_ANTI', 'CORE_FLEX'], 'core', 3, { pref: ['side_plank', 'hollow', 'pallof'] })],
    ] },
    // séances de compétition et d'affûtage : mêmes paires de contraste, volume réduit (2 séries)
    express: { title: 'Puissance · Entretien', blocks: [
      [S('A1', ['POWER_ROT'], 'power', 1, { pref: ROT })],
      [S('B1', ['LEG_KNEE'], 'main', 1, { pref: ['back_squat', 'squat_db', 'goblet_kb', 'goblet_db'], note: 'Charge lourde, remonte le plus vite possible' }), S('B2', ['JUMP_V'], 'plyo', 1, { pref: ['squat_jump', 'cmj', 'box_jump'], note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('C1', ['PUSH_H'], 'main', 2, { pref: ['bench_bar', 'bench_db', 'floor_press', 'push_up_lest', 'push_up'], note: 'Charge lourde, remonte le plus vite possible' }), S('C2', ['PUSH_PLYO'], 'plyo', 2, { pref: ['push_up_plyo', 'push_up_plyo_knee', 'chest_pass'], note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('D1', ['LEG_LAT'], 'main', 1, { pref: ['lunge_lat_db', 'lunge_lat'], note: 'Charge lourde, remonte le plus vite possible' }), S('D2', ['ROLE'], 'plyo', 1, { note: 'Contraste : enchaîne 20 s après l\'exercice chargé, le plus explosif possible' })],
      [S('E1', ['HAM_ECC'], 'ecc', 1, { pref: ['nordic', 'nordic_assist', 'ham_slide'] }), S('E2', ['ADD'], 'prev', 1, { pref: ['copenhagen_short', 'copenhagen'] }), EL('E3'), S('R1', ['ANKLE', 'CALF', 'POGO'], 'prev', 1, { roles: ['rapproche'], pref: ['pogo', 'calf_sl'], note: 'Rapproché : réactivité de la cheville pour les petits appuis' }), S('R2', ['HAM_ECC', 'LEG_HIP'], 'sec', 1, { roles: ['pointe'], pref: ['sl_rdl_db', 'ham_slide', 'sl_bridge', 'sl_rdl_pdc'], note: 'Pointe : chaîne arrière pour les démarrages' }), S('R3', ['ADD', 'LEG_LAT'], 'prev', 1, { roles: ['ailier'], pref: ['lateral_walk', 'add_squeeze', 'copenhagen_short', 'copenhagen'], note: 'Ailier : adducteurs et appuis latéraux' })],
    ] },
    // rappel de force à la reprise (comme 2023) : peu d'exercices, lourds, 3 × 6, pour laisser de l'énergie au kin-ball
    rf_R1: { title: 'Rappel force A · Essentiel', fam: 'force', pid: 'rappel', blocks: [
      [S('A1', ['POWER_ROT'], 'power', 1, { pref: ROT })],
      [S('B1', ['LEG_KNEE'], 'main', 1, { pref: ['back_squat', 'squat_db', 'goblet_kb', 'goblet_db'], alt: { pats: ['LEG_UNI'], pref: ['pistol_box', 'bulgarian_db', 'pistol', 'bulgarian'] } }), S('B2', ['PUSH_H'], 'main', 1, { pref: ['bench_bar', 'bench_db', 'floor_press', 'push_up_lest', 'push_up'] })],
      [S('C1', ['LEG_LAT'], 'main', 1, { pref: ['lunge_lat_db', 'lunge_lat'] }), S('C2', ['ADD'], 'prev', 1, { pref: ['copenhagen', 'copenhagen_short'] })],
      [S('D1', ['HAM_ECC'], 'ecc', 1, { pref: ['nordic', 'nordic_assist', 'ham_slide'] }), EL('D2'), S('R1', ['ANKLE', 'CALF', 'POGO'], 'prev', 1, { roles: ['rapproche'], pref: ['calf_sl', 'pogo'], note: 'Rapproché : réactivité de la cheville pour les petits appuis' }), S('R2', ['HAM_ECC', 'LEG_HIP'], 'sec', 1, { roles: ['pointe'], pref: ['sl_rdl_db', 'ham_slide', 'sl_bridge', 'sl_rdl_pdc'], note: 'Pointe : chaîne arrière pour les démarrages' }), S('R3', ['ADD', 'LEG_LAT'], 'prev', 1, { roles: ['ailier'], pref: ['lateral_walk', 'add_squeeze', 'copenhagen_short', 'copenhagen'], note: 'Ailier : adducteurs et appuis latéraux' })],
    ] },
    rf_R2: { title: 'Rappel force B · Complément', fam: 'force', pid: 'rappel', blocks: [
      [S('A1', ['PULL_V'], 'main', 1, { pref: ['chin_up', 'pull_up', 'pull_up_band', 'lat_pull_band'] }), S('A2', ['PULL_H'], 'main', 1, { pref: ['row_db', 'row_bar', 'inverted_row'] })],
      [S('B1', ['ARMS'], 'acc', 2, { pref: ['triceps', 'curl', 'triceps_band'] }), S('B2', ['CALF', 'ANKLE'], 'prev', 1, { pref: ['calf_sl', 'peroneal', 'calf_db'] })],
      [S('C1', ['PROPRIO'], 'prev', 2, { pref: ['hop_balance', 'hop_rot', 'balance_reach'] })],
    ] },
    // semaine de compétition : activation courte la veille (ou l'avant-veille) du match, sans fatigue
    activ: { title: 'Activation puissance · Veille de match', fixedP: { s: 2, r: 3, rpe: 7, rest: 60, t: 8 }, noShoulder: true, wuRounds: 1, blocks: [
      [S('A1', ['ROLE_SPD'], 'plyo', 1, { note: 'Vitesse maximale, récupération complète' })],
      [S('B1', ['JUMP_V'], 'plyo', 1, { pref: ['cmj', 'squat_jump'], note: 'Chaque saut au maximum, arrête-toi avant la fatigue' }), S('B2', ['ROLE'], 'plyo', 1)],
      [S('C1', ['POWER_ROT'], 'power', 1, { pref: ['frappe_full_band', 'rot_throw_diag', 'rot_throw', 'frappe_air'], note: '3 frappes explosives de chaque côté' })],
    ] },
    circuit: { title: 'Circuit libre · Poids du corps', circuit: true, blocks: [
      [S('A1', ['LEG_UNI'], 'sec', 1, { pref: ['lunge_rev', 'split_squat'] }), S('A2', ['PUSH_H'], 'sec', 1, { pref: ['push_up'] }), S('A3', ['CORE_ANTI'], 'core', 1, { pref: ['dead_bug', 'bird_dog'] }),
        S('A4', ['LUMBAR'], 'prev', 2, { pref: ['superman', 'bird_dog'] }), S('A5', ['PROPRIO'], 'prev', 2, { pref: ['balance'] }), S('A6', ['SHOULDER_PREV'], 'prev', 2, { pref: ['ytw', 'pull_apart'] })],
    ] },
  };
  // bloc épaule et omoplate (5-6 min, intégré à l'échauffement des séances de renfo)
  const SHOULDER = [['ytw', 6, 'Chaque lettre Y, T puis W'], ['pull_apart', 12, ''], ['ext_rot_90', 10, 'Élastique léger, retour en 2 s'], ['pushup_plus', 10, '']];
  function shoulderBlock(ctx, light, n, ov) {
    // progression toutes les 4 semaines (+2 répétitions par palier, 2 paliers max, repart à la reprise de juin)
    const step = n <= 0 ? 0 : Math.min(2, Math.floor(((n >= 25 ? n - 25 : n - 1)) / 4) % 3);
    const ok = e => e && feasible(e, ctx.eqs) && !e.zones.some(z => ctx.pain.has(z)) && !ctx.bans.has(e.id);
    const items = [];
    SHOULDER.forEach(([id, r, note]) => {
      const sk = 'epaule|' + id;
      let ex = ov && ov[sk] && KP.EX_BY_ID[ov[sk]];
      if (!ok(ex) && id === 'ext_rot_90' && ok(KP.EX_BY_ID.ext_rot_side)) ex = KP.EX_BY_ID.ext_rot_side;
      if (!ok(ex)) ex = KP.EX_BY_ID[id];
      if (!ok(ex)) return;
      const t = ex.load === 'time' ? 30 : undefined;
      items.push({ slot: 'SH-' + id, slotKey: sk, pri: 1, kind: 'prev', ex, p: { s: light ? 1 : 2, r: r + 2 * step, t, rpe: 6, rest: 20 }, note: ex.id === id ? note : '', pats: ['SCAP', 'SHOULDER_PREV'], fixed: true });
    });
    return items.length ? { grp: 'É', shoulder: true, items } : null;
  }

  const ROLE_PATS = { pointe: ['JUMP_H'], ailier: ['JUMP_LAT'], rapproche: ['POGO', 'JUMP_LAT'] };
  const ROLE_PREF = { pointe: ['broad_sl', 'broad_jump', 'hop_sl'], ailier: ['lat_bound', 'skater'], rapproche: ['lat_hops', 'pogo'] };
  const ROLE2_PATS = { pointe: ['JUMP_UNI', 'JUMP_H'], ailier: ['JUMP_UNI', 'JUMP_LAT'], rapproche: ['JUMP_LAT'] };
  const ROLE2_PREF = { pointe: ['hop_sl', 'split_jump'], ailier: ['lat_bound_rot', 'skater', 'split_jump'], rapproche: ['skater', 'lat_hops'] };


  // ---------------- matériel & sélection ----------------
  function eqSetOf(profile, lieu) {
    const s = new Set(KP.ALWAYS);
    const list = lieu === 'salle' ? (profile.eqSalle || KP.GYM_SET) : (profile.eq || []);
    list.forEach(x => s.add(x));
    if (s.has('barre')) s.add('landmine_ok');
    return s;
  }
  function feasible(ex, eqs) { return ex.eq.every(req => req.split('|').some(r => eqs.has(r) || (r === 'landmine' && eqs.has('barre') && eqs.has('landmine')))); }
  function painSet(profile) { return new Set(Object.keys(profile.pain || {})); }

  const FALLBACK = { PULL_V: ['PULL_H'], PUSH_V: ['PUSH_H'], POWER_OLY: ['JUMP_V'], PEC_ADD: ['PUSH_H'], POWER_ROT: ['CORE_ROT', 'POWER_UP'], LEG_HIP: ['HAM_ECC'], POWER_UP: ['PUSH_PLYO', 'JUMP_V'], CORE_ROT: ['CORE_ANTI'], QUAD_ISO: ['QUAD_ECC'], ELBOW_PREV: ['ARMS'], SHOULDER_PREV: ['PULL_H'] };
  function candidates(slot, ctx, extraFilter) {
    let list = candidates0(slot, ctx, extraFilter);
    if (slot.kind === 'main' && slot.pats.includes('LEG_KNEE') && (!list.length || list[0].load === 'pdc')) {
      const hard = candidates0(Object.assign({}, slot, { pats: ['LEG_KNEE', 'LEG_UNI'], pref: ['bulgarian_db', 'pistol_box', 'bulgarian', 'pistol'] }), Object.assign({}, ctx, { lvl: Math.max(2, ctx.lvl) }), extraFilter);
      if (hard.length) list = hard;
    }
    if (!list.length) { const fb = slot.pats.flatMap(p => FALLBACK[p] || []); if (fb.length) list = candidates0(Object.assign({}, slot, { pats: fb, pref: [] }), ctx, extraFilter); }
    return list;
  }
  function candidates0(slot, ctx, extraFilter) {
    let pats = slot.pats, pref = slot.pref || [];
    if (pats[0] === 'ROLE') { pats = ROLE_PATS[ctx.role] || ['JUMP_H']; pref = ROLE_PREF[ctx.role] || []; }
    if (pats[0] === 'ROLE_SPD') { pats = ['SPEED', 'AGILITY']; pref = { pointe: ['sprint_start', 'reaction'], ailier: ['shuffle', 'crossover', 'reaction'], rapproche: ['star', 'reaction', 'ladder'] }[ctx.role] || ['reaction']; }
    if (pats[0] === 'ROLE2') { pats = ROLE2_PATS[ctx.role] || ['JUMP_LAT']; pref = ROLE2_PREF[ctx.role] || []; }
    const tl = ctx.lvl;
    return KP.EXERCISES.filter(e => e.pats.some(p => pats.includes(p)) && feasible(e, ctx.eqs) && !e.zones.some(z => ctx.pain.has(z)) && !ctx.bans.has(e.id) && (!extraFilter || extraFilter(e)))
      .map(e => {
        let sc = 0; const pi = pref.indexOf(e.id);
        sc += pi >= 0 ? pi * 3 : 30;
        const lw = ['prev', 'iso', 'core', 'ecc'].includes(slot.kind) ? 2 : 8;
        sc += Math.abs(e.lvl - tl) * lw + (e.lvl > tl ? lw * 0.75 : 0);
        if (slot.kind === 'main' && (e.load === 'kg' || e.load === 'lest')) sc -= 6;
        if (ctx.role && e.role === ctx.role) sc -= 4;
        return { e, sc };
      }).sort((a, b) => a.sc - b.sc).map(x => x.e);
  }

  // ---------------- charges suggérées ----------------
  const e1rm = (kg, reps, rpe) => kg * (1 + (reps + (10 - (rpe || 8))) / 30);
  function lastPerf(exId, logs) {
    for (let i = logs.length - 1; i >= 0; i--) {
      const x = logs[i].ex && logs[i].ex[exId];
      if (!x || !x.sets) continue;
      const best = x.sets.filter(s => +s.kg > 0 && +s.r > 0).sort((a, b) => e1rm(b.kg, b.r, b.rpe) - e1rm(a.kg, a.r, a.rpe))[0];
      if (best) return Object.assign({ week: logs[i].week }, best);
    }
    return null;
  }
  function stepFor(ex) { return ex.eq.some(r => r.includes('barre')) ? 2.5 : ex.eq.some(r => r.includes('kettlebell')) && !ex.eq.some(r => r.includes('halteres')) ? 4 : 1; }
  function maxFor(ex, profile) {
    const m = profile.max || {};
    if (ex.eq.some(r => r.includes('barre'))) return m.barre || null;
    if (ex.eq.some(r => r.includes('halteres'))) return m.halteres || null;
    if (ex.eq.some(r => r.includes('kettlebell'))) return m.kettlebell || null;
    return null;
  }
  function suggestLoad(ex, pr, profile, logs) {
    if (!(ex.load === 'kg' || ex.load === 'lest')) return null;
    const lp = lastPerf(ex.id, logs || []);
    if (!lp && ex.start) {
      const f = { 1: 0.6, 2: 0.8, 3: 1.2 }[profile.xp || 2] || 0.8, st = stepFor(ex), mx = maxFor(ex, profile);
      let kg = Math.max(st, Math.round(ex.start * f / st) * st); if (ex.eq.some(r => r.split('|').includes('barre')) && !ex.eq.some(r => r.includes('landmine'))) kg = Math.max(20, kg); if (mx && kg > mx) kg = mx;
      return { kg, start: true, txt: `Charge de départ indicative pour ton niveau. Ajuste pour finir à RPE ${String(pr.rpe).replace(".", ",")}.` };
    }
    if (!lp) return { kg: null, txt: `Choisis une charge pour finir chaque série à RPE ${pr.rpe} (≈ ${Math.max(0, Math.round(10 - pr.rpe))} répétition${10 - pr.rpe >= 2 ? 's' : ''} en réserve).` };
    const reps = typeof pr.r === 'number' ? pr.r : 8;
    let kg = e1rm(+lp.kg, +lp.r, +lp.rpe || 8) / (1 + (reps + (10 - pr.rpe)) / 30);
    const st = stepFor(ex); kg = Math.round(kg / st) * st;
    const mx = maxFor(ex, profile);
    if (mx && kg > mx) return { kg: mx, capped: true, txt: `Charge max de ton matériel (${mx} kg) : ajoute 2 répétitions ou descends en 3 secondes.` };
    return { kg, txt: `Basé sur ta dernière série : ${lp.kg} kg × ${lp.r} à RPE ${lp.rpe || '?'}.` };
  }

  // ---------------- durée estimée ----------------
  function itemWork(it) { const x = it.ex, p = it.p; const w = x.load === 'time' ? (p.t || 30) : (typeof p.r === 'number' ? p.r : 8) * (x.load === 'plyo' ? 2.5 : 3.5); return w * (x.uni || x.side ? 2 : 1); }
  function blockSec(items, circuit) {
    if (!items.length) return 0;
    if (circuit) return items.reduce((a, it) => a + (it.p.t || 40) + 20, 0) * Math.max(...items.map(i => i.p.s));
    const rounds = Math.max(...items.map(i => i.p.s));
    return items.reduce((a, it) => a + it.p.s * itemWork(it), 0) + rounds * Math.max(...items.map(i => i.p.rest)) * (items.length > 1 ? 0.8 : 1) + items.length * 20;
  }
  function estMinutes(sess) { const s = sess.blocks.reduce((a, b) => a + blockSec(b.items, sess.circuit), 0) + (sess.warmup ? (sess.warmup.rounds || 2) * 4 * 60 : 0) + 60; return Math.max(15, Math.round(s / 300) * 5); }

  // ---------------- échauffement ----------------
  const BAL = ['yeux ouverts', 'en tournant la tête', 'yeux fermés', 'petits sauts avec 1/4 de tour', 'petits sauts avec 1/2 tour'];
  function warmup(ctx, fam, key, k) {
    const last = fam === 'puiss' || fam === 'pic' ? 'high_knees' : key === 'R2' ? 'side_plank' : 'plank';
    const ids = [ctx.eqs.has('corde') ? 'jump_rope' : 'jumping_jack', 'wall_sit', 'worlds_greatest', ctx.eqs.has('plateau') ? 'balance_pad' : 'balance', last];
    const bal = BAL[Math.min(BAL.length - 1, Math.floor((k || 0) / 2) + (fam === 'puiss' || fam === 'pic' ? 2 : 0))];
    return { format: `2 tours de 40 s d'effort / 20 s de repos (équilibre : 20 s par jambe, ${bal})`, items: ids.map(id => KP.EX_BY_ID[id]) };
  }

  // ---------------- construction d'une séance de renfo ----------------
  function buildRenfo(tplKey, key, n, profile, opts) {
    const { phase, wtype, k } = C.phaseOf(n);
    const tpl = T[tplKey];
    const lieu = (opts && opts.lieu) || profile.lieu || 'maison';
    const ctx = { eqs: eqSetOf(profile, lieu), pain: painSet(profile), bans: new Set((profile.bans && profile.bans[lieu]) || []), lvl: profile.xp || 2, role: profile.role || 'pointe' };
    const used = new Set();
    const ov = profile.overrides || {};
    const blocks = [];
    tpl.blocks.forEach((bl, bi) => {
      const items = [];
      bl.forEach(slot => {
        // semaine de la World Cup : pas d'excentrique des ischios (courbatures 2-3 jours)
        if (phase.id === 'affutage' && wtype === 'comp' && slot.pats.includes('HAM_ECC')) return;
        if (slot.roles && !slot.roles.includes(ctx.role)) return;
        const sk = `${phase.id}|${key}|${slot.id}`;
        if (slot.alt && Math.abs(n) % 2 === 1) slot = Object.assign({}, slot, slot.alt);
        if (phase.fam === 'puiss' && slot.pats.includes('ELBOW_PREV')) slot = Object.assign({}, slot, { pref: ['curl_iso', 'elbow_iso', 'wrist_ecc'] });
        let ex = null;
        if (ov[sk] && KP.EX_BY_ID[ov[sk]]) { const o = KP.EX_BY_ID[ov[sk]]; if (feasible(o, ctx.eqs) && !o.zones.some(z => ctx.pain.has(z))) ex = o; }
        const avoid = (opts && opts.avoid) || new Set();
        if (!ex) { const own = e => e.pats.some(x => slot.pats.includes(x)) || ['ROLE', 'ROLE2'].includes(slot.pats[0]); ex = candidates(slot, ctx, e => !used.has(e.id) && !avoid.has(e.id) && own(e))[0] || candidates(slot, ctx, e => !used.has(e.id))[0]; }
        if (!ex) return;
        used.add(ex.id);
        const p = Object.assign({}, presc(tpl.circuit ? 'trans' : tpl.fam || phase.fam, slot.kind, k, wtype, tpl.pid || phase.id));
        if (tpl.circuit) { p.s = 3; p.t = 40; p.rest = 20; }
        if (tpl.fixedP) Object.assign(p, tpl.fixedP);
        let note = slot.note || '';
        if (ex.load === 'time' && !p.t) p.t = slot.kind === 'plyo' ? 10 : slot.kind === 'ecc' ? 20 : 30;
        if (ex.load !== 'time' && slot.kind === 'iso') p.r = 6;
        if ((ex.load === 'pdc' || ex.load === 'band') && ['main', 'sec'].includes(slot.kind) && typeof p.r === 'number' && p.r < (ex.load === 'band' ? 8 : 6)) {
          p.r = ex.load === 'band' ? 8 : 6; note = (note ? note + ' · ' : '') + 'Descente en 3 s, montée explosive';
        }
        if (ex.load === 'plyo' && typeof p.r === 'number' && p.r > 6) p.r = 5;
        if (ex.burst) { p.t = 15; note = (note ? note + ' · ' : '') + 'Par série : 3 contractions de 5 s, de 60 à 95 % de ton effort max'; }
        if (ex.side) note = (note ? note + ' · ' : '') + 'Même volume des deux côtés : alterne le côté de départ à chaque série';
        if (['chin_up', 'pull_up'].includes(ex.id) && ['force', 'puiss'].includes(phase.fam) && !['deload', 'taper', 'comp'].includes(wtype)) {
          const tot = Math.min(25, 18 + 2 * k); // 2023 : de 18 à 25 au total, puis lesté
          note = (note ? note + ' · ' : '') + `Objectif ${tot} tractions au total : fais le maximum à chaque série. Au-delà de 25, passe aux tractions lestées (3 × 5).`;
        }
        items.push({ slot: slot.id, slotKey: sk, pri: slot.pri, kind: slot.kind, ex, p, note, pats: slot.pats });
      });
      if (items.length) blocks.push({ grp: String.fromCharCode(65 + blocks.length), items });
    });
    if (!tpl.circuit && !tpl.noShoulder && (KP.CONFIG || {}).shoulderBlock !== false) { const sb = shoulderBlock(ctx, ['deload', 'taper', 'comp', 'recup'].includes(wtype), n, ov); if (sb) blocks.unshift(sb); }
    const wu = warmup(ctx, tpl.fam || phase.fam, key, k);
    if (tpl.wuRounds) Object.assign(wu, { rounds: tpl.wuRounds, format: wu.format.replace('2 tours', '1 tour') });
    return { key, kind: 'renfo', title: tpl.title, circuit: !!tpl.circuit, activ: tplKey === 'activ', lieu, blocks, warmup: wu };
  }

  // ---------------- cardio ----------------
  const pace = v => { if (!v) return ''; const m = 60 / v; const mm = Math.floor(m), ss = Math.round((m - mm) * 60); return `${mm}'${String(ss === 60 ? 0 : ss).padStart(2, '0')}/km`; };
  const dist = (vma, pct, sec) => vma ? Math.round(vma * pct / 3.6 * sec / 5) * 5 : null;
  function EF(min, vma, extra) {
    const v1 = vma ? vma * 0.65 : null, v2 = vma ? vma * 0.75 : null;
    return { label: `Endurance fondamentale ${min}'`, type: 'ef', min, detail: vma ? `Allure ${pace(v2)} à ${pace(v1)} (65-75 % VMA), FC 70-80 % FCmax. Tu dois pouvoir parler.` : 'Allure où tu peux parler en phrases complètes (RPE 3-4/10), FC 70-80 % FCmax.', extra };
  }
  function INT0(sets, reps, on, off, pct, vma) {
    const d = dist(vma, pct, on);
    return { label: `Intermittent ${on}-${off} : ${sets} × ${reps}`, type: 'int', sets, reps, on, off, min: Math.round(sets * reps * (on + off) / 60 + (sets - 1) * 3),
      detail: `${reps} × (${on} s vite / ${off} s repos sur place) par bloc, 3' de récupération entre les blocs. ` + (d ? `Cible : ${d} m en ${on} s (${Math.round(pct * 100)} % de ta VMA de ${vma} km/h).` : `Intensité RPE 8-9/10, régulière d'une répétition à l'autre.`) };
  }
  function SPR(n, m, pct, note) { return { label: `${n} × ${m} m à ${Math.round(pct * 100)} %`, type: 'spr', min: Math.round(n * 1.2), detail: `${note || 'Récupération complète en marchant (environ 1\' 30).'} ${pct >= 1 ? 'Vitesse maximale.' : 'Vite mais relâché.'}` }; }
  function RSA(sets, reps, m) { return { label: `Sprints répétés : ${sets} × ${reps} × ${m} m`, type: 'rsa', min: sets * 4, detail: `Un sprint de ${m} m toutes les 20 s, ${reps} par série, 3' de récupération entre les séries. Cherche à garder le même temps.` }; }
  const ROLE_DRILLS = {
    pointe: [['sprint_start', 'Départs 5 m depuis la position de jeu', '6 répétitions, récupération 45 s'], ['dive', 'Sprint 8 m + glissade sur sol souple', '4 répétitions'], ['reaction', 'Sprint 10 m réactif au signal de l\'appli', '4 répétitions']],
    ailier: [['shuffle', 'Pas chassés 2 m → sprint 5 m', '3 par côté'], ['crossover', 'Pas croisé → sprint 5 m', '3 par côté'], ['backpedal', 'Course arrière 3 m → demi-tour → sprint 5 m', '4 répétitions']],
    rapproche: [['star', 'Étoile 4 plots à 2 m, 8 s d\'effort', '6 répétitions, 40 s de repos'], ['ladder', 'Petits pas rapides (échelle ou sur place), 6 s', '6 répétitions'], ['reaction', 'Réaction 4 directions au signal de l\'appli, 5 s', '6 répétitions']],
  };
  function ROLE(role, scale) {
    const d = ROLE_DRILLS[role] || ROLE_DRILLS.pointe;
    return { label: `Vitesse spécifique · ${(KP.ROLES.find(r => r.id === role) || {}).label || ''}`, type: 'role', min: Math.round(12 * (scale || 1)), drills: d.map(([id, t, v]) => ({ ex: KP.EX_BY_ID[id], t, v: scale && scale < 1 ? v.replace(/(\d+)/, m => Math.max(2, Math.round(m * scale))) : v })) };
  }
  // échauffement et retour au calme des séances intenses (affichés comme des blocs à part entière)
  const WU = short => ({ label: short ? 'Gammes avant les sprints 4\'' : 'Échauffement 15\'', type: 'wu', min: short ? 4 : 15, drills: [
    ...(short ? [] : [['run', 'Footing lent', '10 min, très facile']]), ['high_knees', 'Montées de genoux', '2 × 15 m'], ['butt_kicks', 'Talons-fesses', '2 × 15 m'],
    ['shuffle', 'Pas chassés', '15 m de chaque côté'], ['crossover', 'Pas croisés', '15 m de chaque côté'], ['sprint_start', 'Accélérations progressives', '3 × 20 m, jusqu\'à 90 %, retour en marchant']].map(([id, t, v]) => ({ ex: KP.EX_BY_ID[id], t, v })).filter(d => d.ex) });
  const CD = () => ({ label: 'Retour au calme 10\'', type: 'cd', min: 10, drills: [
    ['run', 'Footing très lent ou marche', '8 min'], ['leg_swing', 'Mobilité hanches', '10 balancés par jambe, avant-arrière et côté'], ['calf', 'Étirement mollets contre un mur', '30 s par jambe']].map(([id, t, v]) => ({ ex: KP.EX_BY_ID[id], t, v })).filter(d => d.ex) });
  const INTENSE = ['int', 'spr', 'rsa', 'role'];
  const DEB = (n, m) => ({ label: `${n} déboulés de ${m} m`, type: 'deb', min: 3, detail: 'Au milieu de la sortie : accélération progressive jusqu\'à 80 %, puis reprise du footing.' });

  const cardioMin = blocks => blocks.reduce((a, b) => a + (b.min || 0), 0) + (blocks.some(b => b.type === 'wu') ? 0 : 3);
  function cardioSessions(n, profile) {
    const { phase, wtype, wi, k } = C.phaseOf(n);
    const vma = +profile.vma || null, role = profile.role || 'pointe';
    const adj = Math.max(0, Math.min(0.1, +profile.intAdj || 0));
    const INT = (sets, reps, on, off, pct, v) => INT0(sets, reps, on, off, pct + adj, v);
    const out = [];
    const mk = (key, title, essential, blocks, o) => {
      if (blocks.some(b => INTENSE.includes(b.type))) {
        const ef = blocks[0] && blocks[0].type === 'ef'; // l'endurance fait office d'échauffement : gammes courtes avant la partie intense
        blocks = ef ? [blocks[0], WU(true), ...blocks.slice(1), CD()] : [WU(), ...blocks, CD()];
      }
      else if (blocks[0] && blocks[0].type === 'ef') blocks = [Object.assign({}, blocks[0], { detail: 'Démarre les 5 premières minutes plus lentement, termine par 2-3 min de marche. ' + blocks[0].detail }), ...blocks.slice(1)];
      out.push(Object.assign({ key, kind: 'cardio', title, essential, blocks, min: cardioMin(blocks) }, o || {}));
    };
    const fam = phase.id;
    if (phase.fam === 'ppg') {
      const i1 = fam === 'ppg2' ? wi + 1 : fam === 'beta_ppg' ? 1 : wi, i2 = fam === 'ppg2' ? wi + 2 : fam === 'beta_ppg' ? 1 : wi;
      const C1 = [[EF(30, vma), DEB(4, 20)], [INT(2, 6, 30, 30, 1.0, vma)], [INT(2, 8, 30, 30, 1.0, vma)], [EF(30, vma)]][i1] || [INT(2, 8, 30, 30, 1, vma)];
      const C2 = [[EF(35, vma)], [EF(40, vma), DEB(6, 30)], [EF(45, vma)], [EF(35, vma), DEB(6, 20)]][i2] || [EF(40, vma)];
      mk('C1', C1[0].type === 'int' ? 'Cardio · Intermittent' : 'Cardio · Endurance', true, C1);
      mk('C2', 'Cardio · Endurance', false, C2);
    } else if (phase.fam === 'force') {
      if (wtype === 'deload') { mk('C1', 'Cardio · Endurance légère', true, [EF(30, vma)]); }
      else {
        const prog = [INT(3, 6, 30, 30, 1.05, vma), INT(3, 7, 30, 30, 1.05, vma), INT(3, 8, 30, 30, 1.05, vma), INT(2, 10, 15, 15, 1.1, vma), INT(2, 12, 15, 15, 1.1, vma), INT(3, 10, 15, 15, 1.1, vma), INT(3, 12, 15, 15, 1.1, vma)];
        mk('C1', 'Cardio · Intermittent', true, [prog[Math.min(k, prog.length - 1)]]);
        mk('C2', 'Cardio · Endurance + sprints', fam === 'force2' ? 'conseillee' : false, [EF([40, 45, 45, 40, 45, 50, 55][Math.min(k, 6)], vma), k < 3 ? SPR(6, 20, 0.9) : SPR(8, 10, 1.0)]);
        if (fam === 'force2') mk('C3', 'Vitesse spécifique', false, [ROLE(role, 1)]);
      }
    } else if (phase.fam === 'puiss') {
      if (wtype === 'deload') { mk('C1', 'Vitesse spécifique légère', true, [ROLE(role, 0.6), EF(20, vma)]); }
      else {
        mk('C1', 'Vitesse · Sprints répétés + rôle', true, [ROLE(role, 1), RSA(k >= 2 ? 3 : 2, 6, 20)]);
        mk('C2', 'Cardio · Intermittent court', false, [k % 2 ? INT(2, 10, 10, 20, 1.2, vma) : INT(2, 10, 15, 15, 1.1, vma)]);
      }
    } else if (phase.fam === 'pic') {
      if (wtype === 'up') { mk('C1', 'Vitesse · Sprints répétés + rôle', true, [ROLE(role, 1), RSA(wi === 0 ? 3 : 2, 5, 20)]); mk('C2', 'Récupération active', false, [EF(25, vma)]); }
      else if (wtype === 'taper') { mk('C1', 'Vitesse · Affûtage', true, [ROLE(role, 0.7), RSA(2, 4, 20)]); mk('C2', 'Récupération active', false, [EF(25, vma)]); }
      else if (wtype === 'comp') { mk('C1', 'Activation vitesse', false, [ROLE(role, 0.5), SPR(4, 10, 0.95, 'À faire 2 jours avant le match, pas la veille.')]); }
      else if (wtype === 'maint') { mk('C1', 'Cardio · Entretien', true, [INT(2, 8, 15, 15, 1.1, vma), ROLE(role, 0.6)]); }
      else { mk('C1', 'Récupération active', true, [{ label: 'Activité douce 30\'', type: 'free', min: 30, detail: 'Vélo, natation ou footing très lent. Le but est de récupérer de la Challenge Cup.' }]); }
    } else if (phase.id === 'transition') {
      mk('C1', 'Sport libre', false, [{ label: 'Activité plaisir 45\'', type: 'free', min: 45, detail: 'Squash, vélo, natation, randonnée, foot entre amis… ce qui te fait envie.' }]);
      mk('C2', 'Sport libre', false, [{ label: 'Activité plaisir 45\'', type: 'free', min: 45, detail: 'Garde une activité, sans contrainte d\'intensité.' }]);
    }
    return out;
  }

  // ---------------- tests ----------------
  const TESTS = [
    { id: 'vma', label: 'Demi-Cooper (6 minutes)', unit: 'm', detail: 'Après 15 min d\'échauffement, cours la plus grande distance possible en 6 minutes sur un parcours mesuré. VMA (km/h) = distance / 100.', anim: 'run' },
    { id: 'broad', label: 'Saut en longueur sans élan', unit: 'cm', detail: 'Meilleur de 3 essais, pieds joints, réception stabilisée.', anim: 'broad_jump' },
    { id: 'pull', label: 'Tractions max (ou pompes max)', unit: 'rép.', detail: 'Mouvement complet, sans balancer. Sans barre : pompes en 1 minute.', anim: 'pull_up' },
    { id: 'sprint10', label: 'Sprint 10 m (si chrono possible)', unit: 's', detail: 'Départ arrêté, meilleur de 3 essais. Facultatif.', anim: 'sprint_start' },
  ];
  function testSession(n) { return (n === -3 || n === 1 || n === 25 || n === 40) ? { key: 'T', kind: 'test', title: n === -3 ? 'Tests (bêta)' : n === 1 ? 'Tests de départ' : 'Retests', essential: false, tests: TESTS, min: 40 } : null; }

  // ---------------- charge de la semaine & mode ----------------
  function weekLoad(n, profile, checkin) {
    const ev = C.eventsOfWeek(n, profile);
    const ci = checkin || {};
    let score = 0; const why = [];
    ev.forEach(e => { const w = C.EVENT_WEIGHT[e.type] || 0; if (w) { score += w; why.push(e.label); } });
    const club = ci.club != null ? +ci.club : (C.clubActive(n) ? (profile.clubN != null ? +profile.clubN : 2) : 0);
    score += club; if (club) why.push(`${club} entraînement${club > 1 ? 's' : ''} club`);
    (ci.extra || []).forEach(x => { score += +x.w || 1; why.push(x.label); });
    const vie = +ci.vie || 0; score += vie; if (vie) why.push(vie === 1 ? 'semaine chargée' : 'semaine très chargée');
    const fat = +ci.fatigue || 3; if (fat > 3) { score += (fat - 3) * 1.5; why.push('fatigue élevée'); }
    if (profile.strain && profile.strain[n]) { score += 1; why.push('séances très dures la semaine passée'); }
    const sleep = +ci.sommeil || 3; if (sleep < 3) { score += 1; why.push('sommeil insuffisant'); }
    let mode = score <= 5 ? 'normal' : score <= 7 ? 'allege' : score <= 9 ? 'minimal' : 'repos';
    if (ci.mode && ci.mode !== 'auto') mode = ci.mode;
    return { score, mode, why, events: ev, club };
  }
  const MODES = {
    normal: { label: 'Normale', desc: 'Programme complet.' },
    allege: { label: 'Allégée', desc: 'Exercices principaux et fractionné gardés en entier ; une série de moins sur les accessoires, séances facultatives retirées.' },
    minimal: { label: 'Minimale', desc: 'Uniquement l\'essentiel : renfo express et un cardio court.' },
    repos: { label: 'Récupération', desc: 'Mobilité et récupération active seulement.' },
  };

  function applyMode(sess, mode, maxMin, wtype) {
    const light = ['deload', 'taper', 'comp', 'light', 'recup'].includes(wtype);
    if (sess.kind === 'renfo') {
      const drop = mode === 'minimal' ? 2 : mode === 'allege' ? 3 : 99;
      sess.blocks = sess.blocks.map(b => ({ grp: b.grp, shoulder: b.shoulder, items: b.items.filter(i => i.pri < drop).map(i => !i.fixed && ((mode === 'allege' && !light && i.pri > 1) || mode === 'minimal') ? Object.assign({}, i, { p: Object.assign({}, i.p, { s: Math.max(Math.min(2, i.p.s), i.p.s - 1) }) }) : i) })).filter(b => b.items.length);
      sess.min = estMinutes(sess);
      let guard = 0;
      const dropPri = pr => { sess.blocks = sess.blocks.map(b => ({ grp: b.grp, shoulder: b.shoulder, items: b.items.filter(i => i.pri < pr) })).filter(b => b.items.length); };
      const cutSets = (min, keepMain) => sess.blocks.forEach(b => b.items.forEach(i => { if (!i.fixed && !(keepMain && i.kind === 'main' && i.pri === 1) && i.p.s > min) i.p = Object.assign({}, i.p, { s: i.p.s - 1 }); }));
      // séances courtes (30-45 min) : on garde l'essentiel (frappe, jambes, appuis latéraux, Nordic, adducteurs, coude)
      const MUST = ['POWER_ROT', 'LEG_KNEE', 'LEG_UNI', 'LEG_LAT', 'HAM_ECC', 'ADD', 'ELBOW_PREV', 'ROLE', 'ROLE2'];
      const shoulder = (sets, keep) => sess.blocks.forEach(b => { if (b.shoulder) b.items = b.items.slice(0, keep).map(i => Object.assign({}, i, { p: Object.assign({}, i.p, { s: Math.min(sets, i.p.s) }) })); });
      const shortRest = () => sess.blocks.forEach(b => b.items.forEach(i => { if (!i.fixed) i.p = Object.assign({}, i.p, { rest: Math.max(30, Math.round(i.p.rest * 0.6 / 15) * 15) }); }));
      const dropNonMust = () => { sess.blocks = sess.blocks.map(b => Object.assign({}, b, { items: b.items.filter(i => i.fixed || (i.pats || []).some(x => MUST.includes(x))) })).filter(b => b.items.length); };
      const steps = [() => dropPri(3), () => cutSets(3, true), () => cutSets(3), () => dropPri(2), () => cutSets(2), () => shoulder(1, 4), () => { if (sess.warmup) sess.warmup = Object.assign({}, sess.warmup, { rounds: 1, format: '1 tour de 40 s d\'effort / 20 s de repos (équilibre : 20 s par jambe)' }); }, shortRest, dropNonMust, () => shoulder(1, 2)];
      while (maxMin && sess.min > maxMin && guard < steps.length) { steps[guard++](); sess.min = estMinutes(sess); }
      let gi = 0; sess.blocks.forEach(b => { if (!b.shoulder) b.grp = String.fromCharCode(65 + gi++); });
    } else if (sess.kind === 'cardio' && (mode === 'allege' || mode === 'minimal')) {
      // on garde toujours au moins 2 blocs d'intermittent : la qualité du travail compte plus que les minutes gagnées
      const efK = mode === 'minimal' ? 0.7 : 0.85;
      sess.blocks = sess.blocks.map(b => {
        if (b.type === 'int') {
          const sets = b.sets > 2 ? b.sets - 1 : b.sets, reps = mode === 'minimal' && b.sets <= 2 ? Math.max(5, b.reps - 2) : b.reps;
          if (sets === b.sets && reps === b.reps) return b;
          return Object.assign({}, b, { sets, reps, label: b.label.replace(/: \d+ × \d+/, `: ${sets} × ${reps}`), detail: b.detail.replace(/^\d+ ×/, `${reps} ×`), min: Math.round(sets * reps * (b.on + b.off) / 60 + (sets - 1) * 3) });
        }
        if (b.type === 'ef') { const m = Math.max(20, Math.round(b.min * efK)); return Object.assign({}, b, { label: b.label.replace(/\d+'/, m + "'"), min: m }); }
        return b;
      });
      sess.min = cardioMin(sess.blocks);
    }
    return sess;
  }

  // ---------------- placement des jours ----------------
  function placeDays(sessions, n, profile, load) {
    const avail = profile.days && profile.days.length ? profile.days : [0, 1, 2, 3, 4, 5, 6];
    const clubDays = C.clubActive(n) ? (profile.clubDays || [1, 3]) : [];
    const evDays = load.events.filter(e => C.EVENT_WEIGHT[e.type]).flatMap(e => Array.from({ length: e.days }, (_, i) => e.dow + i)).filter(d => d < 7);
    const taken = {};
    sessions.forEach(s => {
      let best = null, bs = -1e9;
      for (const d of avail) {
        let sc = 0;
        if (evDays.includes(d)) sc -= 100;
        if (s.activ) { if (evDays.includes(d + 1)) sc += 30; else if (evDays.includes(d + 2)) sc += 20; }
        else if (evDays.includes(d + 1)) sc -= s.kind === 'renfo' || (s.blocks && s.blocks.some(b => ['int', 'rsa', 'spr'].includes(b.type))) ? 12 : 3;
        if (evDays.includes(d + 2) && s.kind === 'renfo' && !s.activ) sc -= 5;
        if (evDays.includes(d - 1)) sc -= 4;
        if (clubDays.includes(d)) sc -= 6;
        if (taken[d]) sc -= 20;
        if (taken[d - 1] === s.kind || taken[d + 1] === s.kind) sc -= 4;
        if (taken[d - 1] || taken[d + 1]) sc -= 1;
        if (s.kind === 'renfo' && s.key === 'R1' && !s.activ) sc -= Math.abs(d - 2) * 1.5; // séance A vers le mercredi
        else sc -= d * 0.1;
        if (sc > bs) { bs = sc; best = d; }
      }
      if (best != null) { taken[best] = s.kind; s.day = best; }
    });
    return sessions;
  }

  // ---------------- semaine complète ----------------
  function buildWeek(n, profile, checkin, opts) {
    const ph = C.phaseOf(n);
    const load = weekLoad(n, profile, checkin);
    const sess = [];
    const pid = ph.phase.id, w = ph.wtype;
    const tplFor = () => {
      if (ph.phase.fam === 'ppg') return [['ppg_R1', true], ['ppg_R2', false]];
      if (ph.phase.fam === 'force') return w === 'deload' ? [['force_R1', true]] : [['force_R1', true], ['force_R2', pid === 'force2' ? 'conseillee' : false]];
      if (ph.phase.fam === 'puiss') return pid === 'specifique' ? (ph.wi < 2 ? [['rf_R1', true], ['rf_R2', false]] : [['puiss_R1', true], ['puiss_R2', false]]) : w === 'deload' ? [['puiss_R1', true]] : [['puiss_R1', true], ['puiss_R2', false]];
      if (ph.phase.fam === 'pic') return w === 'recup' ? [['circuit', false]] : w === 'up' ? [['express', true], ['puiss_R2', false]] : (w === 'comp' ? [['express', 'conseillee'], ['activ', true]] : load.events.some(e => ['COMP', 'PO'].includes(e.type)) ? [['express', true], ['activ', true]] : [['express', true]]);
      return [['circuit', false]];
    };
    const lieux = (opts && opts.lieux) || {};
    const usedWeek = new Set(); // la séance B évite les exercices déjà dans A (sauf coude)
    tplFor().forEach(([tk, ess], i) => {
      const key = 'R' + (i + 1);
      const s = buildRenfo(tk, key, n, profile, { lieu: lieux[key], avoid: usedWeek });
      s.essential = ess; sess.push(s);
      s.blocks.forEach(b => { if (!b.shoulder) b.items.forEach(it => { if (!(it.pats || []).includes('ELBOW_PREV')) usedWeek.add(it.ex.id); }); });
    });
    cardioSessions(n, profile).forEach(c => sess.push(c));
    const t = testSession(n); if (t) sess.push(t);
    let mode = load.mode;
    if (ph.phase.fam === 'pic' && w === 'comp' && mode === 'normal') mode = 'normal';
    let list = sess;
    if (mode === 'allege') list = sess.filter(s => s.essential === true || s.essential === 'conseillee');
    if (mode === 'minimal') list = sess.filter(s => s.essential === true).map(s => s.kind === 'renfo' ? s : s);
    if (mode === 'repos') list = [{ key: 'M', kind: 'mobilite', title: 'Mobilité et récupération', essential: true, min: 20, items: ['worlds_greatest', 'leg_swing', 'arm_circles', 'inchworm', 'bird_dog', 'dead_bug'].map(id => KP.EX_BY_ID[id]) }];
    list.forEach(s => {
      if (s.kind === 'renfo') applyMode(s, mode, +profile.maxMin || 60, ph.wtype);
      if (s.kind === 'cardio') applyMode(s, mode);
    });
    placeDays(list.filter(s => s.essential === true || s.essential === 'conseillee'), n, profile, load);
    placeDays(list.filter(s => !(s.essential === true || s.essential === 'conseillee')), n, Object.assign({}, profile, { days: (profile.days || [0, 1, 2, 3, 4, 5, 6]).filter(d => !list.some(x => x.day === d)) }), load);
    return { n, ph, load, mode, sessions: list, hidden: sess.filter(s => !list.includes(s)) };
  }

  // ---------------- remplacements ----------------
  function alternatives(item, n, sessKey, profile, reason, zone) {
    const { phase } = C.phaseOf(n);
    const lieu = profile.lieu || 'maison';
    const pain = painSet(profile); if (zone) pain.add(zone);
    const bans = new Set((profile.bans && profile.bans[lieu]) || []); bans.add(item.ex.id);
    const ctx = { eqs: eqSetOf(profile, lieu), pain, bans, lvl: reason === 'trop_dur' ? Math.max(1, item.ex.lvl - 1) : reason === 'trop_facile' ? Math.min(3, item.ex.lvl + 1) : (profile.xp || 2), role: profile.role };
    const slot = { pats: item.pats, kind: item.kind, pref: [] };
    let f = null;
    if (reason === 'trop_dur') f = e => e.lvl <= item.ex.lvl;
    if (reason === 'trop_facile') f = e => e.lvl >= item.ex.lvl;
    return candidates(slot, ctx, f).slice(0, 4);
  }

  KP.gen = { itemWork, buildWeek, buildRenfo, cardioSessions, alternatives, suggestLoad, weekLoad, MODES, eqSetOf, feasible, estMinutes, presc, TESTS, pace, e1rm, lastPerf, ROLE_DRILLS };
})(window.KP = window.KP || {});
