// ===================================
// IMPORTS THREE.JS
// ===================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===================================
// CONFIGURATION & VARIABLES GLOBALES
// ===================================
const CONFIG = {
    camera: { fov: 75, near: 0.1, far: 1000, position: { x: 0, y: 5, z: 20 } },
    particles: { count: 1000, size: 0.1, speed: 0.0005 },
    lighting: { ambient: 0x404040, spotIntensity: 2, pointIntensity: 1.5 },
    sections: {
        hall: { x: 0, y: 0, z: 0 },
        ibam: { x: -30, y: 0, z: 0 },
        modern: { x: 30, y: 0, z: 0 },
        old: { x: 0, y: 0, z: -30 },
        science: { x: 0, y: 0, z: 30 }
    }
};

let scene, camera, renderer, controls;
let particleSystem;
let currentSection = 'hall';
let interactiveObjects = [];
let raycaster, mouse;
let audioEnabled = true;

// Données des sections
const sectionsData = {
    ibam: {
        name: "Technologies IBAM",
        color: 0x00f3ff,
        items: [
            { title: "Électronique Avancée", image: "assets/ibam/Electronique.jpg", description: "Formation en électronique et systèmes embarqués de pointe." },
            { title: "Intelligence Artificielle", image: "assets/ibam/IA.jpg", description: "Programmes d'IA et machine learning pour l'avenir." },
            { title: "Cybersécurité", video: "assets/ibam/cyber-securite.mp4", description: "Protection des systèmes et réseaux informatiques." },
            { title: "Robotique Industrielle", video: "assets/ibam/robotique.mp4", description: "Automatisation et robotique pour l'industrie 4.0." },
            { title: "Digitalisation", video: "assets/ibam/digitalisation.mp4", description: "Transformation numérique des entreprises." },
            { title: "Énergie Solaire", image: "assets/ibam/solar.jpg", description: "Technologies d'énergie renouvelable et durable." },
            { title: "Agriculture Intelligente", image: "assets/ibam/tractor.png", description: "Innovation technologique dans l'agriculture moderne." }
        ]
    },
    modern: {
        name: "Technologies Modernes",
        color: 0x9d00ff,
        items: [
            { title: "Robotique Avancée", video: "assets/modern-tech/Robitque.mp4", description: "Robots intelligents et systèmes autonomes." },
            { title: "Assistant IA", video: "assets/modern-tech/assistant IA.mp4", description: "Assistants virtuels et interfaces conversationnelles." },
            { title: "Intelligence Artificielle", video: "assets/brain.mp4", description: "Réseaux neuronaux et deep learning." },
            { title: "Réalité Virtuelle", video: "assets/cube.mp4", description: "Expériences immersives et mondes virtuels." },
            { title: "Robot Humanoïde", image: "assets/robot.jpg", description: "Robotique anthropomorphe et interaction humain-robot." }
        ]
    },
    old: {
        name: "Technologies Anciennes",
        color: 0xffaa00,
        items: [
            { title: "Instruments Historiques", description: "Instruments d'observation et de navigation du 19ème siècle." },
            { title: "Révolution Industrielle", description: "Technologies qui ont transformé le monde." }
        ]
    },
    science: {
        name: "Histoire des Sciences",
        color: 0x00ff88,
        items: [
            { title: "Nikola Tesla", image: "assets/sciences-storie/Nicala Tesla.png", description: "Pionnier de l'électricité et inventeur visionnaire." },
            { title: "Albert Einstein", image: "assets/sciences-storie/albert-einstein.png", description: "Théorie de la relativité et physique moderne." },
            { title: "Isaac Newton", image: "assets/sciences-storie/isaac-newton.png", description: "Lois du mouvement et gravitation universelle." },
            { title: "Marie Curie", image: "assets/sciences-storie/marie curie.png", description: "Recherches sur la radioactivité et prix Nobel." },
            { title: "Thomas Edison", image: "assets/sciences-storie/thomas-edison.png", description: "Inventeur prolifique et pionnier de l'électricité." }
        ]
    }
};

// ===================================
// INITIALISATION
// ===================================
function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    
    camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, CONFIG.camera.near, CONFIG.camera.far);
    camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);
    
    const canvas = document.getElementById('canvas3d');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    createLighting();
    createParticleSystem();
    createHall();
    createGalleries();
    setupEventListeners();
    
    animate();
    simulateLoading();
}

// ===================================
// CHARGEMENT
// ===================================
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(hideLoadingScreen, 500);
        }
        updateLoadingProgress(progress);
    }, 200);
}

function updateLoadingProgress(progress) {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    if (progressBar) progressBar.style.width = progress + '%';
    if (loadingText) loadingText.textContent = `Chargement du musée... ${Math.round(progress)}%`;
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainInterface = document.getElementById('main-interface');
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 1s ease-out';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainInterface.style.display = 'block';
        mainInterface.style.animation = 'fadeIn 1s ease-in';
    }, 1000);
}

// ===================================
// ÉCLAIRAGE
// ===================================
function createLighting() {
    const ambientLight = new THREE.AmbientLight(CONFIG.lighting.ambient, 0.5);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const spotColors = [0x00f3ff, 0x9d00ff, 0x00ff88, 0xffaa00];
    const spotPositions = [{ x: -20, y: 15, z: 0 }, { x: 20, y: 15, z: 0 }, { x: 0, y: 15, z: -20 }, { x: 0, y: 15, z: 20 }];
    
    spotPositions.forEach((pos, i) => {
        const spotlight = new THREE.SpotLight(spotColors[i], CONFIG.lighting.spotIntensity);
        spotlight.position.set(pos.x, pos.y, pos.z);
        spotlight.angle = Math.PI / 6;
        spotlight.penumbra = 0.5;
        spotlight.decay = 2;
        spotlight.distance = 50;
        scene.add(spotlight);
    });
    
    for (let i = 0; i < 8; i++) {
        const pointLight = new THREE.PointLight(0x00f3ff, CONFIG.lighting.pointIntensity, 20);
        const angle = (i / 8) * Math.PI * 2;
        const radius = 15;
        pointLight.position.set(Math.cos(angle) * radius, 5 + Math.random() * 3, Math.sin(angle) * radius);
        pointLight.userData = { originalY: pointLight.position.y, speed: 0.5 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 };
        scene.add(pointLight);
    }
}

// ===================================
// PARTICULES
// ===================================
function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const colorPalette = [new THREE.Color(0x00f3ff), new THREE.Color(0x9d00ff), new THREE.Color(0x00ff88)];
    
    for (let i = 0; i < CONFIG.particles.count; i++) {
        positions.push((Math.random() - 0.5) * 100, Math.random() * 50, (Math.random() - 0.5) * 100);
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// ===================================
// HALL CENTRAL
// ===================================
function createHall() {
    const floorGeometry = new THREE.CircleGeometry(25, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const gridHelper = new THREE.GridHelper(50, 50, 0x00f3ff, 0x9d00ff);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    const columnGeometry = new THREE.CylinderGeometry(0.5, 0.7, 12, 8);
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x9d00ff,
        emissiveIntensity: 0.2
    });
    
    const columnPositions = [{ x: -10, z: -10 }, { x: 10, z: -10 }, { x: -10, z: 10 }, { x: 10, z: 10 }];
    columnPositions.forEach(pos => {
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.set(pos.x, 6, pos.z);
        column.castShadow = true;
        scene.add(column);
        
        const topLight = new THREE.PointLight(0x9d00ff, 1, 10);
        topLight.position.set(pos.x, 12, pos.z);
        scene.add(topLight);
    });
    
    const ceilingGeometry = new THREE.TorusGeometry(15, 0.5, 16, 100);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 15;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);
    
    createHolographicTitle();
}

function createHolographicTitle() {
    const titleGroup = new THREE.Group();
    const ringGeometry = new THREE.TorusGeometry(3, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    titleGroup.add(ring);
    
    titleGroup.position.set(0, 8, 0);
    titleGroup.userData.rotationSpeed = 0.01;
    scene.add(titleGroup);
}

// ===================================
// GALERIES
// ===================================
function createGalleries() {
    Object.keys(sectionsData).forEach(sectionKey => {
        const sectionData = sectionsData[sectionKey];
        const position = CONFIG.sections[sectionKey];
        createGalleryRoom(sectionKey, position, sectionData);
        createGalleryDoor(sectionKey, position, sectionData.color);
    });
}

function createGalleryRoom(sectionKey, position, sectionData) {
    const roomGroup = new THREE.Group();
    roomGroup.name = `room_${sectionKey}`;
    
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.7,
        roughness: 0.3,
        emissive: sectionData.color,
        emissiveIntensity: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        metalness: 0.5,
        roughness: 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    const backWallGeometry = new THREE.PlaneGeometry(20, 10);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 5, -10);
    roomGroup.add(backWall);
    
    const sideWallGeometry = new THREE.PlaneGeometry(20, 10);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-10, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    roomGroup.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(10, 5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    roomGroup.add(rightWall);
    
    const galleryLight = new THREE.PointLight(sectionData.color, 2, 30);
    galleryLight.position.set(0, 8, 0);
    roomGroup.add(galleryLight);
    
    createExhibitPanels(roomGroup, sectionData, sectionKey);
    
    roomGroup.position.set(position.x, position.y, position.z);
    scene.add(roomGroup);
}

function createExhibitPanels(roomGroup, sectionData, sectionKey) {
    const items = sectionData.items;
    const panelWidth = 3;
    const panelHeight = 4;
    
    items.forEach((item, index) => {
        const panelGroup = new THREE.Group();
        
        const frameGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            metalness: 0.8,
            roughness: 0.2,
            emissive: sectionData.color,
            emissiveIntensity: 0.3
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        panelGroup.add(frame);
        
        const borderGeometry = new THREE.EdgesGeometry(frameGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: sectionData.color, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        panelGroup.add(border);
        
        const panelLight = new THREE.PointLight(sectionData.color, 0.5, 5);
        panelLight.position.z = 0.5;
        panelGroup.add(panelLight);
        
        const angle = (index / items.length) * Math.PI * 1.5 - Math.PI * 0.75;
        const radius = 8;
        panelGroup.position.set(Math.sin(angle) * radius, 3, Math.cos(angle) * radius - 5);
        panelGroup.rotation.y = -angle;
        
        panelGroup.userData = { interactive: true, sectionKey: sectionKey, itemData: item };
        interactiveObjects.push(frame);
        roomGroup.add(panelGroup);
    });
}

function createGalleryDoor(sectionKey, position, color) {
    const doorGroup = new THREE.Group();
    doorGroup.name = `door_${sectionKey}`;
    
    const doorFrameGeometry = new THREE.BoxGeometry(4, 6, 0.5);
    const doorFrameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        metalness: 0.9,
        roughness: 0.1,
        emissive: color,
        emissiveIntensity: 0.4
    });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorGroup.add(doorFrame);
    
    const doorLight = new THREE.PointLight(color, 1.5, 10);
    doorLight.position.set(0, 0, 1);
    doorGroup.add(doorLight);
    
    const doorPosition = { x: position.x / 2, y: 3, z: position.z / 2 };
    doorGroup.position.set(doorPosition.x, doorPosition.y, doorPosition.z);
    
    if (position.x !== 0) {
        doorGroup.rotation.y = position.x > 0 ? -Math.PI / 2 : Math.PI / 2;
    } else if (position.z !== 0) {
        doorGroup.rotation.y = position.z > 0 ? Math.PI : 0;
    }
    
    doorGroup.userData = { interactive: true, type: 'door', targetSection: sectionKey };
    interactiveObjects.push(doorFrame);
    scene.add(doorGroup);
}

// ===================================
// ÉVÉNEMENTS
// ===================================
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navigateToSection(section);
            updateMenuActive(item);
        });
    });
    
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('holographic-menu');
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
        menuToggle.classList.toggle('active');
    });
    
    document.getElementById('reset-camera').addEventListener('click', resetCamera);
    document.getElementById('close-info').addEventListener('click', () => {
        document.getElementById('info-panel').classList.remove('active');
    });
    
    const audioToggle = document.getElementById('audio-toggle');
    audioToggle.addEventListener('click', () => {
        audioEnabled = !audioEnabled;
        audioToggle.classList.toggle('muted');
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        const parent = object.parent;
        
        if (parent.userData.interactive) {
            if (parent.userData.type === 'door') {
                navigateToSection(parent.userData.targetSection);
            } else if (parent.userData.itemData) {
                showInfoPanel(parent.userData.itemData);
            }
        }
    }
}

// ===================================
// NAVIGATION
// ===================================
function navigateToSection(sectionKey) {
    currentSection = sectionKey;
    const position = CONFIG.sections[sectionKey];
    animateCamera({ x: position.x, y: 5, z: position.z + 15 }, { x: position.x, y: 0, z: position.z });
    updateSectionIndicators(sectionKey);
}

function animateCamera(targetPosition, targetLookAt) {
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    const duration = 2000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        camera.position.lerpVectors(startPosition, new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), eased);
        controls.target.lerpVectors(startLookAt, new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z), eased);
        controls.update();
        
        if (progress < 1) requestAnimationFrame(animate);
    }
    animate();
}

function resetCamera() {
    animateCamera(CONFIG.camera.position, { x: 0, y: 0, z: 0 });
    currentSection = 'hall';
    updateSectionIndicators('hall');
}

function updateMenuActive(activeItem) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function updateSectionIndicators(sectionKey) {
    const sectionNames = {
        hall: 'Hall Central',
        ibam: 'Technologies IBAM',
        modern: 'Tech Moderne',
        old: 'Tech Ancienne',
        science: 'Histoire Sciences'
    };
    
    document.getElementById('current-position').textContent = sectionNames[sectionKey];
    document.getElementById('section-name').textContent = sectionNames[sectionKey];
}

// ===================================
// PANNEAU D'INFORMATION
// ===================================
function showInfoPanel(itemData) {
    const panel = document.getElementById('info-panel');
    const title = document.getElementById('info-title');
    const media = document.getElementById('info-media');
    const description = document.getElementById('info-description');
    
    title.textContent = itemData.title;
    description.textContent = itemData.description;
    
    media.innerHTML = '';
    if (itemData.image) {
        const img = document.createElement('img');
        img.src = itemData.image;
        img.alt = itemData.title;
        img.onerror = () => { img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%232a2a4a" width="400" height="300"/%3E%3Ctext fill="%2300f3ff" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E'; };
        media.appendChild(img);
    } else if (itemData.video) {
        const video = document.createElement('video');
        video.src = itemData.video;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        media.appendChild(video);
    }
    
    panel.classList.add('active');
}

// ===================================
// ANIMATION
// ===================================
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    if (particleSystem) {
        particleSystem.rotation.y += CONFIG.particles.speed;
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(time + positions[i]) * 0.01;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    scene.traverse(obj => {
        if (obj.userData.rotationSpeed) {
            obj.rotation.y += obj.userData.rotationSpeed;
        }
        if (obj.userData.originalY) {
            obj.position.y = obj.userData.originalY + Math.sin(time * obj.userData.speed + obj.userData.offset) * 2;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// ===================================
// DÉMARRAGE
// ===================================
window.addEventListener('DOMContentLoaded', init);
