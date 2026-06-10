# Mémoire projet — Cdm-2026-simulator

Notes de travail et décisions importantes prises au fil des sessions.

## Préférences utilisateur

- Demande **toujours le feu vert** avant de modifier du code (`Alerter avant tout codage`).
- Communique en **français**, court et dense.
- N'aime pas les scrollbars horizontaux (header sur 1 ligne, pas de bracket qui déborde en vue globale).
- Préfère des couleurs **bien marquées** plutôt que pastels invisibles (cf. accentuation Classement +500 %).
- Quand un visuel ne fonctionne pas, propose le **concept d'abord** (ASCII mockup) puis attend validation avant de coder.

## Sources de données officielles

- **Forces, positions de tirage, calendrier groupes/KO** : `Coupe du Monde 2026 - Dossier.docx` fourni le 8/06/2026. Le XML extrait via PowerShell + `Expand-Archive` (renommé en .zip).
- **Classement FIFA top 100** : version officielle du **10 juin 2026**, injectée à partir de 8 captures d'écran fournies par l'utilisateur (CF1-10, CF11-24, CF25-38, ..., CF95-108).
- **Site SPA FIFA non scrapable directement** — historiquement on extrayait `__NEXT_DATA__` du HTML SSR puis on appelait l'endpoint API. Désormais l'injection manuelle depuis captures est plus simple à chaque maj FIFA (toutes ~6 semaines).

## Décisions techniques

1. **i18n custom** (pas de react-i18next) — context + dictionnaire flat. Moins lourd.
2. **9 langues** : fr (défaut), en, es, ar (RTL), de, pt, zh, ja, ko.
3. **Heure source = Alger GMT+1** car c'est ce que donne le dossier officiel. Picker convertit en 19 fuseaux.
4. **ELO et Points FIFA séparés** — formules différentes (base 400 vs 600, K-factor vs I-factor).
5. **Simulation pondérée par Force + α** plutôt que par classement FIFA (Force = donnée officielle du dossier).
6. **Bracket progressif** dès 1 match joué (pas d'attente fin de phase de groupes).
7. **Best-thirds** : top 8 affectés aux slots dans l'ordre d'apparition (simplification — l'algo FIFA officiel est plus complexe).
8. **CSS global** dans `index.css`, pas de Tailwind/CSS-in-JS — préférence stabilité.

## Choix UX validés

- Page « Équipes » renommée → **« Paramètre de simulation »** (et traduit).
- Onglet « 2ème tour » → **« Phase Finale »** (et traduit).
- Page Matchs organisée par **section Journée 01/02/03 + phases KO**, ordre chronologique strict.
- Page Classement FIFA top 100 : recherche live + tri sur 6 colonnes.
- Phase Finale : **5 niveaux de zoom progressif** (Vue globale → R16 → QF → SF → Finale), navigation `←/→/Esc` + clics tabs.
- Forces éditables par équipe via slider/input/boutons ± (vert/rouge).
- **Facteur de hiérarchie** sur Paramètre de simulation : 5 presets de α (Chaos 0.2 → Strict 2.0).

## Limites de l'environnement

- WebFetch ne peut pas exécuter de JS → SPA non scrapables. Solution : passer par `Invoke-WebRequest` + extraction `__NEXT_DATA__` côté serveur.
- Le sandbox refuse certaines actions (un test PowerShell avait échoué pendant une indisponibilité Opus → fallback en réessayant).
- Quand un commit est attendu, vérifier que le projet est bien un repo git (le scaffold Vite ne fait pas `git init`).

## Choses non faites (TODO si jamais)

- Algorithme officiel FIFA d'attribution des 8 meilleures 3<sup>es</sup> aux slots R32 (prend en compte les combinaisons de groupes d'origine).
- Horaires précis des matchs R16/QF/SF/Finale (les valeurs actuelles sont raisonnables mais non issues du dossier officiel).
- Audit RTL approfondi pour la version arabe (quelques composants pourraient mal s'aligner).
- Prochaine maj du classement FIFA prévue ~6 semaines après le 10/06/2026.
