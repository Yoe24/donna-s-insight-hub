

## Plan : Animation de texte rotatif dans le H1

### Concept

Le H1 affiche : **"Une employée qui"** (fixe) + **texte rotatif** (fondu enchaîné, coloré).

Les phrases rotatives défilent en boucle avec une animation fade-in/fade-out :

1. "ne dort jamais."
2. "trie vos mails."
3. "rédige vos réponses."
4. "classe vos dossiers."
5. "ne prend jamais de vacances."

Le texte rotatif est affiché dans une couleur d'accent (le `primary` du thème) pour le distinguer visuellement de la partie fixe.

### Modification : `src/pages/Index.tsx`

- Ajouter un state `useState` + `useEffect` avec un `setInterval` (~3s) pour cycler entre les phrases
- Utiliser `AnimatePresence` + `motion.span` avec `key` changeant pour déclencher le fondu à chaque transition
- Animation : fade-out vers le haut + fade-in depuis le bas (slide subtle de ~10px)
- La partie fixe "Une employée qui " reste statique, seul le `motion.span` s'anime
- Le span rotatif reçoit une classe `text-primary` pour la couleur distincte

### Structure résultante

```
<motion.h1>
  Une employée qui{" "}
  <AnimatePresence mode="wait">
    <motion.span
      key={currentPhrase}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-primary"
    >
      {phrases[currentIndex]}
    </motion.span>
  </AnimatePresence>
</motion.h1>
```

Un seul fichier modifié, ~25 lignes ajoutées/changées.

