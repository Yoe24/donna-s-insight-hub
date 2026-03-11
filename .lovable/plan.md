

## Plan : 3 modifications Donna-Legal.ai

### 1. Refonte page Dossiers + page Détail

**`src/pages/Dossiers.tsx`** — Mise à jour interface et affichage :
- Interface `Dossier` : champs `id`, `nom_client`, `email_client`, `statut`, `domaine`, `dernier_echange_date`
- Tableau avec colonnes : nom_client, email_client, statut (badge couleur : actif=vert, en_attente=orange, archivé=gris), domaine, dernier_echange_date (format `fr-FR`)
- Etat vide : message "Aucun dossier pour l'instant. Connectez votre boîte Gmail pour importer vos dossiers clients." + bouton Link vers `/onboarding`

**`src/pages/DossierDetail.tsx`** — 3 appels API séparés :
- `GET /api/dossiers/:id` → infos dossier (mêmes champs que ci-dessus)
- `GET /api/dossiers/:id/emails` → tableau d'emails
- `GET /api/dossiers/:id/documents` → tableau de documents (affichage liste avec nom, type, date)
- Adapter l'interface `DossierDetailData` aux nouveaux champs

### 2. Page Onboarding Gmail

**Nouveau fichier `src/pages/Onboarding.tsx`** :

- Etat 1 (pas de `?import=started`) : écran de bienvenue avec bouton "Connecter ma boîte Gmail"
  - Au clic : `GET /api/import/gmail/auth` → récupère `{ auth_url }` → `window.location.href = auth_url`
- Etat 2 (`?import=started` dans l'URL) : polling `GET /api/import/status` toutes les 2s
  - Barre `Progress` proportionnelle `processed/total`
  - Texte : "X / Y emails traités • Z dossiers créés"
  - Si `status === 'done'` : écran succès + bouton "Voir mes dossiers" → `/dossiers`
  - Si `status === 'error'` : message d'erreur + bouton "Réessayer"

**`src/App.tsx`** : ajouter route `/onboarding` (protégée)

### 3. Badges emails sur le Dashboard

**`src/hooks/useEmails.ts`** :
- Ajouter `metadata?: { filtre?: { categorie?: string } }` au type `Email`
- Ajouter `"ignore"` et `"filtre_rejete"` aux types `statut` / `pipeline_step`

**`src/pages/Dashboard.tsx`** :
- Si `metadata.filtre.categorie === "client"` → badge bleu pill (`bg-blue-100 text-blue-800`)
- Si `metadata.filtre.categorie === "prospect"` → badge vert pill (`bg-green-100 text-green-800`)
- Si `pipeline_step === "filtre_rejete"` → ligne `opacity-50` + badge gris "Ignoré"

### Fichiers modifiés/créés

| Fichier | Action |
|---|---|
| `src/pages/Dossiers.tsx` | Modifier (nouveaux champs, état vide, tableau) |
| `src/pages/DossierDetail.tsx` | Modifier (3 endpoints séparés, nouveaux champs, documents) |
| `src/pages/Onboarding.tsx` | Créer |
| `src/App.tsx` | Modifier (route /onboarding) |
| `src/hooks/useEmails.ts` | Modifier (metadata, filtre_rejete) |
| `src/pages/Dashboard.tsx` | Modifier (badges, opacity) |

### Message OpenClaw (généré après implémentation)

Endpoints concernés :
- `GET /api/import/gmail/auth` → `{ auth_url: string }`
- `GET /api/import/status` → `{ processed, total, dossiers_created, status }`
- `GET /api/dossiers/:id/emails` → `Email[]`
- `GET /api/dossiers/:id/documents` → `Document[]`

