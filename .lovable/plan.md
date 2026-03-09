

## Problème identifié

Lors de la migration vers Supabase (`useEmails`), le dashboard a été réécrit et les éléments suivants ont été supprimés :

1. **Les 2 cartes ROI** (temps gagné + argent économisé) qui étaient en haut du dashboard
2. **Le sélecteur de période** (Jour / Semaine / Mois) avec animation

Ces éléments utilisaient `kpiByPeriod` et `computeROI` de `mock-data.ts`, qui existent toujours.

## Plan de correction

**Fichier modifié : `src/pages/Dashboard.tsx`**

- Réimporter `kpiByPeriod`, `computeROI`, `Period` depuis `mock-data.ts`
- Ajouter un state `period` (`"jour" | "semaine" | "mois"`)
- Restaurer le **sélecteur de période** (3 boutons Jour/Semaine/Mois) entre le header et les stats
- Restaurer les **2 cartes ROI** au-dessus de la grille de stats :
  - Carte 1 : icône Clock + "X h Y min gagnées"
  - Carte 2 : icône DollarSign + "X € économisés"
- Animer la transition entre périodes avec `framer-motion` (déjà importé)

Les données resteront mockées pour l'instant (comme avant), prêtes à être remplacées par des calculs Supabase plus tard.

