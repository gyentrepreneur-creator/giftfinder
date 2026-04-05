/**
 * Kadoizi Analytics — Tracking léger d'événements
 * Envoie silencieusement des événements vers la table Supabase `events`
 * Aucune erreur visible si la table n'existe pas encore (fail-silent).
 *
 * Événements trackés :
 *   search_initiated  — Soumission du questionnaire
 *   results_viewed    — Affichage des résultats (statut done/completed)
 *   product_clicked   — Clic sur un produit affilié
 *   share_clicked     — Clic sur "Partager ces idées cadeaux"
 */
window.GFAnalytics = (function() {

  /**
   * Envoie un événement vers Supabase (fire-and-forget, silencieux).
   * @param {string} eventName  — Nom de l'événement (ex: 'search_initiated')
   * @param {object} [props]    — Propriétés supplémentaires (budget, occasion, etc.)
   */
  function track(eventName, props) {
    try {
      if (!window.supabase) return; // Supabase pas encore chargé

      window.supabase.auth.getSession().then(function(res) {
        var userId = (res && res.data && res.data.session)
          ? res.data.session.user.id
          : null;

        window.supabase.from('events').insert([{
          user_id:    userId,
          event:      eventName,
          properties: props || {}
        }]).then(function() {
          // Succès silencieux
        }).catch(function() {
          // Échec silencieux (table non créée, RLS, réseau)
        });
      }).catch(function() {});

    } catch (e) {
      // Fail complètement silencieux — jamais d'erreur côté UX
    }
  }

  return { track: track };

})();
