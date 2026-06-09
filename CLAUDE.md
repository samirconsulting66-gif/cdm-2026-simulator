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
    fifaWorldRanking.ts           # Top 100 FIFA (avril 2026 top 20 + sept 2025 reste)

  lib/
    standings.ts                  # computeStandings + best thirds + groupStageProgress
    bracket.ts                    # resolveBracket (propagation progressive R32→Finale)
    random.ts                     # simulateEverything(forceOverrides, α) — Poisson basé sur Force
    elo.ts                        # computeElos — ELO classique + Points FIFA SUM + historique
    time.ts                       # shiftDateTime + TIMEZONE_OPTIONS (19 fuseaux)

  store/
    SimulationStore.tsx           # state global : groupMatches, knockout, forceOverrides, simFactor
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
- **Heures stockées en GMT+1 (Alger)** = `SOURCE_TZ_OFFSET = 1` dans `lib/time.ts`. Le picker convertit pour l'affichage.
- **Sortie API FIFA limitée** : les ID `FRS_Male_Football_*` (recent) retournent vide via legacy `/api/ranking-overview`. Le top 20 actuel vient de Wikipedia avril 2026 ; les rangs 21-100 du dump API id14870 (sept. 2025). Re-essayer après le 11/06/2026 quand FIFA publie la nouvelle version.
- **i18n** : pour ajouter une langue, créer `src/i18n/<code>.ts`, étendre `Language` dans `types.ts`, ajouter à `LANGUAGES`, et au `ALL` dans `index.tsx`. Ajouter aussi les entrées dans `teamNames.ts`, `stadiumLabels.ts`, `timezoneHints.ts`.

## Limitations connues

- Calendrier post-FIFA-officiel pour les **horaires KO** (R16+) : valeurs raisonnables choisies à la main car le dossier ne les donne pas.
- Les 8 meilleurs 3ᵉˢ sont rangés par classement courant et affectés dans l'ordre d'apparition des slots (`M74, M77, M79, M80, M81, M82, M85, M87`). Ce n'est pas l'algorithme officiel FIFA qui prend en compte les groupes d'origine — différence visible en cas d'égalité parfaite.
- Le rendu RTL (arabe) est appliqué globalement via `document.documentElement.dir`. Quelques composants pourraient bénéficier d'un audit plus approfondi (ex. ordre des cartes dans les groupes).
