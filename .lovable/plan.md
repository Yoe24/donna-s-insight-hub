

## Plan : Chat Donna — Widget flottant style ChatGPT

### Fichiers

**1. Créer `src/components/DonnaChat.tsx`**

Composant autonome avec UX inspirée de ChatGPT :

**Bouton flottant :**
- `fixed bottom-6 right-6 z-50`, cercle 56px, fond `#6C63FF`, icône `MessageCircle` blanche
- Hover : `scale(1.05)` + ombre élevée, transition 200ms
- Point rouge si historique vide (premier chargement)

**Panel de chat (ouvert) :**
- `fixed bottom-24 right-6`, 400×520px, `rounded-2xl shadow-2xl`, fond blanc
- Mobile (`< 640px`) : plein écran `inset-0 rounded-none`
- Animation framer-motion : slideUp + fadeIn 200ms
- Header minimal : "💬 Donna" + bouton X discret
- Zone messages scrollable avec `scroll-smooth`, auto-scroll en bas

**Messages — style ChatGPT :**
- **Donna** : Aligné gauche, fond `#F3F4F6`, `rounded-2xl rounded-tl-sm`, avatar violet "D" (32px). Contenu rendu via `react-markdown` avec classe `prose prose-sm` pour un rendu propre des listes, gras, paragraphes.
- **User** : Aligné droite, fond `#6C63FF`, texte blanc, `rounded-2xl rounded-tr-sm`, pas d'avatar.
- Espacement généreux entre messages (gap 16px), padding interne 12px 16px.
- Timestamp discret sous chaque message (optionnel, gris clair, font-size 0.7rem).

**Input — style ChatGPT :**
- Barre en bas avec un `textarea` auto-resize (1 ligne par défaut, max 4 lignes) au lieu d'un simple input — exactement comme ChatGPT qui s'agrandit avec le texte.
- Coins arrondis (`rounded-xl`), fond `#F3F4F6`, sans bordure visible, focus = ombre légère.
- Bouton Send (icône `ArrowUp` dans un cercle violet) qui apparaît uniquement quand il y a du texte — comme ChatGPT.
- Envoi sur Enter (Shift+Enter pour saut de ligne).
- Placeholder : "Posez une question à Donna..."

**Indicateur de typing :**
- Message Donna avec 3 points animés (bounce CSS), même style qu'un message normal — comme les "thinking dots" de ChatGPT.

**Message d'accueil (statique, pas d'API) :**
- Affiché si historique vide, formaté en markdown avec les suggestions cliquables.

**Logique :**
- État : `isOpen`, `messages[]`, `input`, `isLoading`
- Persistance localStorage (`donna_chat_history`, max 50 messages)
- Envoi : ajoute message user → affiche typing → `api.post('/api/chat', { message, history: last20 })` → remplace typing par réponse
- Auto-scroll smooth vers le bas après chaque message

**2. Modifier `src/App.tsx`**

Ajouter `<DonnaChat />` dans `ProtectedRoute` :

```tsx
return (
  <>
    {children}
    <DonnaChat />
  </>
);
```

**3. Dépendance** : Ajouter `react-markdown` au package.json.

### Différences clés vs plan précédent (ajout UX ChatGPT)

- Textarea auto-resize au lieu d'un input fixe
- Bouton Send qui apparaît/disparaît selon le contenu
- Rendu markdown (`react-markdown` + `prose`) pour les réponses
- Bulles de message avec coins asymétriques (arrondi réduit côté avatar)
- Shift+Enter pour les retours à la ligne
- Scroll smooth et animation subtile à l'apparition de chaque message

