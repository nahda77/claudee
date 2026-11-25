# Prototype UX — OasisNet

> Objectif : un **assistant de navigation Internet** pour l'enfant, pas un réseau social, pas un navigateur généraliste.
> Public prioritaire : enfants autistes / TSA, besoins de prévisibilité, de faible stimulation et de compréhension explicite de « ce que je peux faire maintenant ».
> Règle fondamentale : **aider à devenir autonome sans supprimer le rôle de l'adulte**.

---

## 1. Principes de conception

| Principe | Traduction dans l'interface |
| --- | --- |
| Prévisibilité | Même structure d'écran, même barre du haut, même barre du bas, aucune surprise, aucun changement automatique |
| Charge cognitive réduite | 4 boutons maximum sur l'accueil, « Autres choix » progressif, une décision par écran |
| Communication visuelle | Pictogrammes emoji, phrases courtes (« Recherche terminée. », « Encore 5 minutes. »), pas de paragraphe dans l'espace enfant |
| Faible stimulation | Animations **désactivées par défaut**, transitions lentes optionnelles, aucun clignotement, aucun son automatique, aucune vibration par défaut, aucune notification agressive |
| Sécurité non anxiogène | 🔴 « Cette vidéo n'est pas disponible. Tu peux choisir une autre vidéo. » ; jamais de message culpabilisant ou pressé |
| Contrôle adulte | Espace parent séparé, PIN, biométrie, recommandations en attente de validation, reprise de contrôle à tout moment |
| Pas de garantie automatique | Chaque évaluation porte la mention : « Cette évaluation aide à choisir. Elle ne garantit jamais qu'un contenu est sûr. » |

### Interdits produit
Publicité ciblée ou non, traceurs tiers, pop-ups inutiles, autoplay, lecture automatique suivante, commentaires, chat, recommandations non validées, liens externes non autorisés, collecte de localisation/caméra/contacts système, notification agressive, classement algorithmique présenté comme une certitude.

---

## 2. Personas et scénarios

- **Lina, 8 ans, TSA** : comprend mieux les images que les longues phrases, sensible aux bruits soudains, a besoin de savoir « ce qui vient ensuite ».
- **Karim, parent** : veut autoriser uniquement 6 sites, bloquer une chaîne, limiter à 30 min/jour et consulter l'historique sans créer de compte cloud.
- **Nadia, parent de deux enfants** : deux profils avec thèmes et intérêts différents (animaux / musique).

### Parcours de référence (exigence 16)

```
Ouverture → « Bonjour 👋 Que veux-tu faire ? »
          → 🎬 Vidéos → « Qu'aimerais-tu regarder ? » → 🐱 Animaux
          → grandes cartes autorisées → sélection
          → « Est-ce que cette vidéo me convient ? »
             🟢 → lecteur simplifié → « Vidéo terminée. »
             🟠 → « Demande à un adulte. » + autre choix
             🔴 → « Cette vidéo n'est pas disponible. Tu peux choisir une autre vidéo. »
```

### Parcours recherche

```
🔎 Chercher → « dinosaures » → « Recherche terminée. 1 résultat autorisé. 1 résultat retiré. »
            → 📄 lecture simplifiée dans l'app → « Lecture terminée. »
            → « Demande à un adulte pour ouvrir le site complet. »
```

### Parcours d'urgence

```
🆘 AIDE (toujours visible en haut et en bas)
   → « Je ne sais pas quoi faire. »
   → 👨 Appeler papa / 👩 Appeler maman / 🧑 Demander de l'aide / ↩️ Retour
   → confirmation « Appeler papa ? Oui / Non » (jamais d'appel automatique)
```

---

## 3. Wireframes (mobile 390 × 844)

### 3.1 Accueil enfant — 4 choix maximum

```
┌──────────────────────────────┐
│ 🫧 OasisNet   ⏳ 20 min 🔒 🆘AIDE│
├──────────────────────────────┤
│ 🦊                           │
│ Bonjour 👋                   │
│ Que veux-tu faire ?          │
│ Choisis une chose.           │
│                              │
│ ⏳ Ton temps aujourd'hui     │
│ ███████░░░░░░  10/30 min    │
│                              │
│ ┌──────────┐ ┌──────────┐   │
│ │ 🎬       │ │ 🔎       │   │
│ │ Regarder │ │ Chercher │   │
│ │ une vidéo│ │ quelque  │   │
│ └──────────┘ │ chose    │   │
│              └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │ 📚       │ │ ⭐       │   │
│ │ Apprendre│ │ Favoris  │   │
│ └──────────┘ └──────────┘   │
│ ↓ Autres choix               │
├──────────────────────────────┤
│ 🏠 Accueil   🆘 Aide  🔒Parent│
└──────────────────────────────┘
```

### 3.2 Vidéos — catégories puis résultats

```
┌──────────────────────────────┐
│ Qu'aimerais-tu regarder ?    │
│ [ Écris un mot… ] [🔎]       │
│ ☰ Toutes les catégories      │
│ ┌──────────┐ ┌──────────┐   │
│ │ 🐱       │ │ 🚗       │   │
│ │ Animaux  │ │ Voitures │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │ 🎵       │ │ 📚       │   │
│ │ Musique  │ │ Apprendre│   │
│ └──────────┘ └──────────┘   │
│ ↓ Plus de catégories         │
└──────────────────────────────┘

Résultats :
┌──────────────────────────────┐
│ [🐱] Les chats               │
│      5 min · youtube-nocookie │
│      🟢 Probablement adapté   │
│ [Est-ce que cette vidéo      │
│  me convient ?]              │
└──────────────────────────────┘
```

### 3.3 Évaluation « Est-ce que cela me convient ? »

```
🟢 Probablement adapté      → [▶️ Regarder la vidéo]
🟠 À vérifier avec un adulte→ [👨‍👩‍👧 Demande à un adulte] [↩️ Autre vidéo]
🔴 Contenu bloqué           → « Cette vidéo n'est pas disponible.
                               Tu peux choisir une autre vidéo. »

Raisons courtes : « Site absent de la liste autorisée »,
« Chaîne pas encore vérifiée », « Vidéo plus longue que 12 minutes ».
Encadré permanent : « Cette évaluation aide à choisir. Elle ne garantit
jamais qu'un contenu est sûr. Un adulte peut toujours vérifier. »
```

### 3.4 Lecteur simplifié

```
┌──────────────────────────────┐
│ Tu regardes une vidéo.       │
│        🐱  (image calme)     │
│        Les chats             │
│ █████░░░░░░  1 min / 5 min  │
│   [▶️ Lire]  [⏹️ Terminer]    │
│ Pas de commentaires, chat,   │
│ publicité, recommandations   │
│ ni liens externes.           │
│ « Vidéo terminée. »          │
│ [🎬 Une autre vidéo] [🏠]    │
└──────────────────────────────┘
```

### 3.5 Routine, temps, fin de journée

```
Ma routine                     Temps presque terminé
👉 Maintenant : 📚 Activité     🕊️ Encore 5 minutes.
   Ensuite : 🎬 Vidéo           Tu peux finir tranquillement.
✅ Fait / 👉 Maintenant / Ensuite
[✅ C'est fait]                🌙 C'est terminé pour aujourd'hui.
                               À demain 👋
                               [👨‍👩‍👧 Demander à un adulte]
```

### 3.6 Espace parent

```
┌──────────────────────────────┐
│ 🔒 Espace parent      ↩️Fermer│
│ [📊][⚙️][👨‍👩‍👧][⏳][🫧][📜][💡][🧩][🔐] │
│ Tableau de bord              │
│ ┌────────┐ ┌────────┐       │
│ │Temps   │ │Recherche│      │
│ │ 12 min │ │   3    │       │
│ └────────┘ └────────┘       │
│ Actions rapides              │
│ [🚫 Bloquer][✅ Autoriser]   │
│ [➕ Ajouter site][⚙️ Règles] │
│ Activité récente + Bloquer / │
│ Autoriser par ligne          │
└──────────────────────────────┘
```

---

## 4. Design system

### Thèmes (commutables par profil)
| Thème | Usage | Caractéristiques |
| --- | --- | --- |
| `doux` | Par défaut | Fond crème, surfaces ivoire, accent sauge, ombres très légères |
| `contraste` | Besoin de lisibilité | Noir/blanc/bleu, bordures pleines, aucune ombre |
| `sombre` | Sensibilité à la lumière | Bleu ardoise, texte clair, lumière réduite |
| `minimal` | Surcharge sensorielle | Quasi monochrome, moins de décorations, sous-titres masqués |

Variables CSS : `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-soft`, `--warn-soft`, `--danger-soft`, `--radius`, `--shadow`.

### Typographie et espacement
- Police système (aucun chargement distant), 17 px par défaut, option « grands textes ».
- Titres courts, interlignage 1,2–1,5, libellés de boutons en gras.
- Cartes 20 px de rayon, zones tactiles ≥ 46 px, grille 2 colonnes maximum.

### Mouvement / son
- `data-animations="false"` par défaut sur tout le téléphone → aucune transition.
- Si activé : uniquement `background-color`, `transform`, `border-color`, `width` sur 340 ms, jamais de clignotement.
- `prefers-reduced-motion` force l'absence de mouvement, quelle que soit la configuration.
- Aucun son automatique, aucune vibration sauf action explicite et option parentale.

### Accessibilité
- Boutons natifs, `aria-label`, `role="switch"`, `role="progressbar"`, focus visible 3 px.
- Textes courts, pictogrammes redondants avec le texte, pas d'information portée uniquement par la couleur.
- Pas de zoom bloqué sur le contenu texte (`maximum-scale` reste à 1 pour la stabilité de l'app, à réévaluer avec des familles).

---

## 5. Inventaire des écrans ↔ exigences

| Exigence | Écran / module |
| --- | --- |
| 2. Accueil enfant, thèmes | `child/Home.tsx`, `parent/SensoryTab` |
| 3. YouTube adapté | `child/Videos.tsx`, `VideoDetail`, `VideoPlayer`, `core/sources.ts` |
| 4. Recherche + liste blanche | `child/Search.tsx`, `core/rules.ts`, onglet Règles |
| 5. Recommandation non autonome | `parent/RecommendationsTab`, section « Pour toi » (acceptées uniquement) |
| 6. « Est-ce que cela me convient ? » | `VideoDetail` + `evaluateContent` + disclaimer |
| 7. Contrôle parental | `parent/ParentGate.tsx`, 9 onglets |
| 8. Gestion du temps | `ChildFrame`, `TimeUp`, `parent/TimeTab`, `core/state.tsx` |
| 9. Routines | `child/Routine`, `parent/RoutineTab` |
| 10. Gestion sensorielle | `parent/SensoryTab`, attributs `data-*` du téléphone |
| 11. Communication visuelle | Design system + phrases courtes |
| 12. Mode urgence / aide | `child/Help`, contacts parent, confirmation d'appel |
| 13. Architecture | `core/`, `docs/ARCHITECTURE.md`, Capacitor |
| 14. Confidentialité | `parent/PrivacyTab`, `docs/PRIVACY.md`, `core/security.ts` |
| 15. Design | `src/styles.css` |
| 16. Parcours exemple | Test automatisé `scripts/smoke.mjs` |
| 17. Tableau de bord | `parent/ParentDashboard.tsx` |
| 18. Priorités | `docs/ROADMAP.md` |
| 19. Règle fondamentale | Disclaimer sur chaque évaluation + validation parentale obligatoire |

---

## 6. Validation prévue avec les familles

1. **Observation** : l'enfant trouve-t-il « Vidéos » en moins de 5 s sans aide ?
2. **Compréhension** : que signifie 🟠 pour l'enfant ? Reformuler si besoin avec des pictogrammes PECS/ARASAAC (à intégrer en phase 2).
3. **Transition** : la fin du temps est-elle vécue sans détresse ? Ajuster les mots avec les parents.
4. **Surcharge** : tester les 4 thèmes et le mode minimal, mesurer les abandons.
5. **Parent** : bloquer une chaîne en moins de 30 s depuis l'historique.
6. **Sécurité** : vérifier qu'aucun contenu 🔴 n'est ouvrable et qu'aucune recommandation n'apparaît sans accord.

> Les pictogrammes emoji sont une solution de prototype. Une version thérapeutique doit proposer une bibliothèque de pictogrammes validés, personnalisables par la famille, et une validation avec des professionnels (orthophonistes, éducateurs, ergothérapeutes).
