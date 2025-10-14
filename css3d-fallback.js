/**
 * Fallback CSS 3D pour navigateurs sans support WebGL
 * Recrée l'expérience immersive avec CSS transforms et animations
 */

class CSS3DMuseum {
    constructor() {
        this.isInitialized = false;
        this.currentGallery = null;
        this.isTransitioning = false;
        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0
        };
        
        this.galleries = {
            ibam: { angle: 0, name: "Technologies IBAM", color: "#00f0ff" },
            modernTech: { angle: 90, name: "Technologies Modernes", color: "#8b5cf6" },
            oldTech: { angle: 180, name: "Technologies Anciennes", color: "#06ffa5" },
            sciencesStorie: { angle: 270, name: "Histoire des Sciences", color: "#ff0080" }
        };
        
        this.controls = {
            isMouseDown: false,
            lastMouseX: 0,
            lastMouseY: 0,
            zoom: 1,
            minZoom: 0.5,
            maxZoom: 2
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.createScene();
            this.setupLighting();
            this.createArchitecture();
            this.setupControls();
            this.initUI();
            this.startAnimations();
            this.isInitialized = true;
            console.log('CSS 3D Museum initialisé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation CSS 3D:', error);
            this.showErrorFallback();
        }
    }
    
    createScene() {
        // Créer le container principal
        const sceneContainer = document.createElement('div');
        sceneContainer.id = 'css3d-scene';
        sceneContainer.className = 'css3d-scene';
        
        // Créer la caméra virtuelle
        const cameraContainer = document.createElement('div');
        cameraContainer.id = 'css3d-camera';
        cameraContainer.className = 'css3d-camera';
        
        sceneContainer.appendChild(cameraContainer);
        
        // Ajouter au DOM
        const app = document.getElementById('app');
        app.appendChild(sceneContainer);
        
        this.sceneContainer = sceneContainer;
        this.cameraContainer = cameraContainer;
        
        // Appliquer les styles CSS 3D
        this.applyCSS3DStyles();
    }
    
    applyCSS3DStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .css3d-scene {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                perspective: 1000px;
                perspective-origin: center center;
                overflow: hidden;
                background: radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%);
            }
            
            .css3d-camera {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 1px;
                height: 1px;
                transform-style: preserve-3d;
                transition: transform 0.3s ease;
            }
            
            .css3d-object {
                position: absolute;
                transform-style: preserve-3d;
                backface-visibility: hidden;
            }
            
            .css3d-hall {
                position: absolute;
                top: -200px;
                left: -200px;
                width: 400px;
                height: 400px;
                background: radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%);
                border-radius: 50%;
                border: 2px solid rgba(0,240,255,0.3);
                box-shadow: 
                    inset 0 0 50px rgba(0,240,255,0.2),
                    0 0 100px rgba(0,240,255,0.1);
                animation: hallPulse 4s ease-in-out infinite;
            }
            
            @keyframes hallPulse {
                0%, 100% { 
                    box-shadow: 
                        inset 0 0 50px rgba(0,240,255,0.2),
                        0 0 100px rgba(0,240,255,0.1);
                }
                50% { 
                    box-shadow: 
                        inset 0 0 80px rgba(0,240,255,0.3),
                        0 0 150px rgba(0,240,255,0.2);
                }
            }
            
            .css3d-gallery {
                position: absolute;
                width: 200px;
                height: 300px;
                background: linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(22,33,62,0.9) 100%);
                border: 1px solid rgba(0,240,255,0.3);
                border-radius: 10px;
                backdrop-filter: blur(10px);
                box-shadow: 
                    inset 0 0 20px rgba(0,240,255,0.1),
                    0 0 40px rgba(0,240,255,0.1);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .css3d-gallery:hover {
                border-color: rgba(0,240,255,0.6);
                box-shadow: 
                    inset 0 0 30px rgba(0,240,255,0.2),
                    0 0 60px rgba(0,240,255,0.2);
                transform: translateZ(20px);
            }
            
            .css3d-gallery.ibam { 
                transform: translateX(-250px) rotateY(-45deg);
                border-color: rgba(0,240,255,0.4);
            }
            
            .css3d-gallery.modern-tech { 
                transform: translateZ(-250px) translateY(0px) rotateY(45deg);
                border-color: rgba(139,92,246,0.4);
            }
            
            .css3d-gallery.old-tech { 
                transform: translateX(250px) rotateY(135deg);
                border-color: rgba(6,255,165,0.4);
            }
            
            .css3d-gallery.sciences-storie { 
                transform: translateZ(250px) translateY(0px) rotateY(-135deg);
                border-color: rgba(255,0,128,0.4);
            }
            
            .css3d-door {
                position: absolute;
                top: 0;
                left: 50%;
                width: 60px;
                height: 100%;
                background: linear-gradient(90deg, rgba(42,42,78,0.9) 0%, rgba(26,26,46,0.9) 100%);
                border: 1px solid rgba(0,240,255,0.5);
                transform: translateX(-50%);
                transition: all 0.5s ease;
                box-shadow: 
                    inset 0 0 20px rgba(0,240,255,0.2),
                    0 0 20px rgba(0,240,255,0.1);
            }
            
            .css3d-door.open {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0.7;
            }
            
            .css3d-floor {
                position: absolute;
                top: 150px;
                left: -300px;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(14,14,35,0.8) 0%, rgba(5,5,8,0.9) 70%);
                border-radius: 50%;
                border: 1px solid rgba(0,240,255,0.2);
                transform: rotateX(90deg);
            }
            
            .css3d-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .css3d-particle {
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(0,240,255,0.8);
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0,240,255,0.8);
                animation: particleFloat 8s linear infinite;
            }
            
            @keyframes particleFloat {
                0% {
                    transform: translateY(100vh) translateX(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(50px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            .css3d-object {
                position: absolute;
                width: 40px;
                height: 40px;
                background: linear-gradient(45deg, rgba(0,240,255,0.8) 0%, rgba(139,92,246,0.8) 100%);
                border-radius: 50%;
                border: 1px solid rgba(0,240,255,0.6);
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 0 20px rgba(0,240,255,0.4);
            }
            
            .css3d-object:hover {
                transform: scale(1.2) translateZ(10px);
                box-shadow: 0 0 30px rgba(0,240,255,0.6);
            }
            
            .css3d-gallery-content {
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                overflow: hidden;
            }
            
            .css3d-gallery-title {
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                font-family: 'Orbitron', monospace;
                font-size: 1.2rem;
                font-weight: 700;
                color: #00f0ff;
                text-align: center;
                text-shadow: 0 0 10px rgba(0,240,255,0.8);
                margin: 0;
            }
            
            .css3d-gallery-description {
                position: absolute;
                top: 60px;
                left: 20px;
                right: 20px;
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                color: rgba(255,255,255,0.8);
                line-height: 1.4;
                text-align: center;
            }
            
            .css3d-lights {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .css3d-light {
                position: absolute;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(0,240,255,0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: lightPulse 3s ease-in-out infinite;
            }
            
            @keyframes lightPulse {
                0%, 100% { 
                    transform: scale(1);
                    opacity: 0.3;
                }
                50% { 
                    transform: scale(1.5);
                    opacity: 0.6;
                }
            }
            
            .css3d-light.center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%);
            }
            
            .css3d-light.gallery {
                width: 60px;
                height: 60px;
            }
            
            .css3d-light.gallery.ibam {
                top: 20%;
                left: 20%;
                background: radial-gradient(circle, rgba(0,240,255,0.3) 0%, transparent 70%);
            }
            
            .css3d-light.gallery.modern-tech {
                top: 20%;
                right: 20%;
                background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%);
            }
            
            .css3d-light.gallery.old-tech {
                bottom: 20%;
                left: 20%;
                background: radial-gradient(circle, rgba(6,255,165,0.3) 0%, transparent 70%);
            }
            
            .css3d-light.gallery.sciences-storie {
                bottom: 20%;
                right: 20%;
                background: radial-gradient(circle, rgba(255,0,128,0.3) 0%, transparent 70%);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    createArchitecture() {
        // Hall central
        this.createHall();
        
        // Galeries
        Object.keys(this.galleries).forEach(galleryKey => {
            this.createGallery(galleryKey);
        });
        
        // Sol
        this.createFloor();
        
        // Particules
        this.createParticles();
        
        // Éclairage
        this.createLights();
    }
    
    createHall() {
        const hall = document.createElement('div');
        hall.className = 'css3d-object css3d-hall';
        hall.id = 'css3d-hall';
        this.cameraContainer.appendChild(hall);
        this.hall = hall;
    }
    
    createGallery(galleryKey) {
        const gallery = document.createElement('div');
        gallery.className = `css3d-object css3d-gallery ${galleryKey}`;
        gallery.id = `css3d-gallery-${galleryKey}`;
        
        const config = this.galleries[galleryKey];
        
        // Contenu de la galerie
        const content = document.createElement('div');
        content.className = 'css3d-gallery-content';
        
        const title = document.createElement('h3');
        title.className = 'css3d-gallery-title';
        title.textContent = config.name;
        
        const description = document.createElement('p');
        description.className = 'css3d-gallery-description';
        description.textContent = this.getGalleryDescription(galleryKey);
        
        content.appendChild(title);
        content.appendChild(description);
        gallery.appendChild(content);
        
        // Porte
        const door = document.createElement('div');
        door.className = 'css3d-door';
        door.id = `css3d-door-${galleryKey}`;
        gallery.appendChild(door);
        
        // Objets interactifs
        this.createGalleryObjects(gallery, galleryKey);
        
        gallery.addEventListener('click', () => {
            this.navigateToGallery(galleryKey);
        });
        
        this.cameraContainer.appendChild(gallery);
        this.galleries[galleryKey].element = gallery;
        this.galleries[galleryKey].door = door;
    }
    
    createGalleryObjects(gallery, galleryKey) {
        const objects = [];
        
        for (let i = 0; i < 3; i++) {
            const object = document.createElement('div');
            object.className = 'css3d-object';
            object.style.left = `${30 + i * 30}%`;
            object.style.top = `${60 + i * 10}%`;
            
            const config = this.galleries[galleryKey];
            object.style.background = `linear-gradient(45deg, ${config.color}88, ${config.color}44)`;
            object.style.borderColor = config.color;
            object.style.boxShadow = `0 0 20px ${config.color}44`;
            
            object.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showObjectInfo(galleryKey, i);
            });
            
            gallery.appendChild(object);
            objects.push(object);
        }
        
        this.galleries[galleryKey].objects = objects;
    }
    
    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'css3d-object css3d-floor';
        this.cameraContainer.appendChild(floor);
    }
    
    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'css3d-particles';
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'css3d-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.animationDuration = `${6 + Math.random() * 4}s`;
            particlesContainer.appendChild(particle);
        }
        
        this.cameraContainer.appendChild(particlesContainer);
    }
    
    createLights() {
        const lightsContainer = document.createElement('div');
        lightsContainer.className = 'css3d-lights';
        
        // Lumière centrale
        const centerLight = document.createElement('div');
        centerLight.className = 'css3d-light center';
        lightsContainer.appendChild(centerLight);
        
        // Lumières des galeries
        Object.keys(this.galleries).forEach(galleryKey => {
            const light = document.createElement('div');
            light.className = `css3d-light gallery ${galleryKey}`;
            lightsContainer.appendChild(light);
        });
        
        this.cameraContainer.appendChild(lightsContainer);
    }
    
    getGalleryDescription(galleryKey) {
        const descriptions = {
            ibam: "Découvrez les technologies innovantes développées par IBAM",
            modernTech: "Explorez les dernières avancées technologiques",
            oldTech: "Plongez dans l'histoire des inventions anciennes",
            sciencesStorie: "Rencontrez les grands scientifiques de l'histoire"
        };
        return descriptions[galleryKey] || "Galerie interactive";
    }
    
    setupControls() {
        // Contrôles souris
        this.sceneContainer.addEventListener('mousedown', (e) => {
            this.controls.isMouseDown = true;
            this.controls.lastMouseX = e.clientX;
            this.controls.lastMouseY = e.clientY;
            this.sceneContainer.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.controls.isMouseDown) return;
            
            const deltaX = e.clientX - this.controls.lastMouseX;
            const deltaY = e.clientY - this.controls.lastMouseY;
            
            this.camera.rotationY += deltaX * 0.01;
            this.camera.rotationX += deltaY * 0.01;
            
            this.updateCamera();
            
            this.controls.lastMouseX = e.clientX;
            this.controls.lastMouseY = e.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            this.controls.isMouseDown = false;
            this.sceneContainer.style.cursor = 'grab';
        });
        
        // Zoom avec molette
        this.sceneContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.controls.zoom *= zoomFactor;
            this.controls.zoom = Math.max(this.controls.minZoom, Math.min(this.controls.maxZoom, this.controls.zoom));
            
            this.updateCamera();
        });
    }
    
    updateCamera() {
        const transform = `
            translate(-50%, -50%) 
            scale(${this.controls.zoom}) 
            rotateX(${this.camera.rotationX}deg) 
            rotateY(${this.camera.rotationY}deg)
        `;
        
        this.cameraContainer.style.transform = transform;
    }
    
    navigateToGallery(galleryKey) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.currentGallery = galleryKey;
        
        const config = this.galleries[galleryKey];
        const gallery = this.galleries[galleryKey].element;
        
        // Animation de la porte
        this.animateDoor(galleryKey, true);
        
        // Animation de la caméra
        this.animateCameraToGallery(galleryKey);
        
        // Mettre à jour l'interface
        this.updateLocationInfo(config.name);
        this.updateMinimap(galleryKey);
        
        // Transition visuelle
        this.showTransitionOverlay(`Accès à ${config.name}`);
        
        setTimeout(() => {
            this.hideTransitionOverlay();
            this.isTransitioning = false;
        }, 1500);
    }
    
    animateDoor(galleryKey, isOpen) {
        const door = this.galleries[galleryKey].door;
        if (!door) return;
        
        if (isOpen) {
            door.classList.add('open');
        } else {
            door.classList.remove('open');
        }
    }
    
    animateCameraToGallery(galleryKey) {
        const config = this.galleries[galleryKey];
        const targetRotationY = config.angle;
        
        // Animation fluide de la rotation
        const startRotation = this.camera.rotationY;
        const startTime = Date.now();
        const duration = 1000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.rotationY = startRotation + (targetRotationY - startRotation) * eased;
            this.updateCamera();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    showObjectInfo(galleryKey, objectIndex) {
        const config = this.galleries[galleryKey];
        const info = {
            title: `Objet ${objectIndex + 1} - ${config.name}`,
            description: `Description détaillée de l'objet interactif dans la galerie ${config.name}.`
        };
        
        this.showInfoPanel(info);
    }
    
    showInfoPanel(info) {
        const panel = document.getElementById('info-panel');
        const title = document.getElementById('panel-title');
        const text = document.getElementById('panel-text');
        
        if (panel && title && text) {
            title.textContent = info.title;
            text.textContent = info.description;
            panel.classList.add('active');
        }
    }
    
    showTransitionOverlay(text) {
        const overlay = document.getElementById('transition-overlay');
        const textElement = document.getElementById('transition-text');
        
        if (overlay && textElement) {
            textElement.textContent = text;
            overlay.classList.add('active');
        }
    }
    
    hideTransitionOverlay() {
        const overlay = document.getElementById('transition-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    updateLocationInfo(location) {
        const locationElement = document.getElementById('current-location');
        if (locationElement) {
            locationElement.textContent = location;
        }
    }
    
    updateMinimap(galleryKey) {
        const dots = document.querySelectorAll('.gallery-dot');
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (galleryKey && dot.dataset.gallery === galleryKey) {
                dot.classList.add('active');
            }
        });
    }
    
    initUI() {
        // Initialiser les interactions avec l'interface existante
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const gallery = item.dataset.gallery;
                this.navigateToGallery(gallery);
            });
        });
    }
    
    startAnimations() {
        // Démarrer les animations CSS
        setInterval(() => {
            // Animation des lumières
            const lights = document.querySelectorAll('.css3d-light');
            lights.forEach(light => {
                const intensity = 0.3 + Math.sin(Date.now() * 0.001) * 0.2;
                light.style.opacity = intensity;
            });
        }, 50);
    }
    
    showErrorFallback() {
        document.getElementById('app').style.display = 'none';
        document.getElementById('error-fallback').classList.remove('hidden');
    }
}

// Fonction de détection des capacités CSS 3D
function detectCSS3DSupport() {
    const testElement = document.createElement('div');
    const transforms = [
        'transform',
        'WebkitTransform',
        'MozTransform',
        'OTransform',
        'msTransform'
    ];
    
    let hasTransform = false;
    for (let i = 0; i < transforms.length; i++) {
        if (testElement.style[transforms[i]] !== undefined) {
            hasTransform = true;
            break;
        }
    }
    
    // Test de support 3D
    if (hasTransform) {
        testElement.style.transform = 'translateZ(0)';
        const has3D = testElement.style.transform !== '';
        return has3D;
    }
    
    return false;
}

// Initialisation automatique si WebGL n'est pas supporté
function initCSS3DFallback() {
    console.log('Tentative d\'initialisation du fallback CSS 3D...');
    
    if (detectCSS3DSupport()) {
        console.log('Support CSS 3D détecté, initialisation...');
        try {
            window.css3dMuseum = new CSS3DMuseum();
            // Attendre que l'initialisation soit terminée
            return new Promise((resolve) => {
                const checkInit = () => {
                    if (window.css3dMuseum && window.css3dMuseum.isInitialized) {
                        console.log('Fallback CSS 3D initialisé avec succès');
                        resolve(true);
                    } else {
                        setTimeout(checkInit, 100);
                    }
                };
                checkInit();
            });
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du fallback CSS 3D:', error);
            return Promise.resolve(false);
        }
    } else {
        console.log('Support CSS 3D non détecté');
        return Promise.resolve(false);
    }
}

// Export pour utilisation globale
window.CSS3DMuseum = CSS3DMuseum;
window.initCSS3DFallback = initCSS3DFallback;
window.detectCSS3DSupport = detectCSS3DSupport;
