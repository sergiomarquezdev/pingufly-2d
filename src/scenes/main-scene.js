import * as THREE from 'three';
import { CONSTANTS, COLORS } from '../utils/constants.js';

export function createScene() {
  // Crear escena
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.SKY);

  // Crear la cámara principal
  const camera = new THREE.PerspectiveCamera(
    CONSTANTS.FOV,
    window.innerWidth / window.innerHeight,
    CONSTANTS.NEAR,
    CONSTANTS.FAR
  );

  // Configurar posición inicial de la cámara
  camera.position.set(
    CONSTANTS.CAMERA_INITIAL_X,
    CONSTANTS.CAMERA_INITIAL_Y,
    CONSTANTS.CAMERA_INITIAL_Z
  );
  camera.lookAt(
    CONSTANTS.CAMERA_LOOK_AT_X,
    CONSTANTS.CAMERA_LOOK_AT_Y,
    CONSTANTS.CAMERA_LOOK_AT_Z
  );

  // Añadir luces a la escena
  setupLighting(scene);

  return { scene, camera };
}

function setupLighting(scene) {
  // Luz ambiental para iluminación general
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Luz direccional para simular el sol
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(-10, 20, 10);
  directionalLight.castShadow = true;

  // Configurar sombras de la luz direccional
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;

  scene.add(directionalLight);

  // Luz de relleno desde otra dirección para reducir las sombras duras
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(10, 10, -10);
  scene.add(fillLight);
}
