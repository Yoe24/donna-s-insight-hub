

## Plan : Navigation, déconnexion, boutons retour, widget ROI

### Rappel des appels API préservés (aucun changement)
- `GET /api/emails` → `api.get<Email[]>('/api/emails')`
- `POST /api/emails/:id/feedback` → `api.post(..., { action })`
- `GET /api/emails/stats` → `api.get<EmailStats>('/api/emails/stats')`
- `GET/PUT /api/config`, `/api/config/examples`, `/api/config/documents`, `/api/config/sources`, `/api/config/rules`
- `GET /api/dossiers`, `GET /api/dossiers/:id`, `/emails`, `/documents`
- `GET /api/import/gmail/auth`, `GET /api/import/status`

Aucun endpoint n'est créé, modifié ou supprimé.

---

### 1. Logo "Donna" → /dashboard

**`src/components/AppSidebar.tsx`** :
- Ligne 29 : `<Link to="/">` → `<Link to="/dashboard">`

### 2. Déconnexion réelle

**`src/components/AppSidebar.tsx`** :
- Importer `useAuth` et `useNavigate`
- Footer : remplacer `<Link to="/">` par un `<button>` qui appelle `signOut()` puis `navigate("/login")`

### 3. Boutons "Retour"

Ajouter un lien `← Retour` en haut du contenu dans :
- **`src/pages/Configuration.tsx`** : "← Tableau de bord" → `/dashboard`
- **`src/pages/Dossiers.tsx`** : "← Tableau de bord" → `/dashboard`
- **`src/pages/Onboarding.tsx`** : "← Tableau de bord" → `/dashboard`
- `DossierDetail.tsx` a déjà un retour vers `/dossiers`

Implémentation : un simple `<Link>` avec icône `ArrowLeft` au-dessus du contenu principal.

### 4. Widget ROI sur le Dashboard

**`src/pages/Dashboard.tsx`** :
- Importer `kpiByPeriod`, `computeROI`, `Period` depuis `mock-data.ts`
- State local : `const [period, setPeriod] = useState<Period>("jour")`
- Carte ROI entre le header et la boîte de réception :
  - 3 boutons pill "Jour / Semaine / Mois" (style toggle, bouton actif = fond sombre)
  - Deux métriques côte à côte : `Clock` "Xh XXmin gagnées" + `TrendingUp` "X XXX € économisés"
  - Calculé via `computeROI(kpiByPeriod[period])`
- Design : une seule `Card` épurée, cohérente avec le reste

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/components/AppSidebar.tsx` | Logo → /dashboard, déconnexion signOut → /login |
| `src/pages/Dashboard.tsx` | Widget ROI + sélecteur période |
| `src/pages/Configuration.tsx` | Lien retour |
| `src/pages/Dossiers.tsx` | Lien retour |
| `src/pages/Onboarding.tsx` | Lien retour |

