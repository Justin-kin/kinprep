/* KinPrep — configuration. Remplis supabaseUrl et supabaseKey (clé « anon public ») pour activer l'espace équipe.
   ai: true active l'assistant Claude (nécessite la fonction coach-ia déployée sur Supabase). */
window.KP = window.KP || {};
KP.CONFIG = {
  supabaseUrl: 'https://kxkqpdepknrjwdlwstst.supabase.co',
  supabaseKey: 'sb_publishable_GiKvPa9VdK3xXkh1m1P0QQ_SoJEgq6T',
  teamName: 'Équipe nationale de kin-ball',
  ai: false,
  demo: false,
};
