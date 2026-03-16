

## Plan : Réécriture complète de `src/pages/APropos.tsx`

Le fichier actuel contient toujours l'ancienne version minimaliste. Il faut le remplacer entièrement par la page complète à 6 sections demandée.

### Contenu à implémenter dans `src/pages/APropos.tsx`

**Section 1 — Hero** (fond blanc)
- Label "NOTRE HISTOIRE", titre serif 3rem, sous-titre gris max-w-600px mentionnant Me Alexandra Fernandez.

**Section 2 — Le Constat** (fond `#F9FAFB`)
- Prose éditoriale centrée, max-w-700px, line-height 1.8, couleur `#374151`.

**Section 3 — Notre Vision** (fond blanc)
- Même style prose, texte sur l'employée numérique.

**Section 4 — Le Fondateur** (fond `#F9FAFB`)
- Layout 2 colonnes : texte à gauche + placeholder cercle gris "YT" à droite.
- Email contact@donna-legal.ai en dessous.

**Section 5 — Nos Valeurs** (fond blanc)
- 3 colonnes avec icônes Shield, Users, Lightbulb (lucide-react). Cards sans bordure.

**Section 6 — CTA** (fond `#111111`)
- Texte blanc centré + bouton blanc "Demander une démo →" vers `/login`.

### Style
- Animations framer-motion fadeUp avec `whileInView`
- Typographie serif titres, sans-serif corps
- Espacement min 80px entre sections
- Responsive : tout empilé sur mobile

### Navigation
- Déjà à jour (PublicNavbar contient "À propos" et "Sécurité", sans "Tarifs"/"Nous contacter") — pas de changement nécessaire.

### Fichier modifié
- `src/pages/APropos.tsx` — réécriture complète

