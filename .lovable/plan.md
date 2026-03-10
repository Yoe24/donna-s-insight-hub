

## Protocole de coordination Frontend ↔ Backend

Compris. Voici le workflow adopté à partir de maintenant :

### À chaque modification

1. Je fais la modification frontend sur Lovable
2. Lovable push sur GitHub → Vercel déploie le frontend
3. **Si la modification touche un appel API**, je génère un message prêt à copier-coller pour OpenClaw, formaté comme suit :

```text
📋 Message pour OpenClaw :

Endpoint(s) concerné(s) : [méthode] [path]
Référence contrat API : [section du contrat]
Description : [ce que le frontend envoie/attend]
Body attendu : { ... }
Réponse attendue : { ... }
Priorité : [haute/moyenne/basse]
```

4. Tu copies ce message et le transmets à OpenClaw
5. OpenClaw implémente l'endpoint sur le VPS
6. Le frontend et le backend restent alignés via le Contrat API V1

### Ce qui ne change pas

- Le contrat API reste la source de vérité
- Les noms de champs restent identiques des deux côtés
- La base URL reste `https://187-77-173-221.nip.io`

Aucune modification de code n'est nécessaire pour ce protocole — c'est un changement de process. Je l'applique dès la prochaine demande de feature.

