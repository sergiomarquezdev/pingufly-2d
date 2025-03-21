/**
 * Clase BackgroundManager - Gestiona la creación y renderizado de todos los elementos del fondo
 * Incluye cielo, sol, montañas, árboles y rocas
 */
import Phaser from 'phaser';

export default class BackgroundManager {
  /**
   * Constructor
   * @param {Phaser.Scene} scene - La escena donde se añadirán los elementos de fondo
   * @param {Object} config - Configuración opcional
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Configuraciones por defecto
    this.config = {
      mountainCount: config.mountainCount || 5,
      treeCount: config.treeCount || 4,
      rockCount: config.rockCount || 12,
      cloudCount: config.cloudCount || 6,
      snowmanCount: config.snowmanCount || 3,
    };

    // Detector simple de dispositivo móvil
    this.isMobile = this.detectMobileDevice();

    // Ajustar configuración basada en capacidad del dispositivo
    if (this.isMobile) {
      this.config.treeCount = Math.floor(this.config.treeCount * 0.6);
      this.config.cloudCount = Math.floor(this.config.cloudCount * 0.6);
      this.config.snowmanCount = Math.floor(this.config.snowmanCount * 0.5);
    }
  }

  /**
   * Detector simple de dispositivo móvil basado en dimensiones de pantalla y user agent
   */
  detectMobileDevice() {
    // Verificar si estamos en un navegador
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    // Detección por user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    // Detección por tamaño de pantalla
    const smallScreen = window.innerWidth < 768;

    return mobileRegex.test(userAgent) || smallScreen;
  }

  /**
   * Crea todos los elementos del fondo
   */
  create() {
    this.createSky();
    this.createSun();
    this.createMountains();
    this.createClouds();
    this.createTrees();
    this.createSnowmen();
    this.createIgloos();
    this.createSnowflakes();
    return this;
  }

  /**
   * Crea el cielo de fondo
   */
  createSky() {
    // Obtenemos las dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear el cielo centrado en la pantalla
    this.scene.add.image(width / 2, height / 2, 'background_sky')
      .setScale(1.2)
      .setDepth(-10) // Profundidad muy baja para el fondo
      .setScrollFactor(0); // Fijo, no se mueve con la cámara
  }

  /**
   * Crea el sol
   */
  createSun() {
    // Obtenemos las dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear el sol
    const sun = this.scene.add.image(width * 0.2, height * 0.1, 'background_sun')
      .setScale(0.2)
      .setDepth(-9) // Profundidad muy baja, pero por encima del cielo
      .setScrollFactor(0.1); // Movimiento muy lento con la cámara

    // Animar el brillo del sol
    this.scene.tweens.add({
      targets: sun,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Crea las montañas en el horizonte y la textura de nieve en el suelo
   */
  createMountains() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const { mountainCount } = this.config;

    // Grupo de montañas para organizar mejor
    const mountainsGroup = [];

    // 1. Montañas de fondo (más lejanas) - Primera capa
    // Dos montañas principales usando los dos assets diferentes
    const mainMountain1 = this.scene.add.image(width * 0.3, height * 0.82, 'background_mountain_02')
      .setScale(0.35)
      .setAlpha(0.8)
      .setDepth(-9.5)
      .setScrollFactor(0.2);
    mountainsGroup.push(mainMountain1);

    const mainMountain2 = this.scene.add.image(width * 0.7, height * 0.82, 'background_mountain_01')
      .setScale(0.3)
      .setAlpha(0.8)
      .setDepth(-9.5)
      .setScrollFactor(0.2);
    mountainsGroup.push(mainMountain2);

    // 2. Montañas intermedias - Segunda capa
    for (let i = 0; i < 3; i++) {
      const mountType = i % 2 === 0 ? 'background_mountain_01' : 'background_mountain_02';
      const x = width * (0.1 + i * 0.4) + Phaser.Math.Between(-50, 50);
      const y = height * 0.85;
      const scale = Phaser.Math.FloatBetween(0.25, 0.4);

      const mountain = this.scene.add.image(x, y, mountType)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setAlpha(0.9)
        .setDepth(-9.3)
        .setScrollFactor(0.3);

      mountainsGroup.push(mountain);
    }

    // 3. Montañas principales de primer plano - Tercera capa (más cercanas)
    // Añadir montaña principal de tipo 01 centrada
    const frontMountain1 = this.scene.add.image(width * 0.5, height * 0.87, 'background_mountain_01')
      .setScale(0.45)
      .setDepth(-9)
      .setScrollFactor(0.4);
    mountainsGroup.push(frontMountain1);

    // Montañas adicionales para crear profundidad
    for (let i = 0; i < mountainCount - 1; i++) {
      const x = -300 + (i * 600) + Phaser.Math.Between(-100, 100);
      const y = height - 30;
      const scale = Phaser.Math.FloatBetween(0.35, 0.5);
      const mountType = i % 2 === 0 ? 'background_mountain_01' : 'background_mountain_02';

      const mountain = this.scene.add.image(x, y, mountType)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(-9)
        .setScrollFactor(0.4);

      mountainsGroup.push(mountain);
    }

    // Añadir textura de nieve en el suelo - ampliada para cubrir mejor el área
    const snowGround = this.scene.add.tileSprite(width / 2, height - 5, width * 5, 150, 'snow_texture')
      .setAlpha(1) // Aumentada a opacidad completa
      .setDepth(-9) // Misma profundidad que el sol y las montañas
      .setScrollFactor(0.5); // Se mueve más rápido que las montañas pero más lento que objetos cercanos
  }

  /**
   * Crea los árboles a lo largo del recorrido del pingüino
   */
  createTrees() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Configurar límites de generación (principalmente hacia la izquierda)
    const rightLimit = width + 200; // 200px a la derecha de la pantalla inicial
    const leftLimit = -10000; // Límite izquierdo del mundo
    const worldWidth = Math.abs(leftLimit) + rightLimit;

    // Ajustamos el treeCount para tener más árboles pero principalmente hacia la izquierda
    const treeCount = this.isMobile ? Math.floor(this.config.treeCount * 2) : Math.floor(this.config.treeCount * 3);

    // Grupos de árboles para capas de profundidad
    const treesGroup = [];

    // Reducimos árboles en la pantalla inicial, ahora solo 1-2 para no sobrecargar
    const initialAreaTreeCount = this.isMobile ? 1 : 2;

    // Crear solo 1-2 árboles en la pantalla inicial
    for (let i = 0; i < initialAreaTreeCount; i++) {
      const x = width * Phaser.Math.FloatBetween(0.15, 0.65);
      const y = height * Phaser.Math.FloatBetween(0.89, 0.91);
      const scale = Phaser.Math.FloatBetween(0.35, 0.5);

      const tree = this.scene.add.image(x, y, 'snow_tree')
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(-5)
        .setScrollFactor(0.75);

      treesGroup.push(tree);
    }

    // Dividimos el recorrido en secciones, como con los copos de nieve
    // Principalmente hacia la izquierda del punto de lanzamiento
    const sectionWidth = 1000; // Secciones de 1000px
    const numSections = Math.ceil(worldWidth / sectionWidth);

    // Más árboles hacia la izquierda (dirección del lanzamiento)
    const treesPerSection = [];

    // Distribuir árboles: menos a la derecha, más en el centro, distribución constante a la izquierda
    for (let section = 0; section < numSections; section++) {
      // Calcular posición X de la sección
      const sectionX = rightLimit - (section * sectionWidth);

      // Si la sección está a la derecha del punto de partida, menos árboles
      if (sectionX > width) {
        treesPerSection[section] = Math.max(1, Math.floor(treeCount / numSections * 0.3));
      }
      // Si es la sección central (punto de partida), pocos árboles
      else if (sectionX > 0 && sectionX <= width) {
        treesPerSection[section] = Math.max(2, Math.floor(treeCount / numSections * 0.5));
      }
      // Si está un poco a la izquierda, más árboles (zona principal de juego)
      else if (sectionX > -3000) {
        treesPerSection[section] = Math.max(3, Math.floor(treeCount / numSections * 1.5));
      }
      // Si está muy a la izquierda, árboles normales
      else {
        treesPerSection[section] = Math.max(2, Math.floor(treeCount / numSections));
      }
    }

    // Crear árboles en cada sección
    for (let section = 0; section < numSections; section++) {
      const numTrees = treesPerSection[section];
      const sectionX = rightLimit - (section * sectionWidth);
      const sectionRightEdge = sectionX;
      const sectionLeftEdge = sectionX - sectionWidth;

      for (let i = 0; i < numTrees; i++) {
        // Posición X aleatoria dentro de la sección
        const x = Phaser.Math.FloatBetween(sectionLeftEdge, sectionRightEdge);

        // Si estamos fuera de los límites del mundo, omitimos
        if (x < leftLimit || x > rightLimit) continue;

        // Posición Y con variación
        const y = height * Phaser.Math.FloatBetween(0.89, 0.96);

        // Escala variable para árboles, más pequeños a la distancia
        let scale = Phaser.Math.FloatBetween(0.3, 0.6);

        // Árboles más alejados (más a la izquierda) pueden ser ligeramente más pequeños
        if (x < -5000) {
          scale *= 0.8;
        }

        // Profundidad variable para dar sensación de capas
        const depth = i % 3 === 0 ? -6 : -5;
        const scrollFactor = depth === -6 ? 0.65 : 0.75;

        const tree = this.scene.add.image(x, y, 'snow_tree')
          .setOrigin(0.5, 1)
          .setScale(scale)
          .setDepth(depth)
          .setScrollFactor(scrollFactor);

        // Árboles más lejanos ligeramente más transparentes
        if (x < -7000) {
          tree.setAlpha(0.9);
        }

        treesGroup.push(tree);
      }
    }

    // Añadir algunos grupos especiales de árboles en puntos clave del recorrido
    const specialSpots = [
      { x: -1500, y: height * 0.92, count: 4, pattern: 'cluster' },
      { x: -4000, y: height * 0.93, count: 5, pattern: 'arc' },
      { x: -7000, y: height * 0.91, count: 3, pattern: 'line' }
    ];

    specialSpots.forEach(spot => {
      switch (spot.pattern) {
        case 'cluster':
          // Grupo agrupado
          for (let i = 0; i < spot.count; i++) {
            const angle = Math.PI * 2 * (i / spot.count);
            const distance = Phaser.Math.Between(50, 120);
            const x = spot.x + Math.cos(angle) * distance;
            const y = spot.y + Math.sin(angle) * 0.5 * distance;

            const scale = Phaser.Math.FloatBetween(0.35, 0.55);

            const tree = this.scene.add.image(x, y, 'snow_tree')
              .setOrigin(0.5, 1)
              .setScale(scale)
              .setDepth(-5)
              .setScrollFactor(0.75);

            treesGroup.push(tree);
          }
          break;

        case 'arc':
          // Árboles en arco
          for (let i = 0; i < spot.count; i++) {
            const arcAngle = (Math.PI * 0.6) * (i / (spot.count - 1)) - Math.PI * 0.3;
            const arcRadius = Phaser.Math.Between(100, 180);
            const x = spot.x + Math.cos(arcAngle) * arcRadius;
            const y = spot.y + Math.sin(arcAngle) * arcRadius * 0.5;

            const scale = Phaser.Math.FloatBetween(0.4, 0.6);

            const tree = this.scene.add.image(x, y, 'snow_tree')
              .setOrigin(0.5, 1)
              .setScale(scale)
              .setDepth(-5)
              .setScrollFactor(0.75);

            treesGroup.push(tree);
          }
          break;

        case 'line':
          // Línea de árboles
          for (let i = 0; i < spot.count; i++) {
            const x = spot.x - (i * 80);
            const y = spot.y - (i * 10);

            const scale = 0.45 - (i * 0.05);

            const tree = this.scene.add.image(x, y, 'snow_tree')
              .setOrigin(0.5, 1)
              .setScale(scale)
              .setDepth(-5)
              .setScrollFactor(0.75);

            treesGroup.push(tree);
          }
          break;
      }
    });

    return treesGroup;
  }

  /**
   * Crea nubes decorativas con efecto de movimiento
   */
  createClouds() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Configuración de las nubes, con menor velocidad para mayor realismo
    const cloudConfigs = [
      // Nubes de fondo (más lentas y lejanas)
      { key: 'cloud_02', xRatio: 0.15, yRatio: 0.15, scale: 0.5, duration: 95000, scrollFactor: 0.1, depth: -8.9, alpha: 0.7 },
      { key: 'cloud_04', xRatio: 0.7, yRatio: 0.12, scale: 0.4, duration: 110000, scrollFactor: 0.1, depth: -8.9, alpha: 0.7 },

      // Nubes de capa media
      { key: 'cloud_01', xRatio: 0.3, yRatio: 0.24, scale: 0.7, duration: 75000, scrollFactor: 0.15, depth: -8.5, alpha: 0.8 },
      { key: 'cloud_03', xRatio: 0.85, yRatio: 0.2, scale: 0.6, duration: 82000, scrollFactor: 0.15, depth: -8.5, alpha: 0.8 },

      // Nubes de frente (más rápidas y cercanas)
      { key: 'cloud_02', xRatio: 0.6, yRatio: 0.28, scale: 0.8, duration: 60000, scrollFactor: 0.2, depth: -8, alpha: 0.9 },
      { key: 'cloud_04', xRatio: 0.05, yRatio: 0.33, scale: 0.7, duration: 65000, scrollFactor: 0.2, depth: -8, alpha: 0.9 }
    ];

    // Crear y animar cada nube
    cloudConfigs.forEach(config => {
      // Posición inicial más variada para que no todas empiecen fuera de la pantalla
      const startX = (width * config.xRatio) - Phaser.Math.Between(500, 1500);
      const y = height * config.yRatio;

      const cloud = this.scene.add.image(startX, y, config.key)
        .setScale(config.scale)
        .setAlpha(config.alpha)
        .setDepth(config.depth)
        .setScrollFactor(config.scrollFactor);

      // Animar movimiento horizontal continuo - más lento y natural
      this.scene.tweens.add({
        targets: cloud,
        x: startX + 3000, // Mover a través de una gran distancia
        duration: config.duration,
        ease: 'Linear',
        repeat: -1, // Repetir indefinidamente
        onRepeat: () => {
          // Reiniciar posición
          cloud.x = startX - Phaser.Math.Between(300, 800);
          // Variar ligeramente la altura para mayor naturalidad
          cloud.y = height * config.yRatio + Phaser.Math.Between(-10, 10);
        }
      });
    });
  }

  /**
   * Crea muñecos de nieve distribuidos a lo largo del recorrido
   */
  createSnowmen() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Configurar límites de generación (principalmente hacia la izquierda)
    const rightLimit = width + 100; // Solo un poco a la derecha de la pantalla inicial
    const leftLimit = -9000; // No llegar al extremo izquierdo

    // Cantidad de muñecos de nieve a generar
    const snowmanCount = this.isMobile ? 5 : 8;

    // Posiciones predefinidas para muñecos de nieve interesantes
    const snowmanPositions = [
      // Algunos cerca del inicio para contexto
      { x: width * 0.6, y: height * 0.9, scale: 0.6 },
      { x: width * 0.25, y: height * 0.88, scale: 0.5 },

      // Distribuidos a lo largo del recorrido (principalmente a la izquierda)
      { x: -500, y: height * 0.92, scale: 0.55 },
      { x: -1800, y: height * 0.91, scale: 0.65 },
      { x: -3200, y: height * 0.93, scale: 0.5 },
      { x: -5000, y: height * 0.92, scale: 0.6 },
      { x: -6500, y: height * 0.91, scale: 0.45 },
      { x: -8000, y: height * 0.93, scale: 0.55 }
    ];

    // Crear cada muñeco de nieve
    snowmanPositions.slice(0, snowmanCount).forEach((pos) => {
      // Solo crear si está dentro de los límites
      if (pos.x >= leftLimit && pos.x <= rightLimit) {
        const snowman = this.scene.add.image(pos.x, pos.y, 'snowman')
          .setOrigin(0.5, 1)
          .setScale(pos.scale)
          .setDepth(-4) // Por encima de árboles, ajustado a -4
          .setScrollFactor(0.8); // Se mueven casi a la misma velocidad que el personaje

        // Recortar 1px de la parte superior para eliminar la línea extraña
        snowman.setCrop(0, 1, 64, 63);
      }
    });

    // Añadir algunas variaciones aleatorias
    const randomPositions = 3; // Número de posiciones aleatorias adicionales

    for (let i = 0; i < randomPositions; i++) {
      // Preferimos posiciones a la izquierda (en la dirección del lanzamiento)
      const x = Phaser.Math.Between(-4000, -1000);
      const y = height * Phaser.Math.FloatBetween(0.9, 0.94);
      const scale = Phaser.Math.FloatBetween(0.4, 0.6);

      const snowman = this.scene.add.image(x, y, 'snowman')
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(-4)
        .setScrollFactor(0.8);

      // Recortar 1px de la parte superior
      snowman.setCrop(0, 1, 64, 63);
    }
  }

  /**
   * Crea iglús distribuidos estratégicamente
   */
  createIgloos() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Configurar límites de generación (principalmente hacia la izquierda)
    const rightLimit = width + 200; // Solo hasta el límite derecho de la pantalla inicial
    const leftLimit = -9500; // Casi al límite izquierdo

    // Cantidad de iglús (menos que muñecos de nieve ya que son estructuras más significativas)
    const iglooCount = this.isMobile ? 3 : 5;

    // Posiciones estratégicas para los iglús
    const iglooPositions = [
      // Uno cerca del inicio para contexto
      { x: width * 0.2, y: height * 0.88, scale: 0.3, depth: -7 },

      // Distribuidos en puntos clave del recorrido
      { x: -1500, y: height * 0.87, scale: 0.25, depth: -7 },
      { x: -4000, y: height * 0.89, scale: 0.3, depth: -7 },
      { x: -7000, y: height * 0.86, scale: 0.22, depth: -7 },
      { x: -9000, y: height * 0.88, scale: 0.27, depth: -7 }
    ];

    // Crear cada iglú
    iglooPositions.slice(0, iglooCount).forEach((pos) => {
      // Solo crear si está dentro de los límites
      if (pos.x >= leftLimit && pos.x <= rightLimit) {
        const igloo = this.scene.add.image(pos.x, pos.y, 'igloo')
          .setOrigin(0.5, 1)
          .setScale(pos.scale)
          .setDepth(pos.depth)
          .setScrollFactor(0.75); // Movimiento intermedio
      }
    });
  }

  /**
   * Crea el efecto de copos de nieve cayendo
   */
  createSnowflakes() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Usamos dimensiones fijas para el mundo del juego en lugar de obtenerlas de Matter
    // Estos valores deben coincidir con los límites definidos en Game.js
    const worldMinX = -10000;
    const worldMaxX = 10000;
    const worldWidth = worldMaxX - worldMinX;

    // Ajustar frecuencia según el dispositivo
    let foregroundFrequency = this.isMobile ? 60 : 30;
    let midgroundFrequency = this.isMobile ? 100 : 50;
    let backgroundFrequency = this.isMobile ? 200 : 100;

    // Emisores para diferentes capas - sin seguimiento de cámara
    const emitters = [];

    // Para cada sección del mundo (podemos dividirlo en secciones de 2000px cada una)
    const sectionWidth = 2000;
    const numSections = Math.ceil(worldWidth / sectionWidth);

    // Crear emisores distribuidos a lo largo del mundo
    for (let section = 0; section < numSections; section++) {
      const sectionX = worldMinX + (section * sectionWidth) + sectionWidth/2;

      // Emisor de primer plano (uno por sección)
      const foregroundEmitter = this.scene.add.particles(sectionX, 0, 'snowflake', {
        x: { min: -sectionWidth/2, max: sectionWidth/2 }, // Distribuido en la sección
        y: { min: -100, max: 0 },
        speedX: { min: -20, max: 20 },
        speedY: { min: 100, max: 150 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        scale: { min: 0.2, max: 0.4 },
        alpha: { min: 0.3, max: 0.6 }, // Opacidad máxima 0.6
        frequency: foregroundFrequency,
        lifespan: 6000,
        blendMode: 'ADD',
        gravityY: 10,
        depth: 10,
        // Importante: Sin seguimiento de cámara, movimiento natural con el mundo
        scrollFactorX: 1,
        scrollFactorY: 1
      });
      emitters.push(foregroundEmitter);

      // Emisor de capa media (uno por sección)
      const midgroundEmitter = this.scene.add.particles(sectionX, 0, 'snowflake', {
        x: { min: -sectionWidth/2, max: sectionWidth/2 }, // Distribuido en la sección
        y: { min: -100, max: 0 },
        speedX: { min: -10, max: 10 },
        speedY: { min: 60, max: 100 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        scale: { min: 0.1, max: 0.2 },
        alpha: { min: 0.2, max: 0.4 }, // Opacidad máxima 0.4
        frequency: midgroundFrequency,
        lifespan: 8000,
        blendMode: 'ADD',
        depth: 9,
        scrollFactorX: 1,
        scrollFactorY: 1
      });
      emitters.push(midgroundEmitter);

      // Emisor de fondo - solo para dispositivos no móviles
      if (!this.isMobile) {
        const backgroundEmitter = this.scene.add.particles(sectionX, 0, 'snowflake', {
          x: { min: -sectionWidth/2, max: sectionWidth/2 }, // Distribuido en la sección
          y: { min: -100, max: 0 },
          speedX: { min: -5, max: 5 },
          speedY: { min: 30, max: 60 },
          angle: { min: 0, max: 360 },
          rotate: { min: 0, max: 360 },
          scale: { min: 0.05, max: 0.1 },
          alpha: { min: 0.1, max: 0.3 }, // Opacidad máxima 0.3
          frequency: backgroundFrequency,
          lifespan: 12000,
          blendMode: 'ADD',
          depth: 8,
          scrollFactorX: 1,
          scrollFactorY: 1
        });
        emitters.push(backgroundEmitter);
      }
    }

    // Sistema de viento global que afecta a todos los emisores
    const windEvent = this.scene.time.addEvent({
      delay: this.isMobile ? 5000 : 3000,
      callback: () => {
        const windDirection = Phaser.Math.FloatBetween(-30, 30);

        // Actualizar la velocidad de cada emisor con la misma dirección de viento
        emitters.forEach(emitter => {
          if (emitter) {
            // La velocidad del viento varía según la capa (más fuerte en primeros planos)
            const windStrength = emitter.depth > 9 ? 20 : (emitter.depth > 8 ? 10 : 5);
            emitter.speedX = {
              min: windDirection - windStrength,
              max: windDirection + windStrength
            };
          }
        });
      },
      callbackScope: this,
      loop: true
    });

    // Método para detener y limpiar recursos
    const stopAllEmitters = () => {
      // Detener y destruir los emisores
      emitters.forEach(emitter => {
        if (emitter && emitter.destroy) {
          emitter.destroy();
        }
      });

      // Detener el evento de viento
      if (windEvent && windEvent.destroy) {
        windEvent.destroy();
      }
    };

    return {
      emitters,
      windEvent,
      stopAllEmitters
    };
  }
}
