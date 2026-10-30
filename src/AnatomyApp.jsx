import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Layers, Eye, EyeOff, RotateCcw, Search, X, Info, ZoomIn, ZoomOut, Crosshair, ChevronRight, Move, Rotate3D, Maximize, ChevronDown, BookOpen, LoaderCircle, AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { anatomyModels, anatomyIndex, dracoJS, dracoWASM } from './AnatomyAssets.js';

export default function AnatomyApp() {
  const clinical = [
  {
    "id": "skull",
    "layer": "bones",
    "name": "Crâne",
    "latin": "Cranium",
    "system": "Squelette axial",
    "role": "Protège l’encéphale et soutient les structures du visage.",
    "metrics": "22 os classiquement décrits, hors osselets de l’oreille.",
    "pathologies": "Fractures, craniosynostose.",
    "fact": "Les sutures sont des articulations fibreuses entre les os du crâne."
  },
  {
    "id": "spine",
    "layer": "bones",
    "name": "Colonne vertébrale",
    "latin": "Columna vertebralis",
    "system": "Squelette axial",
    "role": "Soutient le tronc, permet sa mobilité et protège la moelle dans le canal vertébral.",
    "metrics": "7 vertèbres cervicales, 12 thoraciques et 5 lombaires ; sacrum et coccyx fusionnés.",
    "pathologies": "Hernie discale, scoliose, arthrose.",
    "fact": "Les disques intervertébraux répartissent les contraintes entre les corps vertébraux."
  },
  {
    "id": "ribs",
    "layer": "bones",
    "name": "Cage thoracique",
    "latin": "Costae et sternum",
    "system": "Squelette axial",
    "role": "Protège le cœur et les poumons et participe à la mécanique respiratoire.",
    "metrics": "12 paires de côtes ; les deux dernières sont flottantes.",
    "pathologies": "Fractures costales, costochondrite.",
    "fact": "Les côtes se soulèvent avec la respiration pour augmenter le volume du thorax."
  },
  {
    "id": "pelvis",
    "layer": "bones",
    "name": "Bassin",
    "latin": "Pelvis ossea",
    "system": "Ceinture pelvienne",
    "role": "Transmet le poids du tronc aux membres inférieurs et protège des viscères pelviens.",
    "metrics": "Deux os coxaux, sacrum et coccyx.",
    "pathologies": "Fractures, atteintes sacro-iliaques.",
    "fact": "L’acétabulum reçoit la tête du fémur."
  },
  {
    "id": "humerus",
    "layer": "bones",
    "name": "Humérus",
    "latin": "Humerus",
    "system": "Membre supérieur",
    "role": "Relie l’épaule au coude et sert de levier aux muscles du bras.",
    "metrics": "Un os long dans chaque bras.",
    "pathologies": "Fracture, atteinte du nerf radial associée à certaines fractures.",
    "fact": "Sa tête s’articule avec la cavité glénoïdale de la scapula."
  },
  {
    "id": "forearm",
    "layer": "bones",
    "name": "Radius et ulna",
    "latin": "Radius et ulna",
    "system": "Membre supérieur",
    "role": "Permettent la flexion du coude et la rotation de l’avant-bras.",
    "metrics": "Deux os par avant-bras.",
    "pathologies": "Fractures, luxations.",
    "fact": "Le radius tourne autour de l’ulna pendant la pronation et la supination."
  },
  {
    "id": "femur",
    "layer": "bones",
    "name": "Fémur",
    "latin": "Femur",
    "system": "Membre inférieur",
    "role": "Transmet le poids du bassin au genou et participe à la locomotion.",
    "metrics": "Un par cuisse ; plus long os du corps.",
    "pathologies": "Fracture du col, fracture diaphysaire.",
    "fact": "Le col fémoral forme un angle avec la diaphyse."
  },
  {
    "id": "leg",
    "layer": "bones",
    "name": "Tibia et fibula",
    "latin": "Tibia et fibula",
    "system": "Membre inférieur",
    "role": "Le tibia supporte l’essentiel de la charge ; la fibula stabilise notamment la cheville.",
    "metrics": "Deux os par jambe.",
    "pathologies": "Fracture, périostite tibiale.",
    "fact": "La fibula constitue la malléole latérale de la cheville."
  },
  {
    "id": "biceps",
    "layer": "muscles",
    "name": "Biceps brachial",
    "latin": "Musculus biceps brachii",
    "system": "Muscles du bras",
    "role": "Fléchit le coude et participe à la supination de l’avant-bras.",
    "metrics": "Deux chefs ; innervation par le nerf musculocutané.",
    "pathologies": "Tendinopathie, rupture du tendon.",
    "fact": "Il agit sur l’épaule et le coude."
  },
  {
    "id": "pectorals",
    "layer": "muscles",
    "name": "Grands pectoraux",
    "latin": "Musculi pectorales majores",
    "system": "Muscles du thorax",
    "role": "Rapprochent le bras du tronc et participent à sa rotation interne.",
    "metrics": "Chefs claviculaire et sternocostal.",
    "pathologies": "Déchirure, rupture tendineuse.",
    "fact": "Leur insertion sur l’humérus explique leur action sur le bras."
  },
  {
    "id": "abs",
    "layer": "muscles",
    "name": "Grands droits de l’abdomen",
    "latin": "Musculi recti abdominis",
    "system": "Paroi abdominale",
    "role": "Fléchissent le tronc et contribuent à la pression abdominale.",
    "metrics": "Paire de muscles séparés par la ligne blanche.",
    "pathologies": "Diastasis, lésions musculaires.",
    "fact": "L’aspect segmenté vient des intersections tendineuses."
  },
  {
    "id": "quads",
    "layer": "muscles",
    "name": "Quadriceps",
    "latin": "Musculus quadriceps femoris",
    "system": "Muscles de la cuisse",
    "role": "Étend le genou ; le droit fémoral participe aussi à la flexion de hanche.",
    "metrics": "Quatre chefs ; innervation par le nerf fémoral.",
    "pathologies": "Tendinopathie, déchirure, rupture tendineuse.",
    "fact": "Le tendon du quadriceps se prolonge via la patella et le ligament patellaire."
  },
  {
    "id": "lungs",
    "layer": "organs",
    "name": "Poumons",
    "latin": "Pulmones",
    "system": "Appareil respiratoire",
    "role": "Assurent les échanges d’oxygène et de dioxyde de carbone entre air et sang.",
    "metrics": "3 lobes à droite, 2 à gauche.",
    "pathologies": "Asthme, pneumonie, BPCO.",
    "fact": "Le poumon gauche présente une échancrure liée à la position du cœur."
  },
  {
    "id": "liver",
    "layer": "organs",
    "name": "Foie",
    "latin": "Hepar",
    "system": "Appareil digestif",
    "role": "Transforme les nutriments, synthétise des protéines plasmatiques et produit la bile.",
    "metrics": "Principalement sous les côtes droites ; masse adulte de l’ordre de 1,5 kg.",
    "pathologies": "Stéatose, hépatite, cirrhose.",
    "fact": "Le foie reçoit du sang par l’artère hépatique et la veine porte."
  },
  {
    "id": "stomach",
    "layer": "organs",
    "name": "Estomac",
    "latin": "Gaster",
    "system": "Appareil digestif",
    "role": "Stocke et brasse les aliments ; l’acidité et les enzymes amorcent la digestion des protéines.",
    "metrics": "Entre œsophage et duodénum ; volume variable avec le remplissage.",
    "pathologies": "Gastrite, ulcère, reflux gastro-œsophagien.",
    "fact": "Une barrière de mucus protège sa paroi de l’acidité."
  },
  {
    "id": "kidneys",
    "layer": "organs",
    "name": "Reins",
    "latin": "Renes",
    "system": "Appareil urinaire",
    "role": "Filtrent le plasma et régulent l’eau, les électrolytes et l’équilibre acido-basique.",
    "metrics": "Deux organes rétropéritonéaux ; environ un million de néphrons par rein, avec forte variabilité.",
    "pathologies": "Calculs, maladie rénale chronique, pyélonéphrite.",
    "fact": "Ils contribuent à la production d’érythropoïétine, qui stimule les globules rouges."
  },
  {
    "id": "arteries",
    "layer": "vessels",
    "name": "Réseau artériel systémique",
    "latin": "Arteriae",
    "system": "Circulation systémique",
    "role": "Conduit le sang du cœur vers les tissus ; les artérioles règlent la résistance périphérique.",
    "metrics": "Parois comportant trois tuniques ; pression pulsatile.",
    "pathologies": "Athérosclérose, anévrisme, artériopathie.",
    "fact": "Une artère se définit par la direction du sang, pas par sa teneur en oxygène."
  },
  {
    "id": "veins",
    "layer": "vessels",
    "name": "Réseau veineux systémique",
    "latin": "Venae",
    "system": "Circulation systémique",
    "role": "Ramène le sang des tissus au cœur et constitue un réservoir de volume sanguin.",
    "metrics": "Système à basse pression ; valvules dans de nombreuses veines des membres.",
    "pathologies": "Thrombose veineuse, varices.",
    "fact": "La contraction musculaire aide le retour veineux contre la pesanteur."
  },
  {
    "id": "heart",
    "layer": "vessels",
    "name": "Cœur",
    "latin": "Cor",
    "system": "Appareil cardiovasculaire",
    "role": "Pompe le sang vers les poumons puis vers les organes grâce à deux circuits en série.",
    "metrics": "4 cavités ; fréquence au repos généralement de 60 à 100 battements/min chez l’adulte.",
    "pathologies": "Maladie coronarienne, insuffisance cardiaque, arythmies.",
    "fact": "Le nœud sinusal produit spontanément les impulsions électriques du rythme cardiaque."
  },
  {
    "id": "brain",
    "layer": "nerves",
    "name": "Cerveau",
    "latin": "Cerebrum",
    "system": "Système nerveux central",
    "role": "Intègre les perceptions et participe à la cognition, à la mémoire et au contrôle moteur volontaire.",
    "metrics": "Deux hémisphères cérébraux ; cortex et structures profondes.",
    "pathologies": "AVC, épilepsie, maladies neurodégénératives.",
    "fact": "Le cortex est plissé : ses sillons augmentent sa surface."
  },
  {
    "id": "cord",
    "layer": "nerves",
    "name": "Moelle épinière",
    "latin": "Medulla spinalis",
    "system": "Système nerveux central",
    "role": "Transmet des informations entre cerveau et périphérie et assure des circuits réflexes.",
    "metrics": "Se termine habituellement vers L1–L2 chez l’adulte.",
    "pathologies": "Compression médullaire, myélite, lésion traumatique.",
    "fact": "Les racines sous la moelle forment la queue de cheval."
  },
  {
    "id": "brachial",
    "layer": "nerves",
    "name": "Plexus brachial",
    "latin": "Plexus brachialis",
    "system": "Système nerveux périphérique",
    "role": "Distribue les fibres motrices et sensitives vers le membre supérieur.",
    "metrics": "Rameaux antérieurs C5 à T1.",
    "pathologies": "Plexopathie, lésion par étirement.",
    "fact": "Ses fibres se réorganisent avant de former les nerfs du bras."
  },
  {
    "id": "sciatic",
    "layer": "nerves",
    "name": "Nerfs sciatiques",
    "latin": "Nervi ischiadici",
    "system": "Système nerveux périphérique",
    "role": "Innervent la région postérieure de la cuisse et, via leurs branches, une grande partie de la jambe et du pied.",
    "metrics": "Racines L4 à S3 ; trajet postérieur, projeté ici sur une vue de face.",
    "pathologies": "Sciatalgie, compression, lésion traumatique.",
    "fact": "Le nerf sciatique se divise en nerfs tibial et fibulaire commun."
  },
  {
    "id": "clavicle",
    "name": "Clavicule",
    "latin": "Clavicula",
    "role": "Relie le sternum à la scapula et maintient l’épaule à distance du thorax.",
    "metrics": "Os pair de la ceinture scapulaire, articulé au sternum et à l’acromion.",
    "pathologies": "Fractures, arthrose acromio-claviculaire.",
    "fact": "La clavicule transmet au squelette axial les forces exercées sur le membre supérieur."
  },
  {
    "id": "scapula",
    "name": "Scapula",
    "latin": "Scapula",
    "role": "Sert de support à l’articulation de l’épaule et d’insertion à de nombreux muscles.",
    "metrics": "Os plat de la face postérieure du thorax ; sa glène reçoit l’humérus.",
    "pathologies": "Fracture, dyskinésie scapulaire.",
    "fact": "La scapula glisse sur la cage thoracique pendant l’élévation du bras."
  },
  {
    "id": "sternum",
    "name": "Sternum",
    "latin": "Sternum",
    "role": "Relie les cartilages costaux à l’avant du thorax et protège les structures médiastinales.",
    "metrics": "Manubrium, corps sternal et processus xiphoïde.",
    "pathologies": "Fracture, inflammation des articulations voisines.",
    "fact": "L’angle sternal est un repère utilisé pour compter les côtes."
  },
  {
    "id": "mandible",
    "name": "Mandibule",
    "latin": "Mandibula",
    "role": "Porte les dents inférieures et participe à la mastication et à la parole.",
    "metrics": "Os impair articulé aux deux os temporaux.",
    "pathologies": "Fracture, troubles temporo-mandibulaires.",
    "fact": "La mandibule est le principal os mobile du crâne."
  },
  {
    "id": "patella",
    "name": "Patella · rotule",
    "latin": "Patella",
    "role": "Protège l’avant du genou et augmente le bras de levier du quadriceps.",
    "metrics": "Os sésamoïde inclus dans l’appareil extenseur du genou.",
    "pathologies": "Luxation, fracture, douleur fémoro-patellaire.",
    "fact": "Sa face postérieure s’articule avec le fémur."
  },
  {
    "id": "tibia",
    "name": "Tibia",
    "latin": "Tibia",
    "role": "Transmet la majorité de la charge du genou à la cheville.",
    "metrics": "Os médial de la jambe ; forme la malléole médiale.",
    "pathologies": "Fracture, syndrome de stress tibial médial.",
    "fact": "Son bord antérieur est facilement palpable sous la peau."
  },
  {
    "id": "fibula",
    "name": "Fibula · péroné",
    "latin": "Fibula",
    "role": "Fournit des insertions musculaires et contribue à la stabilité de la cheville.",
    "metrics": "Os latéral de la jambe ; forme la malléole latérale.",
    "pathologies": "Fracture, lésions de la syndesmose tibio-fibulaire.",
    "fact": "Elle supporte une part limitée de la charge axiale comparativement au tibia."
  },
  {
    "id": "radius",
    "name": "Radius",
    "latin": "Radius",
    "role": "Participe au poignet et aux mouvements de pronation et de supination.",
    "metrics": "Os de l’avant-bras situé du côté du pouce en position anatomique.",
    "pathologies": "Fracture distale, fracture de la tête radiale.",
    "fact": "Le radius croise l’ulna pendant la pronation."
  },
  {
    "id": "ulna",
    "name": "Ulna · cubitus",
    "latin": "Ulna",
    "role": "Forme avec l’humérus la principale charnière du coude.",
    "metrics": "Os de l’avant-bras situé du côté du petit doigt.",
    "pathologies": "Fracture de l’olécrâne, fracture diaphysaire.",
    "fact": "L’olécrâne constitue la pointe osseuse du coude."
  },
  {
    "id": "deltoid",
    "name": "Deltoïde",
    "latin": "Musculus deltoideus",
    "role": "Participe à l’abduction, à la flexion et à l’extension du bras selon les faisceaux recrutés.",
    "metrics": "Faisceaux antérieur, moyen et postérieur ; nerf axillaire.",
    "pathologies": "Déchirure, faiblesse en cas d’atteinte du nerf axillaire.",
    "fact": "Son relief forme l’arrondi de l’épaule."
  },
  {
    "id": "trapezius",
    "name": "Trapèze",
    "latin": "Musculus trapezius",
    "role": "Élève, rétracte et abaisse la scapula et contribue à sa rotation.",
    "metrics": "Muscle superficiel du dos ; commande motrice par le nerf accessoire.",
    "pathologies": "Douleur musculaire, paralysie du nerf accessoire.",
    "fact": "Ses faisceaux coopèrent avec le dentelé antérieur pour lever le bras."
  },
  {
    "id": "latissimus",
    "name": "Grand dorsal",
    "latin": "Musculus latissimus dorsi",
    "role": "Étend, rapproche et tourne le bras vers l’intérieur.",
    "metrics": "Muscle large du dos ; innervation par le nerf thoracodorsal.",
    "pathologies": "Élongation, déchirure, atteinte tendineuse.",
    "fact": "Malgré son étendue sur le dos, il se termine sur l’humérus."
  },
  {
    "id": "gluteal",
    "name": "Muscles fessiers",
    "latin": "Musculi glutei",
    "role": "Participent à l’extension et à l’abduction de hanche et stabilisent le bassin pendant la marche.",
    "metrics": "Grand, moyen et petit fessiers ont des actions complémentaires.",
    "pathologies": "Tendinopathie glutéale, lésions musculaires.",
    "fact": "Le moyen fessier limite la chute du bassin du côté opposé lors de l’appui sur un pied."
  },
  {
    "id": "hamstrings",
    "name": "Ischio-jambiers",
    "latin": "Musculi ischiocrurales",
    "role": "Fléchissent le genou et participent à l’extension de hanche.",
    "metrics": "Biceps fémoral, semi-tendineux et semi-membraneux ; le chef court du biceps ne croise pas la hanche.",
    "pathologies": "Déchirures, tendinopathies proximales.",
    "fact": "Leur travail excentrique freine la jambe en fin de phase oscillante pendant la course."
  },
  {
    "id": "calf",
    "name": "Triceps sural",
    "latin": "Musculus triceps surae",
    "role": "Produit la flexion plantaire de la cheville et contribue à la propulsion.",
    "metrics": "Gastrocnémien et soléaire ; tendon calcanéen commun.",
    "pathologies": "Déchirure du mollet, tendinopathie achilléenne.",
    "fact": "Le soléaire participe au maintien de la posture debout."
  },
  {
    "id": "triceps",
    "name": "Triceps brachial",
    "latin": "Musculus triceps brachii",
    "role": "Étend le coude ; son chef long participe aussi aux mouvements de l’épaule.",
    "metrics": "Trois chefs ; nerf radial.",
    "pathologies": "Tendinopathie, rupture du tendon, lésion musculaire.",
    "fact": "Son tendon s’insère sur l’olécrâne de l’ulna."
  },
  {
    "id": "diaphragm",
    "name": "Diaphragme",
    "latin": "Diaphragma",
    "role": "Principal muscle inspiratoire : sa contraction augmente le volume thoracique.",
    "metrics": "Sépare thorax et abdomen ; innervé par les nerfs phréniques C3 à C5.",
    "pathologies": "Paralysie diaphragmatique, hernie diaphragmatique.",
    "fact": "Il comporte des passages pour l’œsophage, l’aorte et la veine cave inférieure."
  },
  {
    "id": "aorta",
    "name": "Aorte",
    "latin": "Aorta",
    "role": "Distribue le sang éjecté par le ventricule gauche vers la circulation systémique.",
    "metrics": "Aorte ascendante, crosse et aorte descendante thoracique puis abdominale.",
    "pathologies": "Anévrisme, dissection, athérosclérose.",
    "fact": "Son élasticité contribue à maintenir le flux sanguin entre deux contractions cardiaques."
  },
  {
    "id": "cava",
    "name": "Veine cave",
    "latin": "Vena cava",
    "role": "Ramène une grande partie du sang veineux systémique à l’atrium droit.",
    "metrics": "Veines caves supérieure et inférieure ; système à basse pression.",
    "pathologies": "Thrombose, compression, syndrome cave.",
    "fact": "Les veines caves recueillent des territoires différents, au-dessus et au-dessous du diaphragme."
  },
  {
    "id": "carotid",
    "name": "Artère carotide",
    "latin": "Arteria carotis",
    "role": "Participe à l’apport sanguin de la tête ; la carotide interne vascularise une partie du cerveau.",
    "metrics": "La carotide commune se divise en carotides interne et externe.",
    "pathologies": "Sténose athéromateuse, dissection.",
    "fact": "Le sinus carotidien contient des capteurs impliqués dans la régulation de la pression artérielle."
  },
  {
    "id": "cerebellum",
    "name": "Cervelet",
    "latin": "Cerebellum",
    "role": "Coordonne la précision des mouvements, l’équilibre et l’apprentissage moteur.",
    "metrics": "Situé dans la fosse crânienne postérieure, derrière le tronc cérébral.",
    "pathologies": "Ataxie, AVC cérébelleux, tumeurs.",
    "fact": "Il corrige les erreurs entre le mouvement prévu et les informations sensorielles reçues."
  },
  {
    "id": "brainstem",
    "name": "Tronc cérébral",
    "latin": "Truncus encephali",
    "role": "Relie les centres cérébraux à la moelle et participe au contrôle de fonctions vitales.",
    "metrics": "Mésencéphale, pont et moelle allongée.",
    "pathologies": "AVC, compression, atteintes démyélinisantes.",
    "fact": "La plupart des nerfs crâniens sont associés au tronc cérébral."
  },
  {
    "id": "median",
    "name": "Nerf médian",
    "latin": "Nervus medianus",
    "role": "Participe à la motricité de l’avant-bras et de la main ainsi qu’à la sensibilité d’une partie de la main.",
    "metrics": "Issu du plexus brachial ; traverse le canal carpien.",
    "pathologies": "Syndrome du canal carpien, lésion traumatique.",
    "fact": "Il contribue à l’opposition du pouce."
  },
  {
    "id": "ulnar",
    "name": "Nerf ulnaire",
    "latin": "Nervus ulnaris",
    "role": "Innerve de nombreux petits muscles de la main et une partie de sa sensibilité.",
    "metrics": "Passe derrière l’épicondyle médial du coude.",
    "pathologies": "Compression au coude, syndrome du canal de Guyon.",
    "fact": "La décharge ressentie après un choc au bord interne du coude vient souvent de ce nerf."
  },
  {
    "id": "radial",
    "name": "Nerf radial",
    "latin": "Nervus radialis",
    "role": "Commande notamment les muscles extenseurs du coude, du poignet et des doigts.",
    "metrics": "Branche terminale du plexus brachial ; trajet proche de l’humérus.",
    "pathologies": "Compression, lésion associée à une fracture humérale.",
    "fact": "Une atteinte peut empêcher l’extension active du poignet."
  },
  {
    "id": "femoralnerve",
    "name": "Nerf fémoral",
    "latin": "Nervus femoralis",
    "role": "Participe à la flexion de hanche, à l’extension du genou et à la sensibilité de territoires du membre inférieur.",
    "metrics": "Plexus lombaire ; racines L2 à L4.",
    "pathologies": "Neuropathie fémorale, compression, traumatisme.",
    "fact": "Sa branche saphène est un nerf sensitif qui descend à la face médiale de la jambe."
  },
  {
    "id": "trachea",
    "name": "Trachée",
    "latin": "Trachea",
    "role": "Conduit l’air du larynx vers les bronches et participe à l’élimination des particules inhalées.",
    "metrics": "Conduite par des anneaux cartilagineux incomplets en arrière.",
    "pathologies": "Sténose, trachéite, obstruction.",
    "fact": "Son épithélium cilié fait remonter le mucus vers le pharynx."
  },
  {
    "id": "esophagus",
    "name": "Œsophage",
    "latin": "Oesophagus",
    "role": "Transporte le bol alimentaire du pharynx vers l’estomac par péristaltisme.",
    "metrics": "Traverse le thorax puis le diaphragme.",
    "pathologies": "Reflux, œsophagite, troubles moteurs.",
    "fact": "La progression des aliments repose sur des contractions coordonnées, pas seulement sur la gravité."
  },
  {
    "id": "intestine",
    "name": "Intestin grêle",
    "latin": "Intestinum tenue",
    "role": "Assure la majeure partie de la digestion enzymatique et de l’absorption des nutriments.",
    "metrics": "Duodénum, jéjunum et iléon.",
    "pathologies": "Maladie cœliaque, maladie de Crohn, occlusion.",
    "fact": "Les villosités et microvillosités augmentent la surface d’absorption."
  },
  {
    "id": "colon",
    "name": "Côlon et rectum",
    "latin": "Intestinum crassum",
    "role": "Récupère de l’eau et des électrolytes et participe à la formation et au stockage des selles.",
    "metrics": "Cæcum, côlon, rectum et canal anal constituent le gros intestin.",
    "pathologies": "Diverticulose, colite, cancer colorectal.",
    "fact": "Le microbiote colique transforme certains résidus qui ont échappé à la digestion."
  },
  {
    "id": "pancreas",
    "name": "Pancréas",
    "latin": "Pancreas",
    "role": "Sécrète des enzymes digestives et des hormones impliquées dans la régulation de la glycémie.",
    "metrics": "Fonctions exocrine et endocrine ; glande située principalement derrière l’estomac.",
    "pathologies": "Pancréatite, diabète, tumeurs.",
    "fact": "Les îlots endocrines représentent une petite partie du tissu pancréatique."
  },
  {
    "id": "gallbladder",
    "name": "Vésicule biliaire",
    "latin": "Vesica biliaris",
    "role": "Stocke et concentre la bile avant sa libération vers le duodénum.",
    "metrics": "Située contre la face inférieure du foie.",
    "pathologies": "Calculs biliaires, cholécystite.",
    "fact": "La bile est produite par le foie, puis stockée dans la vésicule."
  },
  {
    "id": "bladder",
    "name": "Vessie",
    "latin": "Vesica urinaria",
    "role": "Stocke l’urine entre les mictions et l’expulse par contraction du détrusor.",
    "metrics": "Organe pelvien creux ; capacité variable avec le remplissage.",
    "pathologies": "Cystite, rétention, tumeurs.",
    "fact": "Son épithélium spécialisé s’adapte à d’importantes variations de volume."
  }
];
  const systems = [
    { id:'bones', name:'Système squelettique', short:'Squelette', color:'#ad9870', parts:['skeletal'], detail:'Os & articulations' },
    { id:'muscles', name:'Système musculaire', short:'Muscles', color:'#a65b4b', parts:['muscular'], detail:'Muscles & structures associées' },
    { id:'vessels', name:'Vasculaire & cardiaque', short:'Vaisseaux', color:'#a4464d', parts:['cardiovascular'], detail:'Cœur, artères & veines' },
    { id:'nerves', name:'Système nerveux', short:'Nerfs', color:'#aa8a36', parts:['nervous'], detail:'Structures centrales & périphériques' },
    { id:'organs', name:'Organes internes', short:'Organes', color:'#8b776c', parts:['digestive','respiratory','renal'], detail:'Digestion, respiration & voies urinaires' },
  ];
  const familyRules = [
    ['biceps',/biceps brachii/i], ['triceps',/triceps brachii/i], ['hamstrings',/biceps femoris|semitendinosus|semimembranosus/i],
    ['quads',/rectus femoris|vastus (lateralis|medialis|intermedius)/i], ['pectorals',/pectoralis major/i], ['abs',/rectus abdominis/i],
    ['deltoid',/deltoid/i], ['trapezius',/trapezius/i], ['latissimus',/latissimus/i], ['gluteal',/gluteus/i], ['calf',/gastrocnemius|soleus/i], ['diaphragm',/diaphragm(?!atic)/i],
    ['femur',/^femur/i], ['humerus',/^humerus/i], ['tibia',/^tibia[. (]/i], ['fibula',/^fibula[. (]/i], ['radius',/^radius[. (]/i], ['ulna',/^ulna[. (]/i], ['patella',/^patella[. (]/i],
    ['clavicle',/^clavicle/i], ['scapula',/^scapula/i], ['sternum',/^sternum|^manubrium|^xiphoid process/i], ['mandible',/^mandible/i], ['pelvis',/^hip bone|^ilium|^ischium|^pubis|^sacrum/i],
    ['spine',/vertebra|intervertebral disc/i], ['ribs',/^rib\b|^costal cartilage/i], ['skull',/frontal bone|parietal bone|occipital bone|temporal bone|sphenoid bone|ethmoid bone|maxilla|zygomatic bone/i],
    ['cerebellum',/cerebell|vermis/i], ['brainstem',/^pons|medulla oblongata|midbrain/i], ['cord',/^spinal cord/i], ['sciatic',/^sciatic nerve/i], ['median',/^median nerve/i], ['ulnar',/^ulnar nerve/i], ['radial',/^radial nerve/i], ['femoralnerve',/^femoral nerve/i], ['brachial',/brachial plexus/i],
    ['brain',/cerebr|gyrus|gyri|thalamus|hippocamp|caudate nucleus|putamen|corpus callosum|amygdala|frontal lobe|parietal lobe|occipital lobe|temporal lobe/i],
    ['aorta',/^aorta|^aortic arch|^ascending aorta|^descending aorta/i], ['cava',/vena cava/i], ['carotid',/carotid artery/i],
    ['heart',/^heart$|^right atrium|^left atrium|^right ventricle|^left ventricle|^myocardium|^interventricular septum/i],
    ['arteries',/artery|arteries/i], ['veins',/vein|veins|venous/i],
    ['lungs',/lung|lobe of (right|left) lung/i], ['trachea',/^trachea|^main bronchus|^principal bronchus/i], ['liver',/^liver|lobe of liver/i], ['stomach',/^stomach/i], ['kidneys',/^kidney/i],
    ['pancreas',/^pancreas/i], ['gallbladder',/^gallbladder/i], ['esophagus',/^esophagus|^oesophagus/i], ['intestine',/^duodenum|^jejunum|^ileum|small intestine/i], ['colon',/colon|^rectum|^cecum|^caecum|vermiform appendix/i], ['bladder',/^urinary bladder/i],
  ];
  const layerFor = s => systems.find(l=>l.parts.includes(s))?.id;
  const familyFor = name => familyRules.find(([,pattern])=>pattern.test(name))?.[0];
  const knownById = new Map(clinical.map(c=>[c.id,c]));
  const initialLayers = () => Object.fromEntries(systems.map(s=>[s.id,{visible:['bones','muscles'].includes(s.id),opacity:100}]));
  const [layers,setLayers] = useState(initialLayers);
  const [selected,setSelected] = useState(null);
  const [query,setQuery] = useState('');
  const [indexSystem,setIndexSystem] = useState('all');
  const [limit,setLimit] = useState(60);
  const [status,setStatus] = useState({});
  const [error,setError] = useState('');
  const [hovered,setHovered] = useState(null);
  const [zoom,setZoom] = useState(100);
  const [view,setView] = useState('Face');
  const [tab,setTab] = useState('layers');
  const [cut,setCut] = useState(false);
  const [cutPosition,setCutPosition] = useState(.5);
  const [hiddenIds,setHiddenIds] = useState([]);
  const [ready,setReady] = useState(false);
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const chooseRef = useRef(null);
  const latest = useRef({layers,selected,hiddenIds,cut,cutPosition});
  latest.current = {layers,selected,hiddenIds,cut,cutPosition};
  const catalog = useMemo(()=>anatomyIndex.map(d=>{
    const family=familyFor(d.name_en);
    const sheet=knownById.get(family);
    const side=/\(left\)/i.test(d.name_en)?'gauche':/\(right\)/i.test(d.name_en)?'droit':null;
    const display=sheet?`${sheet.name}${side?` · ${side}`:''}`:d.ta2_latin?.replace(/[()]/g,'')||d.name_en;
    return {...d,layer:layerFor(d.system),family,display};
  }),[]);
  const byId = useMemo(()=>new Map(catalog.map(d=>[d.organ_id,d])),[catalog]);
  const sheet = selected && knownById.get(selected.family);
  const selectedLayer = selected && systems.find(s=>s.id===selected.layer);
  const filtered = useMemo(()=>{
    const q=query.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return catalog.filter(d=>(indexSystem==='all'||d.layer===indexSystem)&&[d.display,d.name_en,d.ta2_latin,d.path.join(' ')].join(' ').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q));
  },[catalog,query,indexSystem]);
  const updateLayer=(id,patch)=>setLayers(p=>({...p,[id]:{...p[id],...patch}}));
  const choose=d=>{
    if(!d)return;
    setSelected(d);setHiddenIds(p=>p.filter(id=>id!==d.organ_id));
    setLayers(p=>({...p,[d.layer]:{visible:true,opacity:Math.max(65,p[d.layer].opacity)}}));
  };
  chooseRef.current=choose;
  const preset=(type)=>{
    const visible=type==='surface'?['bones','muscles']:type==='bones'?['bones']:type==='organs'?['bones','organs']:['bones','vessels','nerves'];
    setLayers(p=>Object.fromEntries(systems.map(s=>[s.id,{visible:visible.includes(s.id),opacity:s.id==='bones'&&type!=='bones'&&type!=='surface'?22:100}])));
    setHiddenIds([]);
  };
  const reset=()=>{
    setLayers(initialLayers());setSelected(null);setQuery('');setIndexSystem('all');setLimit(60);setHiddenIds([]);setCut(false);setCutPosition(.5);setView('Face');setTab('layers');
    apiRef.current?.reset();
  };

  useEffect(()=>{
    const host=hostRef.current;
    if(!host)return;
    let disposed=false, frame=0, renderer, controls, observer, highlighted=null, hoveredMesh=null;
    const groups={}, loading={}, meshes=[], resources=new Set(), materials=new Map();
    const urls=[];
    const scene=new THREE.Scene();scene.background=new THREE.Color('#f3f2ee');
    const camera=new THREE.PerspectiveCamera(32,1,.005,30);
    const model=new THREE.Group();scene.add(model);
    const center=new THREE.Vector3(0,.86,0);
    let homeDistance=3.2;
    const raycaster=new THREE.Raycaster();
    const pointer=new THREE.Vector2();
    const clipPlane=new THREE.Plane(new THREE.Vector3(0,0,-1),.05);
    let bounds=new THREE.Box3(new THREE.Vector3(-.5,0,-.2),new THREE.Vector3(.5,1.8,.2));
    let dragging=false, down=null;
    const colorFor=(d)=>{
      if(d.layer==='bones')return '#ddd3b9';
      if(d.layer==='muscles')return /tendon|aponeurosis|bursa|fascia/i.test(d.name_en)?'#d8ccba':'#a75448';
      if(d.layer==='vessels')return /vein|venous|right atrium|right ventricle/i.test(d.name_en)?'#547b9c':'#af4143';
      if(d.layer==='nerves')return /nerve|ganglion|plexus/i.test(d.name_en)?'#c2a252':/cerebell|cerebr|gyrus|thalam/i.test(d.name_en)?'#c9b2a2':'#c4b997';
      return /liver/i.test(d.name_en)?'#8a4f3f':/kidney/i.test(d.name_en)?'#9e5046':/lung/i.test(d.name_en)?'#c38c8b':/stomach/i.test(d.name_en)?'#ce9a8b':/colon|rectum/i.test(d.name_en)?'#b08e79':/intestine|jejunum|ileum|duodenum/i.test(d.name_en)?'#c79b85':'#c4ab8e';
    };
    const materialFor=d=>{
      const color=colorFor(d),key=d.layer+color;
      if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.72,metalness:0,side:THREE.DoubleSide}));
      return materials.get(key);
    };
    const restore=m=>{if(m){if(m.material!==m.userData.baseMaterial)m.material.dispose();m.material=m.userData.baseMaterial;}};
    const mark=(mesh,hover=false)=>{
      if(!mesh)return;
      if(mesh.material!==mesh.userData.baseMaterial)mesh.material.dispose();
      mesh.material=mesh.userData.baseMaterial.clone();
      mesh.material.color.set(hover?'#ccaa73':'#367a77');
      mesh.material.emissive.set(hover?'#271b08':'#103e3c');mesh.material.emissiveIntensity=.15;
      mesh.material.opacity=1;mesh.material.transparent=false;mesh.material.depthWrite=true;
    };
    const sync=()=>{
      if(disposed)return;
      const state=latest.current;
      for(const s of systems){
        const group=groups[s.id];if(group)group.visible=state.layers[s.id].visible&&state.layers[s.id].opacity>0;
      }
      for(const mat of materials.values()){
        const layer=mat.userData.layer;
        if(!layer)continue;
        const opacity=state.layers[layer].opacity/100;
        mat.opacity=opacity;mat.transparent=opacity<.995;mat.depthWrite=opacity>=.995;
        mat.clippingPlanes=state.cut?[clipPlane]:[];mat.needsUpdate=true;
      }
      clipPlane.constant=bounds.min.z+(bounds.max.z-bounds.min.z)*state.cutPosition;
      for(const mesh of meshes)mesh.visible=!state.hiddenIds.includes(mesh.userData.organId);
      if(hoveredMesh&&hoveredMesh!==highlighted)restore(hoveredMesh);
      restore(highlighted);
      highlighted=meshes.find(m=>m.userData.organId===state.selected?.organ_id)||null;
      if(highlighted)mark(highlighted);
      requestRender();
    };
    function requestRender(){if(!frame&&!disposed)frame=requestAnimationFrame(()=>{frame=0;if(!disposed&&renderer)renderer.render(scene,camera);});}
    const applyView=(name)=>{
      if(!controls)return;
      const direction=name==='Dos'?new THREE.Vector3(0,0,-1):name==='Profil droit'?new THREE.Vector3(-1,0,0):name==='Profil gauche'?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1);
      controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,homeDistance);camera.up.set(0,1,0);controls.update();setView(name);requestRender();
    };
    const fit=()=>{
      if(!renderer||!host.clientWidth)return;
      const width=host.clientWidth,height=host.clientHeight;
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      const heightModel=bounds.max.y-bounds.min.y;
      const widthModel=bounds.max.x-bounds.min.x;
      homeDistance=Math.max(heightModel/2/Math.tan(THREE.MathUtils.degToRad(16)),widthModel/2/Math.tan(THREE.MathUtils.degToRad(16))/camera.aspect)*1.13;
      requestRender();
    };
    const loadLayer=async(id)=>{
      if(loading[id])return loading[id];
      const config=systems.find(s=>s.id===id);
      const group=new THREE.Group();groups[id]=group;model.add(group);
      setStatus(p=>({...p,[id]:'loading'}));
      loading[id]=(async()=>{
        try{
          for(const part of config.parts){
            if(disposed)return;
            const bytes=Uint8Array.from(atob(anatomyModels[part]),c=>c.charCodeAt(0));
            const result=await loader.parseAsync(bytes.buffer,'');
            if(disposed){result.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material?.dispose();}});return;}
            const keep=[];
            result.scene.updateMatrixWorld(true);
            result.scene.traverse(o=>{
              if(!o.isMesh)return;
              const id=o.userData.organId || o.parent?.userData.organId;
              const d=byId.get(id);
              if(!d){o.geometry.dispose();o.material?.dispose();return;}
              const world=o.matrixWorld.clone();
              o.material?.dispose();
              const mat=materialFor(d);mat.userData.layer=d.layer;
              o.material=mat;o.userData.baseMaterial=mat;o.userData.organId=id;
              o.userData.layer=d.layer;resources.add(o.geometry);
              keep.push({o,world});
            });
            for(const {o,world} of keep){o.removeFromParent();o.matrix.copy(world);o.matrix.decompose(o.position,o.quaternion,o.scale);group.add(o);meshes.push(o);}
          }
          if(id==='bones'){
            bounds=new THREE.Box3().setFromObject(group);bounds.getCenter(center);fit();applyView('Face');
          }
          setStatus(p=>({...p,[id]:'ready'}));sync();setReady(true);
        }catch(e){
          if(disposed)return;
          setStatus(p=>({...p,[id]:'error'}));setError(`Le calque ${config.name.toLowerCase()} n’a pas pu être chargé. Réinitialisez la page pour réessayer.`);
          console.error(e);
        }
      })();
      return loading[id];
    };
    let loader,draco;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.localClippingEnabled=true;
      renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none;outline:none;';
      renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Corps humain 3D. Flèches : rotation ; plus et moins : zoom ; touche F : vue de face. Sélection des structures disponible dans l’index.');
      renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight('#fffdf5','#b5aaa0',2));
      const key=new THREE.DirectionalLight('#fff7eb',3);key.position.set(-3,4,5);scene.add(key);
      const fill=new THREE.DirectionalLight('#e1edf2',1.7);fill.position.set(3,2,-4);scene.add(fill);
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.minDistance=.08;controls.maxDistance=10;controls.enablePan=true;controls.rotateSpeed=.65;controls.zoomSpeed=.7;controls.target.copy(center);
      camera.position.set(0,.86,3.2);
      controls.addEventListener('change',()=>{setZoom(Math.round(homeDistance/Math.max(.01,camera.position.distanceTo(controls.target))*100));requestRender();});
      const decoderURL=URL.createObjectURL(new Blob([dracoJS],{type:'text/javascript'}));
      const wasmBytes=Uint8Array.from(atob(dracoWASM),c=>c.charCodeAt(0));
      const wasmURL=URL.createObjectURL(new Blob([wasmBytes],{type:'application/wasm'}));urls.push(decoderURL,wasmURL);
      draco=new DRACOLoader().setDecoderPath({js:decoderURL,wasm:wasmURL}).setWorkerLimit(2);
      loader=new GLTFLoader().setDRACOLoader(draco);
      apiRef.current={sync,loadLayer,view:applyView,reset:()=>{applyView('Face');},zoom:factor=>{camera.position.sub(controls.target).multiplyScalar(factor).clampLength(controls.minDistance,controls.maxDistance).add(controls.target);controls.update();requestRender();},focus:async d=>{
        await loadLayer(d.layer);if(disposed)return;
        const mesh=meshes.find(m=>m.userData.organId===d.organ_id);if(!mesh)return;
        const box=new THREE.Box3().setFromObject(mesh);const target=box.getCenter(new THREE.Vector3());
        const size=box.getSize(new THREE.Vector3()).length();
        const direction=camera.position.clone().sub(controls.target).normalize();
        controls.target.copy(target);camera.position.copy(target).addScaledVector(direction,Math.max(.16,size*2.3));controls.update();requestRender();
      }};
      const hit=e=>{
        const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
        const s=latest.current;
        const candidates=meshes.filter(m=>m.visible&&groups[m.userData.layer]?.visible&&s.layers[m.userData.layer].opacity>=10);
        const intersections=raycaster.intersectObjects(candidates,false);
        return intersections.find(i=>!s.cut||clipPlane.distanceToPoint(i.point)>=0)?.object;
      };
      let hoverFrame=0;
      const move=e=>{
        if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){dragging=true;setView('Libre');}
        if(down||hoverFrame)return;
        hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;if(disposed)return;const mesh=hit(e);
          if(mesh!==hoveredMesh){if(hoveredMesh!==highlighted)restore(hoveredMesh);hoveredMesh=mesh;if(mesh!==highlighted)mark(mesh,true);setHovered(mesh?byId.get(mesh.userData.organId)?.display:null);renderer.domElement.style.cursor=mesh?'pointer':'grab';requestRender();}
        });
      };
      const onDown=e=>{down={x:e.clientX,y:e.clientY};dragging=false;};
      const onUp=e=>{if(down&&!dragging){const mesh=hit(e);if(mesh)chooseRef.current(byId.get(mesh.userData.organId));}down=null;};
      const leave=()=>{down=null;if(hoveredMesh!==highlighted)restore(hoveredMesh);hoveredMesh=null;setHovered(null);requestRender();};
      const keyboard=e=>{
        if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','f','F'].includes(e.key))return;
        e.preventDefault();
        if(['+','=','-'].includes(e.key)){apiRef.current.zoom(e.key==='-'?1.15:1/1.15);return;}
        if(e.key.toLowerCase()==='f'){applyView('Face');return;}
        const offset=camera.position.clone().sub(controls.target);const sph=new THREE.Spherical().setFromVector3(offset);
        if(e.key==='ArrowLeft')sph.theta-=.15;if(e.key==='ArrowRight')sph.theta+=.15;
        if(e.key==='ArrowUp')sph.phi-=.15;if(e.key==='ArrowDown')sph.phi+=.15;
        sph.makeSafe();camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));controls.update();setView('Libre');requestRender();
      };
      const contextLost=e=>{e.preventDefault();setError('Le rendu 3D a été interrompu par le navigateur. Rechargez la page pour rétablir le modèle.');};
      renderer.domElement.addEventListener('webglcontextlost',contextLost);
      renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',onUp);renderer.domElement.addEventListener('pointerleave',leave);renderer.domElement.addEventListener('keydown',keyboard);
      observer=new ResizeObserver(()=>{fit();requestRender();});observer.observe(host);fit();
      (async()=>{await loadLayer('bones');if(!disposed)await loadLayer('muscles');})();
      const cleanupEvents=()=>{cancelAnimationFrame(hoverFrame);renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',onUp);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('keydown',keyboard);renderer.domElement.removeEventListener('webglcontextlost',contextLost);};
      apiRef.current.cleanupEvents=cleanupEvents;
    }catch(e){setError('La 3D nécessite WebGL. Activez l’accélération graphique dans votre navigateur ou utilisez un navigateur récent.');console.error(e);}
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer?.disconnect();apiRef.current?.cleanupEvents?.();apiRef.current=null;controls?.dispose();draco?.dispose();restore(highlighted);if(hoveredMesh!==highlighted)restore(hoveredMesh);resources.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer?.dispose();renderer?.domElement.remove();urls.forEach(u=>URL.revokeObjectURL(u));
    };
  },[]);
  useEffect(()=>{
    for(const s of systems)if(layers[s.id].visible)apiRef.current?.loadLayer(s.id);
    apiRef.current?.sync();
  },[layers,selected,hiddenIds,cut,cutPosition]);
  const loading=Object.values(status).some(v=>v==='loading');
  const active=systems.filter(s=>layers[s.id].visible&&layers[s.id].opacity>0).length;
  const selectedHidden=selected&&(!layers[selected.layer].visible||layers[selected.layer].opacity===0||hiddenIds.includes(selected.organ_id));
  return <div className="anatomy-app min-h-screen bg-[#f7f7f4] font-sans text-stone-800" style={{colorScheme:'light'}}>
    <style>{`
      .anatomy-app { --ink:#233630; --accent:#37645a; --line:#dfdfd7; font-family:Arial,Helvetica,sans-serif; }
      .anatomy-app * { box-sizing:border-box; }
      .anatomy-app button,.anatomy-app input,.anatomy-app select { font:inherit; }
      .anatomy-app button { cursor:pointer; }
      .anatomy-app button:disabled { cursor:default; opacity:.45; }
      .anatomy-app :focus-visible { outline:2px solid #37645a; outline-offset:3px; }
      .anatomy-app input[type=range] { accent-color:#37645a; }
      .atlas-scroll { scrollbar-width:thin; scrollbar-color:#c9c9c0 transparent; }
      .atlas-panel { background:#fff; border:1px solid var(--line); border-radius:8px; }
      .atlas-btn { display:inline-flex; min-height:40px; align-items:center; justify-content:center; gap:8px; border:1px solid #d7d9d2; background:#fff; padding:8px 12px; border-radius:5px; font-size:12px!important; color:#43554c; }
      .atlas-btn:hover { background:#f0f2eb; }
      .atlas-kicker { font-size:10px; line-height:1.5; font-weight:600; letter-spacing:.13em; text-transform:uppercase; color:#73786d; }
      .atlas-heading { font-family:Georgia,'Times New Roman',serif; font-weight:400; color:#233630; }
      .atlas-tab[aria-selected=true] { border-bottom:2px solid #37645a; color:#294e44; font-weight:600; }
      .atlas-spin { animation:atlas-spin 1s linear infinite; } @keyframes atlas-spin {to{transform:rotate(360deg)}}
      @media(min-width:1180px){.atlas-workspace{height:calc(100dvh - 140px);min-height:650px;grid-template-columns:260px minmax(0,1fr) 310px;} .atlas-sidebar{height:100%;overflow-y:auto;} .atlas-viewer{height:100%;min-height:650px;}}
      @media(min-width:1500px){.atlas-workspace{grid-template-columns:285px minmax(0,1fr) 335px;}}
      @media(max-width:1179px){.atlas-workspace{grid-template-columns:240px minmax(0,1fr);} .atlas-sidebar{max-height:680px;overflow-y:auto;} .atlas-info{grid-column:1/-1;max-height:none;} .atlas-viewer{height:680px;} }
      @media(max-width:699px){.atlas-workspace{grid-template-columns:1fr;}.atlas-viewer{height:580px;grid-row:1;}.atlas-sidebar{max-height:530px;}.atlas-info{grid-column:auto;}.atlas-header-note{display:none;}}
      @media(prefers-reduced-motion:reduce){.atlas-spin{animation:none;}}
    `}</style>
    <header className="border-b border-stone-200 bg-white px-4 py-4 sm:px-7">
      <div className="mx-auto flex max-w-[1900px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded border border-[#c6d2c8] bg-[#edf2eb] text-[#37645a]"><Activity size={24} strokeWidth={1.4}/></div><div><p className="atlas-kicker">Atlas anatomique · Édition d’étude</p><h1 className="atlas-heading text-xl sm:text-2xl">Anatomie humaine</h1></div></div>
        <div className="flex items-center gap-4"><span className="atlas-header-note text-xs text-stone-500">Modèle masculin adulte <span className="mx-2 text-stone-300">|</span> Exploration tridimensionnelle</span><button type="button" className="atlas-btn" onClick={reset}><RotateCcw size={14}/>Réinitialiser</button></div>
      </div>
    </header>
    <div className="mx-auto max-w-[1900px] px-3 pb-4 sm:px-6">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 py-3"><p className="flex items-center gap-2 text-xs text-stone-500"><BookOpen size={14}/><span>Bibliothèque anatomique</span><ChevronRight size={12}/><span className="font-medium text-stone-700">Corps entier</span></p><p className="text-xs text-stone-500">{catalog.length.toLocaleString('fr-FR')} structures identifiées <span className="mx-2">·</span> 5 systèmes</p></div>
      <div className="atlas-workspace grid items-start gap-3">
        <aside aria-label="Calques et index anatomiques" className="atlas-panel atlas-sidebar atlas-scroll">
          <div className="flex border-b border-stone-200 px-4" role="tablist" aria-label="Navigation des structures">{[['layers','Calques',Layers],['index','Index',Search]].map(([id,label,Icon])=><button key={id} type="button" role="tab" aria-selected={tab===id} aria-controls={`atlas-panel-${id}`} id={`atlas-tab-${id}`} onClick={()=>setTab(id)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=id==='layers'?'index':'layers';setTab(next);document.getElementById(`atlas-tab-${next}`)?.focus();}}} tabIndex={tab===id?0:-1} className="atlas-tab flex min-h-14 flex-1 items-center justify-center gap-2 border-b-2 border-transparent text-xs text-stone-500"><Icon size={15}/>{label}</button>)}</div>
          {tab==='layers'?<div id="atlas-panel-layers" role="tabpanel" aria-labelledby="atlas-tab-layers" className="p-4">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Systèmes anatomiques</h2><span className="text-xs text-stone-500">{active}/5</span></div>
            <p className="mb-4 text-xs leading-relaxed text-stone-500">Affichez les structures et ajustez leur transparence.</p>
            <div className="space-y-3">{systems.map(s=><section key={s.id} className={`rounded-md border p-3 ${layers[s.id].visible?'border-[#cbd4ca] bg-[#f8faf6]':'border-stone-200 bg-white'}`}>
              <div className="flex items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full" style={{background:s.color}}/><h3 className="flex-1 text-xs font-semibold leading-normal">{s.name}</h3><button type="button" aria-label={`${layers[s.id].visible?'Masquer':'Afficher'} ${s.name}`} aria-pressed={layers[s.id].visible} onClick={()=>updateLayer(s.id,{visible:!layers[s.id].visible})} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-[#37645a] hover:bg-stone-100">{status[s.id]==='loading'?<LoaderCircle size={16} className="atlas-spin"/>:layers[s.id].visible?<Eye size={16}/>:<EyeOff size={16} className="text-stone-400"/>}</button></div>
              <p className="mt-1 text-[10px] text-stone-500">{catalog.filter(d=>d.layer===s.id).length} structures · {s.detail}</p>
              <div className="mt-3 flex justify-between text-[10px] text-stone-600"><label htmlFor={`opacity-${s.id}`}>Opacité</label><output htmlFor={`opacity-${s.id}`}>{layers[s.id].opacity}%</output></div><input id={`opacity-${s.id}`} type="range" min="0" max="100" step="5" value={layers[s.id].opacity} onChange={e=>updateLayer(s.id,{opacity:Number(e.target.value)})} className="mt-1 h-5 w-full cursor-pointer"/>
            </section>)}</div>
            <div className="mt-4 flex gap-2"><button type="button" className="atlas-btn flex-1" onClick={()=>setLayers(p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,{...v,visible:true}])))}>Tout afficher</button><button type="button" className="atlas-btn flex-1" onClick={()=>setLayers(p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,{...v,visible:false}])))}>Masquer</button></div>
            <div className="mt-6 border-t border-stone-200 pt-4"><h2 className="atlas-kicker mb-3">Vues d’étude</h2><div className="grid grid-cols-2 gap-2">{[['surface','Musculature'],['bones','Squelette'],['organs','Viscères'],['networks','Nerfs & vaisseaux']].map(([id,name])=><button key={id} type="button" className="atlas-btn" onClick={()=>preset(id)}>{name}</button>)}</div></div>
            <div className="mt-5 rounded-md bg-[#f2f3ee] p-3 text-[11px] leading-relaxed text-stone-600"><Info size={14} className="mb-2 text-[#597364]"/>Pour voir un organe profond, masquez les structures superficielles ou sélectionnez-le dans l’index.</div>
          </div>:<div id="atlas-panel-index" role="tabpanel" aria-labelledby="atlas-tab-index" className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Rechercher une structure</h2>
            <label className="flex items-center gap-2 rounded border border-stone-300 px-2"><Search size={15} className="text-stone-400"/><input type="search" aria-label="Rechercher dans l’index" placeholder="Français, latin, anglais…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(60);}} className="min-h-10 min-w-0 w-full bg-transparent text-xs outline-none"/></label>
            <label htmlFor="index-system" className="sr-only">Filtrer par système</label><select id="index-system" value={indexSystem} onChange={e=>{setIndexSystem(e.target.value);setLimit(60);}} className="mt-2 min-h-10 w-full rounded border border-stone-300 bg-white px-2 text-xs"><option value="all">Tous les systèmes</option>{systems.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
            <p className="my-3 text-[11px] text-stone-500">{filtered.length} résultat{filtered.length>1?'s':''} · nom exact sous le libellé</p>
            <div className="space-y-1">{filtered.slice(0,limit).map(d=><button type="button" key={d.organ_id} aria-pressed={selected?.organ_id===d.organ_id} onClick={()=>choose(d)} className={`flex min-h-12 w-full items-center gap-2 rounded border px-2 py-2 text-left ${selected?.organ_id===d.organ_id?'border-[#8ca89b] bg-[#edf3ec]':'border-transparent hover:bg-stone-100'}`}><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{background:systems.find(s=>s.id===d.layer)?.color}}/><span className="min-w-0 flex-1"><span className="block text-xs leading-normal">{d.display}</span><span className="mt-1 block break-words text-[10px] leading-normal text-stone-500">{d.name_en}</span></span><ChevronRight size={12} className="shrink-0 text-stone-400"/></button>)}</div>
            {filtered.length===0&&<p role="status" className="py-5 text-xs text-stone-500">Aucune structure correspondante.</p>}
            {limit<filtered.length&&<button type="button" className="atlas-btn mt-4 w-full" onClick={()=>setLimit(l=>l+60)}><ChevronDown size={14}/>Afficher 60 résultats de plus</button>}
          </div>}
        </aside>
        <main className="atlas-panel atlas-viewer relative flex min-w-0 flex-col overflow-hidden">
          <div className="z-10 flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3"><div><p className="atlas-kicker">Exploration 3D</p><h2 className="atlas-heading mt-1 text-xl">{selected?'Structure sélectionnée':'Corps humain entier'}</h2></div><div className="flex gap-1 rounded border border-stone-200 p-1">{[['Face','Face'],['Dos','Dos'],['Profil droit','Profil']].map(([id,label])=><button key={id} type="button" onClick={()=>apiRef.current?.view(id)} aria-pressed={view===id} className={`min-h-8 rounded px-3 text-xs ${view===id?'bg-[#eaf0e8] font-semibold text-[#37645a]':'text-stone-500 hover:bg-stone-100'}`}>{label}</button>)}</div></div>
          <div className="relative min-h-0 flex-1 bg-[#f3f2ee]">
            <div ref={hostRef} className="absolute inset-0"/>
            <div className="pointer-events-none absolute left-4 top-4"><p className="atlas-kicker">{view==='Face'?'Vue antérieure':view==='Dos'?'Vue postérieure':view==='Profil droit'?'Vue latérale droite':'Vue libre'}</p><p className="mt-1 text-[10px] text-stone-500">Maillages anatomiques · Z-Anatomy</p></div>
            {(loading||!ready)&&!error&&<div role="status" className="absolute bottom-16 left-4 right-4 flex items-center gap-2 rounded border border-stone-200 bg-white/95 px-3 py-2 text-xs text-stone-600"><LoaderCircle size={15} className="atlas-spin shrink-0"/>Préparation des structures 3D… {Object.values(status).filter(s=>s==='ready').length}/5 calques</div>}
            {error&&<div role="alert" className="absolute inset-x-4 top-20 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle size={18} className="mb-2"/>{error}</div>}
            {active===0&&ready&&!error&&<div role="status" className="absolute inset-x-8 top-1/3 rounded border border-stone-300 bg-white p-5 text-center text-sm">Aucun système visible.<button type="button" className="mt-3 block w-full text-[#37645a] underline" onClick={()=>preset('surface')}>Afficher la musculature</button></div>}
            {hovered&&<div className="pointer-events-none absolute bottom-4 left-4 max-w-[70%] rounded border border-stone-200 bg-white/95 px-3 py-2 text-xs text-stone-700">{hovered}</div>}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-md border border-stone-300 bg-white p-1 shadow-sm"><button type="button" aria-label="Agrandir le modèle" title="Zoom avant" className="flex h-10 w-10 items-center justify-center rounded hover:bg-stone-100" onClick={()=>apiRef.current?.zoom(1/1.2)}><ZoomIn size={17}/></button><span className="text-center text-[10px] text-stone-500">{zoom}%</span><button type="button" aria-label="Réduire le modèle" title="Zoom arrière" className="flex h-10 w-10 items-center justify-center rounded hover:bg-stone-100" onClick={()=>apiRef.current?.zoom(1.2)}><ZoomOut size={17}/></button><div className="mx-1 border-t border-stone-200"/><button type="button" aria-label="Recadrer le corps entier" title="Corps entier" className="flex h-10 w-10 items-center justify-center rounded hover:bg-stone-100" onClick={()=>apiRef.current?.reset()}><Maximize size={16}/></button></div>
          </div>
          <div className="border-t border-stone-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><label className="flex min-h-8 cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={cut} onChange={e=>setCut(e.target.checked)} className="accent-[#37645a]"/>Coupe exploratoire</label><div className="flex items-center gap-3 text-[10px] text-stone-500"><span className="flex items-center gap-1"><Rotate3D size={13}/>Glisser : rotation</span><span className="flex items-center gap-1"><Move size={13}/>Clic droit : déplacer</span></div></div>
            {cut&&<div className="mt-2 flex items-center gap-3"><label htmlFor="section-position" className="text-[10px] text-stone-500">Profondeur</label><input id="section-position" type="range" min="0" max="1" step=".01" value={cutPosition} onChange={e=>setCutPosition(Number(e.target.value))} className="h-6 min-w-0 flex-1"/><output className="text-[10px]">{Math.round(cutPosition*100)}%</output></div>}
          </div>
        </main>
        <aside aria-label="Fiche anatomique" className="atlas-panel atlas-sidebar atlas-info atlas-scroll">
          <div className="flex min-h-14 items-center justify-between border-b border-stone-200 px-5"><h2 className="text-xs font-semibold">Fiche anatomique</h2>{selected?<button type="button" aria-label="Fermer la fiche" onClick={()=>setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded hover:bg-stone-100"><X size={15}/></button>:<BookOpen size={15} className="text-stone-400"/>}</div>
          {selected?<article className="p-5" aria-live="polite">
            <p className="atlas-kicker mb-2">{selectedLayer?.name}</p><h2 className="atlas-heading break-words text-2xl leading-tight">{selected.display}</h2>
            <p className="mt-2 break-words text-xs italic leading-relaxed text-stone-500">{selected.ta2_latin}</p>
            <p className="mt-3 border-l-2 border-[#cad5c7] pl-3 text-[11px] leading-relaxed text-stone-500">Nom exact de la structure dans l’atlas :<br/><span className="font-medium text-stone-700">{selected.name_en}</span></p>
            <div className="mt-5 flex gap-2"><button type="button" className="atlas-btn flex-1" onClick={()=>{choose(selected);apiRef.current?.focus(selected);}}><Crosshair size={14}/>Cadrer</button><button type="button" className="atlas-btn flex-1" onClick={()=>setLayers(p=>Object.fromEntries(systems.map(s=>[s.id,{...p[s.id],visible:s.id===selected.layer,opacity:s.id===selected.layer?100:p[s.id].opacity}])))}><Layers size={14}/>Isoler le système</button></div>
            <div className="mt-2 flex gap-2"><button type="button" className="atlas-btn flex-1" onClick={()=>setHiddenIds(p=>p.includes(selected.organ_id)?p.filter(id=>id!==selected.organ_id):[...p,selected.organ_id])}>{hiddenIds.includes(selected.organ_id)?<Eye size={14}/>:<EyeOff size={14}/>} {hiddenIds.includes(selected.organ_id)?'Réafficher':'Masquer la structure'}</button></div>
            {selectedHidden&&<p className="mt-3 rounded bg-amber-50 p-2 text-xs leading-normal text-amber-900">Cette structure est masquée. <button type="button" className="underline" onClick={()=>choose(selected)}>La réafficher</button></p>}
            {sheet?<>
              <div className="mt-6 border-t border-stone-200 pt-5"><p className="atlas-kicker mb-3">Fiche de référence · {sheet.name}</p><h3 className="mb-2 text-xs font-semibold">Fonction biologique</h3><p className="text-xs leading-6 text-stone-600">{sheet.role}</p></div>
              <h3 className="mb-2 mt-5 text-xs font-semibold">Repères anatomiques</h3><p className="text-xs leading-6 text-stone-600">{sheet.metrics}</p>
              <h3 className="mb-2 mt-5 text-xs font-semibold">Pathologies associées</h3><p className="text-xs leading-6 text-stone-600">{sheet.pathologies}</p>
              <div className="mt-5 rounded-md border border-[#d7dfd1] bg-[#f3f6ef] p-3"><h3 className="flex items-center gap-2 text-xs font-semibold text-[#37645a]"><Info size={14}/>Le saviez-vous ?</h3><p className="mt-2 text-xs leading-6 text-stone-600">{sheet.fact}</p></div>
              <p className="mt-3 text-[10px] leading-relaxed text-stone-500">La fiche décrit la structure ou sa famille anatomique. Le nom exact sélectionné est indiqué ci-dessus.</p>
            </>:<div className="mt-6 border-t border-stone-200 pt-5"><h3 className="text-xs font-semibold">Identification dans l’atlas</h3><p className="mt-3 text-xs leading-6 text-stone-600">Cette structure est disponible en 3D. Sa fiche biologique détaillée n’a pas encore été rédigée.</p><p className="mt-3 text-[11px] leading-relaxed text-stone-500">Hiérarchie source : {selected.path.join(' › ')||selected.system}. Les termes de l’atlas sont conservés dans leur langue source.</p></div>}
          </article>:<div className="p-5">
            <p className="atlas-kicker mt-1">Comprendre le corps humain</p><h2 className="atlas-heading mt-3 text-3xl leading-tight">Observer.<br/>Isoler. Comprendre.</h2><p className="mt-4 text-xs leading-6 text-stone-600">Un atlas tridimensionnel pour explorer les relations entre les structures anatomiques.</p>
            <div className="mt-6 space-y-5">{[[Rotate3D,'Manipuler le modèle','Glissez pour tourner. Utilisez la molette ou pincez avec deux doigts pour zoomer.'],[Layers,'Explorer par système','Masquez un calque pour révéler les structures en profondeur.'],[Crosshair,'Examiner une structure','Cliquez sur le corps ou recherchez un nom dans l’index.']].map(([Icon,title,text])=><div key={title} className="flex gap-3"><span className="mt-1 text-[#6a8170]"><Icon size={18} strokeWidth={1.5}/></span><div><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-xs leading-6 text-stone-500">{text}</p></div></div>)}</div>
            <button type="button" className="atlas-btn mt-6 w-full" onClick={()=>{setTab('index');setQuery('');}}>Ouvrir l’index anatomique<ChevronRight size={14}/></button>
            <div className="mt-6 border-t border-stone-200 pt-4"><p className="atlas-kicker">Études rapides</p><div className="mt-2 flex flex-wrap gap-2">{[['femur','Fémur'],['biceps','Biceps'],['kidneys','Rein'],['sciatic','Nerf sciatique']].map(([id,name])=><button type="button" key={id} className="atlas-btn" onClick={()=>{const d=catalog.find(d=>d.family===id);choose(d);if(d)apiRef.current?.focus(d);}}>{name}</button>)}</div></div>
          </div>}
          <footer className="mx-5 mb-5 border-t border-stone-200 pt-4 text-[10px] leading-relaxed text-stone-500"><p>Modèle pédagogique masculin adulte. Variations individuelles non représentées. La coupe exploratoire ne remplace pas une coupe d’imagerie et ses surfaces ne sont pas refermées.</p><details className="mt-3"><summary className="cursor-pointer font-medium text-[#526b5b]">Sources, données & licences</summary><p className="mt-2">Maillages : <a className="underline" target="_blank" rel="noreferrer" href="https://github.com/Nurkan1/Anatria-3D">Anatria3D</a>, dérivés de <a className="underline" href="https://www.z-anatomy.com/" target="_blank" rel="noreferrer">Z-Anatomy</a> et BodyParts3D / DBCLS. Maillages et nomenclature : <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Ajout d’identifiants pour la sélection ; géométrie inchangée. Nomenclature source non revue intégralement. Les fiches rédigées couvrent {clinical.length} structures ou familles. Références pédagogiques : <a className="underline" href="https://openstax.org/details/books/anatomy-and-physiology-2e" target="_blank" rel="noreferrer">OpenStax</a>, <a className="underline" href="https://www.nhlbi.nih.gov/health/heart/heart-beats" target="_blank" rel="noreferrer">NHLBI</a>. Three.js : MIT ; décodeur Draco : Apache-2.0. Outil d’étude, sans usage diagnostique.</p></details>
          </footer>
        </aside>
      </div>
    </div>
  </div>;
}
