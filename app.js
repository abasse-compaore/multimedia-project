/**
 * Le Musée des Sciences et Technologies d'IBAM
 * Application Three.js immersive avec architecture 3D futuriste
 * 
 * Fonctionnalités principales:
 * - Hall central avec 4 galeries rayonnantes
 * - Système de navigation et téléportation
 * - Effets de lumière dynamiques et post-processing
 * - Système de particules pour ambiance néon
 * - Interface holographique interactive
 */

// ===== CONFIGURATION GLOBALE =====
const CONFIG = {
    // Rendering
    RENDERER: {
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    },
    
    // Caméra
    CAMERA: {
        fov: 75,
        near: 0.1,
        far: 1000,
        initialPosition: { x: 0, y: 5, z: 15 }
    },
    
    // Architecture
    ARCHITECTURE: {
        hallRadius: 20,
        galleryLength: 15,
        galleryWidth: 8,
        wallHeight: 12,
        floorThickness: 0.5
    },
    
    // Galeries
    GALLERIES: {
        ibam: { angle: 0, name: "Technologies IBAM", color: 0x00f0ff },
        modernTech: { angle: Math.PI / 2, name: "Technologies Modernes", color: 0x8b5cf6 },
        oldTech: { angle: Math.PI, name: "Technologies Anciennes", color: 0x06ffa5 },
        sciencesStorie: { angle: 3 * Math.PI / 2, name: "Histoire des Sciences", color: 0xff0080 }
    },
    
    // Effets
    EFFECTS: {
        bloomThreshold: 0.1,
        bloomStrength: 1.5,
        bloomRadius: 0.4,
        particleCount: 1000,
        particleSpeed: 0.02
    },
    
    // Animation
    ANIMATION: {
        doorSpeed: 0.02,
        transitionDuration: 1500,
        cameraSpeed: 0.05
    }
};

// ===== VARIABLES GLOBALES =====
let scene, camera, renderer, controls;
let composer, bloomPass, filmPass;
let hall, galleries = {}, doors = {};
let particles, particleSystem;
let lights = {};
let currentGallery = null;
let isTransitioning = false;
let raycaster, mouse;

// État de l'application
const AppState = {
    isLoading: true,
    isMenuOpen: false,
    currentLocation: 'hall',
    assetsLoaded: 0,
    totalAssets: 0
};

// ===== CLASSES UTILITAIRES =====
class AssetManager {
    constructor() {
        this.loadedAssets = new Map();
        this.loadingPromises = new Map();
        this.totalAssets = 0;
        this.loadedCount = 0;
    }

    async loadTexture(url, options = {}) {
        if (this.loadedAssets.has(url)) {
            return this.loadedAssets.get(url);
        }

        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        const promise = new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    Object.assign(texture, options);
                    this.loadedAssets.set(url, texture);
                    this.updateProgress();
                    resolve(texture);
                },
                undefined,
                reject
            );
        });

        this.loadingPromises.set(url, promise);
        return promise;
    }

    async loadModel(url) {
        if (this.loadedAssets.has(url)) {
            return this.loadedAssets.get(url);
        }

        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        const promise = new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                url,
                (gltf) => {
                    this.loadedAssets.set(url, gltf);
                    this.updateProgress();
                    resolve(gltf);
                },
                undefined,
                reject
            );
        });

        this.loadingPromises.set(url, promise);
        return promise;
    }

    updateProgress() {
        this.loadedCount++;
        const progress = (this.loadedCount / this.totalAssets) * 100;
        updateLoadingProgress(progress);
    }

    setTotalAssets(count) {
        this.totalAssets = count;
    }
}

// ===== INITIALISATION =====
async function init() {
    try {
        // Vérifier le support WebGL
        const hasWebGL = await detectWebGL();
        if (!hasWebGL) {
            // Le fallback CSS 3D a été initialisé automatiquement
            if (window.css3dMuseum && window.css3dMuseum.isInitialized) {
                console.log('Utilisation du fallback CSS 3D');
                hideLoadingScreen();
                return;
            }
            showErrorFallback();
            return;
        }

        // Initialiser Three.js
        initThreeJS();
        
        // Créer la scène
        createScene();
        
        // Configurer les lumières
        setupLighting();
        
        // Créer l'architecture
        await createArchitecture();
        
        // Initialiser les particules
        createParticleSystem();
        
        // Configurer les contrôles
        setupControls();
        
        // Configurer le post-processing
        setupPostProcessing();
        
        // Initialiser l'interface utilisateur
        initUI();
        
        // Charger les assets
        await loadAssets();
        
        // Démarrer l'application
        startApp();
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showErrorFallback();
    }
}

async function detectWebGL() {
    try {
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(window.WebGLRenderingContext && 
                           (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        
        console.log('Support WebGL détecté:', hasWebGL);
        
        // Si WebGL n'est pas supporté, essayer le fallback CSS 3D
        if (!hasWebGL && typeof initCSS3DFallback === 'function') {
            console.log('WebGL non supporté, tentative d\'initialisation du fallback CSS 3D...');
            const fallbackSuccess = await initCSS3DFallback();
            if (fallbackSuccess) {
                console.log('Fallback CSS 3D initialisé avec succès');
                return false; // Empêcher l'initialisation Three.js
            }
        }
        
        return hasWebGL;
    } catch (e) {
        console.error('Erreur lors de la détection WebGL:', e);
        // En cas d'erreur, essayer le fallback CSS 3D
        if (typeof initCSS3DFallback === 'function') {
            console.log('Erreur WebGL, tentative d\'initialisation du fallback CSS 3D...');
            const fallbackSuccess = await initCSS3DFallback();
            if (fallbackSuccess) {
                console.log('Fallback CSS 3D initialisé avec succès');
                return false;
            }
        }
        return false;
    }
}

function initThreeJS() {
    // Canvas
    const canvas = document.getElementById('three-canvas');
    
    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: CONFIG.RENDERER.antialias,
        alpha: CONFIG.RENDERER.alpha,
        powerPreference: CONFIG.RENDERER.powerPreference
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // Scène
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050508, 20, 100);
    
    // Caméra
    camera = new THREE.PerspectiveCamera(
        CONFIG.CAMERA.fov,
        window.innerWidth / window.innerHeight,
        CONFIG.CAMERA.near,
        CONFIG.CAMERA.far
    );
    
    camera.position.set(
        CONFIG.CAMERA.initialPosition.x,
        CONFIG.CAMERA.initialPosition.y,
        CONFIG.CAMERA.initialPosition.z
    );
    
    // Raycaster pour les interactions
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
}

function createScene() {
    // Fond de scène avec gradient
    const geometry = new THREE.SphereGeometry(200, 32, 32);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x050508) },
            color2: { value: new THREE.Color(0x0a0a0f) }
        },
        vertexShader: `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec3 vPosition;
            
            void main() {
                float gradient = (vPosition.y + 100.0) / 200.0;
                gradient = smoothstep(0.0, 1.0, gradient);
                
                vec3 color = mix(color1, color2, gradient);
                
                // Ajouter des étoiles
                float stars = 0.0;
                for (int i = 0; i < 50; i++) {
                    vec2 starPos = vec2(float(i) * 0.1, float(i) * 0.07);
                    float dist = distance(vPosition.xz * 0.1, starPos);
                    stars += smoothstep(0.02, 0.0, dist) * 0.5;
                }
                
                color += stars * 0.3;
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        side: THREE.BackSide
    });
    
    const background = new THREE.Mesh(geometry, material);
    scene.add(background);
    
    // Animer le fond
    function animateBackground() {
        material.uniforms.time.value += 0.01;
        requestAnimationFrame(animateBackground);
    }
    animateBackground();
}

function setupLighting() {
    // Lumière ambiante
    lights.ambient = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(lights.ambient);
    
    // Lumière directionnelle principale
    lights.directional = new THREE.DirectionalLight(0x00f0ff, 0.8);
    lights.directional.position.set(10, 20, 10);
    lights.directional.castShadow = true;
    lights.directional.shadow.mapSize.width = 2048;
    lights.directional.shadow.mapSize.height = 2048;
    lights.directional.shadow.camera.near = 0.5;
    lights.directional.shadow.camera.far = 50;
    lights.directional.shadow.camera.left = -25;
    lights.directional.shadow.camera.right = 25;
    lights.directional.shadow.camera.top = 25;
    lights.directional.shadow.camera.bottom = -25;
    scene.add(lights.directional);
    
    // Lumières ponctuelles pour les galeries
    Object.keys(CONFIG.GALLERIES).forEach((galleryKey, index) => {
        const gallery = CONFIG.GALLERIES[galleryKey];
        const light = new THREE.PointLight(gallery.color, 1, 30);
        
        const angle = gallery.angle;
        light.position.set(
            Math.cos(angle) * (CONFIG.ARCHITECTURE.hallRadius + 5),
            8,
            Math.sin(angle) * (CONFIG.ARCHITECTURE.hallRadius + 5)
        );
        
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        
        lights[galleryKey] = light;
        scene.add(light);
    });
    
    // Lumières d'ambiance supplémentaires
    for (let i = 0; i < 4; i++) {
        const light = new THREE.PointLight(0x8b5cf6, 0.5, 40);
        const angle = (i * Math.PI) / 2;
        light.position.set(
            Math.cos(angle) * 25,
            15,
            Math.sin(angle) * 25
        );
        scene.add(light);
    }
}

async function createArchitecture() {
    // Hall central
    createHall();
    
    // Galeries
    for (const [key, gallery] of Object.entries(CONFIG.GALLERIES)) {
        await createGallery(key, gallery);
    }
    
    // Sol
    createFloor();
}

function createHall() {
    const group = new THREE.Group();
    
    // Murs du hall (cylindre avec ouverture)
    const wallGeometry = new THREE.CylinderGeometry(
        CONFIG.ARCHITECTURE.hallRadius,
        CONFIG.ARCHITECTURE.hallRadius,
        CONFIG.ARCHITECTURE.wallHeight,
        32,
        1,
        false,
        0,
        Math.PI * 2
    );
    
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = CONFIG.ARCHITECTURE.wallHeight / 2;
    walls.receiveShadow = true;
    group.add(walls);
    
    // Plafond
    const ceilingGeometry = new THREE.CylinderGeometry(
        CONFIG.ARCHITECTURE.hallRadius + 2,
        CONFIG.ARCHITECTURE.hallRadius + 2,
        0.5,
        32
    );
    
    const ceilingMaterial = new THREE.MeshPhongMaterial({
        color: 0x16213e,
        emissive: 0x0a0a0f,
        emissiveIntensity: 0.3
    });
    
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = CONFIG.ARCHITECTURE.wallHeight;
    ceiling.receiveShadow = true;
    group.add(ceiling);
    
    // Éclairage central du hall
    const centralLight = new THREE.PointLight(0x00f0ff, 2, 50);
    centralLight.position.set(0, CONFIG.ARCHITECTURE.wallHeight - 2, 0);
    centralLight.castShadow = true;
    group.add(centralLight);
    
    hall = group;
    scene.add(hall);
}

async function createGallery(key, config) {
    const group = new THREE.Group();
    
    // Position de la galerie
    const angle = config.angle;
    const startX = Math.cos(angle) * CONFIG.ARCHITECTURE.hallRadius;
    const startZ = Math.sin(angle) * CONFIG.ARCHITECTURE.hallRadius;
    
    group.position.set(startX, 0, startZ);
    group.rotation.y = angle;
    
    // Sol de la galerie
    const floorGeometry = new THREE.BoxGeometry(
        CONFIG.ARCHITECTURE.galleryLength,
        CONFIG.ARCHITECTURE.floorThickness,
        CONFIG.ARCHITECTURE.galleryWidth
    );
    
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x0e0e23,
        emissive: config.color,
        emissiveIntensity: 0.1
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -CONFIG.ARCHITECTURE.floorThickness / 2;
    floor.receiveShadow = true;
    group.add(floor);
    
    // Murs de la galerie
    const wallGeometry = new THREE.BoxGeometry(
        CONFIG.ARCHITECTURE.galleryLength,
        CONFIG.ARCHITECTURE.wallHeight,
        0.5
    );
    
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.9
    });
    
    // Mur gauche
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(0, CONFIG.ARCHITECTURE.wallHeight / 2, -CONFIG.ARCHITECTURE.galleryWidth / 2);
    leftWall.receiveShadow = true;
    group.add(leftWall);
    
    // Mur droit
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(0, CONFIG.ARCHITECTURE.wallHeight / 2, CONFIG.ARCHITECTURE.galleryWidth / 2);
    rightWall.receiveShadow = true;
    group.add(rightWall);
    
    // Mur du fond
    const backWallGeometry = new THREE.BoxGeometry(
        0.5,
        CONFIG.ARCHITECTURE.wallHeight,
        CONFIG.ARCHITECTURE.galleryWidth
    );
    
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(CONFIG.ARCHITECTURE.galleryLength / 2, CONFIG.ARCHITECTURE.wallHeight / 2, 0);
    backWall.receiveShadow = true;
    group.add(backWall);
    
    // Porte coulissante
    const doorGeometry = new THREE.BoxGeometry(2, CONFIG.ARCHITECTURE.wallHeight, 0.3);
    const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x2a2a4e,
        emissive: config.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9
    });
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, CONFIG.ARCHITECTURE.wallHeight / 2, 0);
    door.castShadow = true;
    doors[key] = door;
    group.add(door);
    
    // Plafond de la galerie
    const ceilingGeometry = new THREE.BoxGeometry(
        CONFIG.ARCHITECTURE.galleryLength,
        0.5,
        CONFIG.ARCHITECTURE.galleryWidth
    );
    
    const ceilingMaterial = new THREE.MeshPhongMaterial({
        color: 0x16213e,
        emissive: config.color,
        emissiveIntensity: 0.2
    });
    
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, CONFIG.ARCHITECTURE.wallHeight, 0);
    ceiling.receiveShadow = true;
    group.add(ceiling);
    
    // Éclairage de la galerie
    const galleryLight = new THREE.PointLight(config.color, 1.5, 25);
    galleryLight.position.set(5, CONFIG.ARCHITECTURE.wallHeight - 2, 0);
    galleryLight.castShadow = true;
    group.add(galleryLight);
    
    // Charger et placer les objets spécifiques à chaque galerie
    await loadGalleryContent(key, group);
    
    galleries[key] = group;
    scene.add(group);
}

async function loadGalleryContent(galleryKey, parentGroup) {
    const assetManager = new AssetManager();
    
    try {
        switch (galleryKey) {
            case 'ibam':
                await loadIBAMContent(parentGroup, assetManager);
                break;
            case 'modernTech':
                await loadModernTechContent(parentGroup, assetManager);
                break;
            case 'oldTech':
                await loadOldTechContent(parentGroup, assetManager);
                break;
            case 'sciencesStorie':
                await loadSciencesStorieContent(parentGroup, assetManager);
                break;
        }
    } catch (error) {
        console.warn(`Erreur lors du chargement du contenu de la galerie ${galleryKey}:`, error);
    }
}

async function loadIBAMContent(parentGroup, assetManager) {
    // Exemples d'objets pour la galerie IBAM
    const displayPositions = [
        { x: 3, y: 2, z: -2 },
        { x: 6, y: 2, z: 2 },
        { x: 9, y: 2, z: -1 }
    ];
    
    for (let i = 0; i < displayPositions.length; i++) {
        const pos = displayPositions[i];
        
        // Créer un podium
        const podiumGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 8);
        const podiumMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a4e,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.3
        });
        
        const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
        podium.position.set(pos.x, pos.y, pos.z);
        podium.castShadow = true;
        parentGroup.add(podium);
        
        // Créer un objet représentatif
        const objectGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const objectMaterial = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.8
        });
        
        const object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.position.set(pos.x, pos.y + 0.75, pos.z);
        object.castShadow = true;
        object.userData = {
            type: 'interactive',
            gallery: 'ibam',
            info: {
                title: `Objet IBAM ${i + 1}`,
                description: 'Description de l\'objet technologique IBAM...'
            }
        };
        
        parentGroup.add(object);
    }
}

async function loadModernTechContent(parentGroup, assetManager) {
    // Charger les modèles 3D modernes si disponibles
    const modernTechFiles = [
        'assets/modern-tech/imprimente-3D.glb',
        'assets/modern-tech/Robot2.fbx'
    ];
    
    for (let i = 0; i < 3; i++) {
        const pos = { x: 3 + i * 3, y: 2, z: 0 };
        
        // Podium
        const podiumGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 8);
        const podiumMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a4e,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.3
        });
        
        const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
        podium.position.set(pos.x, pos.y, pos.z);
        podium.castShadow = true;
        parentGroup.add(podium);
        
        // Objet moderne
        const objectGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const objectMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.8
        });
        
        const object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.position.set(pos.x, pos.y + 0.75, pos.z);
        object.castShadow = true;
        object.userData = {
            type: 'interactive',
            gallery: 'modernTech',
            info: {
                title: `Technologie Moderne ${i + 1}`,
                description: 'Description de la technologie moderne...'
            }
        };
        
        parentGroup.add(object);
    }
}

async function loadOldTechContent(parentGroup, assetManager) {
    // Objets pour les technologies anciennes
    for (let i = 0; i < 3; i++) {
        const pos = { x: 3 + i * 3, y: 2, z: 0 };
        
        // Podium
        const podiumGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 8);
        const podiumMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a4e,
            emissive: 0x06ffa5,
            emissiveIntensity: 0.3
        });
        
        const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
        podium.position.set(pos.x, pos.y, pos.z);
        podium.castShadow = true;
        parentGroup.add(podium);
        
        // Objet ancien
        const objectGeometry = new THREE.ConeGeometry(0.6, 1.2, 8);
        const objectMaterial = new THREE.MeshPhongMaterial({
            color: 0x06ffa5,
            transparent: true,
            opacity: 0.8
        });
        
        const object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.position.set(pos.x, pos.y + 0.75, pos.z);
        object.castShadow = true;
        object.userData = {
            type: 'interactive',
            gallery: 'oldTech',
            info: {
                title: `Technologie Ancienne ${i + 1}`,
                description: 'Description de la technologie ancienne...'
            }
        };
        
        parentGroup.add(object);
    }
}

async function loadSciencesStorieContent(parentGroup, assetManager) {
    // Charger les images des scientifiques
    for (let i = 0; i < 3; i++) {
        const pos = { x: 3 + i * 3, y: 2, z: 0 };
        
        // Cadre pour l'image
        const frameGeometry = new THREE.BoxGeometry(2, 3, 0.1);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a4e,
            emissive: 0xff0080,
            emissiveIntensity: 0.3
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(pos.x, pos.y + 1.5, pos.z);
        frame.castShadow = true;
        parentGroup.add(frame);
        
        // Panneau d'information
        const panelGeometry = new THREE.BoxGeometry(1.8, 2.8, 0.05);
        const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(pos.x, pos.y + 1.5, pos.z + 0.06);
        panel.userData = {
            type: 'interactive',
            gallery: 'sciencesStorie',
            info: {
                title: `Scientifique ${i + 1}`,
                description: 'Biographie et contributions du scientifique...'
            }
        };
        
        parentGroup.add(panel);
    }
}

function createFloor() {
    const floorGeometry = new THREE.CircleGeometry(
        CONFIG.ARCHITECTURE.hallRadius + 10,
        64
    );
    
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x0e0e23,
        transparent: true,
        opacity: 0.8
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Motif au centre
    const centerGeometry = new THREE.CircleGeometry(2, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.rotation.x = -Math.PI / 2;
    center.position.y = 0.01;
    scene.add(center);
}

function createParticleSystem() {
    const particleCount = CONFIG.EFFECTS.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = Math.random() * 50;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;
        
        // Couleur
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.5, 1, 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minPolarAngle = Math.PI / 6;
}

function setupPostProcessing() {
    composer = new THREE.EffectComposer(renderer);
    
    // Render pass
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom pass
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.EFFECTS.bloomStrength,
        CONFIG.EFFECTS.bloomRadius,
        CONFIG.EFFECTS.bloomThreshold
    );
    composer.addPass(bloomPass);
    
    // Film pass pour l'effet futuriste
    filmPass = new THREE.FilmPass(0.35, 0.025, 648, false);
    composer.addPass(filmPass);
}

function initUI() {
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const menuContent = document.getElementById('menu-content');
    
    menuToggle.addEventListener('click', () => {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        menuToggle.classList.toggle('active');
        menuContent.classList.toggle('active');
    });
    
    // Gallery navigation
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const gallery = item.dataset.gallery;
            navigateToGallery(gallery);
        });
    });
    
    // Close info panel
    const closeBtn = document.getElementById('close-info');
    const infoPanel = document.getElementById('info-panel');
    
    closeBtn.addEventListener('click', () => {
        infoPanel.classList.remove('active');
    });
    
    // Mouse interactions
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('mousemove', onDocumentMouseMove);
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
}

async function loadAssets() {
    updateLoadingStatus('Chargement des assets...');
    
    const assetManager = new AssetManager();
    assetManager.setTotalAssets(10); // Estimation
    
    try {
        // Charger les textures et modèles nécessaires
        await Promise.all([
            // Textures d'exemple
            assetManager.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
            assetManager.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
        ]);
        
        updateLoadingStatus('Assets chargés avec succès!');
        
    } catch (error) {
        console.warn('Erreur lors du chargement des assets:', error);
        updateLoadingStatus('Chargement terminé avec avertissements');
    }
}

function startApp() {
    updateLoadingStatus('Initialisation terminée');
    
    setTimeout(() => {
        hideLoadingScreen();
        startRenderLoop();
        startAudio();
    }, 1000);
}

function startRenderLoop() {
    function animate() {
        requestAnimationFrame(animate);
        
        // Mettre à jour les contrôles
        controls.update();
        
        // Animer les particules
        if (particleSystem) {
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += CONFIG.EFFECTS.particleSpeed;
                if (positions[i] > 50) {
                    positions[i] = 0;
                }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animer les lumières
        Object.values(lights).forEach(light => {
            if (light.intensity !== undefined) {
                light.intensity = 0.8 + Math.sin(Date.now() * 0.001) * 0.2;
            }
        });
        
        // Rendu
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
        
        // Mettre à jour l'interface
        updateUI();
    }
    
    animate();
}

function startAudio() {
    const audio = document.getElementById('ambient-audio');
    if (audio) {
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio non disponible:', e));
    }
}

// ===== NAVIGATION =====
async function navigateToGallery(galleryKey) {
    if (isTransitioning || !galleries[galleryKey]) return;
    
    isTransitioning = true;
    currentGallery = galleryKey;
    
    // Animation de transition
    showTransitionOverlay(`Accès à ${CONFIG.GALLERIES[galleryKey].name}`);
    
    // Ouvrir la porte
    if (doors[galleryKey]) {
        animateDoor(galleryKey, true);
    }
    
    // Déplacer la caméra
    await animateCameraToGallery(galleryKey);
    
    // Mettre à jour l'interface
    updateLocationInfo(CONFIG.GALLERIES[galleryKey].name);
    updateMinimap(galleryKey);
    
    setTimeout(() => {
        hideTransitionOverlay();
        isTransitioning = false;
    }, CONFIG.ANIMATION.transitionDuration);
}

async function animateCameraToGallery(galleryKey) {
    const gallery = CONFIG.GALLERIES[galleryKey];
    const targetPosition = {
        x: Math.cos(gallery.angle) * 25,
        y: 8,
        z: Math.sin(gallery.angle) * 25
    };
    
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = CONFIG.ANIMATION.transitionDuration;
    
    return new Promise(resolve => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            camera.position.lerpVectors(startPosition, targetPosition, eased);
            camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        animate();
    });
}

function animateDoor(galleryKey, isOpen) {
    const door = doors[galleryKey];
    if (!door) return;
    
    const targetY = isOpen ? CONFIG.ARCHITECTURE.wallHeight + 2 : CONFIG.ARCHITECTURE.wallHeight / 2;
    
    function animate() {
        const speed = CONFIG.ANIMATION.doorSpeed;
        if (isOpen) {
            door.position.y += speed;
            if (door.position.y < targetY) {
                requestAnimationFrame(animate);
            }
        } else {
            door.position.y -= speed;
            if (door.position.y > targetY) {
                requestAnimationFrame(animate);
            }
        }
    }
    animate();
}

// ===== INTERACTIONS =====
function onDocumentClick(event) {
    if (isTransitioning) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData && object.userData.type === 'interactive') {
            showInfoPanel(object.userData.info);
        }
    }
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Changer le curseur si on survole un objet interactif
    if (intersects.length > 0 && intersects[0].object.userData && intersects[0].object.userData.type === 'interactive') {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'grab';
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ===== UI UPDATES =====
function updateUI() {
    // Mettre à jour la boussole
    updateCompass();
    
    // Mettre à jour la minimap
    updateMinimapPlayer();
}

function updateCompass() {
    const needle = document.getElementById('compass-needle');
    if (needle) {
        const rotation = camera.rotation.y * (180 / Math.PI);
        needle.style.transform = `translate(-50%, -100%) rotate(${-rotation}deg)`;
    }
}

function updateMinimap(galleryKey = null) {
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (galleryKey && dot.dataset.gallery === galleryKey) {
            dot.classList.add('active');
        }
    });
}

function updateMinimapPlayer() {
    const player = document.getElementById('minimap-player');
    if (player) {
        const x = (camera.position.x / 50) * 50 + 50;
        const z = (camera.position.z / 50) * 50 + 50;
        player.style.left = `${Math.max(0, Math.min(100, x))}%`;
        player.style.top = `${Math.max(0, Math.min(100, z))}%`;
    }
}

function updateLocationInfo(location) {
    const locationElement = document.getElementById('current-location');
    if (locationElement) {
        locationElement.textContent = location;
    }
}

function showInfoPanel(info) {
    const panel = document.getElementById('info-panel');
    const title = document.getElementById('panel-title');
    const text = document.getElementById('panel-text');
    
    title.textContent = info.title;
    text.textContent = info.description;
    
    panel.classList.add('active');
}

function showTransitionOverlay(text) {
    const overlay = document.getElementById('transition-overlay');
    const textElement = document.getElementById('transition-text');
    
    textElement.textContent = text;
    overlay.classList.add('active');
}

function hideTransitionOverlay() {
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.remove('active');
}

async function showErrorFallback() {
    // Vérifier une dernière fois si le fallback CSS 3D peut être utilisé
    if (typeof detectCSS3DSupport === 'function' && detectCSS3DSupport()) {
        console.log('Tentative d\'initialisation du fallback CSS 3D...');
        const fallbackSuccess = await initCSS3DFallback();
        if (fallbackSuccess) {
            hideLoadingScreen();
            return;
        }
    }
    
    // Si CSS 3D échoue, essayer le fallback simple
    if (typeof initSimpleFallback === 'function') {
        console.log('Tentative d\'initialisation du fallback simple...');
        const simpleFallbackSuccess = initSimpleFallback();
        if (simpleFallbackSuccess) {
            hideLoadingScreen();
            return;
        }
    }
    
    document.getElementById('app').style.display = 'none';
    document.getElementById('error-fallback').classList.remove('hidden');
}

function hideLoadingScreen() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('app').style.display = 'block';
}

function updateLoadingProgress(percentage) {
    const progressBar = document.querySelector('.loading-progress');
    const percentageElement = document.getElementById('loading-percentage');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (percentageElement) {
        percentageElement.textContent = `${Math.round(percentage)}%`;
    }
}

function updateLoadingStatus(status) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

// ===== INITIALISATION DE L'APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    init();
});

// ===== GESTION DES ERREURS =====
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    showErrorFallback();
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée:', event.reason);
    showErrorFallback();
});
