

## Plan : Dossiers dans la barre laterale (style ChatGPT/Claude)

### Concept

Remplacer le lien "Mes dossiers" dans la sidebar par une liste dynamique des dossiers clients, triee par derniere activite. Chaque dossier affiche le nom du client et des badges de notification (+1 mail, +1 piece jointe) quand il y a du nouveau. Cliquer sur un dossier navigue vers `/dossiers/:id`.

### Modifications

**1. Creer un hook `src/hooks/useDossiers.ts`**
- Appel `apiGet('/api/dossiers')` au montage + polling toutes les 30s
- Expose `dossiers[]` tries par `dernier_echange_date` decroissant
- Interface Dossier avec champs existants (`id`, `nom_client`, `statut`, `dernier_echange_date`) + eventuels compteurs de notifications si le backend les fournit

**2. Modifier `src/components/AppSidebar.tsx`**
- Retirer "Mes dossiers" du tableau `items` (garder Accueil + Configurez-moi)
- Ajouter une deuxieme `SidebarGroup` sous la navigation principale avec le label "Dossiers"
- Utiliser le hook `useDossiers` pour lister les dossiers dynamiquement
- Chaque dossier = un `SidebarMenuItem` cliquable naviguant vers `/dossiers/:id`
- Afficher : nom du client (tronque si sidebar collapsed), initiale quand collapsed
- Badge de statut discret (point colore vert/orange)
- Indicateurs de nouveaute : petit badge "+1" a cote du nom si `dernier_echange_date` est recent (< 24h ou selon un champ du backend)
- Le dossier le plus recemment mis a jour apparait en haut
- Etat loading : 3-4 skeletons pendant le chargement
- Etat vide : petit texte "Aucun dossier" avec lien vers connexion Gmail

**3. Adapter la page `src/pages/Dossiers.tsx`**
- Garder la page comme vue "liste complete" accessible via un lien "Voir tous les dossiers" en bas de la section sidebar
- Ou la supprimer si on considere que la sidebar suffit (a confirmer)

**4. Conserver la route `/dossiers/:id`**
- `DossierDetail.tsx` reste inchange, c'est la destination des clics sidebar

### Details techniques

- Le polling du hook `useDossiers` rafraichit toutes les 30s, coherent avec `useEmails`
- En sidebar collapsed, afficher uniquement l'initiale du client + un point de couleur si activite recente
- La scroll area de la sidebar (`SidebarContent`) gerera naturellement les longues listes
- Les indicateurs "+1 mail / +1 PJ" dependent des donnees renvoyees par `GET /api/dossiers`. Si le backend ne fournit pas ces compteurs, on utilisera `dernier_echange_date` pour marquer les dossiers recemment actifs avec un simple indicateur visuel

