

## Migration vers l'API Backend — Remplacement des mock data et appels Supabase directs

Le contrat API definit une base URL `https://187-77-173-221.nip.io` avec authentification JWT Supabase. Tous les ecrans doivent pointer vers ces endpoints au lieu des donnees mock ou des requetes Supabase directes.

### 1. Creer un client API central

**Nouveau fichier : `src/lib/api.ts`**

- Exporte une fonction `apiClient` qui wrappe `fetch` avec :
  - Base URL `https://187-77-173-221.nip.io`
  - Header `Authorization: Bearer <token>` recupere via `supabase.auth.getSession()`
  - Header `Content-Type: application/json`
- Methodes utilitaires : `api.get()`, `api.post()`, `api.put()`, `api.delete()`

### 2. Refonte du Dashboard (`src/pages/Dashboard.tsx` + `src/hooks/useEmails.ts`)

**Endpoints utilises :**
- `GET /api/emails` — remplace la requete Supabase directe dans `useEmails`
- `GET /api/emails/stats` — remplace le calcul local des stats (recus, traites, valides, en_attente)
- `POST /api/emails/:id/feedback` — remplace le `supabase.update()` dans `useUpdateEmailStatus` (body: `{ type: "parfait" | "modifier" | "erreur" }`)

**Changements concrets :**
- `useEmails` : fetch via `api.get('/api/emails')`, conserve le Realtime Supabase pour les mises a jour en temps reel
- `useUpdateEmailStatus` : appelle `api.post(`/api/emails/${id}/feedback`, { type })` au lieu de `supabase.update`
- Stats dashboard : appel `GET /api/emails/stats` au lieu du calcul local `emails.filter(...)`
- Suppression de `kpiByPeriod` / `computeROI` (mock) — les stats viennent de l'API

### 3. Refonte de la Configuration (`src/pages/Configuration.tsx`)

**Endpoints utilises :**
- `GET /api/config` — charge la config au mount (formule_appel, formule_politesse, niveau_concision, ton_reponse, nom_avocat, nom_cabinet, specialite, signature)
- `PUT /api/config` — sauvegarde la config
- `GET /api/config/examples` — charge les 3 emails exemples
- `PUT /api/config/examples` — sauvegarde les exemples
- `GET /api/config/documents` — liste les documents uploades
- `POST /api/config/documents` — upload document (multipart/form-data)
- `DELETE /api/config/documents/:id` — supprime un document
- `GET /api/config/sources` — charge les sources favorites
- `GET /api/config/rules` — charge les regles
- `POST /api/config/rules` — cree une regle (body: `{ condition, action }`)
- `PUT /api/config/rules/:id` — modifie une regle
- `DELETE /api/config/rules/:id` — supprime une regle

**Changements concrets :**
- Ajout de champs manquants dans le formulaire : `nom_avocat`, `nom_cabinet`, `specialite`, `signature` (present dans le contrat API mais absents du formulaire actuel)
- `useEffect` au mount pour charger config, exemples, documents, sources, regles
- Le bouton "Sauvegarder" appelle `PUT /api/config` + `PUT /api/config/examples` en parallele
- Upload de fichiers : `POST /api/config/documents` avec `FormData`
- Suppression de fichiers : `DELETE /api/config/documents/:id`
- Regles : CRUD via les endpoints dediees (plus de state local seul)
- Les noms de champs correspondent exactement : `formule_appel`, `formule_politesse`, `niveau_concision`, `ton_reponse`

### 4. Refonte des Dossiers (`src/pages/Dossiers.tsx` + `src/pages/DossierDetail.tsx`)

**Endpoints utilises :**
- `GET /api/dossiers` — remplace l'import de `dossiers` depuis mock-data
- `GET /api/dossiers/:id` — charge le detail d'un dossier avec ses emails

**Changements concrets :**
- `Dossiers.tsx` : `useEffect` + `api.get('/api/dossiers')` au lieu de l'import mock. Champs attendus : `id, nom, client, type_droit, nb_emails, created_at, statut`
- `DossierDetail.tsx` : `useEffect` + `api.get(`/api/dossiers/${id}`)` au lieu de `dossiers.find()`. La reponse inclut `{ dossier, emails: [...] }`
- Les champs mock enrichis (resumeDonna, anticipation, timeline, datesCles, piecesRecues/Manquantes) ne sont pas dans le contrat API actuel — on les garde en affichage conditionnel (si le backend les fournit) ou on les masque pour l'instant

### 5. Nettoyage

- Suppression des donnees mock inutilisees dans `src/lib/mock-data.ts` (dossiers, activityFeed)
- Conservation de `kpiByPeriod` / `computeROI` temporairement si `GET /api/emails/stats` ne retourne pas encore de ROI
- Mapping des statuts : le contrat definit `en_attente, traite, valide, erreur, archive` — adapter les labels du dashboard

### Section technique : Mapping des noms de champs

| Frontend actuel | Contrat API | Action |
|---|---|---|
| `statut: "approuvé"/"modifié"/"rejeté"` | feedback type: `"parfait"/"modifier"/"erreur"` | Mapper via `POST /api/emails/:id/feedback` |
| `greeting` (state) | `formule_appel` (API) | Renommer |
| `closing` (state) | `formule_politesse` (API) | Renommer |
| `concision` (state) | `niveau_concision` (API) | Renommer |
| `tone` (state) | `ton_reponse` (API) | Renommer |
| `rule.keyword` | `rule.condition` | Renommer |
| `rule.action` | `rule.action` | OK |

