/* KinPrep — matériel et zones */
(function (KP) {
  KP.EQUIP_GROUPS = [
    { id: 'base', label: 'Toujours disponible', items: [
      { id: 'pdc', label: 'Poids du corps', always: true },
      { id: 'mur', label: 'Un mur libre', always: true },
      { id: 'chaise', label: 'Chaise ou marche stable', always: true },
      { id: 'tapis', label: 'Tapis ou sol confortable', always: true },
    ] },
    { id: 'petit', label: 'Petit matériel', items: [
      { id: 'elastique', label: 'Élastiques longs (bandes de résistance)', hint: 'Indique la tension la plus forte' },
      { id: 'mini_band', label: 'Mini-bandes (élastiques en boucle)' },
      { id: 'corde', label: 'Corde à sauter' },
      { id: 'slider', label: 'Disques de glisse (ou serviette sur sol lisse)' },
      { id: 'plateau', label: 'Coussin ou plateau d\'équilibre' },
      { id: 'swiss', label: 'Swiss ball' },
      { id: 'medball', label: 'Médecine-ball / ballon lesté' },
      { id: 'trx', label: 'Sangles de suspension (TRX)' },
      { id: 'ancrage', label: 'Point d\'ancrage pour les pieds (canapé, partenaire, espalier)' },
      { id: 'gilet', label: 'Gilet ou sac lesté' },
    ] },
    { id: 'charges', label: 'Charges', items: [
      { id: 'halteres', label: 'Haltères', max: true, hint: 'Charge maximale par haltère (kg)' },
      { id: 'kettlebell', label: 'Kettlebell', max: true, hint: 'Charge maximale (kg)' },
      { id: 'barre', label: 'Barre + disques', max: true, hint: 'Charge totale maximale (kg)' },
      { id: 'landmine', label: 'Landmine (ou barre calée dans un coin)' },
    ] },
    { id: 'struct', label: 'Structures', items: [
      { id: 'banc', label: 'Banc de musculation' },
      { id: 'rack', label: 'Rack à squat / support de barre' },
      { id: 'traction', label: 'Barre de traction' },
      { id: 'box', label: 'Box de saut / plateforme solide' },
      { id: 'poulie', label: 'Poulie / câbles' },
      { id: 'machines', label: 'Machines guidées (presse, leg curl…)' },
    ] },
    { id: 'cardio', label: 'Terrain et cardio', items: [
      { id: 'terrain', label: 'Terrain plat d\'au moins 20 m (parc, piste, salle)' },
      { id: 'plots', label: 'Plots ou repères au sol' },
      { id: 'echelle', label: 'Échelle de rythme' },
      { id: 'velo', label: 'Vélo / home-trainer / vélo de salle' },
      { id: 'rameur', label: 'Rameur' },
      { id: 'piscine', label: 'Piscine' },
    ] },
  ];
  KP.EQUIP = {};
  KP.EQUIP_GROUPS.forEach(g => g.items.forEach(i => (KP.EQUIP[i.id] = i)));
  KP.ALWAYS = KP.EQUIP_GROUPS[0].items.map(i => i.id);
  KP.GYM_SET = ['elastique', 'mini_band', 'corde', 'swiss', 'medball', 'plateau', 'trx', 'halteres', 'kettlebell', 'barre', 'landmine', 'banc', 'rack', 'traction', 'box', 'poulie', 'machines', 'velo', 'rameur', 'plots', 'ancrage', 'slider'];

  KP.ZONES = [
    { id: 'epaule', label: 'Épaule' }, { id: 'coude', label: 'Coude' }, { id: 'poignet', label: 'Poignet / main' },
    { id: 'lombaires', label: 'Bas du dos' }, { id: 'hanche', label: 'Hanche / aine' }, { id: 'ischios', label: 'Arrière de cuisse' },
    { id: 'genou', label: 'Genou' }, { id: 'cheville', label: 'Cheville / pied' },
  ];
  KP.ROLES = [
    { id: 'pointe', label: 'Pointe', desc: 'Sprints de 3 à 10 m et glissade vers l\'avant' },
    { id: 'ailier', label: 'Ailier', desc: 'Démarrages latéraux, avant et arrière, glissade' },
    { id: 'rapproche', label: 'Rapproché', desc: 'Petits pas rapides dans toutes les directions' },
  ];
})(window.KP = window.KP || {});
