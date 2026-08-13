# Portfolio — Romain Sergio

Portfolio personnel de **Romain Sergio**, développeur AI & IT Tech basé à
Antananarivo, Madagascar.

🔗 **En ligne :** https://romainsergio.web.app

---

## Stack

Sans framework ni bundler : HTML, CSS et JavaScript natifs, une seule page,
servie en statique par Firebase Hosting.

| Domaine     | Choix                                                          |
| ----------- | -------------------------------------------------------------- |
| Base        | Template [Tooplate 2139 Neural Portfolio](https://www.tooplate.com/view/2139-neural-portfolio), personnalisé |
| Typographie | Orbitron, Exo 2, Audiowide                                      |
| Scripts     | JavaScript natif, sans dépendance                               |
| Formulaire  | [Web3Forms](https://web3forms.com) — aucun backend à maintenir  |
| Hébergement | Firebase Hosting                                                |

Aucune dépendance runtime : pas de `node_modules`, pas d'étape de build. Le
dépôt se clone et s'ouvre directement dans un navigateur.

---

## Structure

```
.
├── index.html                    Page unique
├── tooplate-neural-style.css     Styles du template + section « AJOUTS » en fin de fichier
├── tooplate-neural-scripts.js    Fond animé, navigation, filtres, formulaire
├── img/
│   ├── projects/                 Captures des projets (WebP, 800×500)
│   ├── romain-sergio.jpg         Portrait optimisé
│   ├── og-cover.jpg              Image d'aperçu de partage (1200×630)
│   └── source/                   Fichiers sources, non déployés
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── Romain-Sergio-CV.pdf          CV téléchargeable
├── 2139_neural_portfolio/        Template d'origine intact, pour référence
└── firebase.json                 Hosting : cache, en-têtes de sécurité
```

> Le CSS du template n'a pas été modifié : tous les styles ajoutés sont
> regroupés dans une section « AJOUTS » clairement délimitée en fin de
> `tooplate-neural-style.css`.

---

## Configuration requise avant mise en ligne

Le formulaire de contact utilise Web3Forms. **Une clé d'accès est nécessaire :**

1. Aller sur https://web3forms.com
2. Saisir `sergiohazary@gmail.com` — la clé arrive par e-mail (gratuit)
3. Ouvrir `tooplate-neural-scripts.js` et remplacer la valeur de
   `WEB3FORMS_KEY` :

```js
var WEB3FORMS_KEY = 'votre-cle-ici';
```

Tant que la clé n'est pas renseignée, le formulaire **ne perd aucun message** :
il bascule automatiquement sur un e-mail pré-rempli via `mailto:`.

---

## Développement local

Aucune installation. Servir le dossier avec n'importe quel serveur statique :

```bash
npx serve .
# ou
python -m http.server 8000
# ou, si le CLI Firebase est installé
firebase serve
```

---

## Déploiement

Le projet Firebase `romainsergio` appartient au compte
`sergiohazary@gmail.com`. Si ce n'est pas le compte actif du CLI, le préciser
explicitement :

```bash
firebase deploy --only hosting --account sergiohazary@gmail.com
```

`firebase.json` exclut du déploiement : `cv/`, `img/source/`,
`2139_neural_portfolio/` et ce README — seuls les fichiers utiles partent en
production.

---

## Corrections apportées au template

**Formulaire de contact**

- Le formulaire d'origine affichait « MESSAGE ENVOYÉ ! » sans rien transmettre.
  Il envoie désormais réellement, avec états chargement / succès / erreur.
- Validation en français champ par champ, piège à robots, garde-fou réseau
  de 15 s, repli sur `mailto:` si l'envoi échoue.

**Accessibilité**

- Structure sémantique : `header` / `nav` / `main` / `section` / `footer`
- Chaque lien-icône porte un `aria-label` ; les 5 champs du formulaire ont un
  `<label>` visible
- Lien d'évitement, `aria-current` sur la navigation, `aria-pressed` sur les
  filtres, retours du formulaire annoncés (`aria-live`)
- `prefers-reduced-motion` : animations neutralisées, fond animé désactivé

**Performance**

- Le portrait pointait vers un fichier absent (`img/BOGOSY.png`) : image cassée
  en production. Corrigé et recompressé (178 → 42 Ko).
- Le favicon chargeait un JPEG de 9,5 Mo — remplacé par un SVG de 1 Ko.
- Images inutilisées sorties du périmètre déployé : 25 Mo → ~800 Ko.
- Fond animé : densité proportionnelle au viewport, `devicePixelRatio`
  plafonné, voisinage calculé sur une grille spatiale, animation stoppée quand
  l'onglet passe en arrière-plan.
- Gestionnaire de défilement synchronisé sur `requestAnimationFrame`.

**SEO**

- `meta description`, `canonical`, Open Graph et Twitter Card
- Données structurées JSON-LD `Person`, `sitemap.xml`, `robots.txt`
- Captures d'écran pour les 15 projets, CV téléchargeable

---

## Licence

Template de base fourni par [Tooplate](https://www.tooplate.com). Le contenu
éditorial, le portrait et le CV restent la propriété de Romain Sergio. Les
marques citées dans la section Projets appartiennent à leurs détenteurs
respectifs.
