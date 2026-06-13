# Cdm-2026-simulator — Note de contexte projet

Simulateur de la Coupe du Monde FIFA 2026 (48 équipes, 12 groupes, USA/Canada/Mexique).
Vite + React 19 + TypeScript 6, sans dépendance UI tierce.

## Stack & commandes

```bash
npm install                       # 1er setup
$env:NODE_OPTIONS="--use-system-ca"   # nécessaire sur cette machine (cert TLS)
npm run dev                       # http://localhost:5173
npm run build                     # tsc -b + vite build
npx tsc -b --noEmit               # type-check seul
```

## Arborescence

```
src/
  App.tsx                         # Shell + tabs + LanguageProvider/TimezoneProvider/SimulationProvider
  types.ts                        # Team, GroupMatch, KnockoutMatch, Standing, Confederation, GroupLetter
  index.css                       # CSS global (pas de Tailwind / module / styled)

  data/
    teams.ts                      # 48 équipes (force, groupPosition, fifaRank, fifaPoints…)
    groups.ts                     # 72 RAW_FIXTURES + buildInitialGroupMatches()
    bracket.ts                    # 32 BRACKET_SLOTS (M73–M104, seeds 1A..3-ABCDF, W74..)
    stadiums.ts                   # 16 stades (id, name, city, country)
    fifaWorldRanking.ts           # Top 100 FIFA officiel — 10 juin 2026

  lib/
    standings.ts                  # computeStandings + best thirds + groupStageProgress
    bracket.ts                    # resolveBracket + matching bipartite des 3ᵉˢ aux slots
    random.ts                     # simulateEverything / simulateGroupsOnly / simulateKnockoutOnly
    elo.ts                        # computeElos — ELO classique + Points FIFA SUM + historique
    time.ts                       # shiftDateTime + TIMEZONE_OPTIONS (19 fuseaux)
    snapshot.ts                   # SimSnapshot + create/download/readFile (export JSON v1)
    saveSlots.ts                  # slots nommés en localStorage (max 30, tri par date desc)

  store/
    SimulationStore.tsx           # state global + getSnapshot()/loadSnapshot()
    TimezoneStore.tsx             # offset GMT + shift()

  i18n/
    index.tsx                     # I18nProvider + useT()
    types.ts                      # Translations interface + LANGUAGES (9)
    fr.ts en.ts es.ts ar.ts de.ts pt.ts zh.ts ja.ts ko.ts
    teamNames.ts                  # 100 équipes × 9 langues
    stadiumLabels.ts              # 16 stades × 9 langues
    timezoneHints.ts              # 19 fuseaux × 9 langues

  components/
    Flag.tsx                      # img <flagcdn.com/wXX/code.png>
    FilterDropdown.tsx            # dropdown custom générique (utilisé sur Matchs)
    LanguagePicker.tsx            # popover 9 langues avec drapeaux
    TimezonePicker.tsx            # popover 19 fuseaux groupés par continent
    SimFactorPicker.tsx           # 5 boutons Chaos→Strict (α de 0.2 à 2.0)
    SavePicker.tsx                # popover : input nom + liste slots (charger/supprimer)
    ExportPicker.tsx              # popover : Exporter .json / Importer fichier

  pages/
    MatchesPage.tsx               # 104 matchs en sections : J1/J2/J3/R32/.../Finale
    StandingsPage.tsx             # 12 groupes + Meilleures 3èmes (couleurs accentuées)
    BracketPage.tsx               # « Phase Finale » avec zoom progressif 5 niveaux
    TeamsPage.tsx                 # « Paramètre de simulation » : Force éditable + SimFactor
    FifaRankingPage.tsx           # Top 100 avec recherche + tri colonnes
```

## Modèle de simulation

- **Force** ∈ [47, 93], source = dossier officiel CdM 2026 (custom à la CdM).
- **λ (Poisson)** = `1.25 + α · (Force_me − Force_opp) / 12`, clampé [0.15, 5.5].
- **α (simFactor)** : 0.2 (Chaos) / 0.6 (Surprenant) / **1.0 (Standard)** / 1.5 (Marqué) / 2.0 (Strict).
- **TAB** : prob = 0.5 ± α × diff × 0.005, clampée [0.35, 0.65].
- **ELO interne** : K-factor variable (30 groupes → 60 finale), formule classique `R + K·G·(S−E)` avec base 400.
- **Points FIFA (SUM officielle)** : `P + I·(W−We)` avec base 600, I = 35 (groupes) → 60 (SF/3e/Finale), W = 0.75/0.5 sur TAB.
- **Bracket progressif** : `resolveBracket` se lance dès le 1ᵉʳ score, les seeds 1A/2A/3-ABCDF se remplissent en temps réel selon le classement courant.
- **Matching des 8 meilleurs 3ᵉˢ** : **tableau FIFA officiel** (`src/data/fifaThirdPlaceTable.ts`, 495 entrées extraites de FWC26_regulations_EN.pdf pages 80-97). Pour chaque combinaison de 8 groupes qualifiés, le tableau donne le mapping exact slot → groupe. Fallback en backtracking bipartite si la combinaison n'est pas trouvée (sécurité).

## Conventions importantes

- **Pas de modif sans accord** explicite (règle `feedback_app_prospection_consent` du contexte global).
- Toutes les pages utilisent **`useT()`** → `t.xxx`, `format()`, `teamName(id)`, `stadiumLabel(id)`.
- Persistance `localStorage` :
  - `cdm2026-sim-v6` : groupMatches + knockout
  - `cdm2026-forces` : overrides de Force
  - `cdm2026-simfactor` : α
  - `cdm2026-tz` : offset GMT
  - `cdm2026-lang` : langue
  - `cdm2026-page` : page courante (matches / standings / bracket / teams / fifa)
  - `cdm2026-bracket-zoom` : niveau de zoom Phase Finale (0-4)
  - `cdm2026-save-slots` : slots de sauvegarde nommés (`SaveSlot[]`)
- **Heures stockées en GMT+1 (Alger)** = `SOURCE_TZ_OFFSET = 1` dans `lib/time.ts`. Le picker convertit pour l'affichage.
- **Classement FIFA top 100** : version du **10 juin 2026** (dernière maj officielle FIFA). Données injectées manuellement depuis captures, top 100 complet. À ré-actualiser à la prochaine maj FIFA (~6 semaines).
- **i18n** : pour ajouter une langue, créer `src/i18n/<code>.ts`, étendre `Language` dans `types.ts`, ajouter à `LANGUAGES`, et au `ALL` dans `index.tsx`. Ajouter aussi les entrées dans `teamNames.ts`, `stadiumLabels.ts`, `timezoneHints.ts`.

## Header (2 lignes)

- Ligne 1 : `Brand` à gauche · `LanguagePicker · TimezonePicker | SimulateButtons | SavePicker · ExportPicker | ResetButton` à droite.
- Ligne 2 : tabs (`Matchs · Classement · Phase Finale · Paramètre · Classement FIFA`).
- `zoom: 0.9` sur `:root` + `zoom: 1.12` sur `.app-header` pour une barre légèrement plus grande que le reste.

## Simulation

- 3 boutons dans le groupe 🎲 : **Tout** (groupes + KO), **Groupes** (phase de groupes seule), **Phase finale** (KO seul, basé sur les résultats de groupes courants ; désactivé tant que les 72 matchs ne sont pas joués).
- Pas d'auto-zoom de la Phase Finale après simulation — le niveau choisi est conservé.

## Sauvegarde / Export

- **Sauvegarder** (`SavePicker`) : slots nommés en `localStorage` (`cdm2026-save-slots`, max 30). Écrasement par nom avec confirmation. Charger/Supprimer par slot.
- **Exporter** (`ExportPicker`) : télécharge un JSON versionné (`type: "cdm2026-sim-snapshot"`, `version: 1`) contenant `{ groupMatches, knockout, forceOverrides, simFactor }`. Importer valide le format avant d'écraser l'état courant.

## Limitations connues

- Calendrier post-FIFA-officiel pour les **horaires KO** (R16+) : valeurs raisonnables choisies à la main car le dossier ne les donne pas.
- Le rendu RTL (arabe) est appliqué globalement via `document.documentElement.dir`. Quelques composants pourraient bénéficier d'un audit plus approfondi (ex. ordre des cartes dans les groupes).
