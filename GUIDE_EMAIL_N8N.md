# Guide : Email transactionnel dans n8n

## Objectif
Envoyer un email "Vos idÃ©es cadeaux sont prÃªtes !" Ã  l'utilisateur aprÃ¨s que n8n a gÃ©nÃ©rÃ© les suggestions.

---

## PrÃ©requis

### Option A â Resend (recommandÃ©, gratuit jusqu'Ã  3000 emails/mois)
1. CrÃ©er un compte sur https://resend.com
2. VÃ©rifier votre domaine (ou utiliser l'adresse Vercel temporairement)
3. Copier la clÃ© API : `re_xxxx...`
4. Dans n8n â Credentials â New â HTTP Header Auth :
   - Name : `Resend API`
   - Header Name : `Authorization`
   - Header Value : `Bearer re_xxxx...`

### Option B â Brevo (ex-Sendinblue, gratuit 300 emails/jour)
1. CrÃ©er un compte sur https://www.brevo.com
2. API Keys â Create a new API key
3. Dans n8n â Credentials â New â HTTP Header Auth :
   - Name : `Brevo API`
   - Header Name : `api-key`
   - Header Value : `kxeysib-xxxx...`

---

## Modification du workflow n8n

### OÃ¹ insÃ©rer le node email ?

Dans le workflow actuel, aprÃ¨s le node qui met Ã  jour le statut Supabase Ã  `done`, ajouter un **node HTTP Request** ou **node Email**.

```
[Trigger Supabase]
    â
[Extraire donnÃ©es + gÃ©nÃ©rer suggestions]
    â
[Update Supabase â statut: done]
    â
[NEW] RÃ©cupÃ©rer email utilisateur depuis Supabase  â ajouter ici
    â
[NEW] Envoyer email via Resend                      â ajouter ici
```

---

## Node 1 : RÃ©cupÃ©rer l'email utilisateur

**Type :** Supabase node (ou HTTP Request vers Supabase REST API)

**Objectif :** La table `searches` contient `user_id` mais pas l'email. Il faut interroger `auth.users` via la Service Role API.

**HTTP Request :**
- Method : `GET`
- URL : `https://[TON-PROJECT-REF].supabase.co/auth/v1/admin/users/{{$json.user_id}}`
- Headers :
  - `apikey` : ta Service Role Key (dans Supabase â Settings â API)
  - `Authorization` : `Bearer [SERVICE_ROLE_KEY]`

**Output :** `{{$json.email}}`

---

## Node 2 : Envoyer l'email (Resend)

**Type :** HTTP Request

**Configuration :**
- Method : `POST`
- URL : `https://api.resend.com/emails`
- Authentication : `Resend API` (credential crÃ©Ã© ci-dessus)
- Body Type : `JSON`

**Body JSON :**
```json
{
  "from": "GiftFinder <onboarding@resend.dev>",
  "to": ["{{ $('RÃ©cupÃ©rer email utilisateur').item.json.email }}"],
  "subject": "ð Vos idÃ©es cadeaux pour {{ $('Trigger').item.json.occasion }} sont prÃªtes !",
  "html": "COLLER ICI LE CONTENU DE email_cadeaux_prets.html"
}
```

**Remplacement des variables dans le HTML :**

Avant d'envoyer, utiliser un **Code node** pour remplacer les variables :

```javascript
const htmlTemplate = `COLLER ICI LE CONTENU BRUT DE email_cadeaux_prets.html`;

const data = $('Update Supabase').item.json;
const userEmail = $('RÃ©cupÃ©rer email utilisateur').item.json.email;

const searchId = data.id;
const urlResultats = `https://giftfinder-cyan.vercel.app/resultats.html?id=${searchId}`;

// Compter les suggestions
let nbSuggestions = 9;
try {
  const suggestions = typeof data.suggestions === 'string'
    ? JSON.parse(data.suggestions)
    : data.suggestions;
  nbSuggestions = Array.isArray(suggestions) ? suggestions.length : 9;
} catch(e) {}

const html = htmlTemplate
  .replace(/\{\{destinataire\}\}/g, data.destinataire || 'votre proche')
  .replace(/\{\{occasion\}\}/g, data.occasion || 'cette occasion')
  .replace(/\{\{budget\}\}/g, data.budget || '')
  .replace(/\{\{nb_suggestions\}\}/g, nbSuggestions)
  .replace(/\{\{url_resultats\}\}/g, urlResultats)
  .replace(/\{\{user_email\}\}/g, userEmail);

return { json: { html, to: userEmail } };
```

---

## Node 2 (suite) : Envoyer via Brevo (alternative)

**URL :** `https://api.brevo.com/v3/smtp/email`
**Body JSON :**
```json
{
  "sender": { "name": "GiftFinder", "email": "hello@[VOTRE-DOMAINE].fr" },
  "to": [{ "email": "{{ $json.to }}" }],
  "subject": "ð Vos idÃ©es cadeaux sont prÃªtes !",
  "htmlContent": "{{ $json.html }}"
}
```

---

## Gestion des erreurs

Ajouter un **Error Handler** sur le node email :
- Si erreur â logger dans Supabase (champ `email_sent = false`)
- Ne pas faire Ã©chouer tout le workflow Ã  cause d'un email ratÃ©

---

## Test rapide

1. Dans n8n, utiliser "Execute Workflow" avec un record test
2. VÃ©rifier que l'email arrive dans la boÃ®te mail
3. VÃ©rifier l'affichage sur mobile (Gmail app, etc.)
4. VÃ©rifier les liens : CTA â resultats.html?id=xxx

---

## Notes importantes

- **Ne pas stocker la clÃ© API en dur** dans les nodes n8n â utiliser les Credentials
- **Limite de taux** : Resend = 10 req/sec max
- **Domaine** : Pour sortir de sandbox Resend (expÃ©diteur `onboarding@resend.dev`), vÃ©rifier un domaine personnalisÃ©
- Le fichier `email_cadeaux_prets.html` est le template complet prÃªt Ã  coller

---

*Guide crÃ©Ã© le 28/03/2026 â session planifiÃ©e GiftFinder*
