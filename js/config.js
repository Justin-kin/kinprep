/* KinPrep — configuration. Remplis supabaseUrl et supabaseKey (clé « anon public ») pour activer l'espace équipe.
   ai: true active l'assistant Claude (nécessite la fonction coach-ia déployée sur Supabase). */
window.KP = window.KP || {};
KP.CONFIG = {
  supabaseUrl: '',
  supabaseKey: '',
  teamName: 'Équipe nationale de kin-ball',
  ai: false,
  demo: false,
};
