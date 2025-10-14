/**
 * Fallback simple pour navigateurs très anciens
 * Version 2D avec animations CSS pures
 */

class SimpleFallbackMuseum {
    constructor() {
        this.isInitialized = false;
        this.currentGallery = null;
        this.init();
    }
    
    init() {
        try {
            this.createScene();
            this.createGalleries();
            this.setupInteractions();
            this.startAnimations();
            this.isInitialized = true;
            console.log('Simple Fallback Museum initialisé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation Simple Fallback:', error);
        }
    }
    
    createScene() {
        // Créer le container principal
        const sceneContainer = document.createElement('div');
        sceneContainer.id = 'simple-fallback-scene';
        sceneContainer.className = 'simple-fallback-scene';
        
        // Ajouter au DOM
        const app = document.getElementById('app');
        app.appendChild(sceneContainer);
        
        this.sceneContainer = sceneContainer;
        
        // Appliquer les styles
        this.applyStyles();
    }
    
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .simple-fallback-scene {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%);
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                font-family: 'Inter', sans-serif;
            }
            
            .fallback-hall {
                width: 400px;
                height: 400px;
                background: radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%);
                border: 2px solid rgba(0,240,255,0.3);
                border-radius: 50%;
                position: relative;
                margin: 20px;
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
            
            .fallback-galleries {
                display: flex;
                gap: 40px;
                margin-top: 40px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .fallback-gallery {
                width: 200px;
                height: 250px;
                background: linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(22,33,62,0.9) 100%);
                border: 1px solid rgba(0,240,255,0.3);
                border-radius: 10px;
                backdrop-filter: blur(10px);
                box-shadow: 
                    inset 0 0 20px rgba(0,240,255,0.1),
                    0 0 40px rgba(0,240,255,0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .fallback-gallery:hover {
                border-color: rgba(0,240,255,0.6);
                box-shadow: 
                    inset 0 0 30px rgba(0,240,255,0.2),
                    0 0 60px rgba(0,240,255,0.2);
                transform: translateY(-10px);
            }
            
            .fallback-gallery.ibam { 
                border-color: rgba(0,240,255,0.4);
            }
            
            .fallback-gallery.modern-tech { 
                border-color: rgba(139,92,246,0.4);
            }
            
            .fallback-gallery.old-tech { 
                border-color: rgba(6,255,165,0.4);
            }
            
            .fallback-gallery.sciences-storie { 
                border-color: rgba(255,0,128,0.4);
            }
            
            .fallback-gallery-content {
                padding: 20px;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            
            .fallback-gallery-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                filter: drop-shadow(0 0 10px currentColor);
            }
            
            .fallback-gallery-title {
                font-family: 'Orbitron', monospace;
                font-size: 1.1rem;
                font-weight: 700;
                color: #00f0ff;
                text-shadow: 0 0 10px rgba(0,240,255,0.8);
                margin: 0 0 10px 0;
            }
            
            .fallback-gallery-description {
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                color: rgba(255,255,255,0.8);
                line-height: 1.4;
                margin: 0;
            }
            
            .fallback-objects {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
            }
            
            .fallback-object {
                width: 20px;
                height: 20px;
                background: linear-gradient(45deg, rgba(0,240,255,0.8) 0%, rgba(139,92,246,0.8) 100%);
                border-radius: 50%;
                border: 1px solid rgba(0,240,255,0.6);
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 0 10px rgba(0,240,255,0.4);
            }
            
            .fallback-object:hover {
                transform: scale(1.3);
                box-shadow: 0 0 20px rgba(0,240,255,0.6);
            }
            
            .fallback-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .fallback-particle {
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
            
            .fallback-center-title {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Orbitron', monospace;
                font-size: 2rem;
                font-weight: 900;
                color: #00f0ff;
                text-shadow: 0 0 20px rgba(0,240,255,0.8);
                text-align: center;
                pointer-events: none;
            }
            
            .fallback-center-subtitle {
                position: absolute;
                top: 60%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Orbitron', monospace;
                font-size: 0.8rem;
                font-weight: 400;
                color: #06ffa5;
                text-shadow: 0 0 10px rgba(6,255,165,0.8);
                text-align: center;
                pointer-events: none;
                letter-spacing: 0.2em;
            }
            
            .fallback-info-panel {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 300px;
                max-height: 70vh;
                background: rgba(15, 15, 25, 0.9);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(0,240,255,0.3);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 240, 255, 0.1);
                padding: 20px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-50%) translateX(100%);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .fallback-info-panel.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(-50%) translateX(0);
            }
            
            .fallback-info-title {
                font-family: 'Orbitron', monospace;
                font-size: 1.2rem;
                color: #00f0ff;
                text-shadow: 0 0 10px rgba(0,240,255,0.8);
                margin-bottom: 15px;
            }
            
            .fallback-info-text {
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.6;
                font-size: 0.9rem;
            }
            
            .fallback-info-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 30px;
                height: 30px;
                background: none;
                border: none;
                color: #00f0ff;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .fallback-info-close:hover {
                background: rgba(255, 0, 128, 0.2);
                color: #ff0080;
                box-shadow: 0 0 10px #ff0080;
            }
            
            @media (max-width: 768px) {
                .fallback-galleries {
                    gap: 20px;
                }
                
                .fallback-gallery {
                    width: 150px;
                    height: 200px;
                }
                
                .fallback-gallery-icon {
                    font-size: 2rem;
                }
                
                .fallback-gallery-title {
                    font-size: 1rem;
                }
                
                .fallback-gallery-description {
                    font-size: 0.8rem;
                }
                
                .fallback-center-title {
                    font-size: 1.5rem;
                }
                
                .fallback-info-panel {
                    width: 250px;
                    right: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    createGalleries() {
        // Hall central
        const hall = document.createElement('div');
        hall.className = 'fallback-hall';
        
        // Titre central
        const centerTitle = document.createElement('div');
        centerTitle.className = 'fallback-center-title';
        centerTitle.textContent = 'IBAM';
        
        const centerSubtitle = document.createElement('div');
        centerSubtitle.className = 'fallback-center-subtitle';
        centerSubtitle.textContent = 'MUSÉE DES SCIENCES';
        
        hall.appendChild(centerTitle);
        hall.appendChild(centerSubtitle);
        
        // Particules
        const particles = document.createElement('div');
        particles.className = 'fallback-particles';
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'fallback-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.animationDuration = `${6 + Math.random() * 4}s`;
            particles.appendChild(particle);
        }
        
        hall.appendChild(particles);
        this.sceneContainer.appendChild(hall);
        
        // Galeries
        const galleriesContainer = document.createElement('div');
        galleriesContainer.className = 'fallback-galleries';
        
        const galleries = [
            { key: 'ibam', icon: '🔬', title: 'Technologies IBAM', description: 'Découvrez les technologies innovantes développées par IBAM', color: '#00f0ff' },
            { key: 'modernTech', icon: '🤖', title: 'Technologies Modernes', description: 'Explorez les dernières avancées technologiques', color: '#8b5cf6' },
            { key: 'oldTech', icon: '⚗️', title: 'Technologies Anciennes', description: 'Plongez dans l\'histoire des inventions anciennes', color: '#06ffa5' },
            { key: 'sciencesStorie', icon: '👨‍🔬', title: 'Histoire des Sciences', description: 'Rencontrez les grands scientifiques de l\'histoire', color: '#ff0080' }
        ];
        
        galleries.forEach(gallery => {
            const galleryElement = this.createGallery(gallery);
            galleriesContainer.appendChild(galleryElement);
        });
        
        this.sceneContainer.appendChild(galleriesContainer);
        
        // Panneau d'information
        this.createInfoPanel();
    }
    
    createGallery(galleryData) {
        const gallery = document.createElement('div');
        gallery.className = `fallback-gallery ${galleryData.key}`;
        gallery.dataset.gallery = galleryData.key;
        
        const content = document.createElement('div');
        content.className = 'fallback-gallery-content';
        
        const icon = document.createElement('div');
        icon.className = 'fallback-gallery-icon';
        icon.textContent = galleryData.icon;
        
        const title = document.createElement('h3');
        title.className = 'fallback-gallery-title';
        title.textContent = galleryData.title;
        
        const description = document.createElement('p');
        description.className = 'fallback-gallery-description';
        description.textContent = galleryData.description;
        
        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(description);
        
        // Objets interactifs
        const objects = document.createElement('div');
        objects.className = 'fallback-objects';
        
        for (let i = 0; i < 3; i++) {
            const object = document.createElement('div');
            object.className = 'fallback-object';
            object.dataset.index = i;
            object.style.background = `linear-gradient(45deg, ${galleryData.color}88, ${galleryData.color}44)`;
            object.style.borderColor = galleryData.color;
            object.style.boxShadow = `0 0 10px ${galleryData.color}44`;
            
            object.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showObjectInfo(galleryData.key, i);
            });
            
            objects.appendChild(object);
        }
        
        gallery.appendChild(content);
        gallery.appendChild(objects);
        
        gallery.addEventListener('click', () => {
            this.navigateToGallery(galleryData.key);
        });
        
        return gallery;
    }
    
    createInfoPanel() {
        const panel = document.createElement('div');
        panel.className = 'fallback-info-panel';
        panel.id = 'fallback-info-panel';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fallback-info-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
        });
        
        const title = document.createElement('h2');
        title.className = 'fallback-info-title';
        title.id = 'fallback-info-title';
        title.textContent = 'Titre';
        
        const text = document.createElement('div');
        text.className = 'fallback-info-text';
        text.id = 'fallback-info-text';
        text.textContent = 'Description...';
        
        panel.appendChild(closeBtn);
        panel.appendChild(title);
        panel.appendChild(text);
        
        this.sceneContainer.appendChild(panel);
    }
    
    setupInteractions() {
        // Navigation par galeries
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const gallery = item.dataset.gallery;
                this.navigateToGallery(gallery);
            });
        });
    }
    
    navigateToGallery(galleryKey) {
        this.currentGallery = galleryKey;
        
        const galleries = {
            ibam: "Technologies IBAM",
            modernTech: "Technologies Modernes", 
            oldTech: "Technologies Anciennes",
            sciencesStorie: "Histoire des Sciences"
        };
        
        this.updateLocationInfo(galleries[galleryKey]);
        this.updateMinimap(galleryKey);
        
        // Animation de transition
        this.showTransitionOverlay(`Accès à ${galleries[galleryKey]}`);
        
        setTimeout(() => {
            this.hideTransitionOverlay();
        }, 1000);
    }
    
    showObjectInfo(galleryKey, objectIndex) {
        const galleries = {
            ibam: "Technologies IBAM",
            modernTech: "Technologies Modernes",
            oldTech: "Technologies Anciennes", 
            sciencesStorie: "Histoire des Sciences"
        };
        
        const info = {
            title: `Objet ${objectIndex + 1} - ${galleries[galleryKey]}`,
            description: `Description détaillée de l'objet interactif dans la galerie ${galleries[galleryKey]}. Cet objet représente une innovation importante dans le domaine des sciences et technologies.`
        };
        
        this.showInfoPanel(info);
    }
    
    showInfoPanel(info) {
        const panel = document.getElementById('fallback-info-panel');
        const title = document.getElementById('fallback-info-title');
        const text = document.getElementById('fallback-info-text');
        
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
    
    startAnimations() {
        // Animation des particules et effets
        setInterval(() => {
            // Animation des objets
            const objects = document.querySelectorAll('.fallback-object');
            objects.forEach(object => {
                const intensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.2;
                object.style.opacity = intensity;
            });
        }, 50);
    }
}

// Fonction d'initialisation du fallback simple
function initSimpleFallback() {
    console.log('Initialisation du fallback simple...');
    try {
        window.simpleFallbackMuseum = new SimpleFallbackMuseum();
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du fallback simple:', error);
        return false;
    }
}

// Export pour utilisation globale
window.SimpleFallbackMuseum = SimpleFallbackMuseum;
window.initSimpleFallback = initSimpleFallback;
