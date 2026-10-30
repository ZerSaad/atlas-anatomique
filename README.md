# Atlas anatomique 3D

Un explorateur interactif du corps humain pour observer les structures anatomiques et comprendre leurs relations dans l’espace.

**2 694 structures sélectionnables · 5 systèmes anatomiques · 56 fiches de référence**

> Projet pédagogique. Cet atlas ne constitue pas un outil de diagnostic ou de décision médicale.

## Présentation

L’application permet de manipuler un modèle anatomique masculin adulte en trois dimensions, de superposer différents systèmes et de consulter des informations sur les structures sélectionnées.

Elle fonctionne entièrement dans le navigateur, sans backend, sans compte utilisateur et sans base de données.

## Fonctionnalités

- Rotation, déplacement et zoom du modèle 3D.
- Vues de face, de dos et de profil.
- Activation indépendante de cinq systèmes :
  - Squelettique.
  - Musculaire.
  - Vasculaire et cardiaque.
  - Nerveux.
  - Organes internes.
- Réglage de l’opacité de chaque système.
- Sélection des structures directement sur le modèle.
- Index filtrable par système et recherche par nom.
- Cadrage sur une structure sélectionnée.
- Masquage individuel et isolation d’un système.
- Coupe exploratoire avec profondeur réglable.
- Fiches pédagogiques en français.
- Interface adaptée aux différentes tailles d’écran.

## Technologies

| Technologie | Utilisation |
|---|---|
| React | Interface et gestion des états |
| JavaScript / JSX | Logique de l’application |
| Three.js | Affichage et manipulation de la scène 3D |
| Draco | Décompression des maillages anatomiques |
| Tailwind CSS | Mise en forme de l’interface |
| Lucide React | Icônes |
| Vite | Développement et compilation |

## Démarrage

### Prérequis

- Node.js **22.12 ou version compatible plus récente**.
- npm.
- Un navigateur récent avec WebGL disponible.

### Installation

Depuis le dossier contenant `package.json` :

```bash
npm ci
```

### Développement

```bash
npm run dev
```

Ouvrir ensuite l’adresse locale affichée dans le terminal.

### Compilation

```bash
npm run build
```

Les fichiers du site sont générés dans le dossier `dist/`.

Pour vérifier cette version localement :

```bash
npm run preview
```

### Aperçu autonome

Le fichier `Apercu-Anatomie.html` fourni avec le projet peut être ouvert directement dans un navigateur.

Il contient les modèles et le décodeur nécessaires à son fonctionnement hors connexion.

## Utilisation

| Action | Commande |
|---|---|
| Tourner le modèle | Cliquer et glisser |
| Zoomer | Molette ou pincement à deux doigts |
| Déplacer le modèle | Clic droit et glisser |
| Sélectionner une structure | Cliquer sur le modèle ou utiliser l’index |
| Afficher un système | Utiliser son bouton de visibilité |
| Voir les structures profondes | Masquer les couches superficielles ou réduire leur opacité |

### Navigation au clavier

Après avoir placé le focus sur le modèle avec `Tab` :

- **Flèches** : rotation.
- **+ / −** : zoom.
- **F** : retour à la vue de face.

La sélection des structures est également accessible depuis l’index.

## Organisation du projet

```text
anatomie-3d/
├── src/
│   ├── AnatomyApp.jsx
│   ├── AnatomyAssets.js
│   ├── main.jsx
│   └── style.css
├── licences/
├── Apercu-Anatomie.html
├── DOCUMENTATION.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

### Architecture

- `main.jsx` initialise React.
- `AnatomyApp.jsx` contient l’interface, les états, les fiches et l’intégration du moteur 3D.
- `AnatomyAssets.js` contient les modèles, leur nomenclature et le décodeur embarqué.
- `style.css` charge Tailwind CSS.

Les interactions entre l’interface et la scène sont gérées localement. L’état de l’exploration n’est pas sauvegardé après rechargement de la page.

## Déploiement sur Vercel

Importer le dépôt GitHub dans Vercel puis vérifier les paramètres suivants :

| Paramètre | Valeur |
|---|---|
| Framework | Vite |
| Répertoire racine | Dossier contenant `package.json` |
| Installation | `npm ci` |
| Compilation | `npm run build` |
| Répertoire de sortie | `dist` |

Aucune variable d’environnement n’est nécessaire pour la version actuelle.

## Données anatomiques

| Ensemble | Structures identifiées |
|---|---:|
| Squelettique | 335 |
| Musculaire et structures associées | 1 110 |
| Cardiovasculaire | 640 |
| Nerveux | 525 |
| Digestif | 42 |
| Respiratoire | 34 |
| Rénal | 8 |
| **Total** | **2 694** |

Les ensembles digestif, respiratoire et rénal sont regroupés dans le calque « Organes internes ».

Les **56 fiches de référence** couvrent des structures ou familles anatomiques. Chaque petit élément du modèle ne possède pas nécessairement une fiche dédiée.

## Performances et limites

- Les données 3D embarquées représentent environ **44 Mo**.
- Le premier chargement peut prendre quelques secondes.
- Les systèmes sont décodés lors de leur première activation.
- Afficher tous les systèmes simultanément augmente l’utilisation de la mémoire graphique.
- Le modèle représente une anatomie masculine adulte et ne couvre pas les variations individuelles.
- La nomenclature source n’a pas été intégralement révisée médicalement.
- La coupe exploratoire ne referme pas les surfaces et ne représente pas une coupe radiologique.

## Vérifications réalisées

- Compilation de production.
- Décodage des sept ensembles anatomiques.
- Correspondance entre les 2 694 identifiants et leurs maillages sélectionnables.
- Tests DOM de recherche, sélection, masquage, réaffichage et réinitialisation.
- Vérification du message de repli en cas d’absence de WebGL.

Le rendu graphique WebGL n’a pas été inspecté visuellement dans l’environnement de création. Ces vérifications ne constituent pas un audit de sécurité ou une validation médicale.

## Sources et licences

Les maillages proviennent de :

- [Anatria3D](https://github.com/Nurkan1/Anatria-3D).
- [Z-Anatomy](https://www.z-anatomy.com/).
- BodyParts3D — The Database Center for Life Science, DBCLS.

Les maillages masculins et leur nomenclature sont distribués sous **CC BY-SA 4.0**.

L’adaptation apporte des identifiants de sélection et un conditionnement embarqué. La géométrie des maillages n’est pas modifiée.

Les notices sont disponibles dans `licences/` :

- `ANATOMY-NOTICE.txt`
- `ANATOMY-LICENSE.txt`
- `THREE-LICENSE.txt`
- `DRACO-LICENSE.txt`

**Conserver les attributions et respecter les conditions de partage à l’identique lors de la redistribution des modèles ou de leurs adaptations.**

Three.js est distribué sous licence MIT et Draco sous licence Apache-2.0. Ces licences ne constituent pas une licence globale pour le code propre à cette application.

### Références pédagogiques

- [OpenStax — Anatomy and Physiology 2e](https://openstax.org/details/books/anatomy-and-physiology-2e).
- [NHLBI — How the Heart Beats](https://www.nhlbi.nih.gov/health/heart/heart-beats).
