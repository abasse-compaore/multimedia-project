# 🏛️ Musée des Sciences et Technologies d'IBAM

## 🌟 Description

Un musée interactif 3D futuriste créé avec **Three.js** qui présente quatre collections thématiques via une expérience immersive et cinématique. Le projet combine WebGL avancé, animations CSS/JS modernes et une interface UX/UI futuriste.

## ✨ Fonctionnalités Principales

### 🎨 Expérience Visuelle
- **Rendu 3D avancé** avec Three.js et WebGL
- **Système de particules** avec effets néon flottants
- **Éclairage dynamique** (spotlights, point lights, ambient)
- **Animations fluides** et transitions cinématiques
- **Effets holographiques** et glitch
- **Palette cyberpunk** : cyan électrique, violet néon, vert néon

### 🏗️ Architecture 3D
- **Hall central** avec plafond voûté et colonnes lumineuses
- **4 galeries thématiques** rayonnantes
- **Portes animées** avec effets de lumière
- **Système de téléportation** entre sections
- **Caméra orbitale** avec contrôles intuitifs

### 🎯 Interactions
- **Objets cliquables** avec détection par raycasting
- **Panneaux d'information** flottants
- **Menu holographique** latéral animé
- **Navigation au clavier et souris**
- **Hover effects** sur tous les éléments interactifs

### 📚 Collections

#### 🎓 Technologies IBAM
- Électronique Avancée
- Intelligence Artificielle
- Cybersécurité
- Robotique Industrielle
- Digitalisation
- Énergie Solaire
- Agriculture Intelligente

#### 🤖 Technologies Modernes
- Robotique Avancée
- Assistant IA
- Intelligence Artificielle
- Réalité Virtuelle
- Robot Humanoïde

#### ⚙️ Technologies Anciennes
- Instruments Historiques
- Révolution Industrielle

#### 🔬 Histoire des Sciences
- Nikola Tesla
- Albert Einstein
- Isaac Newton
- Marie Curie
- Thomas Edison

## 🚀 Installation & Lancement

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Un serveur web local (recommandé)

### Méthode 1 : Serveur Local Simple

#### Avec Python 3
```bash
cd multimedia
python -m http.server 8000
```

#### Avec Node.js (http-server)
```bash
npm install -g http-server
cd multimedia
http-server -p 8000
```

#### Avec PHP
```bash
cd multimedia
php -S localhost:8000
```

### Méthode 2 : Extension VS Code
1. Installer l'extension "Live Server"
2. Clic droit sur `index.html`
3. Sélectionner "Open with Live Server"

### Accès
Ouvrir votre navigateur et accéder à : `http://localhost:8000`

## 🎮 Contrôles

### Souris
- **Clic gauche + Glisser** : Rotation de la caméra
- **Molette** : Zoom avant/arrière
- **Clic sur objet** : Afficher les informations

### Interface
- **Menu latéral** : Navigation entre les sections
- **Bouton hamburger** : Afficher/masquer le menu
- **Bouton reset** : Réinitialiser la vue caméra
- **Bouton audio** : Activer/désactiver le son

## 📁 Structure du Projet

```
multimedia/
├── index.html          # Structure HTML principale
├── style.css           # Styles et animations CSS
├── app.js             # Moteur 3D Three.js et logique
├── README.md          # Documentation
└── assets/            # Ressources multimédia
    ├── ibam/          # Technologies IBAM
    ├── modern-tech/   # Technologies modernes
    ├── old-tech/      # Technologies anciennes
    └── sciences-storie/ # Histoire des sciences
```

## 🛠️ Technologies Utilisées

### Core
- **Three.js r152** - Moteur 3D WebGL
- **OrbitControls** - Contrôles de caméra
- **GLTFLoader** - Chargement de modèles 3D

### Design
- **Google Fonts** - Orbitron & Rajdhani
- **CSS3 Animations** - Transitions et effets
- **CSS Grid & Flexbox** - Layout responsive

### Effets
- **Particle System** - Particules flottantes
- **Dynamic Lighting** - Éclairage réactif
- **Fog Effect** - Brouillard atmosphérique
- **Shadow Mapping** - Ombres réalistes

## 🎨 Personnalisation

### Modifier les Couleurs
Éditer les variables CSS dans `style.css` :
```css
:root {
    --primary-cyan: #00f3ff;
    --primary-purple: #9d00ff;
    --neon-green: #00ff88;
    --dark-bg: #0a0a1a;
}
```

### Ajouter du Contenu
Éditer l'objet `sectionsData` dans `app.js` :
```javascript
const sectionsData = {
    nouvelle_section: {
        name: "Nom de la Section",
        color: 0x00f3ff,
        items: [
            {
                title: "Titre",
                image: "chemin/vers/image.jpg",
                description: "Description"
            }
        ]
    }
};
```

### Ajuster la Caméra
Modifier `CONFIG` dans `app.js` :
```javascript
const CONFIG = {
    camera: {
        fov: 75,
        position: { x: 0, y: 5, z: 20 }
    }
};
```

## 🔧 Optimisation

### Performances
- **LOD (Level of Detail)** : Modèles simplifiés à distance
- **Frustum Culling** : Objets hors champ non rendus
- **Texture Compression** : Formats optimisés
- **Lazy Loading** : Chargement progressif des assets

### Responsive
- Adaptation automatique aux différentes tailles d'écran
- Menu mobile avec toggle
- Contrôles tactiles (à venir)

## 🐛 Dépannage

### Le site ne se charge pas
- Vérifier que vous utilisez un serveur web local
- Ouvrir la console du navigateur (F12) pour voir les erreurs
- Vérifier que tous les fichiers sont présents

### Les assets ne s'affichent pas
- Vérifier les chemins dans `app.js`
- S'assurer que les fichiers existent dans le dossier `assets/`
- Vérifier les permissions de lecture

### Performances lentes
- Réduire le nombre de particules dans `CONFIG.particles.count`
- Désactiver les ombres : `renderer.shadowMap.enabled = false`
- Réduire la qualité : `renderer.setPixelRatio(1)`

## 📝 Licence

Ce projet est créé à des fins éducatives pour l'IBAM (Institut Burkinabé des Arts et Métiers).

## 👨‍💻 Développement

### Améliorations Futures
- [ ] Mode VR avec WebXR
- [ ] Audio spatialisé 3D
- [ ] Chargement de modèles 3D GLTF/FBX
- [ ] Système de quêtes interactives
- [ ] Multijoueur avec WebRTC
- [ ] Export de captures d'écran
- [ ] Mode nuit/jour
- [ ] Accessibilité WCAG 2.1

### Contribuer
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 🙏 Remerciements

- **Three.js** pour le moteur 3D
- **Google Fonts** pour les typographies
- **IBAM** pour le contenu éducatif

---

**Créé avec ❤️ pour l'IBAM** | *Musée Interactif 3D Futuriste*
