import * as THREE from 'three';
import { COLORS, POSITIONS } from '../utils/constants.js';

export class EnvironmentEntity {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.highestScore = 0; // Inicializa el score más alto

    this.createEnvironment();
  }

  createEnvironment() {
    // Crear el suelo nevado
    this.createGround();

    // Crear fondo degradado azul de cielo
    this.createSky();

    // Crear la montaña de hielo
    this.createIceMountain();

    // Crear árboles con nieve
    this.createTrees();

    // Crear rocas
    this.createRocks();

    // Crear señal para top score
    this.createTopScoreSign();

    // Crear roca con inscripción
    this.createSignatureRock();

    // Añadir firma del autor en la parte superior
    this.createAuthorSignature();
  }

  createGround() {
    // Geometría para el suelo plano
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: COLORS.SNOW,
      side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = POSITIONS.GROUND_Y;
    ground.receiveShadow = true;

    this.scene.add(ground);
    this.objects.push(ground);
    this.ground = ground;
  }

  createSky() {
    // Crear un fondo degradado para el cielo usando un color de fondo en la escena
    // y un hemisphereLight para dar un efecto de ambiente más realista
    const hemisphereLight = new THREE.HemisphereLight(
      COLORS.SKY, // Color del cielo
      COLORS.SNOW, // Color del suelo
      0.7 // Intensidad aumentada
    );
    hemisphereLight.position.set(0, 50, 0);
    this.scene.add(hemisphereLight);

    // Añadir luz direccional para simular el sol y mejorar las sombras
    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    sunLight.position.set(50, 100, 30);
    sunLight.castShadow = true;

    // Configuración mejorada para las sombras
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 2;

    this.scene.add(sunLight);

    // Añadir luz ambiental suave para evitar sombras demasiado oscuras
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    this.scene.add(ambientLight);
  }

  createIceMountain() {
    // Crear montaña de hielo desde donde cae el pingüino
    // Grupo para la montaña de hielo
    this.iceMountainGroup = new THREE.Group();

    // Posicionar según la descripción (ahora a la derecha)
    this.iceMountainGroup.position.set(8, 0, 0);

    // Base principal de la montaña - ahora usando forma más natural
    const mountainGeometry = new THREE.ConeGeometry(5, 12, 8);

    // Distorsionar vertices para hacerla más irregular y natural
    const vertices = mountainGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);

      // Solo distorsionar si no es la punta o la base para preservar forma
      if (y > 0.5 && y < 11.5) {
        // Usar una distorsión más natural con menos aleatoriedad
        const distanceFromCenter = Math.sqrt(x*x + z*z);
        const distortionFactor = Math.sin(y * 0.5) * 0.7;

        vertices.setX(i, x + (Math.random() - 0.5) * distortionFactor);
        vertices.setZ(i, z + (Math.random() - 0.5) * distortionFactor);
      }
    }

    // Material mejorado para la base de la montaña - glaciar azulado
    const mountainIceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xA5D8FF,
      roughness: 0.3,
      metalness: 0.1,
      transmission: 0.2, // Translucidez sutil
      thickness: 1.0,
      envMapIntensity: 0.2
    });

    // Material para la nieve - blanco puro con textura
    const mountainSnowMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.7,
      metalness: 0.0,
      flatShading: true
    });

    // Partes principales de la montaña
    this.iceMountain = new THREE.Mesh(mountainGeometry, mountainIceMaterial);
    this.iceMountain.castShadow = true;
    this.iceMountain.receiveShadow = true;

    // Añadir capa de nieve en la parte superior - más irregular
    const snowCapGeometry = new THREE.ConeGeometry(4, 7, 8);

    // Distorsionar la capa de nieve para hacerla irregular
    const snowCapVertices = snowCapGeometry.attributes.position;
    for (let i = 0; i < snowCapVertices.count; i++) {
      const x = snowCapVertices.getX(i);
      const y = snowCapVertices.getY(i);
      const z = snowCapVertices.getZ(i);

      if (y > 0.5 && y < 6.5) {
        snowCapVertices.setX(i, x + (Math.random() - 0.5) * 0.8);
        snowCapVertices.setZ(i, z + (Math.random() - 0.5) * 0.8);
      }
    }

    const snowCap = new THREE.Mesh(snowCapGeometry, mountainSnowMaterial);
    snowCap.position.y = 5.5;
    snowCap.castShadow = true;
    snowCap.receiveShadow = true;

    // Mejorar la plataforma superior - ya no es un simple cubo
    // Crear una plataforma cóncava en forma de cuenco para el pingüino
    const platformGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 16);

    // Aplanar el centro para crear un cuenco suave
    const platformVertices = platformGeometry.attributes.position;
    for (let i = 0; i < platformVertices.count; i++) {
      const y = platformVertices.getY(i);

      // Si está en la cara superior, crear concavidad
      if (y > 0.2) {
        const x = platformVertices.getX(i);
        const z = platformVertices.getZ(i);
        const distFromCenter = Math.sqrt(x*x + z*z);

        // Crear depresión en el centro
        if (distFromCenter < 0.8) {
          platformVertices.setY(i, y - 0.3 * (0.8 - distFromCenter));
        }
      }
    }

    const platform = new THREE.Mesh(platformGeometry, mountainSnowMaterial);
    platform.position.set(0, 11.0, 0);
    platform.castShadow = true;
    platform.receiveShadow = true;

    // Añadir picos secundarios más naturales
    const createPeak = (x, y, z, scale) => {
      const peakGeometry = new THREE.ConeGeometry(1, 3, 7);

      // Distorsionar los picos secundarios
      const peakVertices = peakGeometry.attributes.position;
      for (let i = 0; i < peakVertices.count; i++) {
        const px = peakVertices.getX(i);
        const py = peakVertices.getY(i);
        const pz = peakVertices.getZ(i);

        if (py > 0.5 && py < 2.5) {
          peakVertices.setX(i, px + (Math.random() - 0.5) * 0.3);
          peakVertices.setZ(i, pz + (Math.random() - 0.5) * 0.3);
        }
      }

      // Mezclar material de nieve y hielo para los picos
      const peak = new THREE.Mesh(peakGeometry, mountainSnowMaterial);
      peak.position.set(x, y, z);
      peak.scale.set(scale, scale, scale);
      peak.castShadow = true;
      peak.receiveShadow = true;
      return peak;
    };

    // Añadir todos los elementos a la montaña
    this.iceMountainGroup.add(this.iceMountain);
    this.iceMountainGroup.add(snowCap);
    this.iceMountainGroup.add(platform);

    // Añadir más picos secundarios para aumentar realismo
    this.iceMountainGroup.add(createPeak(1.8, 4, 1.2, 0.9));
    this.iceMountainGroup.add(createPeak(-2.0, 4.5, -0.5, 0.8));
    this.iceMountainGroup.add(createPeak(0.9, 8, -1.5, 0.5));
    this.iceMountainGroup.add(createPeak(-1.2, 7, 1.8, 0.6));
    this.iceMountainGroup.add(createPeak(2.2, 2, -2.0, 0.7));

    // Añadir detalles de nieve en los bordes
    const addSnowDetail = (x, y, z, scale) => {
      const snowDetailGeometry = new THREE.SphereGeometry(1, 8, 8);
      // Aplastar para hacer forma de copo de nieve
      snowDetailGeometry.scale(1, 0.3, 1);

      const snowDetail = new THREE.Mesh(snowDetailGeometry, mountainSnowMaterial);
      snowDetail.position.set(x, y, z);
      snowDetail.scale.set(scale, scale, scale);
      snowDetail.castShadow = false;
      snowDetail.receiveShadow = true;
      return snowDetail;
    };

    // Añadir acumulaciones de nieve en puntos estratégicos
    this.iceMountainGroup.add(addSnowDetail(2.2, 1.0, 2.0, 0.8));
    this.iceMountainGroup.add(addSnowDetail(-1.9, 2.2, 1.5, 0.6));
    this.iceMountainGroup.add(addSnowDetail(1.5, 3.5, -2.3, 0.5));
    this.iceMountainGroup.add(addSnowDetail(-2.5, 0.8, -2.0, 0.7));

    // Añadir pequeños cristales de hielo que sobresalen (detalles)
    const addIceCrystal = (x, y, z, scale) => {
      const crystalGeometry = new THREE.OctahedronGeometry(0.5, 0);
      const crystalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xE6F7FF,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.8,
        thickness: 0.5
      });

      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(x, y, z);
      crystal.scale.set(scale, scale * 1.5, scale);
      crystal.castShadow = true;
      return crystal;
    };

    // Añadir cristales decorativos de hielo
    this.iceMountainGroup.add(addIceCrystal(2.5, 3.0, 1.0, 0.3));
    this.iceMountainGroup.add(addIceCrystal(-1.8, 5.0, 2.0, 0.25));
    this.iceMountainGroup.add(addIceCrystal(1.0, 7.5, -1.0, 0.2));

    this.scene.add(this.iceMountainGroup);
    this.objects.push(this.iceMountainGroup);
  }

  createTrees() {
    // Crear árboles en el lado izquierdo con tamaños ligeramente diferentes para dar profundidad
    this.createTree(-8, 0, -3, 1.2);
    this.createTree(-10, 0, -5, 1.4);
    // Añadir más árboles para crear un bosque en la distancia
    this.createTree(-12, 0, -2, 1.1);
    this.createTree(-9, 0, -7, 1.3);
    this.createTree(-14, 0, -4, 1.0);
  }

  createTree(x, y, z, scale) {
    // Grupo para contener las partes del árbol
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    treeGroup.scale.set(scale, scale, scale);

    // Tronco del árbol
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;

    // Crear varias capas de "hojas" para simular un pino
    const createLeaves = (y, scale) => {
      const leavesGeometry = new THREE.ConeGeometry(1 * scale, 2 * scale, 8);
      const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x2D4F2D });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = y;
      leaves.castShadow = true;

      // Añadir nieve a las ramas
      const snowGeometry = new THREE.ConeGeometry(1.1 * scale, 0.4 * scale, 8);
      const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      const snow = new THREE.Mesh(snowGeometry, snowMaterial);
      snow.position.y = 0.8 * scale;
      leaves.add(snow);

      return leaves;
    };

    // Crear diferentes niveles de hojas para el pino
    treeGroup.add(trunk);
    treeGroup.add(createLeaves(2.5, 1.0));
    treeGroup.add(createLeaves(3.5, 0.8));
    treeGroup.add(createLeaves(4.3, 0.6));

    this.scene.add(treeGroup);
    this.objects.push(treeGroup);
  }

  createRocks() {
    // Crear algunas rocas dispersas
    this.createRock(5, 0, 2, 0.5);
    this.createRock(3, 0, -4, 0.3);
    // Añadir más rocas para mejorar el paisaje
    this.createRock(-6, 0, 3, 0.4);
    this.createRock(0, 0, -6, 0.6);
    this.createRock(7, 0, -3, 0.35);
  }

  createRock(x, y, z, scale) {
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);

    rock.position.set(x, y + scale / 2, z);
    rock.scale.set(scale, scale, scale);
    rock.castShadow = true;
    rock.receiveShadow = true;

    this.scene.add(rock);
    this.objects.push(rock);
  }

  createTopScoreSign() {
    // Crear un grupo para la señal
    const signGroup = new THREE.Group();
    signGroup.position.set(-6, 0, 0); // Centro-izquierda de la escena

    // Poste de la señal
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 2;
    post.castShadow = true;

    // Crear la señal con forma de flecha
    const signShape = new THREE.Shape();
    signShape.moveTo(0, 0);
    signShape.lineTo(1.5, 0);
    signShape.lineTo(2.0, 0.5);
    signShape.lineTo(1.5, 1.0);
    signShape.lineTo(0, 1.0);
    signShape.lineTo(-0.5, 0.5);
    signShape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3
    };

    const signGeometry = new THREE.ExtrudeGeometry(signShape, extrudeSettings);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(-1, 3.5, 0);
    sign.castShadow = true;

    // Borde azul claro
    const borderGeometry = new THREE.EdgesGeometry(signGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x75B7FF, linewidth: 2 });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    sign.add(border);

    // Crear una textura de canvas para el texto "TOP SCORE"
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#2D4F2D';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText('TOP SCORE', 128, 40);

    // Añadir la puntuación más alta
    this.scoreContext = context;
    this.scoreCanvas = canvas;
    this.updateScoreCanvas();

    const scoreTexture = new THREE.CanvasTexture(canvas);
    const scoreMaterial = new THREE.MeshBasicMaterial({
      map: scoreTexture,
      transparent: true
    });

    const scoreGeometry = new THREE.PlaneGeometry(1.6, 0.8);
    this.scoreTextMesh = new THREE.Mesh(scoreGeometry, scoreMaterial);
    this.scoreTextMesh.position.set(-0.25, 3.5, 0.11);

    // Añadir todos los elementos al grupo
    signGroup.add(post);
    signGroup.add(sign);
    signGroup.add(this.scoreTextMesh);

    // Añadir el grupo a la escena
    this.scene.add(signGroup);
    this.objects.push(signGroup);
    this.topScoreSign = signGroup;
  }

  createSignatureRock() {
    // Roca con inscripción "1978 REINHOLD + YETI"
    const rockGeometry = new THREE.DodecahedronGeometry(0.8, 1);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2
    });

    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(-12, 0, 4);
    rock.rotation.set(0.2, 0.5, 0.1);
    rock.scale.set(1, 0.7, 1);
    rock.castShadow = true;
    rock.receiveShadow = true;

    // Crear texto de inscripción con canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#333333';
    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.fillText('1978', 128, 80);
    context.fillText('REINHOLD', 128, 120);
    context.fillText('+ YETI', 128, 160);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true
    });

    const textGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(-12.5, 0.8, 4.5);
    text.rotation.y = 0.5;

    this.scene.add(rock);
    this.scene.add(text);
    this.objects.push(rock);
    this.objects.push(text);
    this.signatureRock = rock;
  }

  createAuthorSignature() {
    // Texto de autor en la parte superior izquierda
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#2D4F2D';
    context.font = 'bold 20px Arial';
    context.textAlign = 'center';
    context.fillText('YETI SPORTS', 256, 30);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      depthTest: false // Para que siempre sea visible
    });

    const textGeometry = new THREE.PlaneGeometry(8, 1);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Posicionar en la esquina superior izquierda
    textMesh.position.set(-15, 10, -10);

    this.scene.add(textMesh);
    this.objects.push(textMesh);
    this.authorSignature = textMesh;
  }

  // Método auxiliar para actualizar la textura del canvas con la puntuación
  updateScoreCanvas() {
    if (this.scoreContext && this.scoreCanvas) {
      // Limpiar área para el score
      this.scoreContext.clearRect(0, 50, this.scoreCanvas.width, 80);

      // Dibujar nueva puntuación
      this.scoreContext.fillStyle = '#2D4F2D';
      this.scoreContext.font = 'bold 24px Arial';
      this.scoreContext.textAlign = 'center';
      this.scoreContext.fillText(`TOP: ${this.highestScore.toFixed(1)}`, 128, 80);

      // Si ya tenemos una textura, actualizarla
      if (this.scoreTextMesh && this.scoreTextMesh.material && this.scoreTextMesh.material.map) {
        this.scoreTextMesh.material.map.needsUpdate = true;
      }
    }
  }

  // Método para actualizar la puntuación más alta
  updateHighScore(score) {
    if (typeof score === 'number' && !isNaN(score) && score > this.highestScore) {
      this.highestScore = score;
      this.updateScoreCanvas();
    }
  }

  // Método para recuperar la puntuación más alta
  getHighScore() {
    return this.highestScore;
  }

  update(deltaTime) {
    // No es necesario actualizar nada en el entorno estático
  }

  reset() {
    // No necesitamos resetear elementos del entorno estático
  }
}
