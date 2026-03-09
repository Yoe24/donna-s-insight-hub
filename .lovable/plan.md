

## Refonte de la page Configuration → Onboarding conversationnel en 4 cartes

Remplacement complet du contenu de `src/pages/Configuration.tsx`. Le design reste cohérent avec le reste du dashboard : monochrome noir/blanc, police serif Playfair Display pour les titres, Inter pour le corps, ombres douces, bordures subtiles.

### Structure du fichier

Un seul fichier `src/pages/Configuration.tsx` avec tous les états React locaux, prêts pour une future persistance Supabase.

### Carte 1 — L'ADN et la Voix du Cabinet

- **Select** "Formule d'appel" : Cher Maître / Madame, Monsieur / Prénom
- **Select** "Formule de politesse" : Bien à vous / Cordialement / Veuillez agréer...
- **Slider** "Niveau de concision" (0-100) avec labels "Très direct" ↔ "Détaillé"
- **Slider** "Ton de la réponse" (0-100) avec labels "Factuel" ↔ "Empathique"

### Carte 2 — Entraînement IA (Cold Start)

- 3 `Textarea` expansibles, chacune intitulée "Collez un email parfait que vous avez écrit récemment (anonymisé)"
- Numérotées 1, 2, 3 pour guider l'utilisateur
- Texte d'aide sous le titre : "Donna analysera ces emails pour comprendre votre style de rédaction unique."

### Carte 3 — Le Coffre-Fort Juridique

- Zone de drag & drop stylisée (div avec bordure pointillée, icône Upload, texte explicatif). Upload visuel uniquement pour l'instant (state local avec liste de fichiers sélectionnés via `<input type="file">`).
- `Textarea` "Sources et Jurisprudences favorites" avec texte d'aide sur Dalloz, Code Civil, etc.

### Carte 4 — Règles et Workflows

- State `rules: Array<{keyword: string, action: string}>`
- Bouton "+ Ajouter une règle automatique" qui push une ligne vide
- Chaque ligne : deux `Input` côte à côte ("Si l'email contient..." → "Alors Donna doit...") + bouton supprimer (icône X)

### En bas de page

- Bouton principal "Sauvegarder et Entraîner Donna" (style `bg-accent text-accent-foreground`)
- `toast.success()` au clic

### States React préparés

```ts
const [greeting, setGreeting] = useState("cher_maitre");
const [closing, setClosing] = useState("cordialement");
const [concision, setConcision] = useState([50]);
const [tone, setTone] = useState([50]);
const [examples, setExamples] = useState(["", "", ""]);
const [files, setFiles] = useState<File[]>([]);
const [sources, setSources] = useState("");
const [rules, setRules] = useState<{keyword: string; action: string}[]>([]);
```

Composants shadcn utilisés : Card, Select, Slider, Textarea, Input, Button, Label. Tous déjà installés.

