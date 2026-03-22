

## Plan : Supprimer la page /dossiers et rendre la sidebar scrollable

### Résumé

Supprimer la page `/dossiers` et le lien "Voir tous les dossiers →" de la sidebar. Tous les dossiers seront visibles directement dans la sidebar via scroll, sans limite de hauteur artificielle.

### Modifications

**1. `src/components/AppSidebar.tsx`**
- Supprimer le bloc "Voir tous les dossiers →" (lignes 233-243)
- Supprimer la limite `max-h-[calc(100vh-320px)]` du `ScrollArea` pour qu'il prenne tout l'espace restant (utiliser `flex-1 overflow-auto` ou garder ScrollArea sans max-h)
- Dans l'état vide (aucun dossier), remplacer le lien "Connecter Gmail" qui pointe vers `/dossiers` par un lien vers `/configuration` ou simplement un texte

**2. `src/App.tsx`**
- Supprimer la route `/dossiers` et l'import du composant `Dossiers`

**3. `src/pages/Dossiers.tsx`**
- Supprimer le fichier

