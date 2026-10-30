# Atlas anatomique · Exploration 3D

Ouvrez **Apercu-Anatomie.html** dans un navigateur récent disposant de WebGL. Le fichier contient l’interface, les maillages et le décodeur : aucun serveur, installation ou téléchargement supplémentaire n’est nécessaire. Si le fichier était déjà ouvert, rechargez l’onglet. La préparation initiale des modèles prend quelques secondes.

## Nouveautés

- Interface claire : fond blanc cassé, panneaux blancs, accents verts et typographie sobre.
- Véritables maillages anatomiques 3D avec éclairage de surface.
- 2 694 structures identifiées : 335 squelettiques, 1 110 musculaires et associées, 640 cardiovasculaires, 525 nerveuses et 84 viscérales (42 digestives, 34 respiratoires, 8 rénales).
- Cinq systèmes indépendants, visibilité et opacité réglables.
- Rotation par glisser ; zoom par molette ou pincement ; déplacement par clic droit/glisser ou geste à deux doigts.
- Vues de face, dos et profil ; retour au corps entier ; cadrage d’une structure.
- Sélection par clic et index filtrable en français (familles documentées), latin ou anglais.
- Masquage individuel des structures et isolation de leur système.
- Coupe exploratoire réglable en profondeur. Les surfaces ne sont pas refermées ; ce n’est pas une coupe radiologique.
- 56 fiches de référence en français. Une fiche peut décrire la famille anatomique ; le nom exact sélectionné est toujours indiqué. Les structures sans fiche dédiée sont signalées.

Clavier : focalisez le modèle avec Tab, puis utilisez les flèches pour tourner, +/− pour zoomer et F pour revenir de face. La sélection au clavier se fait via l’index.

## Source React

`AnatomyApp.jsx` exporte un unique composant fonctionnel et importe `AnatomyAssets.js`, contenant les modèles et la nomenclature. Placez ces deux fichiers dans le même dossier d’un projet React avec Tailwind CSS configuré. Dépendances : React, React DOM, `lucide-react` et **`three@0.186.1`**. Cette version de Three.js permet la configuration explicite des URLs du décodeur Draco utilisées pour le fonctionnement hors connexion.

La vraie 3D remplace le SVG initial et nécessite Three.js et le fichier d’assets. Le HTML livré reste autonome (environ 45 Mo). Les systèmes sont décodés lors de leur première activation ; les afficher tous demande davantage de mémoire graphique.

## Sources et licences

Maillages : [Anatria3D](https://github.com/Nurkan1/Anatria-3D/tree/main/public/anatomy), issus de [Z-Anatomy](https://www.z-anatomy.com/) et de BodyParts3D, The Database Center for Life Science (DBCLS). Maillages masculins et nomenclature : **CC BY-SA 4.0**. Modifications : ajout d’identifiants aux nœuds et conditionnement embarqué ; géométrie inchangée. Conservez `ANATOMY-NOTICE.txt` et `ANATOMY-LICENSE.txt` lors d’une redistribution des assets. Leurs textes sont aussi inclus dans le HTML. Three.js : MIT ; Draco : Apache-2.0. Notices jointes.

Références pédagogiques : [OpenStax Anatomy & Physiology 2e](https://openstax.org/details/books/anatomy-and-physiology-2e), [NHLBI — How the Heart Beats](https://www.nhlbi.nih.gov/health/heart/heart-beats).

Atlas d’étude masculin adulte, sans représentation des variations individuelles. La nomenclature source n’a pas été intégralement révisée médicalement. Les fiches ne couvrent pas chaque petite structure. Outil pédagogique, sans usage diagnostique.

## Vérification

Compilation de production réussie. Les sept modèles ont été décodés : chaque entrée de l’index correspond à un maillage sélectionnable, avec normales et coordonnées cohérentes. Tests DOM : rendu de l’interface, absence de WebGL, recherche, sélection, masquage/réaffichage, fermeture de fiche et réinitialisation. Le rendu graphique WebGL n’a pas pu être inspecté visuellement dans le navigateur intégré, qui bloque l’accès de l’outil aux fichiers locaux.
