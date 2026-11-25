# OasisNet — Mon Internet calme

Prototype interactif **fonctionnel** d'une application mobile Android/iOS pour aider un enfant (notamment autiste) à accéder à Internet dans un espace **simple, prévisible, personnalisable et sécurisé**.

> ⚠️ Ce dépôt contient un **MVP de démonstration**, pas un produit prêt à publier sur les stores. Les contenus sont locaux, le lecteur vidéo est simulé, et aucune classification automatique n'est présentée comme une garantie. Voir [Limites](#limites-et-honnêteté).

---

## Lancer le prototype

```bash
npm install
npm run dev            # http://localhost:3000 — prévisualisation en direct
npm run build          # typecheck + build de production
npm run test:smoke     # parcours automatisés (jsdom)
```

Dans la prévisualisation : l'écran de gauche présente le prototype, le « téléphone » à droite est l'application.
**Premier accès à l'espace parent** : touchez 🔒 en haut à droite, puis créez un code PIN (4 chiffres minimum). Il n'existe **aucun code par défaut**.

### Empaquetage Android / iOS

Le code est une application web mobile empaquetable avec **Capacitor** (`capacitor.config.ts`) :

```bash
npm run build
npm run cap:add:android   # nécessite Android Studio
npm run cap:add:ios       # nécessite Xcode + macOS
npm run cap:sync
```

Pour la production native, la clé de chiffrement doit être déplacée du stockage web vers **Android Keystore / iOS Keychain**, derrière la biométrie (voir `docs/ARCHITECTURE.md`).

---

## Ce qui fonctionne dans ce dépôt

### Espace enfant
- Accueil : 4 gros boutons maximum, « Autres choix » progressif, pictogrammes, phrases courtes.
- **Vidéos** : catégories illustrées, recherche texte, recherche vocale optionnelle (après activation parent + clic explicite), grandes cartes avec durée et statut `🟢 / 🟠 / 🔴`.
- **« Est-ce que cette vidéo me convient ? »** : évaluation explicable par les règles parentales, avec avertissement « jamais une garantie ».
- Lecteur simplifié : pas de commentaires, chat, publicité, recommandations, liens externes ni démarrage automatique.
- **Recherche Internet** : résultats autorisés uniquement, lecture simplifiée dans l'app, mots-clés interdits, liste blanche, comptage des résultats retirés.
- Apprendre, Musique, Favoris, **Ma routine** (maintenant / ensuite / terminé), **AIDE** avec contacts configurés par les parents et confirmation avant appel.
- **Temps d'écran** : barre visuelle, « Encore 5 minutes. Tu peux finir tranquillement. », fin de journée douce, ajout de temps par le parent.

### Espace parent (PIN haché + biométrie WebAuthn si disponible)
- Tableau de bord : temps, contenus, recherches, blocages, catégories, sites, réglages, horaires, actions rapides.
- Règles : niveau de filtrage, liste blanche/noire, mots-clés, chaînes, catégories, durée max, modules accessibles, horaires, YouTube contrôlé, modération externe préparée.
- Profils enfants multiples, centres d'intérêt, thèmes, temps quotidien, contacts d'urgence.
- Confort sensoriel : 4 thèmes, animations/sons/vibrations désactivables, transitions lentes, grands textes, interface minimaliste.
- Historique local effaçable, **recommandations jamais autonomes** (attente de validation, bloquer chaîne/site/mot-clé), éditeur de routine, confidentialité.

### Sécurité et confidentialité
- Données **locales**, chiffrées au repos (AES-GCM), PIN haché (PBKDF2-SHA256, 120 000 itérations), aucun PIN par défaut.
- Aucune publicité, aucun traceur, aucune vente de données, aucune localisation/caméra/contacts système, micro sur clic explicite uniquement.
- Historique limité à 200 événements et effaçable. Politique lisible dans l'onglet « Confidentialité ».

---

## Architecture en bref

```
src/core/        types, catalogue, moteur de règles, sources, modération, temps, sécurité, état
src/components/  design system + cadre enfant
src/screens/     child/ (9 parcours) · parent/ (9 onglets)
docs/            prototype UX, architecture, confidentialité, feuille de route
scripts/         test de parcours
```

Extensibilité : toute source implémente `ContentSource` (`search(query) → ContentItem[]`) et s'enregistre dans `registry`. Le filtrage est **toujours appliqué après** la source par `evaluateContent(item, rules)`. Ajouter Kiddle, YouTube Data API via relais serveur, un moteur safe search ou un filtre de durée ne demande aucune modification des écrans. Détails et exemples : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Documentation

| Document | Contenu |
| --- | --- |
| [`docs/UX-PROTOTYPE.md`](docs/UX-PROTOTYPE.md) | Wireframes, parcours, design system faible stimulation, accessibilité, validation familles |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Modules, pipeline de filtrage, modèles de données, sécurité, serveur optionnel, conformité, extension |
| [`docs/PRIVACY.md`](docs/PRIVACY.md) | Politique de confidentialité claire pour les parents |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | MVP livré, phases suivantes, critères de sortie |

---

## Limites et honnêteté

- Le catalogue vidéo est **local et fictif** : le prototype ne charge aucune vidéo YouTube distante. `YouTubeSource` est un adaptateur prêt à brancher sur un **relais serveur** (clé API côté serveur, quotas, modération, liste blanche).
- Le lecteur est **simulé** (image calme + progression). La version native utilisera un lecteur `youtube-nocookie` embarqué sans commentaires ni recommandations, uniquement après accord parental.
- Le chiffrement navigateur protège au repos, mais la clé vit dans le stockage local : c'est une limite connue, corrigée par Keystore/Keychain en natif.
- Les comptes parent/enfant sont **locaux** dans ce MVP ; l'authentification serveur, la synchronisation chiffrée et la modération externe sont spécifiées mais non déployées.
- Aucun algorithme ne peut déterminer avec certitude qu'un contenu convient à un enfant. L'adulte peut toujours reprendre le contrôle : c'est la règle fondamentale du produit.

---

## Tests

`npm run test:smoke` exécute les parcours principaux dans un DOM simulé : accueil → vidéos → évaluation → lecteur → fin, recherche sécurisée, création du PIN, tableau de bord, règles, historique, réglages sensoriels, et vérifie le chiffrement du stockage.
