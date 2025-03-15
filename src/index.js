import * as THREE from 'three';
import { GameManager } from './systems/game-manager.js';
import { loadAssets } from './utils/asset-loader.js';
import { createScene } from './scenes/main-scene.js';

// Estado global del juego (normalmente evitaríamos el estado global, pero para un MVP es aceptable)
const GAME_STATE = {
  isLoading: true,
  assets: null,
  scene: null,
  camera: null,
  renderer: null,
  gameManager: null,
  lastTime: 0,
  isGameStarted: false,
  currentDistance: 0,
  bestDistance: 0
};

// Función principal
async function init() {
  // Ocultar mensajes de info hasta que todo esté cargado
  document.getElementById('info').style.display = 'none';
  document.getElementById('score').style.display = 'none';

  // Crear renderer
  GAME_STATE.renderer = new THREE.WebGLRenderer({ antialias: true });
  GAME_STATE.renderer.setSize(window.innerWidth, window.innerHeight);
  GAME_STATE.renderer.setClearColor(0x87CEEB); // Color azul cielo
  GAME_STATE.renderer.shadowMap.enabled = true;
  GAME_STATE.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
  document.body.appendChild(GAME_STATE.renderer.domElement);

  // Cargar recursos
  try {
    GAME_STATE.assets = await loadAssets();
    console.log('Assets loaded successfully');

    // Crear escena principal
    const sceneData = createScene();
    GAME_STATE.scene = sceneData.scene;
    GAME_STATE.camera = sceneData.camera;

    // Inicializar gestor del juego
    GAME_STATE.gameManager = new GameManager(GAME_STATE);

    // Todo cargado, iniciar juego
    GAME_STATE.isLoading = false;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('info').style.display = 'block';
    document.getElementById('score').style.display = 'block';

    // Empezar el bucle de renderizado
    requestAnimationFrame(gameLoop);

    // Añadir eventos de interacción
    setupEventListeners();

  } catch (error) {
    console.error('Error initializing game:', error);
    document.getElementById('loading').textContent = 'Error cargando el juego. Por favor, recarga la página.';
  }
}

// Bucle principal del juego
function gameLoop(time) {
  if (GAME_STATE.isLoading) return;

  const deltaTime = (time - GAME_STATE.lastTime) / 1000;
  GAME_STATE.lastTime = time;

  // Actualizar lógica del juego
  if (GAME_STATE.gameManager) {
    GAME_STATE.gameManager.update(deltaTime);
  }

  // Renderizar escena
  GAME_STATE.renderer.render(GAME_STATE.scene, GAME_STATE.camera);

  // Continuar bucle
  requestAnimationFrame(gameLoop);
}

// Configurar eventos
function setupEventListeners() {
  // Evento de clic para golpear al pingüino
  window.addEventListener('click', () => {
    if (GAME_STATE.gameManager) {
      GAME_STATE.gameManager.handlePlayerClick();
    }
  });

  // Evento de redimensionado de ventana
  window.addEventListener('resize', () => {
    if (GAME_STATE.camera && GAME_STATE.renderer) {
      GAME_STATE.camera.aspect = window.innerWidth / window.innerHeight;
      GAME_STATE.camera.updateProjectionMatrix();
      GAME_STATE.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  });
}

// Iniciar el juego cuando se cargue la página
window.addEventListener('load', init);
