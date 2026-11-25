# Politique de confidentialité — version courte pour les parents

*Dernière mise à jour : 25 novembre 2026. Ce texte concerne le prototype OasisNet livré dans ce dépôt. Une version juridiquement validée sera nécessaire avant toute publication publique.*

## En une phrase

**OasisNet fonctionne sur l'appareil : les données de votre enfant restent sur l'appareil, chiffrées, et ne sont ni vendues, ni utilisées pour de la publicité, ni envoyées à un serveur dans ce prototype.**

## Ce que l'application enregistre

| Donnée | Pourquoi | Où |
| --- | --- | --- |
| Prénom / avatar de l'enfant, thème, centres d'intérêt | Personnaliser l'accueil et les idées de contenus | Sur l'appareil, chiffré |
| Règles parentales (sites autorisés/bloqués, mots-clés, catégories, horaires, durée) | Appliquer le contrôle parental | Sur l'appareil, chiffré |
| Code PIN **haché** (PBKDF2-SHA256 + sel) | Protéger l'espace parent | Sur l'appareil, jamais en clair |
| Historique minimal (200 événements maximum) | Vous permettre de voir consultés, recherches et blocages | Sur l'appareil, chiffré, effaçable |
| Contacts d'urgence saisis par vous | Bouton AIDE | Sur l'appareil, chiffré |
| Temps d'écran du jour | Minuterie bienveillante | Sur l'appareil, chiffré |

## Ce que l'application n'enregistre PAS

- ❌ Localisation, ❌ caméra, ❌ carnet de contacts de l'appareil, ❌ identifiant publicitaire, ❌ adresse IP dans un journal, ❌ données de santé ou diagnostics, ❌ données biométriques brutes.
- ❌ Aucun cookie tiers, aucun traceur analytics, aucune publicité, aucune publicité ciblée, aucune vente ou location de données.
- ❌ Aucun microphone ouvert automatiquement : la recherche vocale est désactivée par défaut et ne s'active qu'après **votre accord** dans les règles **et** un clic explicite de l'enfant.

## Qui peut voir les données

- **Vous**, après saisie du code PIN ou biométrie, dans l'espace parent.
- **Personne d'autre dans ce prototype** : il n'y a ni compte cloud, ni serveur, ni API externe appelée.
- Si une version future ajoute une synchronisation chiffrée, elle sera **désactivable**, documentée et soumise à votre consentement avant activation.

## Sécurité

- Chiffrement AES-GCM 256 des réglages, de l'historique et des contacts au repos.
- PIN jamais stocké en clair ; biométrie via passkey/WebAuthn (l'application ne reçoit aucune empreinte).
- Clé de chiffrement locale dans le navigateur : **limite connue du prototype web**. Les versions Android/iOS utiliseront Android Keystore / iOS Keychain.
- Aucune classification automatique n'est une garantie de sécurité : les règles parentales restent la décision finale.

## Vos droits et ceux de votre enfant

- **Voir** : onglets « Historique », « Tableau de bord », « Règles ».
- **Corriger** : modifiez profils, intérêts, sites, horaires et réglages sensoriels à tout moment.
- **Effacer** : « Effacer l'historique », « Effacer toutes les données » (onglet Confidentialité) ou « Réinitialiser » sur la porte parent.
- **Reprendre le contrôle** : bloquer immédiatement un site, une chaîne, un mot-clé ou un contenu depuis le tableau de bord.

## Changements de politique

Toute modification sera accompagnée d'une version datée et d'une note simple dans l'espace parent. Aucune nouvelle collecte ne sera activée silencieusement.

## Contact

Prototype de démonstration : aucun responsable de traitement n'est encore désigné. Avant publication, renseigner ici : nom de l'éditeur, adresse, délégué à la protection des données, autorité de contrôle compétente (CNDP au Maroc, CNIL/ICO selon le pays de diffusion).
