

## Refonte de la page Dossiers → Liste + Vue Dossier détaillée

### Architecture

La page `/dossiers` actuelle reste la liste des dossiers. On ajoute une route `/dossiers/:id` pour la vue détaillée d'un dossier. Cliquer sur un dossier dans la liste navigue vers sa vue détaillée.

### Fichiers modifiés / créés

**1. `src/lib/mock-data.ts`** — Enrichir les données mock

Ajouter des données détaillées pour chaque dossier :
- `titre` (ex: "Affaire Dupont c/ Entreprise XYZ")
- `statutDossier` (ex: "En attente du client", "Audience programmée")
- `piecesCollectees` / `piecesTotal`
- `resumeDonna` (paragraphe de synthèse IA)
- `anticipation` (texte d'alerte proactive + échéance)
- `timeline[]` (type: "recu" | "envoye" | "note", expéditeur, date, résumé)
- `datesCles[]` (label + date)
- `piecesRecues[]` (nom, type: "pdf" | "word" | "image")
- `piecesManquantes[]` (nom)

**2. `src/pages/Dossiers.tsx`** — Rendre les dossiers cliquables

Wrapper chaque Card dans un `<Link to={/dossiers/${dossier.id}}>` pour naviguer vers la vue détaillée.

**3. `src/pages/DossierDetail.tsx`** — Nouvelle page (le gros du travail)

Layout en deux colonnes dans `DashboardLayout` :

```text
┌─────────────────────────────────────────────────┐
│  Header: Titre + Badge statut + Progress pièces │
├───────────────────────────┬─────────────────────┤
│  Colonne gauche (2/3)     │  Colonne droite(1/3)│
│                           │                     │
│  ┌─ Résumé Donna ───────┐│  ┌─ Dates Clés ───┐ │
│  │ Sparkles + synthèse  ││  │ liste échéances │ │
│  └──────────────────────┘│  └─────────────────┘ │
│                           │                     │
│  ┌─ Anticipation ───────┐│  ┌─ Documents ────┐ │
│  │ AlertTriangle + texte ││  │ Pièces reçues  │ │
│  │ Bouton "Voir brouillon│  │ Pièces manquant │ │
│  └──────────────────────┘│  └─────────────────┘ │
│                           │                     │
│  ┌─ Timeline ───────────┐│  ┌─ Rechercher ──┐  │
│  │ Fil vertical épuré   ││  │ Bouton Search  │  │
│  └──────────────────────┘│  └────────────────┘  │
└───────────────────────────┴─────────────────────┘
```

Composants utilisés : Card, Badge, Progress, Button, Dialog (pour le brouillon), Alert. Icônes : Sparkles, AlertTriangle, Mail, Send, StickyNote, FileText, FileWarning, Search, Calendar, ArrowLeft.

- **Header** : Bouton retour, titre serif, Badge statut coloré, Progress bar pièces
- **Résumé Donna** : Card avec fond `bg-accent/5`, bordure `border-accent/20`, icône Sparkles dorée, paragraphe + mention "Dernière mise à jour..."
- **Anticipation** : Card avec fond `bg-amber-50 dark:bg-amber-950/20`, bordure `border-amber-200`, icône AlertTriangle amber, texte d'alerte, bouton "Voir le brouillon" qui ouvre un Dialog
- **Timeline** : Liste verticale avec ligne pointillée, icônes différentes selon le type (Mail reçu, Send envoyé, StickyNote note), date + résumé
- **Dates Clés** : Liste simple avec icône Calendar + date + label
- **Documents** : Deux sous-sections avec icônes FileText (reçues) et FileWarning (manquantes)
- **Rechercher** : Bouton pleine largeur avec icône Search

Animations framer-motion cohérentes avec le reste.

**4. `src/App.tsx`** — Ajouter la route

```tsx
<Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetail /></ProtectedRoute>} />
```

### Design

Même palette monochrome que le dashboard. L'accent visuel est mis sur la carte Anticipation via un fond amber subtil et une bordure plus marquée pour attirer l'œil immédiatement.

