# Améliorations prioritaires GiftFinder — Backlog

*Généré le 31/03/2026 par analyse automatique (sous-agent)*

---

## Phase 1 — Quick wins (Semaine 1-2)

| # | Amélioration | Fichier(s) | Priorité | Effort | Impact |
|---|---|---|---|---|---|
| 1 | **Email de relance J+2** — Envoyer un email aux utilisateurs inscrits sans aucune recherche 48h après inscription | n8n workflow (nouveau) | 🔴 Haute | Grand | +30-40% activation dormants |
| 2 | ~~**Gamification : compteur cadeaux**~~ ✅ **FAIT (01/04/2026)** — Compteur dans navbar (questionnaire.html) + badges 5 niveaux dans profil.html (Débutant/1, Expert/5, Champion/10, Légende/25, Maestro/50) | profil.html, questionnaire.html | 🔴 Haute | Moyen | +25% re-visites |
| 7 | ~~**Navigation mobile : bottom nav + CTA sticky**~~ ✅ **FAIT (31/03/2026)** — Barre de nav en bas sur mobile déployée sur css/style.css, questionnaire.html, historique.html, profil.html, resultats.html | css/style.css, questionnaire.html, historique.html, profil.html, resultats.html | 🔴 Haute | Petit | +5-10% conversion mobile |

## Phase 2 — Medium-term (Semaine 3-4)

| # | Amélioration | Fichier(s) | Priorité | Effort | Impact |
|---|---|---|---|---|---|
| 3 | ~~**Landing page social proof dynamique**~~ ✅ **FAIT (01/04/2026)** — Badge + avatars row mis à jour en temps réel depuis Supabase (total + stat mensuelle). Fallback silencieux sur valeurs statiques si RLS bloque. | index.html | 🟡 Moyenne | Moyen | +15-20% conversion landing |
| 5 | ~~**Partage résultats viral**~~ ✅ **FAIT (01/04/2026)** — URL unique `/shared.html?token=UUID` créée dans Supabase (table `shared_results`, 30j expiry). `handleShare()` dans resultats.html génère le token + sauvegarde + partage via Web Share API ou clipboard. | resultats.html, shared.html (nouveau) | 🟡 Moyenne | Moyen | +20-30% nouveaux users |
| 4 | ~~**PWA : installation mobile + offline**~~ ✅ **FAIT (01/04/2026)** — manifest.json + service-worker.js créés. Cache-first sur assets statiques, network-first sur Supabase. SW enregistré sur index.html, resultats.html, shared.html. | manifest.json, service-worker.js (nouveaux), index.html, resultats.html | 🟡 Moyenne | Moyen | +10-15% rétention |

## Phase 3 — Long-term (Mois 2)

| # | Amélioration | Fichier(s) | Priorité | Effort | Impact |
|---|---|---|---|---|---|
| 6 | **Email de suggestions quotidiennes** — Opt-in dans profil pour recevoir 1 idée cadeau par jour via n8n cron | profil.html, n8n workflow | 🟢 Basse | Grand | +15% lifetime value |
| 8 | **Analytics dashboard** — Tracking événements (search_initiated, results_viewed, product_clicked, share_clicked) pour mesurer les funnels | RPC Supabase (nouveaux) | 🟢 Basse | Moyen | Décisions data-driven |

---

## Blockers à résoudre en premier

1. **og-image.png** → Uploader sur GitHub (requis pour social sharing viral)
2. **n8n accessible** → Vérifier si n8n peut être rendu accessible depuis internet pour les webhooks email
3. **Resend.com** → Créer compte + configurer dans n8n (guide : `GUIDE_EMAIL_N8N.md`)

---

*Ce backlog doit être revu toutes les semaines selon les nouvelles stats d'usage.*
