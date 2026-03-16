

## Plan : Refonte page Login — style Fyxer avec OAuth Gmail/Outlook

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/pages/Login.tsx` | Réécriture complète |
| `src/contexts/AuthContext.tsx` | Ajout `signInWithGoogle` (pour usage futur) |
| `src/pages/Onboarding.tsx` | Ajout extraction token + `verifyOtp` au chargement |

### Login.tsx — Réécriture complète

**Colonne gauche** (masquée sur mobile, `lg:w-1/2`) :
- Fond : `hero-bg.jpg` + overlay sombre (comme actuellement)
- Logo "Donna" en haut à gauche
- Accroche : « Donna a analysé 500 emails en 5 minutes. Je gagne 2h par jour. »
- 3 bullet points avec icônes Mail/Zap/PenLine :
  - "Emails triés automatiquement à mesure qu'ils arrivent"
  - "Résumés intelligents, prêts à lire"
  - "Brouillons de réponse en un clic"
- Copyright en bas

**Colonne droite** (fond blanc, `flex-1`) :
- Titre : "Commencez avec Donna"
- Sous-titre : "Donna organise vos emails immédiatement."
- **Bouton Gmail** : icône Google SVG + "Commencer avec Gmail →" — fond blanc, bordure grise, texte noir, hover bordure violette, `min-h-[56px]`, `rounded-xl`. Au clic → `api.get('/api/import/gmail/auth')` puis `window.location.href = auth_url`
- **Bouton Outlook** : icône Microsoft SVG + "Commencer avec Outlook" — même style, `opacity-50`, `disabled`, sous-texte italique "Bientôt disponible"
- Séparateur discret "ou"
- Lien "Vous avez déjà un compte ? Connectez-vous" → toggle affichage d'un mini formulaire email/password (réutilise la logique `signIn` existante)
- Bas de page : "Connexion OAuth sécurisée · Déconnexion possible à tout moment" + lien "Politique de confidentialité" → `/mentions-legales`

### AuthContext.tsx — Ajout méthode OAuth

Ajout de `signInWithGoogle()` au contexte (appelle `supabase.auth.signInWithOAuth({ provider: 'google' })`). Exposé dans l'interface mais le bouton Gmail de la page login utilisera l'endpoint API `/api/import/gmail/auth` directement (le backend gère le flow OAuth + import).

### Onboarding.tsx — Gestion du token

Dans le composant `ImportProgress`, au montage :
- Extraire `token` des query params
- Si présent, appeler `supabase.auth.verifyOtp({ token_hash: token, type: 'magiclink' })`
- Si succès : session établie, continuer normalement
- Si échec : continuer quand même (mode dégradé, l'import tourne en backend)
- Le polling de statut reste identique

### Style

- Boutons grands et centraux avec `min-h-[56px]` et `rounded-xl` (12px)
- Responsive : colonne gauche masquée sur mobile via `hidden lg:flex`
- Icônes Google et Microsoft en SVG inline pour un rendu propre

