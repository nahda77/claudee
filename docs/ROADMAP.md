# Feuille de route — OasisNet

## Phase 0 — Prototype UX complet ✅ livré

- Wireframes de tous les parcours, design system 4 thèmes, règles de faible stimulation, inventaire écrans ↔ 18 exigences (`docs/UX-PROTOTYPE.md`).
- Prototype interactif utilisable dans un navigateur, avec cadre mobile.

## Phase 1 — MVP fonctionnel ✅ livré dans ce dépôt

| Élément demandé | État | Où |
| --- | --- | --- |
| Profil parent (PIN + biométrie optionnelle) | ✅ | `parent/ParentGate.tsx`, `core/security.ts` |
| Profil enfant (+ plusieurs profils) | ✅ | `parent/ParentProfiles.tsx` |
| Écran d'accueil enfant | ✅ | `child/Home.tsx` |
| Recherche sécurisée | ✅ | `child/Search.tsx`, `core/rules.ts` |
| Accès contrôlé aux vidéos | ✅ | `child/Videos.tsx` |
| Liste blanche / noire de sites | ✅ | `parent/ParentRules.tsx` |
| Contrôle parental (règles, catégories, intérêts, horaires) | ✅ | 9 onglets parent |
| Minuterie + fin de journée douce | ✅ | `core/state.tsx`, `TimeUp` |
| Interface faible stimulation | ✅ | `styles.css`, `SensoryTab` |
| Historique côté parent | ✅ | `HistoryTab` |
| AIDE + contacts parent | ✅ | `child/Help.tsx` |
| Chiffrement local, PIN haché, politique claire | ✅ | `core/security.ts`, `docs/PRIVACY.md` |
| Architecture sources / filtres extensibles | ✅ | `core/sources.ts`, `core/rules.ts`, `core/moderation.ts` |

**Déjà allé au-delà du MVP** : évaluation « Est-ce que cela me convient ? », recommandations en attente de validation, routine, thèmes multiples, mode minimaliste, test de parcours automatisé.

## Phase 2 — Contenus réels et validation familles

1. **Relais serveur parent** : YouTube Data API v3 (clé serveur, `safeSearch=strict`, quotas), moteur safe search (Kiddle / Google CSE), normalisation `ContentItem`.
2. **Lecteur natif contrôlé** : `youtube-nocookie` en iframe, `rel=0`, sans commentaires/chat/suggestions, contrôles simplifiés, aucune lecture automatique suivante.
3. **Navigateur in-app sécurisé** : filtrage d'URL, interception des redirections, liste blanche stricte, page de lecture simplifiée par défaut.
4. **Modération serveur optionnelle** : `POST /v1/moderation/assess` avec `videoId` seul, résultats `needs-review` → 🟠, jamais de décision automatique irréversible.
5. **Bibliothèque de pictogrammes** : ARASAAC/PECS, pictogrammes personnalisables par la famille, validation avec orthophonistes/éducateurs.
6. **Biométrie native** : Capacitor + Keystore/Keychain, protection de la clé de chiffrement, verrouillage après échecs.
7. **Étude d'usage** : 10–15 familles, mesure de compréhension, détresse à la fin du temps, surcharge sensorielle, temps de blocage parent.

## Phase 3 — Fonctions avancées (toutes supervisées)

- Recommandations personnalisées enrichies **avec file de validation parentale obligatoire**.
- Commande vocale native (hors cloud si possible), synthèse vocale des consignes courtes.
- Apprentissage personnalisé : progression des autonomies paramétrée par le parent (« 2 choix → 4 choix → catégories »).
- Statistiques locales sur 7/30 jours, export chiffré, aucune donnée publicitaire.
- Multi-appareils : comptes OIDC, RBAC, synchronisation de politiques signées chiffrée de bout en bout.
- Tableau de bord professionnel (éducateur / thérapeute) **uniquement sur invitation parentale explicite**.

## Critères de sortie avant un store

- [ ] Audit de sécurité indépendant (stockage des clés, WebView, redirections, PIN).
- [ ] AIPD / analyse d'impact + validation juridique RGPD, COPPA, Kids Category, DSA minors, loi 09-08.
- [ ] Aucun SDK tiers publicitaire ou analytics dans le binaire.
- [ ] Test « contenu 🔴 non ouvrable » et « aucune recommandation sans accord » automatisés sur Android et iOS.
- [ ] Tests d'accessibilité WCAG 2.2 AA + validation familles.
- [ ] Procédure de signalement de contenu et de reprise de contrôle parent documentée.
- [ ] Politique de confidentialité finale avec responsable de traitement et contact.

## Risques identifiés

| Risque | Mitigation |
| --- | --- |
| Croire qu'un filtre garantit la sécurité | Disclaimer permanent, décision parentale obligatoire, 🟠 jamais ouvrable seul |
| Contournement via lien externe | Aucun lien externe dans le MVP ; futur navigateur in-app avec liste blanche et interception |
| Surcharge sensorielle | Animations/sons/vibrations off par défaut, 4 thèmes, mode minimal, pas de pop-up inutile |
| Détresse à la fin du temps | Messages doux, transition visuelle progressive, ajout de temps par l'adulte, AIDE toujours disponible |
| Données d'enfant excessives | Local-first, 200 événements max, effacement en un geste, aucun identifiant publicitaire |
| Dérive « réseau social » | Pas de profil public, pas de likes, pas de commentaires, pas de recommandations automatiques |
