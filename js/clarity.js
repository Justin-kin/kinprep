/* KinPrep — consignes clarifiées (« Comment faire »), rythme d'exécution et progressions au poids du corps.
   Chargé après exercises.js et attention.js : remplace les consignes ambiguës. */
(function (KP) {
  const CUES = {
    squat_band: ['Élastique sous les pieds, extrémités tenues aux épaules', 'Descends en contrôle', 'Monte jusqu\'à l\'extension complète'],
    lateral_walk: ['Mini-bande autour des chevilles (ou des genoux)', 'En demi-squat : 5 pas vers la gauche, puis 5 vers la droite, deux fois', 'Pieds parallèles, l\'élastique reste tendu entre les pieds'],
    nordic: ['À genoux, pieds bloqués (sous un canapé ou tenus par un partenaire)', 'Corps gainé de la tête aux genoux', 'Descends le plus lentement possible, rattrape-toi avec les mains, remonte en t\'aidant des mains'],
    nordic_assist: ['Élastique accroché en hauteur devant toi, l\'autre bout tenu contre la poitrine', 'Pieds bloqués, corps gainé des genoux à la tête', 'Descends lentement, l\'élastique t\'aide en fin de course'],
    ham_slide: ['En pont fessier, talons posés sur les disques', 'Allonge les jambes en gardant le bassin haut', 'Ramène les talons vers les fesses'],
    ham_swiss: ['Allongé sur le dos, talons sur le ballon, bassin haut', 'Ramène le ballon vers les fesses avec les talons', 'Repousse le ballon lentement, bassin toujours haut'],
    copenhagen: ['En gainage latéral sur l\'avant-bras, cheville de la jambe du dessus posée sur le banc', 'Soulève le bassin : corps aligné de la cheville à la tête', 'Tiens la position, la jambe du dessous reste libre'],
    copenhagen_short: ['En gainage latéral sur l\'avant-bras, genou de la jambe du dessus posé sur le banc ou la chaise', 'Soulève le bassin : corps aligné du genou à la tête', 'Tiens la position, la jambe du dessous reste libre'],
    push_up_incline: ['Mains sur le bord du banc', 'Corps gainé', 'Descends la poitrine jusqu\'au bord du banc'],
    floor_press: ['Allongé au sol, genoux fléchis, un haltère dans chaque main', 'Descends jusqu\'à poser les coudes au sol', 'Pousse sans rebond'],
    push_band: ['Élastique passé dans le dos, extrémités tenues sous les mains', 'Pompe complète', 'Contrôle la descente'],
    ohp_band: ['Élastique sous les pieds, extrémités tenues aux épaules', 'Pousse les mains au-dessus de la tête', 'Contrôle le retour'],
    pull_up_band: ['Élastique accroché à la barre, sous un genou ou un pied', 'Tire jusqu\'au menton au-dessus de la barre', 'Prends un élastique moins fort au fil des semaines'],
    pull_up_neg: ['Monte sur une chaise pour avoir le menton au-dessus de la barre', 'Descends le plus lentement possible jusqu\'aux bras tendus', 'Remonte avec la chaise, sans tirer'],
    lat_pull_band: ['Élastique accroché en hauteur, une extrémité dans chaque main', 'Tire les coudes vers les côtes', 'Reviens bras tendus en contrôle'],
    pec_iso: ['Ballon (ou coussin) entre les paumes, à hauteur de poitrine', 'Écrase-le de toutes tes forces 5 s', 'Relâche, recommence'],
    ext_rot: ['Élastique accroché sur le côté, tenu dans la main la plus éloignée', 'Coude collé au corps, à 90° (serviette roulée dessous)', 'Ouvre l\'avant-bras vers l\'extérieur, puis reviens'],
    ext_rot_ecc: ['Élastique accroché sur le côté, tenu dans la main la plus éloignée', 'Coude collé au corps, à 90°', 'Ouvre l\'avant-bras vite, reviens en freinant'],
    ext_rot_90: ['Élastique accroché devant toi, tenu dans une main', 'Bras à l\'horizontale sur le côté, coude plié à 90°, main vers l\'avant', 'Bascule l\'avant-bras vers le haut, puis reviens'],
    face_pull: ['Élastique accroché à hauteur du visage, une extrémité dans chaque main', 'Tire les mains vers le front, coudes hauts', 'Termine pouces vers l\'arrière, puis reviens'],
    pull_apart: ['Élastique tenu à deux mains, bras tendus devant toi à hauteur d\'épaules', 'Écarte les bras jusqu\'à ce que l\'élastique touche la poitrine', 'Reviens bras tendus'],
    ytw: ['Allongé sur le ventre, front posé au sol, bras tendus', 'Par série : 6 Y (bras en diagonale au-dessus de la tête), 6 T (bras sur les côtés), 6 W (coudes pliés ramenés vers les côtes, mains à hauteur des épaules)', 'Pouces vers le plafond, tiens 2 s en haut à chaque répétition'],
    triceps_band: ['Élastique accroché en hauteur devant toi', 'Coudes fixes au corps', 'Tends complètement les bras vers le bas'],
    dead_bug: ['Allongé sur le dos, bras vers le plafond, genoux à 90°', 'Tends un bras et la jambe opposée sans que le dos décolle', 'Expire en allongeant, reviens, change de côté'],
    pallof: ['Élastique accroché sur le côté à hauteur de poitrine, tenu à deux mains contre le sternum', 'Tends les bras droit devant la poitrine', 'Tiens sans laisser l\'élastique te faire tourner, puis ramène les mains'],
    chop: ['Élastique accroché en hauteur sur le côté, tenu à deux mains', 'Tire en diagonale vers la hanche opposée', 'Pivote le pied arrière'],
    chop_ecc: ['Élastique accroché en hauteur sur le côté, tenu à deux mains', 'Tire en diagonale vers la hanche opposée', 'Reviens en résistant à la rotation'],
    rot_throw: ['De profil au mur, les deux pieds bien ancrés au sol', 'Pousse sur la jambe arrière, bloque la jambe avant', 'Tourne les hanches puis le buste, et lance contre le mur'],
    frappe_band: ['Élastique accroché haut derrière toi, tenu dans la main de frappe', 'Bras armé au-dessus de la tête, frappe vers l\'avant puis vers le bas', 'Les deux pieds bien ancrés au sol, la poussée part de la jambe arrière'],
    frappe_full_band: ['Élastique accroché derrière toi à hauteur d\'épaule, tenu dans la main de frappe, bras tendu vers l\'arrière (armé)', 'Pousse sur la jambe arrière, tourne hanches puis buste : le bras balaie vers l\'avant et monte au-dessus de l\'épaule', 'Juste après le « contact », ramène le bras vers le bas le plus vite possible'],
    frappe_air: ['Armé : bras en arrière, poids sur la jambe arrière', 'Balayage montant : la jambe arrière pousse, les hanches tournent, puis le bras', 'Ramené : le bras redescend le plus vite possible, les deux pieds ancrés au sol'],
    frappe_step: ['Un pas d\'élan, le pied avant se plante', 'Les deux pieds bien ancrés, enchaîne la frappe complète : balayage montant puis ramené', 'La puissance vient des appuis au sol'],
    straight_pulldown: ['Élastique accroché en hauteur devant toi, bras tendus vers le haut', 'Ramène les bras tendus vers les hanches le plus vite possible', 'Remonte lentement'],
    rot_throw_diag: ['Ballon à la hanche arrière, les deux pieds bien ancrés au sol', 'Pousse la jambe arrière, bloque la jambe avant, tourne et lance vers le haut et l\'avant', 'Finis bras vers le haut, comme au contact de la frappe'],
    rot_band: ['De profil, élastique accroché à hauteur de hanche côté arrière, tenu dans la main de frappe', 'Pousse sur la jambe arrière, tourne les hanches puis le buste, le bras suit en dernier', 'Les deux pieds restent ancrés au sol, puis reviens'],
    rot_band_high: ['Élastique accroché à hauteur d\'épaule côté arrière, tenu dans la main de frappe', 'Même enchaînement jambes → hanches → buste → bras', 'Les deux pieds restent ancrés au sol, puis reviens'],
    rot_throw_open: ['Face au mur à 2 m, pieds parallèles et bien ancrés', 'Charge sur la jambe extérieure, tourne fort et lance', 'Comme une frappe en appui ouvert'],
    rot_throw_step: ['Pas chassé vers le mur, puis les deux pieds se plantent', 'Enchaîne immédiatement le lancer rotatif', 'Comme un déplacement suivi d\'une frappe en match'],
    frappe_ball: ['Ballon léger qui rebondit contre le mur, à hauteur de hanche', 'Frappe : jambe arrière, hanches, buste, puis bras', 'Les deux pieds ancrés, main ouverte, finis vers l\'avant'],
    worlds_greatest: ['Grande fente avant, main du côté de la jambe avant posée au sol', 'Ouvre l\'autre bras vers le plafond en tournant le buste', 'Suis ta main du regard, puis reviens'],
    balance: ['Debout sur une jambe, genou légèrement fléchi', 'Suis la consigne du jour : yeux ouverts, tête qui tourne, yeux fermés ou petits sauts', 'Récupère l\'équilibre sans poser l\'autre pied'],
    wall_sit: ['Dos plaqué au mur, pieds avancés', 'Descends jusqu\'aux genoux à 90°', 'Bras croisés sur la poitrine, respire calmement'],
  };
  // rythme d'exécution affiché en séance (lent) ; la vitesse maximale est ajoutée par le générateur en puissance
  const TEMPO = {
    squat_tempo: 'Descente 3 s, pause 1 s en bas, montée 1 s', back_squat: 'Descente 2 s, montée rapide', bulgarian_db: 'Descente 2 s, montée rapide', bulgarian: 'Descente 2 s, montée rapide',
    step_up: 'Redescente 2 s', bridge: 'Pause 1 s en haut, descente 2 s', bridge_db: 'Pause 1 s en haut, descente 2 s', sl_bridge: 'Pause 1 s en haut, descente 2 s', hip_thrust_db: 'Pause 1 s en haut, descente 2 s', hip_thrust_bar: 'Pause 1 s en haut, descente 2 s',
    nordic: 'Descente la plus lente possible (3 à 5 s)', nordic_assist: 'Descente 3 à 5 s', reverse_nordic: 'Descente 3 s', ham_slide: 'Jambes qui s\'allongent en 3 s', ham_swiss: 'Ballon repoussé en 3 s', leg_curl: 'Descente 3 s',
    calf: 'Pause 1 s en haut, descente 2 s', calf_db: 'Pause 1 s en haut, descente 2 s', calf_sl: 'Descente 3 s sur 1 jambe', calf_seated: 'Descente 2 s', tibialis: 'Descente 2 s', peroneal: 'Retour 2 s',
    pull_up_neg: 'Descente 4 à 5 s', curl: 'Descente 2 s', wrist_ecc: 'Descente 4 s', pronosup: '2 s dans chaque sens',
    ext_rot: 'Retour 3 s', ext_rot_ecc: 'Ouverture 1 s, retour 3 s', ext_rot_side: 'Retour 2 s', ext_rot_90: 'Retour 2 s', face_pull: 'Retour 2 s', pull_apart: 'Retour 2 s', ytw: 'Tiens 2 s en haut', pushup_plus: 'Relâche en 2 s',
    straight_pulldown: 'Ramené explosif, remontée 2 s', rot_band: 'Rotation explosive, retour 2 s', rot_band_high: 'Rotation explosive, retour 2 s', chop_ecc: 'Tirage 1 s, retour 3 s', pallof: 'Tiens 2 s bras tendus',
    dead_bug: 'Allonge en 2 s', bird_dog: 'Tiens 2 s', superman: 'Tiens 2 s', ab_wheel: 'Aller en 2 s', ab_wheel_stand: 'Aller en 2 s', pullover: 'Descente 2 s',
  };
  // progressions au poids du corps (exercice suivant quand c'est trop facile)
  const NEXT = {
    bridge: 'bridge_db', bridge_db: 'sl_bridge', sl_bridge: 'hip_thrust_db', hip_thrust_db: 'hip_thrust_bar',
    push_up_knee: 'push_up', push_up_incline: 'push_up', push_up: 'push_up_lest', push_up_plyo_knee: 'push_up_plyo',
    plank: 'plank_reach', split_squat: 'split_squat_db', split_squat_db: 'bulgarian_db', lunge_rev: 'lunge_fwd_db', pistol_box: 'pistol',
    squat_pdc: 'goblet_db', wall_sit: 'wall_sit_sl', nordic_assist: 'nordic', ham_slide: 'nordic_assist', curl_up: 'hollow', hollow: 'ab_wheel', ab_wheel: 'ab_wheel_stand',
    copenhagen_short: 'copenhagen', calf: 'calf_sl', calf_db: 'calf_sl', sl_rdl_pdc: 'sl_rdl_db', pull_up_band: 'chin_up', table_row: 'inverted_row', side_plank: 'copenhagen_short',
  };
  (KP.EXERCISES || []).forEach(e => {
    if (CUES[e.id]) e.cues = CUES[e.id];
    if (TEMPO[e.id]) e.tempo = TEMPO[e.id];
    if (NEXT[e.id]) e.next = NEXT[e.id];
  });
  KP.EX_NEXT = NEXT;
  // marche latérale : format de 2023
  if (KP.EX_BY_ID.lateral_walk) { KP.EX_BY_ID.lateral_walk.repsTxt = '2 allers-retours de 5 pas'; KP.EX_BY_ID.lateral_walk.note = ''; }
  if (KP.EX_BY_ID.copenhagen) KP.EX_BY_ID.copenhagen.anim = 'copenhagen';
  if (KP.EX_BY_ID.copenhagen_short) KP.EX_BY_ID.copenhagen_short.anim = 'copenhagen_short';
  if (KP.EX_BY_ID.frappe_full_band) KP.EX_BY_ID.frappe_full_band.note = 'Reproduit les 3 phases de la frappe : armé, balayage montant, ramené. Les deux pieds restent bien ancrés au sol.';
})(window.KP = window.KP || {});
