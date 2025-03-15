import * as THREE from 'three';

// Función para cargar texturas
function loadTexture(path) {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      path,
      (texture) => {
        console.log(`Texture loaded: ${path}`);
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`Error loading texture ${path}:`, error);
        // Resolvemos con null en lugar de rechazar para no interrumpir la carga completa
        resolve(null);
      }
    );
  });
}

// Función para crear geometrías básicas para los modelos
function createBasicGeometries() {
  return {
    // Geometrías para el Yeti
    yetiBody: new THREE.CylinderGeometry(1, 0.8, 2, 16),
    yetiHead: new THREE.SphereGeometry(0.8, 16, 16),
    yetiArm: new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8),
    yetiBat: new THREE.BoxGeometry(0.2, 1.5, 0.2),

    // Geometrías para el Pingüino
    penguinBody: new THREE.SphereGeometry(0.5, 16, 16),
    penguinHead: new THREE.SphereGeometry(0.3, 16, 16),
    penguinBeak: new THREE.ConeGeometry(0.1, 0.2, 8),
    penguinArm: new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8),

    // Geometrías para el entorno
    ground: new THREE.PlaneGeometry(1000, 1000),
    mountain: new THREE.ConeGeometry(5, 10, 16),
    tree: new THREE.ConeGeometry(1, 2, 8),
    treeStump: new THREE.CylinderGeometry(0.2, 0.2, 1, 8),
    rock: new THREE.DodecahedronGeometry(0.5, 0),

    // Geometrías para el marcador
    signpost: new THREE.BoxGeometry(0.1, 2, 0.1),
    signboard: new THREE.BoxGeometry(1.5, 0.8, 0.1)
  };
}

// Función para crear materiales básicos
function createBasicMaterials() {
  return {
    // Materiales para el Yeti
    yetiBody: new THREE.MeshLambertMaterial({ color: 0xFFFFFF }),
    yetiEyes: new THREE.MeshLambertMaterial({ color: 0x000000 }),

    // Materiales para el Pingüino
    penguinBody: new THREE.MeshLambertMaterial({ color: 0x000000 }),
    penguinBelly: new THREE.MeshLambertMaterial({ color: 0xFFFFFF }),
    penguinBeak: new THREE.MeshLambertMaterial({ color: 0xFFA500 }),

    // Materiales para el entorno
    snow: new THREE.MeshLambertMaterial({ color: 0xFFFFFF }),
    ice: new THREE.MeshPhongMaterial({
      color: 0xADD8E6,
      specular: 0xFFFFFF,
      shininess: 100
    }),
    wood: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
    treeLeaves: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
    rock: new THREE.MeshLambertMaterial({ color: 0x808080 }),

    // Materiales para el marcador
    signpost: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
    signboard: new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
  };
}

// Función principal para cargar todos los recursos
export async function loadAssets() {
  try {
    console.log('Starting asset loading...');

    // Para el MVP, usaremos geometrías y materiales básicos en lugar de modelos y texturas complejas
    const geometries = createBasicGeometries();
    const materials = createBasicMaterials();

    // Devolver todos los recursos agrupados
    return {
      geometries,
      materials,
      // Podemos agregar texturas más adelante cuando tengamos los archivos
      textures: {}
    };
  } catch (error) {
    console.error('Error loading assets:', error);
    throw error;
  }
}
