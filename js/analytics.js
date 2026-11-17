/**
 * Kadoizi Analytics — Tracking léger d'événements
 * Envoie silencieusement des événements vers la table Supabase `events`
 * Aucune erreur visible si la table n'existe pas encore (fail-silent).
 *
 * Événements trackés :
 *   page_view         — Chargement d'une page (accueil, questionnaire, resultats) : d'où vient la visite
 *   search_initiated  — Soumission du questionnaire
 *   results_viewed    — Affichage des résultats (statut done/completed)
 *   product_clicked   — Clic sur un produit affilié
 *   share_clicked     — Clic sur "Partager ces idées cadeaux"
 *   cta_click         — Appui sur « Trouver mon cadeau » (accueil), envoyé par send() : arrive même si la page change aussitôt
 *
 * Attribution : le paramètre ?s= (ex. s=tt pour la bio TikTok) est mémorisé dans
 * localStorage (kado_src) dès la première page vue, puis repris par tous les événements.
 * Aucune donnée personnelle : pas d'adresse IP, pas d'identifiant durable ; un identifiant
 * de session (sessionStorage, effacé à la fermeture) relie seulement les pages d'une même visite.
 */
window.GFAnalytics = (function() {

  /** Source de la visite (?s=...), mémorisée à la première page et réutilisée ensuite. */
  function source() {
    try {
      var s = new URLSearchParams(location.search).get('s');
      if (s) localStorage.setItem('kado_src', String(s).slice(0, 40));
      return localStorage.getItem('kado_src');
    } catch (e) { return null; }
  }

  /** Identifiant de la visite en cours (le temps de l'onglet), pour relier accueil → questionnaire → résultats. */
  function sessionId() {
    try {
      var id = sessionStorage.getItem('kado_sid');
      if (!id) {
        id = Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem('kado_sid', id);
      }
      return id;
    } catch (e) { return null; }
  }

  /** Navigateur intégré d'une appli (TikTok, Instagram...) ou null. */
  function appFromUA() {
    var ua = navigator.userAgent || '';
    if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return 'tiktok';
    if (/Instagram/i.test(ua)) return 'instagram';
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook';
    if (/Pinterest/i.test(ua)) return 'pinterest';
    if (/Snapchat/i.test(ua)) return 'snapchat';
    return null;
  }

  /**
   * Envoie un événement vers Supabase (fire-and-forget, silencieux).
   * @param {string} eventName  — Nom de l'événement (ex: 'search_initiated')
   * @param {object} [props]    — Propriétés supplémentaires (budget, occasion, etc.)
   */
  function track(eventName, props) {
    try {
      if (!window.supabase) return; // Supabase pas encore chargé

      props = props || {};
      if (props.src === undefined) props.src = source();
      if (props.sid === undefined) props.sid = sessionId();

      window.supabase.auth.getSession().then(function(res) {
        var userId = (res && res.data && res.data.session)
          ? res.data.session.user.id
          : null;

        window.supabase.from('events').insert([{
          user_id:    userId,
          event:      eventName,
          properties: props
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

  /**
   * Envoi direct, sans attendre la librairie Supabase, et qui survit au changement de page
   * (fetch keepalive). Sert aux appuis sur un bouton qui quitte la page aussitôt :
   * avec track(), l'envoi était souvent annulé par la navigation sur téléphone.
   * Toujours anonyme (user_id nul) : c'est un compteur, pas un suivi de personne.
   */
  function send(eventName, props) {
    try {
      if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined' || !window.fetch) return;
      props = props || {};
      if (props.src === undefined) props.src = source();
      if (props.sid === undefined) props.sid = sessionId();
      if (props.app === undefined) props.app = appFromUA();
      fetch(SUPABASE_URL + '/rest/v1/events', {
        method: 'POST',
        keepalive: true,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify([{ user_id: null, event: eventName, properties: props }])
      }).catch(function() {});
    } catch (e) {}
  }

  /** Page vue : d'où vient le visiteur (appli, mobile, site référent) — à appeler une fois par page. */
  function pageView(page) {
    try {
      var ref = '';
      try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
      track('page_view', {
        page:   page,
        app:    appFromUA(),
        mobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || ''),
        ref:    ref,
        // 'hidden' = page chargée sans être affichée (préchargement d'une pub par l'appli) : à ne pas compter comme une visite
        vis:    document.visibilityState || null
      });
    } catch (e) {}
  }

  return { track: track, send: send, pageView: pageView, source: source };

})();
