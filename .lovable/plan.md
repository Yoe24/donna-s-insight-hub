

## Plan : Transformer l'Accueil en Briefing + Créer "Fil d'actualité"

### Vue d'ensemble

L'Accueil actuel (`/dashboard`) affiche une liste brute d'emails. On va :
1. Dupliquer cette vue email dans une nouvelle page **"Fil d'actualité"** (`/fil`)
2. Transformer `/dashboard` en **page Briefing** — ce que l'utilisatrice voit en ouvrant Donna

---

### 1. Créer la page "Fil d'actualité" (`src/pages/FilActualite.tsx`)

- Copier le contenu actuel de `Dashboard.tsx` (liste d'emails, overlay de détail, compteur animé, filtres, archives)
- Page accessible via `/fil`
- Garder le comportement identique : inbox, clic sur email, overlay, feedback

### 2. Transformer `/dashboard` en Briefing

La nouvelle page Accueil affiche un **fil de briefings** chronologique, structuré ainsi :

**En-tête personnalisé :**
- "Bonjour {nom\_avocat} — Briefing du {date}, {heure}" (récupéré via `/api/config`)
- Compteur dopamine animé : "23 emails traités · 47 min gagnées · 142€ économisés"

**4 sections empilées, chacune repliable :**

| Section | Filtre emails | Style |
|---------|--------------|-------|
| 🔴 **Urgent** | `pipeline_step === "pret_a_reviser"` + détection deadline (heuristique sur le résumé) | Bordure rouge, badge count rouge |
| 📋 **À traiter** | `statut === "en_attente"` et non rejeté | Style standard, mention "brouillon prêt" si `brouillon` non null |
| 📬 **Pour info** | `pipeline_step === "filtre_rejete"` avec `categorie` connue (newsletters, CC) | Opacité réduite, résumé 1 ligne, non cliquable |
| 🚫 **Ignoré** | `pipeline_step === "filtre_rejete"` sans catégorie (spam) | Compteur seul, replié par défaut |

Chaque email dans "Urgent" et "À traiter" montre :
- Avatar + expéditeur + badge catégorie
- Résumé 2 lignes (depuis `brouillon` parsé)
- Action recommandée ("Brouillon prêt — Cliquer pour réviser")
- Clic ouvre le même `EmailDetailOverlay`

**Section "Mises à jour" (briefings horaires) :**
- Afficher des blocs horodatés basés sur les timestamps des emails
- Regrouper par tranches (matin/après-midi/soir) selon `created_at`
- Le bloc le plus récent apparaît en haut (fil inversé)

**Brief du soir (si > 17h) :**
- Résumé auto en bas : "{N} emails traités aujourd'hui. {X} réponses envoyées. {Y} actions en attente pour demain. Temps gagné : {Z}."

### 3. Mettre à jour la navigation

**`src/components/AppSidebar.tsx`** — modifier `navItems` :
```
{ title: "Accueil", url: "/dashboard", icon: LayoutDashboard },
{ title: "Fil d'actualité", url: "/fil", icon: Mail },
{ title: "Configurez-moi", url: "/configuration", icon: Settings },
```

**`src/App.tsx`** — ajouter la route :
```
<Route path="/fil" element={<ProtectedRoute><FilActualite /></ProtectedRoute>} />
```

### 4. Données

Toutes les données viennent des mêmes hooks existants (`useEmails`, `useEmailStats`, `apiGet("/api/config")`). Le classement Urgent/À traiter/Pour info/Ignoré se fait côté frontend par filtrage sur `pipeline_step`, `statut`, et `metadata.filtre.categorie`. Pas de nouvel endpoint API nécessaire.

### Fichiers modifiés/créés

| Fichier | Action |
|---------|--------|
| `src/pages/FilActualite.tsx` | **Créer** — copie de l'inbox email actuelle |
| `src/pages/Dashboard.tsx` | **Réécrire** — page Briefing |
| `src/components/AppSidebar.tsx` | **Modifier** — ajouter "Fil d'actualité" dans la nav |
| `src/App.tsx` | **Modifier** — ajouter route `/fil` |

