# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Portfolio personnel mono-page de Romain Sergio, en ligne sur https://romainsergio.web.app.
Tout le contenu éditorial, les commentaires de code et les messages de commit sont **en français** — s'y tenir.

Pas de framework, pas de bundler, pas de `node_modules`, aucune étape de build : HTML/CSS/JS natifs servis
en statique par Firebase Hosting. Trois fichiers portent la quasi-totalité du site :
[index.html](index.html), [tooplate-neural-style.css](tooplate-neural-style.css),
[tooplate-neural-scripts.js](tooplate-neural-scripts.js).

## Commandes

```bash
# Développement local (n'importe quel serveur statique)
python -m http.server 8080        # puis http://localhost:8080
npx serve .
firebase serve

# Déploiement — le compte doit être précisé, le projet `romainsergio`
# appartient à sergiohazary@gmail.com et non au compte CLI actif
firebase deploy --only hosting --account sergiohazary@gmail.com
```

Aucun test, aucun linter dans le dépôt. La vérification se fait en ouvrant la page et en
contrôlant à la main : navigation, filtres projets, formulaire, rendu mobile.

## Règle structurante : le template n'est pas modifié

Le site part du template [Tooplate 2139 Neural Portfolio](https://www.tooplate.com/view/2139-neural-portfolio).
Sa copie d'origine intacte vit dans [2139_neural_portfolio/](2139_neural_portfolio/) à titre de référence —
ne jamais l'éditer, elle n'est pas déployée.

Dans `tooplate-neural-style.css`, **rien au-dessus de la bannière « AJOUTS » (ligne ~1811) n'a été touché**.
Tout style ajouté va dans cette section, organisée en blocs lettrés (A accessibilité, B infobulles du rail,
C boutons du hero, D bloc Langues, E captures de projets, F formulaire, G préférences de mouvement,
H largeur du contenu). Ajouter dans le bloc correspondant plutôt qu'en fin de fichier.

L'esthétique du template et le rail de navigation vertical à gauche sont voulus : corriger le fonctionnel,
pas le design.

## Architecture

### Mise en page et rail de navigation
Le rail `#navbar` est un bandeau **vertical** en `position: fixed` à gauche (≈75 px : 15 px de décalage +
60 px de large). Deux conséquences qui reviennent sans cesse :

- Il ne participe pas au flux, donc le contenu se centrerait sur toute la fenêtre et paraîtrait décalé.
  La variable CSS `--rail-space: 75px` réserve sa place. Toute autre valeur décale le centre optique.
- `getNavOffset()` dans le JS ne doit **pas** retrancher la hauteur de `#navbar` : un rail latéral centré ne
  masque rien verticalement. L'avoir fait posait l'indicateur de section une icône trop haut à chaque clic.
  Le saut d'ancre et la détection de section active partagent volontairement le même repère vertical.

### JavaScript (`tooplate-neural-scripts.js`, un seul fichier, sans module)
Tout est en IIFE/handlers attachés au chargement. Blocs, dans l'ordre :

1. **Fond animé neuronal** (canvas) — densité proportionnelle au viewport, `devicePixelRatio` plafonné à 1.5,
   voisinage calculé via une grille spatiale de cellules `LINK_DISTANCE` (pas de comparaison toutes paires),
   animation stoppée quand l'onglet passe en arrière-plan.
2. **Navigation** — `setActiveSection` / `currentSectionId` / `updateActiveNav` ; la détection est mise en
   pause pendant le défilement fluide déclenché par un clic, sinon l'indicateur clignote en traversant les
   sections. `onScroll` est synchronisé sur `requestAnimationFrame`, pas sur l'événement.
3. **Barres** compétences et langues, révélées au défilement.
4. **Filtres projets** — pilotés par `data-category` sur `.project-card` et `data-filter` sur `.filter-btn`.
   Le masquage utilise la propriété `hidden` (et pas seulement une classe CSS) pour sortir la carte de
   l'ordre de tabulation ; `#projects-count` en `aria-live` annonce le nombre affiché.
5. **Formulaire de contact** — voir ci-dessous.

`reduceMotion` (`prefers-reduced-motion`) est lu une fois en tête de fichier et conditionne animations et
fond animé partout.

### Formulaire de contact
Envoi réel via [Web3Forms](https://web3forms.com), sans backend. La clé est la variable `WEB3FORMS_KEY` en
tête de `tooplate-neural-scripts.js` et **n'est pas encore renseignée** (valeur `REMPLACER_PAR_VOTRE_CLE_WEB3FORMS`).
Tant qu'elle est absente, `fallbackToMailto()` bascule sur un e-mail pré-rempli : aucun message n'est perdu.
Le même repli couvre l'échec réseau et le garde-fou de 15 s. Validation champ par champ en français,
états chargement/succès/erreur annoncés en `aria-live`, piège à robots.

### Accessibilité — contraintes à respecter sur toute modification
Structure sémantique `header`/`nav`/`main`/`section`/`footer`, lien d'évitement, `aria-label` sur chaque
lien-icône, `<label>` visible sur les 5 champs du formulaire, `aria-current` sur la navigation,
`aria-pressed` sur les filtres. Ne pas régresser en ajoutant du markup.

### Images et poids
Les captures de projets sont en WebP 800×500 dans `img/projects/`, avec `width`/`height`, `loading="lazy"`
et `decoding="async"` sur chaque `<img>`. Les sources lourdes vivent dans `img/source/` et
`img/projects/_raw/` (ce dernier est gitignoré), aucune n'est déployée.

## Périmètre déployé

[firebase.json](firebase.json) exclut `cv/`, `img/source/`, `img/projects/_raw|cdp|cdp2|cdpnew/`,
`2139_neural_portfolio/` et `README.md`. Y ajouter tout nouveau dossier de travail, sans quoi il part en
production. Le fichier fixe aussi les en-têtes de cache (CSS/JS 7 jours, images 1 an immuable, HTML
`max-age=0`) et les en-têtes de sécurité.

Ajouter une section ou une page implique de mettre à jour [sitemap.xml](sitemap.xml) et, pour une section,
le rail de navigation dans `index.html`.
