# Portfolio — Romain Sergio

Portfolio personnel de **Romain Sergio**, développeur IA Automatisation & IT Tech
basé à Antananarivo, Madagascar.

🔗 **En ligne :** https://romainsergio.web.app

---

## Stack

Volontairement sans framework ni bundler : HTML, CSS et JavaScript natifs.
Le site est composé d'une seule page, servie en statique par Firebase Hosting.

| Domaine       | Choix                                                        |
| ------------- | ------------------------------------------------------------ |
| Markup        | HTML5 sémantique (`header` / `main` / `section` / `footer`)   |
| Styles        | CSS moderne — variables, `clamp()`, grid, `aspect-ratio`      |
| Scripts       | JavaScript ES5+ sans dépendance, `IntersectionObserver`       |
| Typographie   | Space Grotesk (titres), Inter (texte), JetBrains Mono (méta)  |
| Formulaire    | [Web3Forms](https://web3forms.com) — aucun backend à maintenir |
| Hébergement   | Firebase Hosting                                             |

Aucune dépendance runtime : pas de `node_modules`, pas d'étape de build.
Le dépôt se clone et s'ouvre directement dans un navigateur.

---

## Structure

```
.
├── index.html                 Page unique
├── assets/
│   ├── css/main.css           Feuille de style (sections numérotées)
│   └── js/main.js             Scripts (fond animé, filtres, formulaire)
├── img/
│   ├── projects/              Captures des projets (WebP, 800×500)
│   ├── romain-sergio.jpg      Portrait optimisé
│   ├── og-cover.jpg           Image d'aperçu de partage (1200×630)
│   └── source/                Fichiers sources non déployés
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── Romain-Sergio-CV.pdf       CV téléchargeable
└── firebase.json              Hosting : cache, en-têtes de sécurité
```

---

## Configuration requise avant mise en ligne

Le formulaire de contact utilise Web3Forms. **Une clé d'accès est nécessaire :**

1. Aller sur https://web3forms.com
2. Saisir `sergiohazary@gmail.com` — la clé arrive par email (gratuit, illimité)
3. Ouvrir `assets/js/main.js` et remplacer la valeur de `WEB3FORMS_KEY` :

```js
var WEB3FORMS_KEY = 'votre-cle-ici';
```

Tant que la clé n'est pas renseignée, le formulaire **ne perd aucun message** :
il bascule automatiquement sur un email pré-rempli via `mailto:`.

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

> Ouvrir `index.html` par double-clic fonctionne aussi, mais le protocole
> `file://` peut bloquer le chargement des polices Google.

---

## Déploiement

```bash
firebase deploy --only hosting
```

`firebase.json` exclut du déploiement : le dossier `cv/`, les sources
d'images (`img/source/`), les captures brutes (`img/projects/_raw/`) et ce
README — seuls les fichiers utiles partent en production.

---

## Choix techniques notables

**Accessibilité**

- Lien d'évitement vers le contenu principal
- Chaque lien-icône porte un `aria-label` explicite
- Tous les champs du formulaire ont un `<label>` visible
- Section active signalée par `aria-current`, filtres par `aria-pressed`
- Retours du formulaire annoncés via `role="status"` + `aria-live="polite"`
- `prefers-reduced-motion` : animations neutralisées, fond animé désactivé

**Performance**

- Fond animé en canvas : densité proportionnelle à l'aire du viewport,
  `devicePixelRatio` plafonné à 1.5, voisinage calculé sur une grille
  spatiale (linéaire au lieu de quadratique), animation stoppée dès que le
  hero quitte l'écran ou que l'onglet passe en arrière-plan
- Captures de projets en WebP, `loading="lazy"` et `decoding="async"`
- `width` / `height` posés sur toutes les images (aucun décalage de mise en page)
- Révélations au défilement via `IntersectionObserver` (aucun listener `scroll`)

**SEO**

- `meta description`, `canonical`, Open Graph et Twitter Card
- Données structurées JSON-LD `Person`
- `sitemap.xml` et `robots.txt`

---

## Licence

Code sous licence MIT. Le contenu éditorial, le portrait et le CV restent la
propriété de Romain Sergio. Les marques citées dans la section Projets
appartiennent à leurs détenteurs respectifs.
