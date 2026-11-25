# Architecture technique — OasisNet

## 1. Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                    Application mobile (1 code)                │
│  React + TypeScript + Vite  ──►  Capacitor ──► Android / iOS  │
├──────────────────────────────────────────────────────────────┤
│ UI  src/screens/child/* · src/screens/parent/* · components/ │
├──────────────────────────────────────────────────────────────┤
│ État  src/core/state.tsx (reducer + contexte + persistance)   │
│       ├── rules.ts       moteur de filtrage explicable        │
│       ├── sources.ts     registre de sources de contenu       │
│       ├── moderation.ts  fournisseurs de modération          │
│       ├── time.ts        horaires                            │
│       ├── security.ts    AES-GCM, PBKDF2, WebAuthn            │
│       └── catalog.ts     données de démonstration             │
├──────────────────────────────────────────────────────────────┤
│ Stockage local chiffré (navigateur) / Keystore-Keychain (natif)│
└──────────────────────────────────────────────────────────────┘
                    │ optionnel, jamais obligatoire
                    ▼
        Relais serveur parent (auth, quotas, modération)
```

**Décision structurante** : les sources renvoient des contenus **bruts** ; le filtrage est **toujours** appliqué ensuite, côté appareil, par le même moteur. Une nouvelle source ne peut donc pas contourner les règles parentales.

---

## 2. Modèle de données (`src/core/types.ts`)

| Entité | Champs principaux |
| --- | --- |
| `ContentItem` | `id`, `kind` (video/page/music/activity), `simpleTitle`, `category`, `emoji`, `color`, `site`, `channel?`, `durationSec?`, `summary`, `tags`, `externalId?` |
| `RuleSet` | `level`, `whitelistOnly`, `allowedSites`, `blockedSites`, `blockedKeywords`, `allowedCategories`, `blockedChannels`, `trustedChannels`, `maxVideoMinutes`, `requireAdultForUncertain`, `youtubeManaged`, `voiceSearchEnabled`, `externalModeration`, `enforceSchedules`, `enabledSections` |
| `ChildProfile` | `id`, `name`, `emoji`, `theme`, `interests`, `favorites`, `dailyMinutes`, `bonusMinutes`, `secondsUsed`, `dayStamp`, `routine` |
| `HistoryEntry` | `id`, `at`, `profileId`, `type`, `label`, `detail?`, `site?` (200 max) |
| `Recommendation` | `id`, `itemId`, `profileId`, `reason`, `status` (`pending` → `approved` / `rejected`), `decidedAt?` |
| `ParentAccount` | `pinHash`, `salt`, `biometricCredentialId?`, `createdAt` |

L'état complet est `AppState`, versionné (`version: 1`) et fusionné avec les valeurs par défaut au chargement : l'ajout d'une règle ne casse pas les données existantes.

---

## 3. Pipeline de sécurité d'un contenu

```
1. Source.search(query)            → ContentItem[] bruts
2. evaluateContent(item, rules)    → FilterResult { status, label, reasons[], needsAdult }
     a. mots-clés interdits        → 🔴 bloqué
     b. site / chaîne bloqués      → 🔴 bloqué
     c. liste blanche              → 🔴 si site absent
     d. catégorie non autorisée    → 🔴 (strict) ou 🟠
     e. needsReview / durée /      → 🟠 à vérifier
        chaîne non connue (strict)
     f. sinon                      → 🟢 probablement adapté
3. UI enfant :
     🟢 → lecteur simplifié
     🟠 → « Demande à un adulte », aucune ouverture automatique
     🔴 → « Cette vidéo n'est pas disponible. »
4. Disclaimer permanent : aucune garantie absolue.
```

Le résultat est **explicable** (`reasons` en français court) et **deterministe**. Il n'y a aucun score opaque. Une modération externe peut compléter, jamais remplacer, la décision parentale.

### Ajouter un filtre (exemple)

```ts
// src/core/rules.ts — dans evaluateContent(), avant le retour final
if (item.durationSec && item.durationSec < 60) {
  uncertain.push('Vidéo très courte : à confirmer');
}
```

Aucun écran n'est à modifier : `FilterResult` transporte déjà le statut, le libellé et les raisons.

### Ajouter une source (exemple Kiddle / moteur safe search)

```ts
// src/core/sources.ts
export class KiddleSource implements ContentSource {
  id = 'kiddle';
  label = 'Kiddle (relais)';
  kinds: ContentItem['kind'][] = ['page'];
  constructor(private proxyUrl: string) {}
  async search(query: string): Promise<ContentItem[]> {
    const r = await fetch(`${this.proxyUrl}/search?provider=kiddle&q=${encodeURIComponent(query)}`);
    if (!r.ok) return [];
    return (await r.json()).items as ContentItem[];
  }
}
registerSource(new KiddleSource(import.meta.env.VITE_PROXY_URL ?? ''));
```

`searchAllSources()` déduplique par `id`, isole les erreurs d'une source (`catch → []`) et applique ensuite `evaluateAll()`.

### Modération

`ModerationProvider` (`src/core/moderation.ts`) : `assess(item) → { available, flag, note }`.
- `LocalModerationProvider` : actif, ne classe rien (« la décision appartient aux parents »).
- `ServerModerationProvider` : adaptateur non configuré ; envoie **uniquement** `videoId`, jamais de donnée sur l'enfant.

---

## 4. État, temps et persistance

- `AppProvider` : `useReducer` + contexte, actions typées (`rules`, `log`, `favorite`, `tick`, `bonus`, `decideRecommendation`, …).
- Persistance asynchrone et débouncée (300 ms) via `saveState()` : `JSON` → AES-GCM 256 avec IV aléatoire → `localStorage`.
- `loadState()` déchiffre, fusionne avec les defaults, puis affiche l'app (écran « On prépare ton espace calme… » pendant le chargement).
- **Temps** : `tick` toutes les 5 s uniquement dans l'espace enfant ; remise à zéro automatique au changement de jour (`dayStamp`) ; `bonusMinutes` non reporté.
- **Horaires** : `isWithinSchedules()` (gère les plages traversant minuit). Si `enforceSchedules`, l'enfant voit un écran calme hors plage ; l'AIDE reste disponible.
- **Historique** : 200 entrées maximum, suppression en un geste, aucun identifiant publicitaire.

---

## 5. Sécurité et authentification

| Besoin | MVP (ce dépôt) | Production |
| --- | --- | --- |
| Code PIN | PBKDF2-SHA256, 120 000 itérations, sel aléatoire, haché ; aucun code par défaut | Idem + politique de tentatives et verrouillage temporaire |
| Biométrie | WebAuthn/platform authenticator si disponible, PIN de repli | Capacitor Biometric + Keystore/Keychain |
| Chiffrement | AES-GCM des réglages, historique et contacts | Clé dans Keystore/Keychain, chiffrement de bout en bout pour la synchro |
| Comptes | Profils locaux, espace parent séparé | OIDC/OAuth2, RBAC parent/enfant, jetons courts, MFA parent |
| Règles côté serveur | Non nécessaires (local-first) | Politique signée, synchronisée, appliquée **aussi** côté serveur (défense en profondeur) |
| Modération | Règles locales | Relais serveur + liste blanche + review humaine, journal minimal |

### Limite connue du navigateur
La clé AES est stockée dans le `localStorage` du navigateur : cela protège d'une lecture naïve des données mais pas d'un attaquant ayant déjà un accès au profil navigateur. Les builds natifs **doivent** utiliser Android Keystore / iOS Keychain. C'est documenté dans l'application, onglet Confidentialité.

### Permissions
Aucune localisation, caméra, contacts système, notification agressive. Le micro n'est ouvert que si `voiceSearchEnabled` ET sur clic explicite de l'enfant ; `SpeechRecognition` est détecté à l'usage et échoue proprement si indisponible.

---

## 6. Relais serveur optionnel (spécification, non déployé)

Endpoints prévus, tous authentifiés par le compte **parent** :

```
POST /v1/policies            règles signées par profil
GET  /v1/youtube/search?q=   YouTube Data API v3, clé côté serveur, quota, safeSearch=strict
GET  /v1/search?q=           moteur sécurisé (Kiddle / Google CSE / Brave) + liste blanche
POST /v1/moderation/assess   { videoId } uniquement, aucun profil enfant
GET  /v1/health              disponibilité
```

Règles serveur :
- Aucune clé API dans l'app ; `youtube-nocookie.com` uniquement pour le lecteur.
- Réponses normalisées en `ContentItem`, puis **re-filtrées sur l'appareil**.
- Journalisation minimale : horodatage, code de décision, pas de requête brute associée à un enfant, rétention courte et configurable.
- Pas de publicité, pas de profilage, pas de revente, pas d'analytics tiers.

---

## 7. Conformité (à valider juridiquement avant publication)

- **RGPD / loi 09-08 (Maroc)** : minimisation, base légale consentement parental, droit d'accès/rectification/effacement/portabilité, registre des traitements, DPO si nécessaire.
- **COPPA (US) / Age Appropriate Design Code (UK) / DSA minors** : vérification de l'âge, consentement vérifiable du parent, paramètres les plus protecteurs par défaut, pas de profilage publicitaire, pas de « dark patterns ».
- **Analyse d'impact (AIPD)** : obligatoire avant déploiement à grande échelle sur des données d'enfants.
- **Accessibilité** : WCAG 2.2 AA visé ; validation complémentaire avec des familles et professionnels pour les pictogrammes.
- **Stores** : politique « Kids » Google Play / Apple Kids Category, absence de SDK publicitaires et d'analytics tiers.

---

## 8. Qualité

```bash
npm run build        # tsc strict + Vite
npm run test:smoke   # parcours enfant/parent + vérification du chiffrement
npm run dev          # prévisualisation
```

`scripts/smoke.mjs` monte l'application dans `jsdom` avec `crypto.subtle` réel et parcourt : accueil → vidéos → évaluation → lecteur → fin, recherche sécurisée, création du PIN (PBKDF2 réel), tableau de bord, règles, historique, réglages sensoriels, puis vérifie la présence d'un ciphertext dans le stockage.

---

## 9. Ce qui reste volontairement ouvert

- Lecteur YouTube réel (`externalId` → iframe `youtube-nocookie`, `rel=0`, pas de commentaires, pas de suggestions, contrôles simplifiés).
- Navigateur in-app avec filtrage d'URL et interception des redirections (le prototype ouvre une **lecture simplifiée locale**, jamais un site externe).
- Pictogrammes ARASAAC/PECS personnalisables, synthèse vocale des consignes, commande vocale native.
- Statistiques longitudinales, apprentissage personnalisé **supervisé par le parent**.
- Multi-appareils, sauvegarde chiffrée, audit de sécurité indépendant et tests d'usage en situation réelle.
