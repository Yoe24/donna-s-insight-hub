

## Plan : Ajouter le champ "Profil de personnalité" dans la page Configuration

### Fichier modifié : `src/pages/Configuration.tsx`

**1. Nouvel état :**
- `const [profil_style, setProfilStyle] = useState("")`

**2. Chargement :** Dans le `useEffect`, lire `config.profil_style` et alimenter l'état (ligne 45).

**3. Sauvegarde :** Ajouter `profil_style` dans le body du `api.put('/api/config', { ... })` (ligne 70-75).

**4. Nouvelle section Card** insérée entre la Card "Exemples d'emails" (ligne 248) et la Card "Base de connaissances" (ligne 251) :

- Import `Sparkles`, `ChevronDown` depuis lucide-react + `Collapsible, CollapsibleTrigger, CollapsibleContent` (déjà disponible dans le projet)
- Card avec icône `Sparkles` + titre "Profil de personnalité" + sous-titre explicatif
- Un `Collapsible` avec bouton "Comment obtenir mon profil ?" qui déplie les 4 étapes (texte statique avec le prompt ChatGPT dans un bloc `bg-muted rounded p-3 font-mono text-xs`)
- Un `Textarea` avec `min-h-[200px]`, placeholder "Collez le profil généré par ChatGPT ici...", lié à `profil_style`

Aucun autre fichier modifié. Aucun changement d'API côté appel.

