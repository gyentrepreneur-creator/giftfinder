# AmÃ©liorations prioritaires GiftFinder â Backlog

*GÃ©nÃ©rÃ© le 31/03/2026 par analyse automatique (sous-agent)*

---

## Phase 1 â Quick wins (Semaine 1-2)

| # | AmÃ©lioration | Fichier(s) | PrioritÃ© | Effort | Impact |
|---|---|---|---|---|---|
| 1 | **Email de relance J+2** â Envoyer un email aux utilisateurs inscrits sans aucune recherche 48h aprÃ¨s inscription | n8n workflow (nouveau) | ð´ Haute | Grand | +30-40% activation dormants |
| 2 | **Gamification : compteur cadeaux** â Afficher dans profil/navbar le total de cadeaux trouvÃ©s + badges pour jalons (10, 25, 50) | profil.html, questionnaire.html | ð´ Haute | Moyen | +25% re-visites |
| 7 | ~~**Navigation mobile : bottom nav + CTA sticky**~~ â **FAIT (31/03/2026)** â Barre de nav en bas sur mobile dÃ©ployÃ©e sur css/style.css, questionnaire.html, historique.html, profil.html, resultats.html | css/style.css, questionnaire.html, historique.html, profil.html, resultats.html | ð´ Haute | Petit | +5-10% conversion mobile |

## Phase 2 â Medium-term (Semaine 3-4)

| # | AmÃ©lioration | Fichier(s) | PrioritÃ© | Effort | Impact |
|---|---|---|---|---|---|
| 3 | **Landing page social proof dynamique** â Stats en temps rÃ©el depuis Supabase (ex: "+26 cadeaux trouvÃ©s ce mois") au lieu des chiffres statiques | index.html | ð¡ Moyenne | Moyen | +15-20% conversion landing |
| 5 | **Partage rÃ©sultats viral** â URL de partage unique et anonyme `/shared/XXXX` sans rÃ©vÃ©ler l'ID utilisateur | resultats.html | ð¡ Moyenne | Moyen | +20-30% nouveaux users |
| 4 | **PWA : installation mobile + offline** â manifest.json + service worker pour installer l'app + accÃ¨s hors-ligne | manifest.json, service-worker.js (nouveau) | ð¡ Moyenne | Moyen | +10-15% rÃ©tention |

## Phase 3 â Long-term (Mois 2)

| # | AmÃ©lioration | Fichier(s) | PrioritÃ© | Effort | Impact |
|---|---|---|---|---|---|
| 6 | **Email de suggestions quotidiennes** â Opt-in dans profil pour recevoir 1 idÃ©e cadeau par jour via n8n cron | profil.html, n8n workflow | ð¢ Basse | Grand | +15% lifetime value |
| 8 | **Analytics dashboard** â Tracking Ã©vÃ©nements (search_initiated, results_viewed, product_clicked, share_clicked) pour mesurer les funnels | RPC Supabase (nouveaux) | ð¢ Basse | Moyen | DÃ©cisions data-driven |

---

## Blockers Ã  rÃ©soudre en premier

1. **og-image.png** â Uploader sur GitHub (requis pour social sharing viral)
2. **n8n accessible** â VÃ©rifier si n8n peut Ãªtre rendu accessible depuis internet pour les webhooks email
3. **Resend.com** â CrÃ©er compte + configurer dans n8n (guide : `GUIDE_EMAIL_N8N.md`)

---

*Ce backlog doit Ãªtre revu toutes les semaines selon les nouvelles stats d'usage.*
