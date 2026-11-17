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
 *   ecran, depart, js_error — témoin d'affichage (voir temoin() plus bas) : ce que l'écran du visiteur montre, le temps passé, les erreurs
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

  /**
   * Témoin d'affichage (17/11/2026). Pour chaque visite de l'accueil, du questionnaire ou des résultats,
   * il note ce que l'écran du visiteur montre vraiment — aucune donnée personnelle, seulement des mesures :
   *   ecran    — 1,2 s après l'arrivée : la page est-elle affichée, le titre et le bouton sont-ils visibles,
   *              où sont-ils dans l'écran, quelque chose les recouvre-t-il, la feuille de style est-elle appliquée
   *   depart   — quand le visiteur quitte la page : secondes passées, touchers, clics, défilement
   *   js_error — une erreur de script ou un fichier qui ne charge pas (3 au plus par page)
   * Sert à savoir ce que voient les visiteurs des navigateurs internes de TikTok / Instagram, qu'on ne peut
   * pas reproduire sur un ordinateur. Envoi par send() : ne dépend pas de la librairie externe.
   */
  function temoin() {
    try {
      var nom = (location.pathname || '/').replace(/\.html$/, '').split('/').pop();
      var page = (nom === '' || nom === 'index') ? 'accueil' : (nom === 'questionnaire' || nom === 'resultats') ? nom : null;
      if (!page) return;
      var selTitre  = page === 'accueil' ? '.hero h1' : page === 'questionnaire' ? '.q-title' : '.r-hdr';
      var selBouton = page === 'accueil' ? '.hero .btn-cta' : page === 'questionnaire' ? '.q-card' : '.r-card';
      var maintenant = function () { try { return performance.now(); } catch (e) { return 0; } };
      var t0 = maintenant(), touchers = 0, clics = 0, defil = 0, imageDessinee = false, parti = false, erreurs = 0;
      var appli = appFromUA();   // lue une fois à l'arrivée (au départ de la page, certains navigateurs ne la donnent plus)
      function envoi(evenement, proprietes) { proprietes.app = appli; send(evenement, proprietes); }
      try { requestAnimationFrame(function () { imageDessinee = true; }); } catch (e) {}

      function mesure(sel, avecDessus) {
        try {
          var el = document.querySelector(sel);
          if (!el) return null;
          var r = el.getBoundingClientRect(), c = getComputedStyle(el);
          var m = { o: Math.round(parseFloat(c.opacity) * 100) / 100, haut: Math.round(r.top), bas: Math.round(r.bottom),
                    cache: c.display === 'none' || c.visibility === 'hidden' || r.width === 0 };
          if (avecDessus) {
            // ce qui se trouve réellement sous le doigt au centre du bouton
            var d = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            m.couvert = !!d && d !== el && !el.contains(d);
            if (m.couvert) m.par = (String(d.tagName || '').toLowerCase() + '#' + (d.id || '') + '.' + String(d.className || '').split(' ')[0]).slice(0, 60);
            m.fond = c.backgroundColor;
          }
          return m;
        } catch (e) { return null; }
      }

      setTimeout(function () {
        var fcp = null;
        try { var p = performance.getEntriesByName('first-contentful-paint')[0]; if (p) fcp = Math.round(p.startTime); } catch (e) {}
        envoi('ecran', {
          page: page, vis: document.visibilityState || null, l: window.innerWidth, h: window.innerHeight,
          titre: mesure(selTitre, false), bouton: mesure(selBouton, true),
          lib: typeof window.supabase !== 'undefined', img: imageDessinee,
          sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
          fcp: fcp, t: Math.round(maintenant())
        });
      }, 1200);

      window.addEventListener('touchstart', function () { touchers++; }, true);
      window.addEventListener('click', function () { clics++; }, true);
      window.addEventListener('scroll', function () { var y = window.pageYOffset || 0; if (y > defil) defil = y; }, true);

      function depart() {
        if (parti) return;
        parti = true;
        envoi('depart', { page: page, s: Math.round((maintenant() - t0) / 100) / 10, touchers: touchers, clics: clics, defil: Math.round(defil), vis: document.visibilityState || null });
      }
      window.addEventListener('pagehide', depart);
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') depart(); });

      window.addEventListener('error', function (e) {
        try {
          if (erreurs++ >= 3) return;
          var c = (e && e.target && e.target !== window) ? e.target : null;
          if (c && (c.src || c.href)) {
            envoi('js_error', { page: page, fichier: (String(c.tagName || '').toLowerCase() + ' ' + String(c.src || c.href).replace(/^https?:\/\//, '').split('?')[0]).slice(-80) });
          } else {
            envoi('js_error', { page: page, msg: String((e && e.message) || '').slice(0, 160), fichier: String((e && e.filename) || '').split('/').pop().split('?')[0].slice(0, 40), ligne: (e && e.lineno) || null });
          }
        } catch (x) {}
      }, true);
      window.addEventListener('unhandledrejection', function (e) {
        try {
          if (erreurs++ >= 3) return;
          var r = e && e.reason;
          envoi('js_error', { page: page, msg: ('promesse : ' + String((r && r.message) || r || '')).slice(0, 160) });
        } catch (x) {}
      });
    } catch (e) {}
  }
  temoin();

  return { track: track, send: send, pageView: pageView, source: source };

})();
