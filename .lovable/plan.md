

## Plan : Bouton "Générer un brouillon" dans le panneau détail email

### Modifications dans `src/pages/Dashboard.tsx`

**1. Ajouter l'état local pour le brouillon :**
- `draftText` (string | null) — le texte du brouillon généré
- `draftLoading` (boolean) — état de chargement
- Réinitialiser ces états quand `selectedEmail` change

**2. Pré-remplir le brouillon si déjà existant :**
- Dans le `useEffect` ou à l'ouverture du panel, vérifier si `selectedEmail.brouillon` contient du contenu qui ressemble à un brouillon de réponse (on vérifie si le champ `brouillon` contient "✉️ Brouillon" ou on utilise un champ dédié retourné par l'API)
- En pratique : on stocke le `draftText` localement et on le réinitialise à `null` à chaque changement d'email sélectionné

**3. Ajouter le bouton et l'encart après la section Résumé (ligne ~496), avant les pièces jointes :**

- **Bouton** : `outline`, petite taille, icône `PenLine` de lucide-react
  - Label initial : "✉️ Générer un brouillon de réponse"
  - Si brouillon existe : "Regénérer le brouillon"
  - Au clic : `draftLoading = true`, appel `api.post(/api/emails/${id}/draft)`, puis `draftText = response.draft`

- **État loading** : texte "Donna rédige un brouillon..." avec spinner animé

- **Encart brouillon** (affiché quand `draftText` existe) :
  - Titre : "✉️ Brouillon de réponse"
  - Fond bleu très pâle (`bg-blue-50 border-blue-100`)
  - Texte en `font-mono text-sm`
  - Bouton "Copier le brouillon" → `navigator.clipboard.writeText(draftText)` → toast "Brouillon copié !"

**4. Import `PenLine` et `Loader2` depuis lucide-react.**

Aucun autre fichier modifié. Aucun changement d'API.

